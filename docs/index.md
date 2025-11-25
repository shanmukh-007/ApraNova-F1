---
layout: default
title: ApraNova LMS - Technical Documentation
---

<div style="text-align: center; padding: 40px 0 20px 0;">
  <h1 style="font-size: 3.5em; margin-bottom: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">🎓 ApraNova LMS</h1>
  <h2 style="font-size: 1.8em; color: #2c3e50; font-weight: 400; margin-top: 0;">Modern Learning Management System</h2>
  <p style="font-size: 1.2em; color: #7f8c8d; margin-top: 20px; max-width: 800px; margin-left: auto; margin-right: auto;">
    Complete technical documentation for a cloud-native LMS with Docker workspaces, JWT authentication, and integrated payments
  </p>
</div>

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 15px; color: white; margin: 40px 0; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);">
  <h3 style="margin-top: 0; color: white; font-size: 1.8em;">🚀 What is ApraNova?</h3>
  <p style="font-size: 1.15em; line-height: 1.8; margin-bottom: 20px;">
    ApraNova is a <strong>cloud-native Learning Management System</strong> that provides students with isolated,
    Docker-based VS Code workspaces, integrated payment processing, and multi-role authentication.
    Built with Django REST Framework and Next.js for maximum scalability and performance.
  </p>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 25px;">
    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
      <div style="font-size: 2em; margin-bottom: 5px;">🐳</div>
      <div style="font-weight: 600;">Docker Workspaces</div>
      <div style="font-size: 0.9em; opacity: 0.9;">Isolated environments</div>
    </div>
    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
      <div style="font-size: 2em; margin-bottom: 5px;">🔐</div>
      <div style="font-weight: 600;">JWT + OAuth</div>
      <div style="font-size: 0.9em; opacity: 0.9;">Secure authentication</div>
    </div>
    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
      <div style="font-size: 2em; margin-bottom: 5px;">💳</div>
      <div style="font-weight: 600;">Stripe Payments</div>
      <div style="font-size: 0.9em; opacity: 0.9;">Integrated billing</div>
    </div>
  </div>
</div>

---

## 📚 Documentation Navigation

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 25px; margin: 40px 0;">

<div style="border: 3px solid #3498db; border-radius: 12px; padding: 25px; background: linear-gradient(135deg, #f8f9fa 0%, #e8f4f8 100%); transition: transform 0.3s; box-shadow: 0 5px 15px rgba(52, 152, 219, 0.1);">
  <h3 style="color: #3498db; margin-top: 0; font-size: 1.5em; display: flex; align-items: center; gap: 10px;">
    <span style="font-size: 1.3em;">🏗️</span> Architecture & Design
  </h3>
  <ul style="list-style: none; padding-left: 0;">
    <li style="margin-bottom: 18px; padding-left: 25px; position: relative;">
      <span style="position: absolute; left: 0; color: #3498db;">📐</span>
      <a href="./architecture.html" style="font-weight: 600; font-size: 1.05em; color: #2c3e50; text-decoration: none;">System Architecture</a><br/>
      <small style="color: #7f8c8d; line-height: 1.6;">Complete system overview with interactive diagrams</small>
    </li>
    <li style="margin-bottom: 18px; padding-left: 25px; position: relative;">
      <span style="position: absolute; left: 0; color: #3498db;">🗄️</span>
      <a href="./database-schema.html" style="font-weight: 600; font-size: 1.05em; color: #2c3e50; text-decoration: none;">Database Schema</a><br/>
      <small style="color: #7f8c8d; line-height: 1.6;">ERD diagrams and table relationships</small>
    </li>
    <li style="margin-bottom: 0; padding-left: 25px; position: relative;">
      <span style="position: absolute; left: 0; color: #3498db;">📡</span>
      <a href="./api-documentation.html" style="font-weight: 600; font-size: 1.05em; color: #2c3e50; text-decoration: none;">API Documentation</a><br/>
      <small style="color: #7f8c8d; line-height: 1.6;">Complete REST API reference with examples</small>
    </li>
  </ul>
</div>

<div style="border: 3px solid #9b59b6; border-radius: 12px; padding: 25px; background: linear-gradient(135deg, #f8f9fa 0%, #f4e8f8 100%); transition: transform 0.3s; box-shadow: 0 5px 15px rgba(155, 89, 182, 0.1);">
  <h3 style="color: #9b59b6; margin-top: 0; font-size: 1.5em; display: flex; align-items: center; gap: 10px;">
    <span style="font-size: 1.3em;">🔄</span> Flow Diagrams
  </h3>
  <ul style="list-style: none; padding-left: 0;">
    <li style="margin-bottom: 18px; padding-left: 25px; position: relative;">
      <span style="position: absolute; left: 0; color: #9b59b6;">🔐</span>
      <a href="./auth-flow.html" style="font-weight: 600; font-size: 1.05em; color: #2c3e50; text-decoration: none;">Authentication Flow</a><br/>
      <small style="color: #7f8c8d; line-height: 1.6;">JWT, OAuth, and social login flows</small>
    </li>
    <li style="margin-bottom: 18px; padding-left: 25px; position: relative;">
      <span style="position: absolute; left: 0; color: #9b59b6;">🐳</span>
      <a href="./workspace-flow.html" style="font-weight: 600; font-size: 1.05em; color: #2c3e50; text-decoration: none;">Workspace Provisioning</a><br/>
      <small style="color: #7f8c8d; line-height: 1.6;">Docker-in-Docker workspace creation</small>
    </li>
    <li style="margin-bottom: 0; padding-left: 25px; position: relative;">
      <span style="position: absolute; left: 0; color: #9b59b6;">💳</span>
      <a href="./payment-flow.html" style="font-weight: 600; font-size: 1.05em; color: #2c3e50; text-decoration: none;">Payment Processing</a><br/>
      <small style="color: #7f8c8d; line-height: 1.6;">Stripe integration and payment flows</small>
    </li>
  </ul>
