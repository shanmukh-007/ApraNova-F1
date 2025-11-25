# ============================================
# ApraNova Code Workspace - Production Dockerfile
# Code-server (VS Code in browser)
# ============================================

FROM codercom/code-server:latest

# Set environment variables
ENV CODE_SERVER_PORT=8080 \
    PASSWORD="" \
    HASHED_PASSWORD="" \
    SUDO_PASSWORD="" \
    PROXY_DOMAIN="" \
    TZ=America/New_York

# Install additional tools
USER root

# Install Python, Node.js, and development tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    nodejs \
    npm \
    git \
    curl \
    wget \
    vim \
    nano \
    htop \
    postgresql-client \
    redis-tools \
    docker.io \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip3 install --no-cache-dir \
    django \
    djangorestframework \
    psycopg2-binary \
    redis \
    celery \
    gunicorn \
    pytest \
    black \
    flake8 \
    pylint

# Install Node.js packages globally
RUN npm install -g \
    typescript \
    ts-node \
    eslint \
    prettier \
    nodemon \
    pm2

# Install VS Code extensions
RUN code-server --install-extension ms-python.python && \
    code-server --install-extension dbaeumer.vscode-eslint && \
    code-server --install-extension esbenp.prettier-vscode && \
    code-server --install-extension eamodio.gitlens && \
    code-server --install-extension ms-azuretools.vscode-docker && \
    code-server --install-extension bradlc.vscode-tailwindcss && \
    code-server --install-extension dsznajder.es7-react-js-snippets

# Create workspace directory
RUN mkdir -p /home/coder/workspace && \
    chown -R coder:coder /home/coder/workspace

# Switch back to coder user
USER coder

# Set working directory
WORKDIR /home/coder/workspace

# Copy VS Code settings
COPY --chown=coder:coder config/settings.json /home/coder/.local/share/code-server/User/settings.json

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/healthz || exit 1

# Start code-server
CMD ["code-server", "--bind-addr", "0.0.0.0:8080", "--auth", "password", "/home/coder/workspace"]

