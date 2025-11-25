---
layout: default
title: System Architecture - ApraNova LMS
---

<div style="text-align: center; padding: 30px 0 20px 0;">
  <h1 style="font-size: 3em; margin-bottom: 10px; background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">🏗️ System Architecture</h1>
  <p style="font-size: 1.2em; color: #7f8c8d; max-width: 700px; margin: 0 auto;">
    Complete architectural overview of the ApraNova Learning Management System
  </p>
</div>

<div style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); padding: 30px; border-radius: 12px; color: white; margin: 30px 0; box-shadow: 0 8px 25px rgba(52, 152, 219, 0.3);">
  <h3 style="margin-top: 0; color: white; font-size: 1.6em;">📋 Architecture Overview</h3>
  <p style="font-size: 1.1em; line-height: 1.7; margin-bottom: 0;">
    ApraNova follows a <strong>modern microservices architecture</strong> with clear separation of concerns.
    The system is built on a <strong>3-tier architecture</strong> (Presentation, Application, Data) with
    Docker containerization for scalability and isolation.
  </p>
</div>

---

## 🏗️ System Architecture Diagram

```mermaid
graph TB
    subgraph CLIENT["CLIENT LAYER"]
        WEB["Web Browser"]
        NEXTJS["Next.js Application<br/>Port 3000"]
    end

    subgraph FRONTEND["FRONTEND LAYER"]
        MOBILE["Mobile Browser"]
        ANCHANCA["Anchanca Service"]
    end

    subgraph BACKEND["BACKEND LAYER"]
        DJANGO["Django REST API<br/>Port 8000"]
        AUTOMATION["Automation Service"]
        WORKSPACE["Workspace Service"]
    end

    subgraph EXTERNAL["EXTERNAL SERVICES"]
        STRIPE["Stripe API"]
        GOOGLE["Google OAuth"]
        GITHUB["GitHub OAuth"]
    end

    subgraph DATA["DATA LAYER"]
        POSTGRES["PostgreSQL<br/>Port 5433"]
        REDIS["Redis<br/>Port 6380"]
        DOCKER["Docker"]
    end

    subgraph WORKSPACES["WORKSPACE LAYER"]
        CS1["Code-Server 1"]
        CS2["Code-Server 2"]
        CSN["Code-Server N"]
    end

    WEB -->|SSR/Routes| NEXTJS
    NEXTJS -->|API Calls| DJANGO
    MOBILE --> ANCHANCA
    ANCHANCA --> DJANGO

    DJANGO --> STRIPE
    DJANGO --> GOOGLE
    DJANGO --> GITHUB

    DJANGO --> POSTGRES
    DJANGO --> REDIS

    AUTOMATION --> WORKSPACE
    WORKSPACE --> DOCKER

    DOCKER --> CS1
    DOCKER --> CS2
    DOCKER --> CSN

    POSTGRES -.-> DOCKER
    REDIS -.-> DOCKER

    style CLIENT fill:#9b4dca,stroke:#7b3da6,stroke-width:3px,color:#fff
    style FRONTEND fill:#9b4dca,stroke:#7b3da6,stroke-width:3px,color:#fff
    style BACKEND fill:#9b4dca,stroke:#7b3da6,stroke-width:3px,color:#fff
    style EXTERNAL fill:#9b4dca,stroke:#7b3da6,stroke-width:3px,color:#fff
    style DATA fill:#9b4dca,stroke:#7b3da6,stroke-width:3px,color:#fff
    style WORKSPACES fill:#9b4dca,stroke:#7b3da6,stroke-width:3px,color:#fff

    style WEB fill:#1e3a5f,stroke:#61dafb,stroke-width:2px,color:#61dafb
    style NEXTJS fill:#1e3a5f,stroke:#61dafb,stroke-width:2px,color:#61dafb
    style MOBILE fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style ANCHANCA fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style DJANGO fill:#1e3a5f,stroke:#0fa,stroke-width:2px,color:#0fa
    style AUTOMATION fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style WORKSPACE fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style STRIPE fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style GOOGLE fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style GITHUB fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style POSTGRES fill:#1e3a5f,stroke:#61dafb,stroke-width:2px,color:#61dafb
    style REDIS fill:#8b0000,stroke:#dc382d,stroke-width:2px,color:#dc382d
    style DOCKER fill:#1e3a5f,stroke:#61dafb,stroke-width:2px,color:#61dafb
    style CS1 fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style CS2 fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style CSN fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
```

