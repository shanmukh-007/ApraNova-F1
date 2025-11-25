# Apache Superset Integration - Complete Guide

## 🎯 Overview

Apache Superset has been successfully integrated into ApraNova LMS for the **Data Professional (DP)** track. When students with the DP track click on their workspace, they automatically get access to Apache Superset instead of VS Code.

## ✨ What's New

### For Data Professional Students

- **Automatic Workspace Detection**: System automatically detects your track and provisions the right workspace
- **Apache Superset Access**: Click "Launch Superset" to get your personal analytics platform
- **Pre-configured Environment**: Superset comes with sample datasets and dashboards
- **Persistent Storage**: Your work is automatically saved

### For Full Stack Development Students

- No changes - you still get VS Code as your workspace

## 🚀 Quick Start

### Option 1: Start Everything (Recommended)

```bash
# Windows
.\start-all.ps1

# Mac/Linux
./start-all.sh
```

### Option 2: Start Only Superset

```bash
# Windows
.\start-superset.ps1

# Mac/Linux
./start-superset.sh
```

### Option 3: Manual Start

```bash
# Start Superset service
docker-compose up -d superset

# View logs
docker-compose logs -f superset

# Access at http://localhost:8088
# Username: admin
# Password: admin
```

## 📋 What Was Changed

### 1. Docker Compose Configuration

**File**: `docker-compose.yml`

Added new Superset service:
```yaml
superset:
  image: apache/superset:latest
  container_name: apranova_superset
  ports:
    - "8088:8088"
  environment:
    - SUPERSET_SECRET_KEY=${SUPERSET_SECRET_KEY}
    - SUPERSET_LOAD_EXAMPLES=yes
  volumes:
    - superset_home:/app/superset_home
```

### 2. Environment Variables

**Files**: `.env` and `.env.example`

Added Superset configuration:
```env
SUPERSET_SECRET_KEY=your-secret-key
SUPERSET_ADMIN_USERNAME=admin
SUPERSET_ADMIN_PASSWORD=admin
SUPERSET_ADMIN_EMAIL=admin@apranova.com
```

### 3. Backend Workspace Logic

**File**: `backend/accounts/workspace_views.py`

Already had the logic to detect user track and provision appropriate workspace:
- DP track → Apache Superset (port 8088)
- FSD track → VS Code (port 8080)

### 4. Frontend Workspace UI

**File**: `frontend/app/student/workspace/page.tsx`

Updated to show different UI based on workspace type:
- Detects user track on page load
- Shows Superset-specific features for DP users
- Shows VS Code features for FSD users
- Dynamic button text and colors

### 5. New Scripts

Created helper scripts:
- `start-superset.ps1` - Windows PowerShell script
- `start-superset.sh` - Mac/Linux bash script
- `SUPERSET_SETUP.md` - Detailed setup documentation

## 🎓 How Students Use It

### For Data Professional Students

1. **Sign Up**
   - Go to signup page
   - Select track: "Data Professional (DP)"
   - Complete registration

2. **Access Workspace**
   - Login to student dashboard
   - Click on "Workspace" in sidebar
   - Click "Launch Superset" button

3. **First Time Setup**
   - System provisions your personal Superset instance
   - Takes 30-60 seconds on first launch
   - Opens automatically in new tab

4. **Login to Superset**
   - Username: `admin`
   - Password: `admin`
   - Change password after first login

5. **Start Analyzing**
   - Explore sample dashboards
   - Create your own visualizations
   - Connect to databases
   - Build interactive reports

## 🔧 Technical Details

### Architecture

```
Student Login (DP Track)
    ↓
Click "Launch Workspace"
    ↓
Backend checks user.track
    ↓
track == "DP" → Provision Superset Container
    ↓
Return URL: http://localhost:{port}
    ↓
Frontend opens Superset in new tab
```

### Port Allocation

- **Main Superset Service**: Port 8088
- **User Workspaces**: Dynamic ports (8089, 8090, etc.)
- Each user gets their own isolated container

### Data Persistence

- **Volume**: `superset_home`
- **Location**: Docker volume managed by Docker
- **Backup**: Use `docker volume` commands

### Database Connection

Superset uses the same PostgreSQL database as the LMS:
```
Host: db
Port: 5432
Database: apranova_db
User: apranova_user
Password: apranova_dev_password_123
```

## 🎨 UI Changes

### Workspace Page Features

**For Data Professional (DP) Track:**
- Purple color scheme
- "Launch Superset" button
- Features: Data Viz, SQL Editor, Pre-loaded datasets
- Environment includes: Dashboards, SQL Lab, Chart Builder, Database Connections

**For Full Stack Development (FSD) Track:**
- Blue color scheme
- "Launch Workspace" button
- Features: Instant Setup, Auto-Save, Full VS Code
- Environment includes: Python, Pandas, Jupyter, Git

## 🔐 Security Considerations

