#!/usr/bin/env python
"""
Test Docker connection for workspace provisioning.
Run this script to verify Docker is accessible from Django backend.
"""

import sys
import platform

def test_docker_connection():
    """Test if Docker is accessible."""
    print("=" * 60)
    print("Docker Connection Test")
    print("=" * 60)
    print(f"Platform: {platform.system()}")
    print(f"Python: {sys.version}")
    print()
    
    # Test 1: Import docker module
    print("Test 1: Importing docker module...")
    try:
        import docker
        print("✓ docker module imported successfully")
    except ImportError as e:
        print(f"✗ Failed to import docker module: {e}")
        print("\nSolution: Install docker package")
        print("  pip install docker")
        return False
    print()
    
    # Test 2: Connect to Docker
    print("Test 2: Connecting to Docker...")
    client = None
    
    # Try Windows named pipe first
    if platform.system() == "Windows":
        print("  Trying Windows named pipe (npipe:////./pipe/docker_engine)...")
        try:
            client = docker.DockerClient(base_url='npipe:////./pipe/docker_engine')
            client.ping()
            print("  ✓ Connected via named pipe")
        except Exception as e:
            print(f"  ✗ Named pipe failed: {e}")
            print("  Trying docker.from_env()...")
            try:
                client = docker.from_env()
                client.ping()
                print("  ✓ Connected via environment")
            except Exception as e2:
                print(f"  ✗ Environment connection failed: {e2}")
    else:
        # Linux/Mac
        print("  Trying docker.from_env()...")
        try:
            client = docker.from_env()
            client.ping()
            print("  ✓ Connected via environment")
        except Exception as e:
            print(f"  ✗ Connection failed: {e}")
    
    if client is None:
        print("\n✗ FAILED: Could not connect to Docker")
        print("\nTroubleshooting:")
        if platform.system() == "Windows":
            print("1. Make sure Docker Desktop is running")
            print("2. Check Docker Desktop settings:")
            print("   Settings → General → 'Expose daemon on tcp://localhost:2375 without TLS'")
            print("3. Restart Docker Desktop")
            print("4. Restart this script")
        else:
            print("1. Make sure Docker is installed and running")
            print("2. Add your user to docker group: sudo usermod -aG docker $USER")
            print("3. Restart your terminal")
            print("4. Or run with sudo")
        return False
    print()
    
    # Test 3: Get Docker info
    print("Test 3: Getting Docker info...")
    try:
        info = client.info()
        print(f"  ✓ Docker version: {info.get('ServerVersion', 'Unknown')}")
        print(f"  ✓ Containers: {info.get('Containers', 0)}")
        print(f"  ✓ Images: {info.get('Images', 0)}")
    except Exception as e:
        print(f"  ✗ Failed to get Docker info: {e}")
        return False
    print()
    
    # Test 4: List containers
    print("Test 4: Listing containers...")
    try:
        containers = client.containers.list()
        print(f"  ✓ Found {len(containers)} running container(s)")
        for container in containers:
            print(f"    - {container.name} ({container.status})")
    except Exception as e:
        print(f"  ✗ Failed to list containers: {e}")
        return False
    print()
    
    # Test 5: Check if we can pull images
    print("Test 5: Checking image access...")
    try:
        images = client.images.list()
        print(f"  ✓ Found {len(images)} image(s)")
        
        # Check for required images
        required_images = ['apache/superset', 'codercom/code-server']
        for image_name in required_images:
            found = any(image_name in str(img.tags) for img in images)
            if found:
                print(f"  ✓ {image_name} image found")
            else:
                print(f"  ℹ {image_name} image not found (will be pulled on first use)")
    except Exception as e:
        print(f"  ✗ Failed to check images: {e}")
        return False
    print()
    
    # Success!
    print("=" * 60)
    print("✓ ALL TESTS PASSED!")
    print("=" * 60)
    print("\nDocker is accessible and workspace provisioning should work.")
    print("\nNext steps:")
    print("1. Start Django server: python manage.py runserver")
    print("2. Login as a Data Professional student")
    print("3. Go to Workspace page")
    print("4. Click 'Launch Superset'")
    print()
    return True


if __name__ == "__main__":
    success = test_docker_connection()
    sys.exit(0 if success else 1)