</div>

</div>

---

## 🚀 Quick Start

<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 12px; color: white; margin: 30px 0; box-shadow: 0 8px 25px rgba(245, 87, 108, 0.3);">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
    <div>
      <div style="font-size: 1.1em; font-weight: 600; margin-bottom: 8px;">📦 GitHub Repository</div>
      <a href="https://github.com/prempp/ApraNova" target="_blank" style="color: white; text-decoration: underline;">github.com/prempp/ApraNova</a>
    </div>
    <div>
      <div style="font-size: 1.1em; font-weight: 600; margin-bottom: 8px;">🔧 Tech Stack</div>
      <div style="font-size: 0.95em;">Django 5.2.7 • Next.js 15.2.4 • PostgreSQL 14 • Redis 7</div>
    </div>
  </div>
</div>

---

## 🏗️ System Overview

<div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 35px; border-radius: 12px; margin: 30px 0;">
  <h3 style="margin-top: 0; color: #d35400; font-size: 1.6em;">💡 Key Features</h3>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 20px;">
    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
      <div style="font-size: 2em; margin-bottom: 10px;">👥</div>
      <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px;">Multi-Role Authentication</div>
      <div style="color: #7f8c8d; font-size: 0.95em;">Student, Trainer, Admin, SuperAdmin</div>
    </div>
    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
      <div style="font-size: 2em; margin-bottom: 10px;">🐳</div>
      <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px;">Docker-Based Workspaces</div>
      <div style="color: #7f8c8d; font-size: 0.95em;">Isolated VS Code environments</div>
    </div>
    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
      <div style="font-size: 2em; margin-bottom: 10px;">💳</div>
      <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px;">Payment Integration</div>
      <div style="color: #7f8c8d; font-size: 0.95em;">Stripe payment processing</div>
    </div>
    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
      <div style="font-size: 2em; margin-bottom: 10px;">🔐</div>
      <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px;">OAuth Support</div>
      <div style="color: #7f8c8d; font-size: 0.95em;">Google and GitHub authentication</div>
    </div>
    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
      <div style="font-size: 2em; margin-bottom: 10px;">⚡</div>
      <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px;">Real-time Updates</div>
      <div style="color: #7f8c8d; font-size: 0.95em;">WebSocket support for notifications</div>
    </div>
    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
      <div style="font-size: 2em; margin-bottom: 10px;">📈</div>
      <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px;">Scalable Architecture</div>
      <div style="color: #7f8c8d; font-size: 0.95em;">Microservices-ready design</div>
    </div>
  </div>
</div>

---

## 🛠️ Technology Stack

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin: 30px 0;">

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; color: white; box-shadow: 0 5px 20px rgba(102, 126, 234, 0.3);">
  <h3 style="margin-top: 0; color: white; font-size: 1.4em; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 10px;">⚙️ Backend</h3>
  <ul style="list-style: none; padding-left: 0; margin-top: 15px;">
    <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">
      <span style="position: absolute; left: 0;">•</span>
      <strong>Framework:</strong> Django 5.2.7 + DRF
    </li>
    <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">
      <span style="position: absolute; left: 0;">•</span>
      <strong>Database:</strong> PostgreSQL 14
    </li>
    <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">
      <span style="position: absolute; left: 0;">•</span>
      <strong>Cache:</strong> Redis 7
    </li>
    <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">
      <span style="position: absolute; left: 0;">•</span>
      <strong>Authentication:</strong> JWT + OAuth 2.0
    </li>
    <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">
      <span style="position: absolute; left: 0;">•</span>
      <strong>Payment:</strong> Stripe API
    </li>
    <li style="margin-bottom: 0; padding-left: 20px; position: relative;">
      <span style="position: absolute; left: 0;">•</span>
      <strong>Containers:</strong> Docker + DinD
    </li>
  </ul>
</div>

