# Apache Superset Integration Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        ApraNova LMS                              │
│                                                                   │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │   Student    │         │   Student    │                      │
│  │  (DP Track)  │         │  (FSD Track) │                      │
│  └──────┬───────┘         └──────┬───────┘                      │
│         │                        │                               │
│         │ Click "Workspace"      │ Click "Workspace"            │
│         │                        │                               │
│         ▼                        ▼                               │
│  ┌──────────────────────────────────────────┐                   │
│  │     Frontend (Next.js)                   │                   │
│  │  - Detects user track                    │                   │
│  │  - Shows appropriate UI                  │                   │
│  │  - Calls workspace API                   │                   │
│  └──────────────┬───────────────────────────┘                   │
│                 │                                                │
│                 │ POST /users/workspace/create/                 │
│                 │                                                │
│                 ▼                                                │
│  ┌──────────────────────────────────────────┐                   │
│  │     Backend (Django)                     │                   │
│  │  - Checks user.track                     │                   │
│  │  - Provisions container                  │                   │
│  │  - Returns workspace URL                 │                   │
│  └──────────────┬───────────────────────────┘                   │
│                 │                                                │
│        ┌────────┴────────┐                                      │
│        │                 │                                       │
│        ▼                 ▼                                       │
│  ┌──────────┐      ┌──────────┐                                │
│  │ Superset │      │ VS Code  │                                │
│  │Container │      │Container │                                │
│  │Port 8088 │      │Port 8080 │                                │
│  └──────────┘      └──────────┘                                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## User Flow Diagram

### Data Professional (DP) Student

```
┌─────────────┐
│   Sign Up   │
│  Track: DP  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Login    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│Student Dashboard│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│Click "Workspace"│
└──────┬──────────┘
       │
       ▼
┌──────────────────────┐
│Frontend detects      │
│track = "DP"          │
│Shows Superset UI     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│Click "Launch         │
│Superset"             │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│Backend provisions    │
│Superset container    │
│Port: 8088            │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│Returns URL:          │
│http://localhost:8088 │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│Opens Superset in     │
│new browser tab       │
└──────────────────────┘
```

### Full Stack Development (FSD) Student

```
┌─────────────┐
│   Sign Up   │
│ Track: FSD  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Login    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│Student Dashboard│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│Click "Workspace"│
└──────┬──────────┘
       │
       ▼
┌──────────────────────┐
│Frontend detects      │
│track = "FSD"         │
│Shows VS Code UI      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│Click "Launch         │
│Workspace"            │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│Backend provisions    │
│VS Code container     │
│Port: 8080            │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│Returns URL:          │
│http://localhost:8080 │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│Opens VS Code in      │
│new browser tab       │
└──────────────────────┘
```

## Component Interaction

### Backend Workspace Provisioning Logic

```python
# backend/accounts/workspace_views.py

def create_workspace(request):
    user = request.user
    
    # 1. Detect user track
    user_track = getattr(user, 'track', 'FSD')
    is_data_professional = user_track == 'DP'
    
    # 2. Choose container image and port
    if is_data_professional:
        image = "apache/superset:latest"
        port_mapping = {"8088/tcp": port}
        workspace_type = "superset"
    else:
        image = "codercom/code-server:latest"
        port_mapping = {"8080/tcp": port}
        workspace_type = "vscode"
    
    # 3. Create container
    container = docker_client.containers.run(
        image=image,
        ports=port_mapping,
        detach=True,
        ...
    )
    
    # 4. Return workspace URL
    return Response({
        "url": f"http://localhost:{port}",
        "workspace_type": workspace_type
    })
```

### Frontend Track Detection

```typescript
// frontend/app/student/workspace/page.tsx

export default function WorkspacePage() {
  const [workspaceType, setWorkspaceType] = useState<"vscode" | "superset">("vscode")
  
  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const res = await apiClient.get("/users/profile/")
      const track = res.data.track || "FSD"
      
      // Set workspace type based on track
      setWorkspaceType(track === "DP" ? "superset" : "vscode")
    }
    fetchProfile()
  }, [])
  
  // Show different UI based on workspace type
  return (
    <div>
      {workspaceType === "superset" ? (
        <SupersetUI />
      ) : (
        <VSCodeUI />
      )}
    </div>
  )
}
```

