# Project-Based Tools Implementation

## Current Problem
- All tools (Superset, Prefect, Jupyter) show at once
- Doesn't match the actual DP workflow where tools unlock per project
- Trainer dashboard doesn't show project-specific progress

## Correct DP Workflow

### Project 1: Business Analytics Dashboard
**Tools Needed:**
- ✅ Jupyter Notebook (Clean CSV with Pandas)
- ✅ PostgreSQL (Load transformed data)
- ✅ Superset (Build dashboard)

**Workflow:**
1. Clean raw CSV dataset in Python/Pandas (Jupyter)
2. Load transformed data into PostgreSQL (student schema)
3. Write complex SQL queries for KPIs & insights
4. Connect Superset to PostgreSQL schema
5. Build interactive dashboard with filters/charts
6. Summarize findings in 1-page insights report

### Project 2: Automated ETL Pipeline
**Tools Needed:**
- ✅ Jupyter Notebook (API data transformation)
- ✅ PostgreSQL (Load API data)
- ✅ Prefect (Orchestration & scheduling)
- ✅ Email (Daily reports)

**Workflow:**
1. Pick a public API (weather, COVID, finance)
2. Use Requests to pull daily API data (Jupyter)
3. Transform data with Pandas (Jupyter)
4. Load into PostgreSQL schema (new table)
5. Orchestrate using Prefect (scheduling + monitoring)
6. Add daily email report summarizing KPIs

### Project 3: End-to-End Analytics Solution (Capstone)
**Tools Needed:**
- ✅ All previous tools
- ✅ Cloud platform (BigQuery/Redshift)
- ✅ Cloud deployment

**Workflow:**
1. Design complete analytics solution
2. Deploy on cloud infrastructure
3. Implement full ETL pipeline
4. Create production dashboards
5. Document architecture

## Implementation Changes

### 1. Backend API Changes

**New Endpoint:** `GET /api/curriculum/current-project-tools/`
```python
# Returns tools for current active project
{
  "project": {
    "id": 1,
    "title": "Business Analytics Dashboard",
    "number": 1
  },
  "tools": [
    {
      "name": "Jupyter Notebook",
      "type": "jupyter",
      "url": "http://localhost:8888",
      "description": "Clean CSV data with Python/Pandas",
      "status": "active"
    },
    {
      "name": "PostgreSQL",
      "type": "database",
      "credentials": {...},
      "description": "Load transformed data",
      "status": "active"
    },
    {
      "name": "Apache Superset",
      "type": "superset",
      "url": "http://localhost:8088",
      "description": "Build interactive dashboard",
      "status": "active"
    }
  ]
}
```

### 2. Frontend Changes

**Student Dashboard:**
- Show current project prominently
- Display only tools for current project
- Show workflow steps with tool icons
- Progress indicator per step

**Trainer Dashboard:**
- See all students' current projects
- View which tools each student is using
- Monitor progress per project
- See submission status

### 3. Tool Unlocking Logic

```python
def get_tools_for_project(project_number):
    if project_number == 1:
        return ['jupyter', 'postgresql', 'superset']
    elif project_number == 2:
        return ['jupyter', 'postgresql', 'prefect']
    elif project_number == 3:
        return ['jupyter', 'postgresql', 'superset', 'prefect', 'cloud']
    return []
```

### 4. UI Components to Update

1. **ToolCardsSection.tsx** - Make project-aware
2. **StudentDashboard** - Show current project context
3. **TrainerDashboard** - Show student project progress
4. **ProjectGuide** - Highlight tools needed for each step

## Next Steps

1. Create backend endpoint for project-specific tools
2. Update ToolCardsSection to accept currentProject prop
3. Modify student dashboard to fetch current project
4. Update trainer dashboard to show project-based view
5. Add workflow visualization with tool icons
