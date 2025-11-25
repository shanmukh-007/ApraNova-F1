---
layout: default
title: Authentication Flow - ApraNova LMS
---

<div style="text-align: center; padding: 30px 0 20px 0;">
  <h1 style="font-size: 3em; margin-bottom: 10px; background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">🔐 Authentication Flow</h1>
  <p style="font-size: 1.2em; color: #7f8c8d; max-width: 700px; margin: 0 auto;">
    Complete authentication and authorization flow diagrams for ApraNova LMS
  </p>
</div>

<div style="background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); padding: 30px; border-radius: 12px; color: white; margin: 30px 0; box-shadow: 0 8px 25px rgba(155, 89, 182, 0.3);">
  <h3 style="margin-top: 0; color: white; font-size: 1.6em;">🔒 Authentication Overview</h3>
  <p style="font-size: 1.1em; line-height: 1.7; margin-bottom: 15px;">
    ApraNova implements a <strong>multi-layered authentication system</strong> with support for traditional
    credentials and social login providers.
  </p>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">
    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
      <div style="font-size: 1.8em; margin-bottom: 5px;">📧</div>
      <div style="font-weight: 600;">Email/Password</div>
      <div style="font-size: 0.9em; opacity: 0.9;">Traditional credentials</div>
    </div>
    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
      <div style="font-size: 1.8em; margin-bottom: 5px;">🔑</div>
      <div style="font-weight: 600;">JWT Tokens</div>
      <div style="font-size: 0.9em; opacity: 0.9;">Stateless auth</div>
    </div>
    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
      <div style="font-size: 1.8em; margin-bottom: 5px;">🌐</div>
      <div style="font-weight: 600;">Google OAuth</div>
      <div style="font-size: 0.9em; opacity: 0.9;">Social login</div>
    </div>
    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
      <div style="font-size: 1.8em; margin-bottom: 5px;">🐙</div>
      <div style="font-weight: 600;">GitHub OAuth</div>
      <div style="font-size: 0.9em; opacity: 0.9;">Developer login</div>
    </div>
  </div>
</div>

---

## 📝 User Registration Flow

<div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 20px; border-radius: 10px; margin: 20px 0;">
  <p style="margin: 0; color: #d35400; font-size: 1.05em;">
    <strong>📌 Note:</strong> New users register with email/password and receive a verification email.
    JWT tokens are issued immediately upon successful registration.
  </p>
</div>

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant APIClient
    participant Django
    participant Database
    participant Email

    User->>Frontend: Fill Signup Form
    Frontend->>Frontend: Client-side Validation
    Frontend->>APIClient: POST /api/auth/registration/
    APIClient->>Django: Registration Request
    Django->>Django: Validate Data
    Django->>Database: Check Email Exists
    Database-->>Django: Email Available
    Django->>Database: Create User
    Database-->>Django: User Created
    Django->>Django: Generate JWT Tokens
    Django->>Email: Send Verification Email
    Django-->>APIClient: Return Tokens + User Data
    APIClient->>APIClient: Save Tokens to localStorage
    APIClient-->>Frontend: Success Response
    Frontend->>Frontend: Redirect to Dashboard
    Frontend-->>User: Show Dashboard
```

### Registration Request

**Endpoint**: `POST /api/auth/registration/`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password1": "SecurePass123!",
  "password2": "SecurePass123!",
  "role": "student",
  "track": "DP"
}
```

**Response**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "student",
    "track": "DP"
  }
}
```

---

## 🔑 Login Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant APIClient
    participant Django
    participant Database
    participant Redis

    User->>Frontend: Enter Credentials
    Frontend->>Frontend: Validate Input
    Frontend->>APIClient: POST /api/users/login/
    APIClient->>Django: Login Request
    Django->>Database: Authenticate User
    Database-->>Django: User Found
    Django->>Django: Verify Password
    Django->>Django: Check Role Match
    Django->>Django: Generate JWT Tokens
    Django->>Redis: Store Session
    Django-->>APIClient: Return Tokens + User
    APIClient->>APIClient: Save to localStorage
    APIClient-->>Frontend: Success Response
    Frontend->>Frontend: Determine Redirect URL
    Frontend-->>User: Redirect to Dashboard
```

### Login Request

**Endpoint**: `POST /api/users/login/`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "student"
}
```

**Response**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "student"
  },
  "redirect_url": "/student/dashboard"
}
```

---

## 🔄 Token Refresh Flow

```mermaid
sequenceDiagram
    participant Frontend
    participant APIClient
    participant Django
    participant Redis

    Frontend->>APIClient: API Request
    APIClient->>APIClient: Add Access Token
    APIClient->>Django: Request with Token
    Django->>Django: Validate Access Token
    Django-->>APIClient: 401 Unauthorized
    
    Note over APIClient: Token Expired
    
    APIClient->>APIClient: Get Refresh Token
    APIClient->>Django: POST /api/auth/token/refresh/
    Django->>Redis: Check Token Blacklist
    Redis-->>Django: Token Not Blacklisted
    Django->>Django: Generate New Access Token
    Django-->>APIClient: New Access Token
    APIClient->>APIClient: Save New Token
    APIClient->>Django: Retry Original Request
    Django-->>APIClient: Success Response
    APIClient-->>Frontend: Return Data
```

### Token Refresh Request

**Endpoint**: `POST /api/auth/token/refresh/`