---

## 📦 Component Architecture

<div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 5px 20px rgba(250, 112, 154, 0.2);">
  <h3 style="margin-top: 0; color: #2c3e50; font-size: 1.5em;">⚛️ Frontend Architecture</h3>
  <p style="color: #2c3e50; font-size: 1.05em; line-height: 1.6; margin-bottom: 0;">
    Built with <strong>Next.js 15.2.4</strong> using the App Router pattern. Features React 19 components,
    Context API for state management, and Axios for API communication with interceptors for authentication.
  </p>
</div>

### Frontend Component Diagram

```mermaid
graph TB
    subgraph COMPONENTS["FRONTEND COMPONENTS"]
        APP["App Router"]
        LAYOUT["Layout Components"]
        PAGES["Page Components"]
        AUTH["Auth Components"]
        DASHBOARD["Dashboard Components"]
        WORKSPACE["Workspace Components"]
    end

    subgraph STATE["STATE MANAGEMENT"]
        CONTEXT["React Context"]
        LOCAL["Local Storage"]
        SESSION["Session Storage"]
    end

    subgraph API["API LAYER"]
        CLIENT["Axios Client"]
        INTERCEPTORS["Request/Response<br/>Interceptors"]
        SERVICES["Service Functions"]
    end

    APP --> LAYOUT
    LAYOUT --> PAGES
    PAGES --> AUTH
    PAGES --> DASHBOARD
    PAGES --> WORKSPACE

    AUTH --> CONTEXT
    DASHBOARD --> CONTEXT
    WORKSPACE --> CONTEXT

    CONTEXT --> LOCAL
    CONTEXT --> SESSION

    PAGES --> SERVICES
    SERVICES --> CLIENT
    CLIENT --> INTERCEPTORS

    style COMPONENTS fill:#9b4dca,stroke:#7b3da6,stroke-width:3px,color:#fff
    style STATE fill:#9b4dca,stroke:#7b3da6,stroke-width:3px,color:#fff
    style API fill:#9b4dca,stroke:#7b3da6,stroke-width:3px,color:#fff

    style APP fill:#1e3a5f,stroke:#61dafb,stroke-width:2px,color:#61dafb
    style LAYOUT fill:#1e3a5f,stroke:#61dafb,stroke-width:2px,color:#61dafb
    style PAGES fill:#1e3a5f,stroke:#61dafb,stroke-width:2px,color:#61dafb
    style AUTH fill:#1e3a5f,stroke:#61dafb,stroke-width:2px,color:#61dafb
    style DASHBOARD fill:#1e3a5f,stroke:#61dafb,stroke-width:2px,color:#61dafb
    style WORKSPACE fill:#1e3a5f,stroke:#61dafb,stroke-width:2px,color:#61dafb
    style CONTEXT fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style LOCAL fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style SESSION fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style CLIENT fill:#1e3a5f,stroke:#0fa,stroke-width:2px,color:#0fa
    style INTERCEPTORS fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style SERVICES fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
```

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 5px 20px rgba(102, 126, 234, 0.2); color: white;">
  <h3 style="margin-top: 0; color: white; font-size: 1.5em;">⚙️ Backend Architecture</h3>
  <p style="font-size: 1.05em; line-height: 1.6; margin-bottom: 0;">
    Powered by <strong>Django 5.2.7</strong> with Django REST Framework. Implements JWT authentication,
    Docker-in-Docker workspace provisioning, Stripe payment integration, and PostgreSQL + Redis for data persistence.
  </p>
</div>

### Backend Component Diagram