## Docker Architecture

### Service Dependencies

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│                  (apranova_network)                      │
│                                                           │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│  │PostgreSQL│◄───┤  Backend │◄───┤ Frontend │          │
│  │   :5432  │    │  :8000   │    │  :3000   │          │
│  └────┬─────┘    └──────────┘    └──────────┘          │
│       │                                                   │
│       │          ┌──────────┐                            │
│       ├─────────►│  Redis   │                            │
│       │          │  :6379   │                            │
│       │          └──────────┘                            │
│       │                                                   │
│       │          ┌──────────┐                            │
│       └─────────►│ Superset │                            │
│                  │  :8088   │                            │
│                  └──────────┘                            │
│                                                           │
│  ┌────────────────────────────────────────────┐         │
│  │     User Workspace Containers               │         │
│  │  (Dynamically created per user)             │         │
│  │                                              │         │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐ │         │
│  │  │Superset  │  │Superset  │  │ VS Code  │ │         │
│  │  │User 1    │  │User 2    │  │User 3    │ │         │
│  │  │:8089     │  │:8090     │  │:8081     │ │         │
│  │  └──────────┘  └──────────┘  └──────────┘ │         │
│  └────────────────────────────────────────────┘         │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Volume Management

```
┌─────────────────────────────────────────┐
│         Docker Volumes                   │
│                                          │
│  ┌────────────────┐                     │
│  │ postgres_data  │ ← PostgreSQL data   │
│  └────────────────┘                     │
│                                          │
│  ┌────────────────┐                     │
│  │  redis_data    │ ← Redis cache       │
│  └────────────────┘                     │
│                                          │
│  ┌────────────────┐                     │
│  │ superset_home  │ ← Superset config   │
│  └────────────────┘                     │
│                                          │
│  ┌────────────────┐                     │
│  │ static_volume  │ ← Django static     │
│  └────────────────┘                     │
│                                          │
│  ┌────────────────┐                     │
│  │ media_volume   │ ← User uploads      │
│  └────────────────┘                     │
│                                          │
│  ┌────────────────────────────────┐    │
│  │ User Workspace Volumes          │    │
│  │ (One per user)                  │    │
│  │                                 │    │
│  │  workspace_1_dp/                │    │
│  │  workspace_2_dp/                │    │
│  │  workspace_3_fsd/               │    │
│  └────────────────────────────────┘    │
│                                          │
└─────────────────────────────────────────┘
```

## Data Flow

### Workspace Creation Flow

```
┌─────────┐
│ Student │
└────┬────┘
     │
     │ 1. Click "Launch Workspace"
     ▼
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │
       │ 2. POST /users/workspace/create/
       │    Headers: Authorization: Bearer <token>
       ▼
┌──────────────┐
│   Backend    │
└──────┬───────┘
       │
       │ 3. Verify JWT token
       │ 4. Get user from token
       │ 5. Check user.track
       ▼
┌──────────────┐
│Docker Engine │
└──────┬───────┘
       │
       │ 6. Check if container exists
       │ 7. If not, create new container
       │ 8. Start container
       │ 9. Get port mapping
       ▼
┌──────────────┐
│   Backend    │
└──────┬───────┘
       │
       │ 10. Return workspace URL
       │     { url: "http://localhost:8088",
       │       workspace_type: "superset" }
       ▼
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │
       │ 11. Open URL in new tab
       ▼
┌──────────────┐
│   Superset   │
│   Browser    │
└──────────────┘
```

## Security Architecture

### Authentication Flow

