import docker
import socket
import os
from pathlib import Path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

# Only connect to Docker if available (prevents crash on Render)
try:
    # Try to connect to Docker
    # On Windows with Docker Desktop, try named pipe first
    import platform
    if platform.system() == "Windows":
        try:
            # Try Docker Desktop named pipe
            client = docker.DockerClient(base_url='npipe:////./pipe/docker_engine')
            # Test connection
            client.ping()
        except Exception as e:
            print(f"Failed to connect via named pipe: {e}")
            # Fallback to environment
            client = docker.from_env()
    else:
        client = docker.from_env()
    
    # Test the connection
    client.ping()
    print("✓ Docker client connected successfully")
except Exception as e:
    client = None
    print(f"Docker not available: {e}")
    print("Workspace provisioning will not be available.")

def get_free_port():
    """Find an available port for user container."""
    s = socket.socket()
    s.bind(('', 0))
    port = s.getsockname()[1]
    s.close()
    return port

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_workspace(request):
    """Provision workspace container for the user (VS Code for FSD, Superset for DP)"""
    
    user = request.user
    
    # Determine workspace type based on user's track
    user_track = getattr(user, 'track', 'FSD')  # Default to FSD if no track
    is_data_professional = user_track == 'DP'
    
    # For development: Use the shared Superset instance instead of provisioning per-user containers
    # This avoids Docker-in-Docker issues when running Django directly
    use_shared_instance = os.getenv("USE_SHARED_SUPERSET", "true").lower() == "true"
    
    if use_shared_instance:
        # Use shared instances for both tracks (avoids Docker-in-Docker issues)
        if is_data_professional:
            # Superset for Data Professional
            workspace_url = os.getenv("SUPERSET_URL", "http://localhost:8088")
            workspace_type = "superset"
            workspace_port = "8088"
            msg = "Superset workspace ready. Login with admin/admin"
            
            # Verify Superset is accessible
            try:
                import requests
                health_check = requests.get("http://superset:8088/health", timeout=2)
            except Exception as e:
                print(f"Warning: Could not verify Superset health: {e}")
        else:
            # VS Code for Full Stack Development
            workspace_url = os.getenv("CODE_SERVER_URL", "http://localhost:8080")
            workspace_type = "vscode"
            workspace_port = "8080"
            password = os.getenv("CODE_SERVER_PASSWORD", "password123")
            msg = f"VS Code workspace ready. Password: {password}"
            
            # Verify Code Server is accessible
            try:
                import requests
                health_check = requests.get("http://code-server:8080/healthz", timeout=2)
            except Exception as e:
                print(f"Warning: Could not verify Code Server health: {e}")
        
        return Response(
            {
                "url": workspace_url,
                "port": workspace_port,
                "status": "ready",
                "workspace_type": workspace_type,
                "msg": msg
            },
            status=status.HTTP_200_OK,
        )
    
    # Check if Docker is available for per-user provisioning
    if client is None:
        import platform
        system = platform.system()
        
        if system == "Windows":
            instructions = (
                "1. Make sure Docker Desktop is running\n"
                "2. Check Docker Desktop settings: Settings → General → 'Expose daemon on tcp://localhost:2375 without TLS' (for development only)\n"
                "3. Or install docker package: pip install docker\n"
                "4. Restart the Django server"
            )
        else:
            instructions = (
                "1. Make sure Docker is installed and running\n"
                "2. Add your user to the docker group: sudo usermod -aG docker $USER\n"
                "3. Restart your terminal/server\n"
                "4. Or run with Docker Compose: docker-compose up"
            )
        
        return Response(
            {
                "error": "Workspace feature not available",
                "message": f"Docker is not accessible from the backend. Running on {system}.",
                "instructions": instructions,
                "details": "The workspace provisioning feature requires Docker access. Follow the instructions above to enable it."
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    user = request.user
    
    # Determine workspace type based on user's track
    user_track = getattr(user, 'track', 'FSD')  # Default to FSD if no track
    is_data_professional = user_track == 'DP'
    
    # Use different container names for different tracks
    container_name = f"workspace_{user.id}_{user_track.lower()}"
    try:
        # Check if container already exists
        container = client.containers.get(container_name)
        container.reload()

        # Get the port mapping (8080 for VS Code, 8088 for Superset)
        port_key = '8088/tcp' if is_data_professional else '8080/tcp'
        port_bindings = container.attrs['HostConfig']['PortBindings']
        if port_bindings and port_key in port_bindings:
            port = port_bindings[port_key][0]['HostPort']
        else:
            port = "8088" if is_data_professional else "8080"

        # Use localhost URL for development
        use_localhost = os.getenv("DEBUG", "False").lower() == "true"
        if use_localhost:
            url = f"http://localhost:{port}"
        else:
            url = f"http://workspace-{user.id}.apranova.com"

        if container.status == "running":
            return Response(
                {
                    "url": url, 
                    "port": port, 
                    "status": "running",
                    "workspace_type": "superset" if is_data_professional else "vscode"
                },
                status=status.HTTP_200_OK,
            )
        else:
            container.start()
            return Response(
                {
                    "url": url, 
                    "port": port, 
                    "status": "started",
                    "workspace_type": "superset" if is_data_professional else "vscode"
                },
                status=status.HTTP_200_OK,
            )
    except docker.errors.NotFound:
        port = get_free_port()

        # Create workspace directory if it doesn't exist
        workspace_base = os.getenv("WORKSPACE_BASE_PATH", str(Path.home() / "apranova_workspaces"))
        user_volume = os.path.join(workspace_base, str(user.id))
        Path(user_volume).mkdir(parents=True, exist_ok=True)
        
        # Set permissions for coder user (UID 1000 in code-server container)
        # Skip on Windows as chown/chmod don't exist
        import platform
        if platform.system() != "Windows":
            import subprocess
            subprocess.run(["chown", "-R", "1000:1000", user_volume], check=False)
            subprocess.run(["chmod", "-R", "755", user_volume], check=False)

        # Use localhost URL for development
        use_localhost = os.getenv("DEBUG", "False").lower() == "true"

        try:
            if is_data_professional:
                # Apache Superset for Data Professional track
                image_name = "apache/superset:latest"
                port_mapping = {"8088/tcp": port}
                
                # Create initialization script
                init_script = """#!/bin/bash
set -e

# Initialize database
superset db upgrade

# Create admin user (ignore if exists)
superset fab create-admin \
    --username admin \
    --firstname Admin \
    --lastname User \
    --email admin@superset.com \
    --password admin || true

# Initialize Superset
superset init

# Start the server
superset run -h 0.0.0.0 -p 8088 --with-threads --reload --debugger
"""
                
                # Write init script to user volume
                init_script_path = os.path.join(user_volume, "init_superset.sh")
                with open(init_script_path, "w") as f:
                    f.write(init_script)
                
                # Make script executable (skip on Windows)
                if platform.system() != "Windows":
                    import subprocess
                    subprocess.run(["chmod", "+x", init_script_path], check=False)
                
                container = client.containers.run(
                    image_name,
                    name=container_name,
                    detach=True,
                    ports=port_mapping,
                    environment={
                        "SUPERSET_SECRET_KEY": f"superset_secret_{user.id}",
                        "SUPERSET_LOAD_EXAMPLES": "yes",
                    },
                    volumes={user_volume: {"bind": "/app/superset_home", "mode": "rw"}},
                    restart_policy={"Name": "unless-stopped"},
                    command=["/bin/bash", "/app/superset_home/init_superset.sh"],
                )
                
                workspace_type = "superset"
                success_msg = "Superset workspace created successfully. Initializing... This may take 60-90 seconds. Default credentials: admin/admin"
                
            else:
                # VS Code (code-server) for Full Stack Development track
                image_name = "apra-nova-code-server:latest"
                try:
                    client.images.get(image_name)
                except docker.errors.ImageNotFound:
                    # Use official code-server image as fallback
                    image_name = "codercom/code-server:latest"
                    print(f"Custom image not found, using {image_name}")
                
                container = client.containers.run(
                    image_name,
                    name=container_name,
                    detach=True,
                    ports={"8080/tcp": port},
                    environment={
                        "PASSWORD": "",  # Clear the password - this disables password authentication
                    },
                    command=["--auth", "none", "--bind-addr", "0.0.0.0:8080", "."],
                    volumes={user_volume: {"bind": "/home/coder/project", "mode": "rw"}},
                    restart_policy={"Name": "unless-stopped"},
                )
                
                workspace_type = "vscode"
                success_msg = "VS Code workspace created successfully."

            # Return localhost URL for development
            if use_localhost:
                url = f"http://localhost:{port}"
            else:
                url = f"http://workspace-{user.id}.apranova.com"

            return Response(
                {
                    "url": url, 
                    "port": port, 
                    "msg": success_msg,
                    "workspace_type": workspace_type
                },
                status=status.HTTP_201_CREATED,
            )
        except docker.errors.ImageNotFound:
            workspace_name = "Superset" if is_data_professional else "Code-server"
            return Response(
                {
                    "error": f"{workspace_name} image not found",
                    "message": f"No {workspace_name} image available. Docker will download it automatically on first use.",
                    "details": f"The official {workspace_name} image will be pulled from Docker Hub."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