```mermaid
graph TB
    subgraph APILAYER["API LAYER"]
        URLS["URL Router"]
        VIEWS["API Views"]
        SERIALIZERS["Serializers"]
    end

    subgraph LOGIC["BUSINESS LOGIC"]
        AUTHLOGIC["Authentication Logic"]
        WORKSPACELOGIC["Workspace Logic"]
        PAYMENTLOGIC["Payment Logic"]
        USERLOGIC["User Logic"]
    end

    subgraph DATALAYER["DATA LAYER"]
        MODELS["Django Models"]
        MIGRATIONS["Database Migrations"]
        MANAGERS["Model Managers"]
    end

    subgraph INTEGRATIONS["EXTERNAL INTEGRATIONS"]
        DOCKERAPI["Docker API"]
        STRIPEAPI["Stripe API"]
        OAUTH["OAuth Providers"]
    end

    URLS --> VIEWS
    VIEWS --> SERIALIZERS
    SERIALIZERS --> AUTHLOGIC
    SERIALIZERS --> WORKSPACELOGIC
    SERIALIZERS --> PAYMENTLOGIC
    SERIALIZERS --> USERLOGIC

    AUTHLOGIC --> MODELS
    WORKSPACELOGIC --> MODELS
    PAYMENTLOGIC --> MODELS
    USERLOGIC --> MODELS

    MODELS --> MIGRATIONS
    MODELS --> MANAGERS

    WORKSPACELOGIC --> DOCKERAPI
    PAYMENTLOGIC --> STRIPEAPI
    AUTHLOGIC --> OAUTH

    style APILAYER fill:#9b4dca,stroke:#7b3da6,stroke-width:3px,color:#fff
    style LOGIC fill:#9b4dca,stroke:#7b3da6,stroke-width:3px,color:#fff
    style DATALAYER fill:#9b4dca,stroke:#7b3da6,stroke-width:3px,color:#fff
    style INTEGRATIONS fill:#9b4dca,stroke:#7b3da6,stroke-width:3px,color:#fff

    style URLS fill:#1e3a5f,stroke:#0fa,stroke-width:2px,color:#0fa
    style VIEWS fill:#1e3a5f,stroke:#0fa,stroke-width:2px,color:#0fa
    style SERIALIZERS fill:#1e3a5f,stroke:#0fa,stroke-width:2px,color:#0fa
    style AUTHLOGIC fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style WORKSPACELOGIC fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style PAYMENTLOGIC fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style USERLOGIC fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style MODELS fill:#1e3a5f,stroke:#0fa,stroke-width:2px,color:#0fa
    style MIGRATIONS fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style MANAGERS fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style DOCKERAPI fill:#1e3a5f,stroke:#61dafb,stroke-width:2px,color:#61dafb
    style STRIPEAPI fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style OAUTH fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
```

---

## 🔄 Request Flow

### Standard API Request Flow

```mermaid
sequenceDiagram
    participant Browser
    participant NextJS
    participant Middleware
    participant APIClient
    participant Django
    participant Database

    Browser->>NextJS: User Action
    NextJS->>Middleware: Route Request
    Middleware->>Middleware: Check Auth
    Middleware->>APIClient: Make API Call
    APIClient->>APIClient: Add JWT Token
    APIClient->>Django: HTTP Request
    Django->>Django: Validate Token
    Django->>Django: Check Permissions
    Django->>Database: Query Data
    Database-->>Django: Return Data
    Django-->>APIClient: JSON Response
    APIClient-->>NextJS: Process Response
    NextJS-->>Browser: Render UI
```

### Authenticated Request with Token Refresh

```mermaid
sequenceDiagram
    participant Browser
    participant APIClient
    participant Django
    participant Redis

    Browser->>APIClient: API Request
    APIClient->>APIClient: Add Access Token
    APIClient->>Django: Request with Token
    Django->>Django: Validate Token
    Django-->>APIClient: 401 Unauthorized
    APIClient->>APIClient: Detect 401
    APIClient->>Django: Refresh Token Request
    Django->>Redis: Check Token Blacklist
    Redis-->>Django: Token Valid
    Django-->>APIClient: New Access Token
    APIClient->>APIClient: Save New Token
    APIClient->>Django: Retry Original Request
    Django-->>APIClient: Success Response
    APIClient-->>Browser: Return Data
```

---

## 🗄️ Data Flow Architecture

