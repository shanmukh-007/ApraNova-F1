# Apache Superset Integration for Data Professional Track

## Overview

Apache Superset is now integrated into ApraNova LMS for students enrolled in the **Data Professional (DP)** track. When a Data Professional student clicks on their workspace, they will get access to Apache Superset instead of VS Code.

## Features

- **Interactive Dashboards**: Create beautiful, interactive data visualizations
- **SQL Lab**: Write and execute SQL queries with a powerful editor
- **Chart Builder**: Build charts with a drag-and-drop interface
- **Database Connections**: Connect to PostgreSQL, MySQL, and more
- **Pre-loaded Examples**: Sample datasets and dashboards to get started

## Quick Start

### 1. Start Superset Service

```bash
# Start all services including Superset
docker-compose up -d

# Or start only Superset
docker-compose up -d superset
```

### 2. Access Superset

- **URL**: http://localhost:8088
- **Default Username**: admin
- **Default Password**: admin

### 3. For Data Professional Students

1. Sign up with track "Data Professional (DP)"
2. Navigate to **Student Dashboard** → **Workspace**
3. Click **Launch Superset**
4. Your personal Superset instance will be provisioned automatically

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Apache Superset Configuration
SUPERSET_SECRET_KEY=your-superset-secret-key-change-in-production
SUPERSET_ADMIN_USERNAME=admin
SUPERSET_ADMIN_PASSWORD=admin
SUPERSET_ADMIN_EMAIL=admin@apranova.com
```

### Generate Secure Secret Key

```bash
# Generate a secure secret key for production
openssl rand -base64 42
```

## Architecture

### How It Works

1. **User Track Detection**: Backend checks user's track (DP or FSD)
2. **Container Provisioning**: 
   - DP users get Apache Superset container
   - FSD users get VS Code container
3. **Port Mapping**: Each user gets a unique port for their workspace
4. **Persistent Storage**: User data is stored in Docker volumes

### Backend Logic

The workspace provisioning logic is in `backend/accounts/workspace_views.py`:

```python
# Determine workspace type based on user's track
user_track = getattr(user, 'track', 'FSD')
is_data_professional = user_track == 'DP'

if is_data_professional:
    # Apache Superset for Data Professional track
    image_name = "apache/superset:latest"
    port_mapping = {"8088/tcp": port}
else:
    # VS Code for Full Stack Development track
    image_name = "codercom/code-server:latest"
    port_mapping = {"8080/tcp": port}
```

## Docker Compose Service

The Superset service is defined in `docker-compose.yml`:

```yaml
superset:
  image: apache/superset:latest
  container_name: apranova_superset
  restart: unless-stopped
  environment:
    - SUPERSET_SECRET_KEY=${SUPERSET_SECRET_KEY}
    - SUPERSET_LOAD_EXAMPLES=yes
  ports:
    - "8088:8088"
  volumes:
    - superset_home:/app/superset_home
  depends_on:
    - db
    - redis
```

## First-Time Setup

When Superset starts for the first time, it will:

1. Initialize the database
2. Create an admin user (admin/admin)
3. Load example datasets and dashboards
4. Start the web server on port 8088

## Connecting to Databases

### PostgreSQL (Built-in)

Superset can connect to the same PostgreSQL database used by the LMS:

1. Go to **Data** → **Databases** → **+ Database**
2. Select **PostgreSQL**
3. Connection String:
   ```
   postgresql://apranova_user:apranova_dev_password_123@db:5432/apranova_db
   ```

### Other Databases

Superset supports many databases:
- MySQL
- SQLite
- MongoDB
- Snowflake
- BigQuery
- Redshift
- And many more...

## Troubleshooting

### Superset Container Not Starting

```bash
# Check logs
docker-compose logs superset

# Restart the service
docker-compose restart superset
```

### Port Already in Use

If port 8088 is already in use, change it in `docker-compose.yml`:

```yaml
ports:
  - "8089:8088"  # Use 8089 instead
```

### Reset Admin Password

```bash
# Access Superset container
docker exec -it apranova_superset bash

# Reset password
superset fab reset-password --username admin
```

## Production Considerations

### Security

1. **Change Default Credentials**: Update admin password immediately
2. **Use Strong Secret Key**: Generate with `openssl rand -base64 42`
3. **Enable HTTPS**: Configure SSL certificates
4. **Restrict Access**: Use firewall rules to limit access

### Performance

1. **Use Redis**: Already configured for caching
2. **Database Optimization**: Use connection pooling
3. **Resource Limits**: Set memory and CPU limits in docker-compose

### Backup

```bash
# Backup Superset data
docker run --rm -v apranova_superset_home:/data -v $(pwd):/backup alpine tar czf /backup/superset-backup.tar.gz /data

# Restore Superset data
docker run --rm -v apranova_superset_home:/data -v $(pwd):/backup alpine tar xzf /backup/superset-backup.tar.gz -C /
```

## Resources

- [Apache Superset Documentation](https://superset.apache.org/docs/intro)
- [Superset Docker Hub](https://hub.docker.com/r/apache/superset)
- [Superset GitHub](https://github.com/apache/superset)

## Support

For issues or questions:
- Check the logs: `docker-compose logs superset`
- Contact support: support@apranova.com
- Open an issue on GitHub
