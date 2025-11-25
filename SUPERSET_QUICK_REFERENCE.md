# Apache Superset - Quick Reference Card

## 🚀 Quick Start Commands

### Start Superset
```bash
# Windows
.\start-superset.ps1

# Mac/Linux
./start-superset.sh

# Manual
docker-compose up -d superset
```

### Access Superset
- **URL**: http://localhost:8088
- **Username**: `admin`
- **Password**: `admin`

## 📋 Common Commands

### Service Management
```bash
# Start
docker-compose up -d superset

# Stop
docker-compose stop superset

# Restart
docker-compose restart superset

# Remove
docker-compose down superset

# View logs
docker-compose logs -f superset

# Check status
docker-compose ps superset
```

### Container Management
```bash
# Access container shell
docker exec -it apranova_superset bash

# Check health
docker exec apranova_superset curl http://localhost:8088/health

# View container info
docker inspect apranova_superset
```

### Database Management
```bash
# Initialize database
docker exec apranova_superset superset db upgrade

# Create admin user
docker exec apranova_superset superset fab create-admin \
  --username admin \
  --firstname Admin \
  --lastname User \
  --email admin@apranova.com \
  --password admin

# Reset password
docker exec apranova_superset superset fab reset-password --username admin
```

## 🎯 User Tracks

| Track | Code | Workspace | Port |
|-------|------|-----------|------|
| Data Professional | DP | Apache Superset | 8088 |
| Full Stack Development | FSD | VS Code | 8080 |

## 🔧 Configuration

### Environment Variables (.env)
```env
SUPERSET_SECRET_KEY=your-secret-key
SUPERSET_ADMIN_USERNAME=admin
SUPERSET_ADMIN_PASSWORD=admin
SUPERSET_ADMIN_EMAIL=admin@apranova.com
```

### Generate Secret Key
```bash
openssl rand -base64 42
```

## 📊 Superset Features

### Main Components
- **SQL Lab** - Write and execute SQL queries
- **Charts** - Create visualizations
- **Dashboards** - Combine multiple charts
- **Datasets** - Define data sources
- **Databases** - Connect to data sources

### Supported Databases
- PostgreSQL ✓
- MySQL ✓
- SQLite ✓
- MongoDB ✓
- BigQuery ✓
- Snowflake ✓
- Redshift ✓
- And 40+ more...

## 🔌 Database Connection

### PostgreSQL (Built-in)
```
Host: db
Port: 5432
Database: apranova_db
User: apranova_user
Password: apranova_dev_password_123

Connection String:
postgresql://apranova_user:apranova_dev_password_123@db:5432/apranova_db
```

## 🐛 Troubleshooting

### Superset Not Starting
```bash
# Check logs
docker-compose logs superset

# Check if port is in use
netstat -ano | findstr :8088  # Windows
lsof -i :8088                 # Mac/Linux

# Restart
docker-compose restart superset
```

### Can't Login
```bash
# Reset admin password
docker exec -it apranova_superset superset fab reset-password --username admin

# Create new admin
docker exec -it apranova_superset superset fab create-admin
```

### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose ps db

# Test connection
docker exec apranova_superset psql -h db -U apranova_user -d apranova_db
```

### Port Already in Use
Edit `docker-compose.yml`:
```yaml
ports:
  - "8089:8088"  # Change to different port
```

## 📁 File Locations

### Configuration Files
- `docker-compose.yml` - Service definition
- `.env` - Environment variables
- `backend/accounts/workspace_views.py` - Workspace provisioning logic
- `frontend/app/student/workspace/page.tsx` - Workspace UI

### Documentation
- `SUPERSET_INTEGRATION_GUIDE.md` - Complete integration guide
- `SUPERSET_SETUP.md` - Setup instructions
- `SUPERSET_ARCHITECTURE.md` - Architecture diagrams
- `README.md` - Main documentation

### Scripts
- `start-superset.ps1` - Windows startup script
- `start-superset.sh` - Mac/Linux startup script

## 🔐 Security Checklist

### Development
- [x] Default credentials (admin/admin)
- [x] HTTP (no SSL)
- [x] Open access on localhost

### Production
- [ ] Change default password
- [ ] Use strong secret key
- [ ] Enable HTTPS
- [ ] Configure firewall
- [ ] Set up authentication
- [ ] Enable audit logging
- [ ] Regular backups

## 💾 Backup & Restore

### Backup
```bash
# Backup Superset data
docker run --rm \
  -v apranova_superset_home:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/superset-backup.tar.gz /data