```mermaid
graph LR
    subgraph CLIENT["CLIENT SIDE"]
        FORM["User Form"]
        STATE["Component State"]
    end

    subgraph APILAYER["API LAYER"]
        VALIDATION["Client Validation"]
        REQUEST["API Request"]
    end

    subgraph SERVER["SERVER SIDE"]
        SERIALIZER["DRF Serializer"]
        BUSINESSLOGIC["Business Logic"]
        MODEL["Django Model"]
    end

    subgraph STORAGE["STORAGE"]
        DB[("Database")]
        CACHE[("Cache")]
        FILES["File Storage"]
    end

    FORM --> STATE
    STATE --> VALIDATION
    VALIDATION --> REQUEST
    REQUEST --> SERIALIZER
    SERIALIZER --> BUSINESSLOGIC
    BUSINESSLOGIC --> MODEL
    MODEL --> DB
    BUSINESSLOGIC --> CACHE
    BUSINESSLOGIC --> FILES

    style CLIENT fill:#9b4dca,stroke:#7b3da6,stroke-width:3px,color:#fff
    style APILAYER fill:#9b4dca,stroke:#7b3da6,stroke-width:3px,color:#fff
    style SERVER fill:#9b4dca,stroke:#7b3da6,stroke-width:3px,color:#fff
    style STORAGE fill:#9b4dca,stroke:#7b3da6,stroke-width:3px,color:#fff

    style FORM fill:#1e3a5f,stroke:#61dafb,stroke-width:2px,color:#61dafb
    style STATE fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style VALIDATION fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style REQUEST fill:#1e3a5f,stroke:#0fa,stroke-width:2px,color:#0fa
    style SERIALIZER fill:#1e3a5f,stroke:#0fa,stroke-width:2px,color:#0fa
    style BUSINESSLOGIC fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style MODEL fill:#1e3a5f,stroke:#0fa,stroke-width:2px,color:#0fa
    style DB fill:#1e3a5f,stroke:#61dafb,stroke-width:2px,color:#61dafb
    style CACHE fill:#8b0000,stroke:#dc382d,stroke-width:2px,color:#dc382d
    style FILES fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
```

---

## 🐳 Docker Architecture

```mermaid
graph TB
    subgraph DOCKERHOST["DOCKER HOST"]
        subgraph NETWORK["APRANOVA NETWORK"]
            FRONTEND["Frontend Container<br/>Next.js:3000"]
            BACKEND["Backend Container<br/>Django:8000"]
            DBCONTAINER["PostgreSQL Container<br/>Port 5433"]
            REDISCONTAINER["Redis Container<br/>Port 6380"]
        end

        subgraph WORKSPACES["WORKSPACE CONTAINERS"]
            WS1["Workspace 1<br/>Code-Server"]
            WS2["Workspace 2<br/>Code-Server"]
            WSN["Workspace N<br/>Code-Server"]
        end

        DOCKERSOCKET["Docker Socket<br/>/var/run/docker.sock"]
    end

    subgraph VOLUMES["VOLUMES"]
        PGDATA["postgres_data"]
        REDISDATA["redis_data"]
        STATICFILES["static_volume"]
        MEDIAFILES["media_volume"]
        WORKSPACEDATA["workspace_data"]
    end

    FRONTEND --> BACKEND
    BACKEND --> DBCONTAINER
    BACKEND --> REDISCONTAINER
    BACKEND --> DOCKERSOCKET

    DOCKERSOCKET --> WS1
    DOCKERSOCKET --> WS2
    DOCKERSOCKET --> WSN

    DBCONTAINER --> PGDATA
    REDISCONTAINER --> REDISDATA
    BACKEND --> STATICFILES
    BACKEND --> MEDIAFILES
    WS1 --> WORKSPACEDATA
    WS2 --> WORKSPACEDATA
    WSN --> WORKSPACEDATA

    style DOCKERHOST fill:#000,stroke:#9b4dca,stroke-width:3px,color:#fff
    style NETWORK fill:#9b4dca,stroke:#7b3da6,stroke-width:3px,color:#fff
    style WORKSPACES fill:#9b4dca,stroke:#7b3da6,stroke-width:3px,color:#fff
    style VOLUMES fill:#9b4dca,stroke:#7b3da6,stroke-width:3px,color:#fff

    style FRONTEND fill:#1e3a5f,stroke:#61dafb,stroke-width:2px,color:#61dafb
    style BACKEND fill:#1e3a5f,stroke:#0fa,stroke-width:2px,color:#0fa
    style DBCONTAINER fill:#1e3a5f,stroke:#61dafb,stroke-width:2px,color:#61dafb
    style REDISCONTAINER fill:#8b0000,stroke:#dc382d,stroke-width:2px,color:#dc382d
    style DOCKERSOCKET fill:#1e3a5f,stroke:#61dafb,stroke-width:2px,color:#61dafb
    style WS1 fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style WS2 fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style WSN fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style PGDATA fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style REDISDATA fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style STATICFILES fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style MEDIAFILES fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
    style WORKSPACEDATA fill:#9b4dca,stroke:#fff,stroke-width:2px,color:#fff
```

---

## 🔌 Integration Points

### External Service Integration