**Request Body**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## 🚪 Logout Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant APIClient
    participant Django
    participant Redis

    User->>Frontend: Click Logout
    Frontend->>APIClient: POST /api/users/logout/
    APIClient->>APIClient: Get Refresh Token
    APIClient->>Django: Logout Request
    Django->>Redis: Blacklist Refresh Token
    Redis-->>Django: Token Blacklisted
    Django-->>APIClient: Success Response
    APIClient->>APIClient: Clear localStorage
    APIClient->>APIClient: Clear sessionStorage
    APIClient-->>Frontend: Logout Complete
    Frontend->>Frontend: Redirect to Login
    Frontend-->>User: Show Login Page
```

---

## 🌐 OAuth Flow (Google/GitHub)

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant OAuth Provider
    participant Django
    participant Database

    User->>Frontend: Click "Login with Google"
    Frontend->>OAuth Provider: Redirect to OAuth
    OAuth Provider->>User: Show Consent Screen
    User->>OAuth Provider: Grant Permission
    OAuth Provider->>Frontend: Redirect with Code
    Frontend->>Django: POST /api/auth/google/
    Django->>OAuth Provider: Exchange Code for Token
    OAuth Provider-->>Django: Access Token
    Django->>OAuth Provider: Get User Info
    OAuth Provider-->>Django: User Profile
    Django->>Database: Find or Create User
    Database-->>Django: User Object
    Django->>Django: Generate JWT Tokens
    Django-->>Frontend: Return Tokens + User
    Frontend->>Frontend: Save Tokens
    Frontend-->>User: Redirect to Dashboard
```

### OAuth Login Request

**Endpoint**: `POST /api/auth/google/` or `POST /api/auth/github/`

**Request Body**:
```json
{
  "code": "4/0AY0e-g7...",
  "redirect_uri": "http://localhost:3000/auth/callback"
}
```

**Response**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "john@gmail.com",
    "name": "John Doe",
    "role": "student"
  }
}
```

---

## 🛡️ Protected Route Access

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Middleware
    participant APIClient
    participant Django

    User->>Browser: Navigate to /student/dashboard
    Browser->>Middleware: Route Request
    Middleware->>Middleware: Check localStorage
    
    alt Token Exists
        Middleware->>APIClient: Verify Token
        APIClient->>Django: GET /api/users/profile/
        Django->>Django: Validate JWT
        Django-->>APIClient: User Data
        APIClient-->>Middleware: Valid User
        Middleware->>Browser: Allow Access
        Browser-->>User: Show Dashboard
    else No Token
        Middleware->>Browser: Redirect to Login
        Browser-->>User: Show Login Page
    end
```

---

## 🔐 Role-Based Access Control

```mermaid
graph TB
    Request[Incoming Request]
    Auth[Authentication Check]
    Role[Role Verification]
    Permission[Permission Check]
    
    Student[Student Routes]
    Trainer[Trainer Routes]
    Admin[Admin Routes]
    SuperAdmin[SuperAdmin Routes]
    
    Denied[Access Denied]
    Allowed[Access Granted]

    Request --> Auth
    Auth -->|Valid Token| Role
    Auth -->|Invalid Token| Denied
    
    Role -->|Student| Permission
    Role -->|Trainer| Permission
    Role -->|Admin| Permission
    Role -->|SuperAdmin| Permission
    
    Permission -->|Match| Allowed
    Permission -->|Mismatch| Denied
    
    Allowed --> Student
    Allowed --> Trainer
    Allowed --> Admin
    Allowed --> SuperAdmin

    style Auth fill:#ffd700,stroke:#333,stroke-width:2px
    style Permission fill:#90ee90,stroke:#333,stroke-width:2px
    style Denied fill:#ff6b6b,stroke:#333,stroke-width:2px,color:#fff
    style Allowed fill:#51cf66,stroke:#333,stroke-width:2px,color:#fff
```

### Role Hierarchy

| Role | Access Level | Permissions |
|------|-------------|-------------|
| **Student** | Basic | Own dashboard, workspace, submissions |
| **Trainer** | Elevated | Student management, grading, batch access |
| **Admin** | High | User management, system config, reports |
| **SuperAdmin** | Full | All permissions, can access any role |

---

## 🔒 Security Measures

### Token Security

1. **Access Token**: Short-lived (15 minutes)
2. **Refresh Token**: Long-lived (7 days)
3. **Token Blacklisting**: Logout invalidates tokens
4. **HTTPS Only**: Tokens transmitted over secure connection
5. **HttpOnly Cookies**: Optional cookie-based storage

### Password Security

1. **Hashing**: bcrypt with salt
2. **Minimum Length**: 8 characters
3. **Complexity**: Uppercase, lowercase, numbers, symbols
4. **Reset Flow**: Email-based password reset
5. **Rate Limiting**: Prevent brute force attacks

---

## 📊 Authentication State Management

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    
    Unauthenticated --> Authenticating: Login/Signup
    Authenticating --> Authenticated: Success
    Authenticating --> Unauthenticated: Failure
    
    Authenticated --> RefreshingToken: Token Expired
    RefreshingToken --> Authenticated: Refresh Success
    RefreshingToken --> Unauthenticated: Refresh Failed
    
    Authenticated --> Unauthenticated: Logout
    Authenticated --> Unauthenticated: Token Invalid
```

---

## 🔗 Related Documentation

- [API Documentation](./api-documentation.md)
- [Database Schema](./database-schema.md)
- [System Architecture](./architecture.md)

---

[← Back to Index](./index.md)