```
┌─────────┐
│ Student │
└────┬────┘
     │
     │ 1. Login with email/password
     ▼
┌──────────────┐
│   Backend    │
│   /login/    │
└──────┬───────┘
       │
       │ 2. Verify credentials
       │ 3. Generate JWT tokens
       │    - Access token (15 min)
       │    - Refresh token (7 days)
       ▼
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │
       │ 4. Store tokens in localStorage
       │ 5. Include in API requests
       │    Authorization: Bearer <access_token>
       ▼
┌──────────────┐
│   Backend    │
│  Workspace   │
│     API      │
└──────┬───────┘
       │
       │ 6. Verify token
       │ 7. Extract user from token
       │ 8. Check permissions
       │ 9. Provision workspace
       ▼
┌──────────────┐
│   Docker     │
│  Container   │
└──────────────┘
```

### Container Isolation

```
┌─────────────────────────────────────────┐
│         Host Machine                     │
│                                          │
│  ┌────────────────────────────────┐    │
│  │  User 1 Container (DP)         │    │
│  │  - Isolated filesystem         │    │
│  │  - Dedicated port (8089)       │    │
│  │  - Own Superset instance       │    │
│  │  - Volume: workspace_1_dp/     │    │
│  └────────────────────────────────┘    │
│                                          │
│  ┌────────────────────────────────┐    │
│  │  User 2 Container (DP)         │    │
│  │  - Isolated filesystem         │    │
│  │  - Dedicated port (8090)       │    │
│  │  - Own Superset instance       │    │
│  │  - Volume: workspace_2_dp/     │    │
│  └────────────────────────────────┘    │
│                                          │
│  ┌────────────────────────────────┐    │
│  │  User 3 Container (FSD)        │    │
│  │  - Isolated filesystem         │    │
│  │  - Dedicated port (8081)       │    │
│  │  - Own VS Code instance        │    │
│  │  - Volume: workspace_3_fsd/    │    │
│  └────────────────────────────────┘    │
│                                          │
└─────────────────────────────────────────┘
```

## Scalability Considerations

### Current Architecture (Single Host)

```
┌─────────────────────────────────┐
│      Single Docker Host          │
│                                  │
│  - All services on one machine  │
│  - Limited by host resources    │
│  - Max ~50 concurrent users     │
│                                  │
└─────────────────────────────────┘
```

### Future Architecture (Kubernetes)

```
┌─────────────────────────────────────────────────────┐
│              Kubernetes Cluster                      │
│                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │   Node 1    │  │   Node 2    │  │   Node 3    ││
│  │             │  │             │  │             ││
│  │ Backend     │  │ Superset    │  │ Workspaces  ││
│  │ Frontend    │  │ Pods        │  │ Pods        ││
│  │ Database    │  │             │  │             ││
│  └─────────────┘  └─────────────┘  └─────────────┘│
│                                                       │
│  - Auto-scaling based on load                        │
│  - Load balancing across nodes                       │
│  - High availability                                 │
│  - Supports 1000+ concurrent users                   │
│                                                       │
└─────────────────────────────────────────────────────┘
```

## Monitoring and Logging

### Log Flow

```
┌──────────────┐
│  Container   │
│    Logs      │
└──────┬───────┘
       │
       │ stdout/stderr
       ▼
┌──────────────┐
│Docker Logging│
│   Driver     │
└──────┬───────┘
       │
       │ docker logs <container>
       ▼
┌──────────────┐
│   Console    │
│   Output     │
└──────────────┘
```

### Health Checks

```
┌──────────────┐
│   Superset   │
│  Container   │
└──────┬───────┘
       │
       │ Every 30s
       ▼
┌──────────────┐
│Health Check  │
│GET /health   │
└──────┬───────┘
       │
       ├─► 200 OK → Container healthy
       │
       └─► Timeout/Error → Container unhealthy
           → Docker restarts container
```

## Summary

The Apache Superset integration seamlessly provides Data Professional students with a professional analytics platform while maintaining the existing VS Code workspace for Full Stack Development students. The system automatically detects the user's track and provisions the appropriate environment, ensuring a smooth and intuitive user experience.