# Backup database
docker exec apranova_db pg_dump -U apranova_user apranova_db > backup.sql
```

### Restore
```bash
# Restore Superset data
docker run --rm \
  -v apranova_superset_home:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/superset-backup.tar.gz -C /

# Restore database
docker exec -i apranova_db psql -U apranova_user apranova_db < backup.sql
```

## 📈 Performance Tips

### Optimize Queries
- Use indexes on frequently queried columns
- Limit result sets with WHERE clauses
- Use EXPLAIN to analyze query plans

### Cache Configuration
- Enable Redis caching (already configured)
- Set appropriate cache timeouts
- Use query result caching

### Resource Limits
```yaml
# docker-compose.yml
superset:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 4G
      reservations:
        cpus: '1'
        memory: 2G
```

## 🔗 Useful Links

### Documentation
- [Superset Docs](https://superset.apache.org/docs/intro)
- [Docker Hub](https://hub.docker.com/r/apache/superset)
- [GitHub](https://github.com/apache/superset)

### Tutorials
- [Getting Started](https://superset.apache.org/docs/installation/installing-superset-using-docker-compose)
- [Creating Dashboards](https://superset.apache.org/docs/creating-charts-dashboards/creating-your-first-dashboard)
- [SQL Lab](https://superset.apache.org/docs/using-superset/exploring-data)

### Community
- [Slack](https://apache-superset.slack.com/)
- [Mailing List](https://lists.apache.org/list.html?dev@superset.apache.org)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/apache-superset)

## 📞 Support

### Get Help
- Email: support@apranova.com
- Check logs: `docker-compose logs superset`
- GitHub Issues: [Project Repository]

### Common Issues
1. **Port conflict** → Change port in docker-compose.yml
2. **Can't login** → Reset password with `superset fab reset-password`
3. **Database error** → Check PostgreSQL is running
4. **Slow performance** → Enable Redis caching
5. **Container won't start** → Check logs with `docker-compose logs superset`

## 🎓 Student Workflow

### For Data Professional Students

1. **Sign Up**
   - Choose "Data Professional (DP)" track

2. **Login**
   - Access student dashboard

3. **Launch Workspace**
   - Click "Workspace" in sidebar
   - Click "Launch Superset" button
   - Wait 30-60 seconds

4. **Access Superset**
   - Opens automatically in new tab
   - Login with admin/admin
   - Start creating dashboards!

### First Steps in Superset

1. **Explore Examples**
   - Go to "Dashboards" → "Examples"
   - Click on any dashboard to see it in action

2. **Try SQL Lab**
   - Go to "SQL Lab" → "SQL Editor"
   - Select database and schema
   - Write and execute queries

3. **Create Your First Chart**
   - Go to "Charts" → "+ Chart"
   - Select dataset
   - Choose visualization type
   - Configure and save

4. **Build a Dashboard**
   - Go to "Dashboards" → "+ Dashboard"
   - Add charts by dragging
   - Arrange and resize
   - Save and share

## 🎯 Quick Tips

### Keyboard Shortcuts
- `Ctrl + Enter` - Run SQL query
- `Ctrl + S` - Save chart/dashboard
- `Ctrl + /` - Toggle comments in SQL

### Best Practices
- Name charts and dashboards clearly
- Use filters for interactivity
- Add descriptions to datasets
- Document complex queries
- Test queries before adding to dashboards
- Use appropriate visualization types
- Keep dashboards focused and simple

### Performance
- Limit query results (use LIMIT)
- Use database indexes
- Enable caching
- Avoid SELECT *
- Use aggregations when possible

---

**Need more help?** Check `SUPERSET_INTEGRATION_GUIDE.md` for detailed instructions.
