# Dashboard Tool Cards Integration

## Files Created:
1. ✅ `frontend/components/student/tool-card.tsx` - Individual tool card component
2. ✅ `frontend/components/student/tool-cards-section.tsx` - Tool cards section with all tools

## How to Integrate into Dashboard:

### Step 1: Import the component
Add to the imports at the top of `frontend/app/student/dashboard/page.tsx`:

```typescript
import ToolCardsSection from "@/components/student/tool-cards-section"
```

### Step 2: Add tool cards section
Add this section AFTER the "Trainer Info" section and BEFORE the "Main grid" section:

```typescript
{/* Tool Cards Section */}
<ToolCardsSection
  track={currentTrack?.code as 'DP' | 'FSD' | null}
  supersetUrl={profileResponse.data?.superset_url}
  prefectUrl={profileResponse.data?.prefect_url}
  jupyterUrl={profileResponse.data?.jupyter_url}
  workspaceUrl={profileResponse.data?.workspace_url}
  dbCredentials={
    currentTrack?.code === 'DP' && profileResponse.data?.db_credentials
      ? {
          host: 'db.apranova.com',
          port: '5432',
          database: 'apranova_students',
          schema: `dp_student_${profileResponse.data.id}`,
          username: `student_${profileResponse.data.id}`,
          password: '***********', // Fetch from API
          connectionString: `postgresql://student_${profileResponse.data.id}:***@db.apranova.com:5432/apranova_students?options=-c%20search_path=dp_student_${profileResponse.data.id}`
        }
      : undefined
  }
/>
```

### Step 3: Fetch user data
Make sure the dashboard fetches user profile data including:
- `superset_url`
- `prefect_url`
- `jupyter_url`
- `workspace_url`
- `track` (DP or FSD)

This data should already be available from the `/api/users/profile` endpoint.

## What It Looks Like:

### For DP (Data Professional) Students:
- **Apache Superset** (Green) - "Open Superset" button
- **Prefect** (Blue) - "Open Prefect" button
- **Jupyter Notebook** (Orange) - "Open Jupyter" button
- **PostgreSQL Database** (Green) - "Show Credentials" button with expandable credentials
- **Discord Community** (Purple) - "Open Discord" button

### For FSD (Full-Stack Developer) Students:
- **CodeServer** (Blue) - "Open CodeServer" button
- **GitHub** (Green) - "Open GitHub" button
- **Discord Community** (Purple) - "Open Discord" button

## Features:
- ✅ Color-coded by tool type
- ✅ Icons for each tool
- ✅ "Open [Tool]" buttons that open in new tab
- ✅ Database credentials with copy-to-clipboard
- ✅ Status indicators (active, provisioning, inactive)
- ✅ Hover effects and animations
- ✅ Responsive design
- ✅ Dark theme matching the screenshot

## API Endpoint Needed:

Create an endpoint to fetch database credentials:

```python
# backend/accounts/views.py

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_db_credentials(request):
    """Get database credentials for DP students"""
    user = request.user
    
    if user.track != 'DP':
        return Response(
            {"error": "Database credentials only available for DP track"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    from .postgres_provisioning import PostgresProvisioningService
    
    credentials = PostgresProvisioningService.get_credentials(user)
    
    if not credentials:
        return Response(
            {"error": "Database not provisioned yet"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    return Response(credentials)
```

Add to `backend/accounts/urls.py`:
```python
path('db-credentials/', views.get_db_credentials, name='db-credentials'),
```

## Testing:

1. Login as a DP student
2. Go to dashboard
3. See tool cards for Superset, Prefect, Jupyter, PostgreSQL, Discord
4. Click "Open Superset" - opens in new tab
5. Click "Show Credentials" on PostgreSQL - expands to show credentials
6. Click copy button - copies to clipboard

Login as FSD student:
1. See tool cards for CodeServer, GitHub, Discord
2. Click "Open CodeServer" - opens in new tab

## Result:

The dashboard will now show tool cards exactly like the screenshot you provided, with the green-bordered Apache Superset card and "Open Superset" button!