<div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 25px; border-radius: 12px; color: #2c3e50; box-shadow: 0 5px 20px rgba(250, 112, 154, 0.3);">
  <h3 style="margin-top: 0; font-size: 1.4em; border-bottom: 2px solid rgba(0,0,0,0.1); padding-bottom: 10px;">⚛️ Frontend</h3>
  <ul style="list-style: none; padding-left: 0; margin-top: 15px;">
    <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">
      <span style="position: absolute; left: 0;">•</span>
      <strong>Framework:</strong> Next.js 15.2.4
    </li>
    <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">
      <span style="position: absolute; left: 0;">•</span>
      <strong>UI Library:</strong> React 19 + Tailwind
    </li>
    <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">
      <span style="position: absolute; left: 0;">•</span>
      <strong>State:</strong> React Context API
    </li>
    <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">
      <span style="position: absolute; left: 0;">•</span>
      <strong>HTTP Client:</strong> Axios
    </li>
    <li style="margin-bottom: 0; padding-left: 20px; position: relative;">
      <span style="position: absolute; left: 0;">•</span>
      <strong>Auth Storage:</strong> localStorage
    </li>
  </ul>
</div>

<div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); padding: 25px; border-radius: 12px; color: white; box-shadow: 0 5px 20px rgba(48, 207, 208, 0.3);">
  <h3 style="margin-top: 0; color: white; font-size: 1.4em; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 10px;">🏗️ Infrastructure</h3>
  <ul style="list-style: none; padding-left: 0; margin-top: 15px;">
    <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">
      <span style="position: absolute; left: 0;">•</span>
      <strong>Orchestration:</strong> Docker Compose
    </li>
    <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">
      <span style="position: absolute; left: 0;">•</span>
      <strong>Web Server:</strong> Gunicorn + Node.js
    </li>
    <li style="margin-bottom: 10px; padding-left: 20px; position: relative;">
      <span style="position: absolute; left: 0;">•</span>
      <strong>Reverse Proxy:</strong> Nginx
    </li>
    <li style="margin-bottom: 0; padding-left: 20px; position: relative;">
      <span style="position: absolute; left: 0;">•</span>
      <strong>Code Server:</strong> VS Code in browser
    </li>
  </ul>
</div>

</div>

---

## 📊 System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph "Frontend Layer"
        NextJS[Next.js Application<br/>Port 3000]
        NextJS --> |SSR/API Routes| NextAPI[Next.js API Routes]
    end

    subgraph "Backend Layer"
        Django[Django REST API<br/>Port 8000]
        Django --> Auth[Authentication Service]
        Django --> Workspace[Workspace Service]
        Django --> Payment[Payment Service]
    end

    subgraph "Data Layer"
        PostgreSQL[(PostgreSQL<br/>Port 5433)]
        Redis[(Redis Cache<br/>Port 6380)]
    end

    subgraph "External Services"
        Stripe[Stripe API]
        Google[Google OAuth]
        GitHub[GitHub OAuth]
    end

    subgraph "Workspace Layer"
        Docker[Docker Engine]
        CodeServer1[Code-Server 1]
        CodeServer2[Code-Server 2]
        CodeServerN[Code-Server N]
    end

    Browser --> NextJS
    Mobile --> NextJS
    NextJS --> Django
    
    Auth --> PostgreSQL
    Auth --> Redis
    Workspace --> Docker
    Payment --> Stripe
    Auth --> Google
    Auth --> GitHub
    
    Docker --> CodeServer1
    Docker --> CodeServer2
    Docker --> CodeServerN
    
    Workspace --> PostgreSQL
    Payment --> PostgreSQL

    style NextJS fill:#61dafb,stroke:#333,stroke-width:2px
    style Django fill:#092e20,stroke:#333,stroke-width:2px,color:#fff
    style PostgreSQL fill:#336791,stroke:#333,stroke-width:2px,color:#fff
    style Redis fill:#dc382d,stroke:#333,stroke-width:2px,color:#fff
    style Docker fill:#2496ed,stroke:#333,stroke-width:2px,color:#fff
```

---

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configured allowed origins
- **CSRF Protection**: Django CSRF middleware
- **Password Hashing**: bcrypt password hashing
- **Role-Based Access Control**: Fine-grained permissions
- **Docker Isolation**: Isolated workspace environments
- **HTTPS Ready**: SSL/TLS support in production

---

## 📈 Performance Features

- **Redis Caching**: Fast data retrieval
- **Database Indexing**: Optimized queries
- **Static File Serving**: WhiteNoise for static files
- **Connection Pooling**: Database connection optimization
- **Lazy Loading**: Frontend code splitting
- **Docker Volumes**: Persistent data storage

---

## 🎯 Key Features

### For Students
- Personal dashboard with course progress
- Docker-based VS Code workspace
- Project submission system
- Real-time notifications
- Payment integration for courses

### For Trainers
- Student management dashboard
- Assignment creation and grading
- Progress tracking
- Batch management

### For Admins
- User management
- System configuration
- Analytics and reporting
- Payment management

---

## 📞 Support & Contact

- **Documentation Issues**: [GitHub Issues](https://github.com/your-org/apranova/issues)
- **Email Support**: support@apranova.com
- **Community**: [Discord Server](https://discord.gg/apranova)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Last Updated**: {{ site.time | date: '%B %d, %Y' }}

**Version**: 1.0.0

