# Code Server (VS Code IDE) Setup for Full Stack Development Track

## Overview

Code Server is now integrated into ApraNova LMS for students enrolled in the **Full Stack Development (FSD)** track. When an FSD student clicks on their workspace, they will get access to VS Code IDE in the browser.

## Features

- **Full VS Code Experience**: Complete VS Code IDE in the browser
- **Extensions Support**: Install VS Code extensions
- **Terminal Access**: Built-in terminal for running commands
- **File Management**: Create, edit, and manage project files
- **Git Integration**: Built-in Git support
- **Syntax Highlighting**: Support for all major languages
- **IntelliSense**: Code completion and suggestions

## Quick Start

### 1. Start Code Server

```bash
# Windows
.\start-code-server.ps1

# Mac/Linux
./start-code-server.sh
```

### 2. Access Code Server

- **URL**: http://localhost:8080
- **Password**: password123

### 3. For Full Stack Development Students

1. Sign up with track "Full Stack Development (FSD)"
2. Navigate to **Student Dashboard** → **Workspace**
3. Click **Launch Workspace**
4. Your personal VS Code IDE will open automatically

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Code Server Configuration
CODE_SERVER_PASSWORD=password123
USE_SHARED_CODE_SERVER=true
CODE_SERVER_URL=http://localhost:8080
```

### Change Password

Edit `.env`:
```env
CODE_SERVER_PASSWORD=your-secure-password
```

Then restart:
```bash
docker-compose restart code-server
```

## Architecture

### How It Works

1. **User Track Detection**: Backend checks user's track (DP or FSD)
2. **Workspace Routing**: 
   - FSD users get Code Server (VS Code)
   - DP users get Apache Superset
3. **Shared Instance**: All FSD students use the same Code Server instance
4. **Browser Access**: Opens in new tab at http://localhost:8080

### Backend Logic

The workspace provisioning logic is in `backend/accounts/workspace_views.py`:

```python
# Determine workspace type based on user's track
user_track = getattr(user, 'track', 'FSD')
is_data_professional = user_track == 'DP'

if is_data_professional:
    # Apache Superset for Data Professional track
    workspace_url = "http://localhost:8088"
    workspace_type = "superset"
else:
    # VS Code for Full Stack Development track
    workspace_url = "http://localhost:8080"
    workspace_type = "vscode"
```

## Docker Compose Service

The Code Server service is defined in `docker-compose.yml`:

```yaml
code-server:
  image: codercom/code-server:latest
  container_name: apranova_code_server
  restart: unless-stopped
  user: "1000:1000"
  environment:
    - PASSWORD=${CODE_SERVER_PASSWORD:-password123}
  ports:
    - "8080:8080"
  volumes:
    - code_server_data:/home/coder/project
  networks:
    - apranova_network
```

## First-Time Setup

When Code Server starts for the first time, it will:

1. Initialize the workspace
2. Set up the VS Code environment
3. Start the web server on port 8080
4. Be ready for connections

## Using Code Server

### Creating Files

1. Click **File** → **New File**
2. Or use the Explorer panel on the left
3. Or use terminal: `touch filename.js`

### Installing Extensions

1. Click **Extensions** icon (left sidebar)
2. Search for extension
3. Click **Install**

### Using Terminal

1. Click **Terminal** → **New Terminal**
2. Or press `` Ctrl+` ``
3. Run commands like: `npm install`, `python script.py`, etc.

### Git Integration

1. Click **Source Control** icon (left sidebar)
2. Initialize repository or clone existing
3. Commit and push changes

## Troubleshooting

### Code Server Container Not Starting

```bash
# Check logs
docker-compose logs code-server

# Restart the service
docker-compose restart code-server
```

### Port Already in Use

If port 8080 is already in use, change it in `docker-compose.yml`:

```yaml
ports:
  - "8081:8080"  # Use 8081 instead
```

### Permission Issues

If you see permission errors:

```bash
# Stop and remove container
docker-compose stop code-server
docker-compose rm -f code-server

# Remove volume
docker volume rm apranova-app_code_server_data

# Start fresh
docker-compose up -d code-server
```

### Can't Access Code Server

```bash
# Check if container is running
docker-compose ps code-server

# Check health
docker exec apranova_code_server curl http://localhost:8080/healthz

# Restart if needed
docker-compose restart code-server
```

## Production Considerations

### Security

1. **Change Default Password**: Update CODE_SERVER_PASSWORD in .env
2. **Use Strong Password**: Generate with `openssl rand -base64 32`
3. **Enable HTTPS**: Configure SSL certificates
4. **Restrict Access**: Use firewall rules to limit access

### Performance

1. **Resource Limits**: Set memory and CPU limits in docker-compose
2. **Volume Management**: Regular cleanup of unused files
3. **Extension Management**: Only install necessary extensions

### Backup

```bash
# Backup Code Server data
docker run --rm -v apranova-app_code_server_data:/data -v $(pwd):/backup alpine tar czf /backup/code-server-backup.tar.gz /data

# Restore Code Server data
docker run --rm -v apranova-app_code_server_data:/data -v $(pwd):/backup alpine tar xzf /backup/code-server-backup.tar.gz -C /
```

## Comparison: Shared vs Per-User

### Current Setup (Shared Instance)

**Pros**:
- Simple setup
- No Docker-in-Docker needed
- Works with any deployment
- Fast access

**Cons**:
- Students share the same workspace
- No isolation between students
- Files are shared

### Per-User Containers (Future)

**Pros**:
- Full isolation per student
- Personal workspace
- Independent environments

**Cons**:
- Requires Docker-in-Docker
- More complex setup
- Higher resource usage

To enable per-user containers:
```env
USE_SHARED_CODE_SERVER=false
```

## Resources

- [Code Server Documentation](https://coder.com/docs/code-server/latest)
- [Code Server GitHub](https://github.com/coder/code-server)
- [VS Code Documentation](https://code.visualstudio.com/docs)

## Support

For issues or questions:
- Check the logs: `docker-compose logs code-server`
- Contact support: support@apranova.com
- Open an issue on GitHub

## Summary

Code Server is now fully integrated for Full Stack Development students! They can access a complete VS Code IDE right from their browser, with all the features they need for web development.

**Access**: http://localhost:8080  
**Password**: password123  
**Track**: Full Stack Development (FSD)