### Development

Current setup is for development with:
- Default credentials (admin/admin)
- HTTP (no SSL)
- Open access on localhost

### Production

For production deployment:

1. **Change Credentials**
   ```bash
   docker exec -it apranova_superset superset fab reset-password --username admin
   ```

2. **Use Strong Secret Key**
   ```bash
   openssl rand -base64 42
   ```

3. **Enable HTTPS**
   - Configure SSL certificates
   - Update nginx configuration

4. **Restrict Access**
   - Use firewall rules
   - Implement authentication
   - Set up VPN if needed

## 📊 Superset Features

### What Students Can Do

1. **SQL Lab**
   - Write and execute SQL queries
   - Save queries for reuse
   - Export results to CSV

2. **Chart Builder**
   - Drag-and-drop interface
   - 40+ visualization types
   - Interactive filters

3. **Dashboards**
   - Combine multiple charts
   - Add filters and controls
   - Share with others

4. **Database Connections**
   - Connect to PostgreSQL, MySQL, SQLite
   - Cloud databases (BigQuery, Snowflake)
   - NoSQL databases (MongoDB)

## 🐛 Troubleshooting

### Superset Not Starting

```bash
# Check logs
docker-compose logs superset

# Common issues:
# 1. Port 8088 already in use
# 2. Database not ready
# 3. Missing environment variables

# Solution: Restart services
docker-compose restart superset
```

### Can't Access Superset

```bash
# Check if container is running
docker ps | grep superset

# Check health
docker exec apranova_superset curl http://localhost:8088/health

# Restart if needed
docker-compose restart superset
```

### Workspace Not Provisioning

```bash
# Check backend logs
docker-compose logs backend

# Check Docker socket access
docker ps

# Verify user track
# Should be "DP" for Data Professional
```

### Port Conflicts

If port 8088 is already in use:

1. Edit `docker-compose.yml`:
   ```yaml
   ports:
     - "8089:8088"  # Change to 8089
   ```

2. Restart:
   ```bash
   docker-compose up -d superset
   ```

## 📚 Resources

### Documentation

- [Apache Superset Docs](https://superset.apache.org/docs/intro)
- [Superset Docker Hub](https://hub.docker.com/r/apache/superset)
- [Superset GitHub](https://github.com/apache/superset)

### Tutorials

- [Getting Started with Superset](https://superset.apache.org/docs/installation/installing-superset-using-docker-compose)
- [Creating Your First Dashboard](https://superset.apache.org/docs/creating-charts-dashboards/creating-your-first-dashboard)
- [Connecting to Databases](https://superset.apache.org/docs/databases/installing-database-drivers)

### Support

- Email: support@apranova.com
- Check logs: `docker-compose logs superset`
- GitHub Issues: [Project Repository]

## 🎯 Testing the Integration

### Test as Data Professional Student

1. **Create DP Student Account**
   ```bash
   # Use signup form or Django admin
   # Set track = "DP"
   ```

2. **Login and Navigate**
   - Go to Student Dashboard
   - Click "Workspace" in sidebar

3. **Launch Superset**
   - Click "Launch Superset" button
   - Wait for provisioning (30-60 seconds)
   - Should open in new tab

4. **Verify Access**
   - Login with admin/admin
   - See Superset dashboard
   - Explore sample data

### Test as FSD Student

1. **Create FSD Student Account**
   - Set track = "FSD"

2. **Launch Workspace**
   - Should get VS Code instead
   - Different UI and features

## 🔄 Maintenance

### Backup Superset Data

```bash
# Backup volume
docker run --rm -v apranova_superset_home:/data -v $(pwd):/backup alpine tar czf /backup/superset-backup.tar.gz /data
```

### Restore Superset Data

```bash
# Restore volume
docker run --rm -v apranova_superset_home:/data -v $(pwd):/backup alpine tar xzf /backup/superset-backup.tar.gz -C /
```

### Update Superset

```bash
# Pull latest image
docker-compose pull superset

# Restart with new image
docker-compose up -d superset
```

### Reset Superset

```bash
# Stop and remove container
docker-compose down superset

# Remove volume (WARNING: Deletes all data!)
docker volume rm apranova_superset_home

# Start fresh
docker-compose up -d superset
```

## ✅ Checklist

- [x] Docker Compose service added
- [x] Environment variables configured
- [x] Backend workspace logic (already existed)
- [x] Frontend UI updated
- [x] Startup scripts created
- [x] Documentation written
- [x] No diagnostics errors

## 🎉 Summary

Apache Superset is now fully integrated! Data Professional students will automatically get Superset when they click on their workspace, while Full Stack Development students continue to get VS Code. The system intelligently detects the user's track and provisions the appropriate environment.

**Next Steps:**
1. Start the services: `docker-compose up -d`
2. Test with a DP student account
3. Customize Superset settings as needed
4. Deploy to production with proper security