| Service | Purpose | Integration Method |
|---------|---------|-------------------|
| **Stripe** | Payment Processing | REST API |
| **Google OAuth** | Social Authentication | OAuth 2.0 |
| **GitHub OAuth** | Social Authentication | OAuth 2.0 |
| **Docker Engine** | Workspace Provisioning | Docker SDK |
| **SMTP Server** | Email Notifications | SMTP Protocol |

### Internal Service Communication

| From | To | Protocol | Purpose |
|------|-----|----------|---------|
| Frontend | Backend | HTTP/HTTPS | API Requests |
| Backend | PostgreSQL | TCP | Database Queries |
| Backend | Redis | TCP | Caching |
| Backend | Docker | Unix Socket | Container Management |
| Next.js | Django | HTTP Proxy | SSR API Calls |

---

## 📊 Scalability Considerations

### Horizontal Scaling

```mermaid
graph TB
    LB["Load Balancer"]

    subgraph FECLUSTER["FRONTEND CLUSTER"]
        FE1["Frontend 1"]
        FE2["Frontend 2"]
        FE3["Frontend N"]
    end

    subgraph BECLUSTER["BACKEND CLUSTER"]
        BE1["Backend 1"]
        BE2["Backend 2"]
        BE3["Backend N"]
    end

    subgraph DATALAYER["DATA LAYER"]
        DBMASTER[("DB Master")]
        DBREPLICA1[("DB Replica 1")]
        DBREPLICA2[("DB Replica 2")]
        REDISCLUSTER[("Redis Cluster")]
    end

    LB --> FE1
    LB --> FE2
    LB --> FE3

    FE1 --> BE1
    FE2 --> BE2
    FE3 --> BE3

    BE1 --> DBMASTER
    BE2 --> DBMASTER
    BE3 --> DBMASTER

    DBMASTER --> DBREPLICA1
    DBMASTER --> DBREPLICA2

    BE1 --> REDISCLUSTER
    BE2 --> REDISCLUSTER
    BE3 --> REDISCLUSTER

    style FECLUSTER fill:#9b4dca,stroke:#7b3da6,stroke-width:3px,color:#fff
    style BECLUSTER fill:#9b4dca,stroke:#7b3da6,stroke-width:3px,color:#fff
    style DATALAYER fill:#9b4dca,stroke:#7b3da6,stroke-width:3px,color:#fff

    style LB fill:#9b4dca,stroke:#fff,stroke-width:4px,color:#fff
    style FE1 fill:#1e3a5f,stroke:#61dafb,stroke-width:2px,color:#61dafb
    style FE2 fill:#1e3a5f,stroke:#61dafb,stroke-width:2px,color:#61dafb
    style FE3 fill:#1e3a5f,stroke:#61dafb,stroke-width:2px,color:#61dafb
    style BE1 fill:#1e3a5f,stroke:#0fa,stroke-width:2px,color:#0fa
    style BE2 fill:#1e3a5f,stroke:#0fa,stroke-width:2px,color:#0fa
    style BE3 fill:#1e3a5f,stroke:#0fa,stroke-width:2px,color:#0fa
    style DBMASTER fill:#1e3a5f,stroke:#61dafb,stroke-width:2px,color:#61dafb
    style DBREPLICA1 fill:#1e3a5f,stroke:#61dafb,stroke-width:2px,color:#61dafb
    style DBREPLICA2 fill:#1e3a5f,stroke:#61dafb,stroke-width:2px,color:#61dafb
    style REDISCLUSTER fill:#8b0000,stroke:#dc382d,stroke-width:2px,color:#dc382d
```

---

## 🔒 Security Architecture

### Security Layers

1. **Network Layer**: CORS, HTTPS, Firewall rules
2. **Application Layer**: JWT validation, CSRF protection
3. **Data Layer**: Encrypted connections, password hashing
4. **Container Layer**: Isolated workspaces, resource limits

### Authentication Flow

See [Authentication Flow](./auth-flow.md) for detailed diagrams.

---

## 📈 Performance Optimization

### Caching Strategy

- **Redis Cache**: User sessions, API responses
- **Browser Cache**: Static assets, images
- **Database Cache**: Query result caching
- **CDN**: Static file delivery (production)

### Database Optimization

- **Indexes**: On frequently queried fields
- **Connection Pooling**: Reuse database connections
- **Query Optimization**: Select only needed fields
- **Lazy Loading**: Load related objects on demand

---

## 🔗 Related Documentation

- [Database Schema](./database-schema.md)
- [API Documentation](./api-documentation.md)
- [Deployment Guide](./deployment.md)

---

[← Back to Index](./index.md)

