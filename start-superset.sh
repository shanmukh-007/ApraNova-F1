#!/bin/bash

# Start Apache Superset for Data Professional Track
# This script starts the Superset service and opens it in the browser

echo "========================================"
echo "  Apache Superset - Data Professional  "
echo "========================================"
echo ""

# Check if Docker is running
echo "Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi
echo "✓ Docker is running"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "WARNING: .env file not found!"
    echo "Copying .env.example to .env..."
    cp .env.example .env
    echo "✓ Created .env file"
    echo "Please update the .env file with your configuration."
    echo ""
fi

# Start Superset service
echo "Starting Apache Superset..."
docker-compose up -d superset

if [ $? -eq 0 ]; then
    echo "✓ Superset is starting..."
    echo ""
    
    echo "Waiting for Superset to be ready..."
    echo "This may take 30-60 seconds on first run..."
    
    # Wait for Superset to be ready
    max_attempts=30
    attempt=0
    ready=false
    
    while [ $attempt -lt $max_attempts ] && [ "$ready" = false ]; do
        sleep 2
        attempt=$((attempt + 1))
        
        if curl -s -f http://localhost:8088/health > /dev/null 2>&1; then
            ready=true
        else
            echo -n "."
        fi
    done
    
    echo ""
    
    if [ "$ready" = true ]; then
        echo "✓ Superset is ready!"
        echo ""
        echo "========================================"
        echo "  Superset Access Information"
        echo "========================================"
        echo "URL:      http://localhost:8088"
        echo "Username: admin"
        echo "Password: admin"
        echo "========================================"
        echo ""
        echo "Opening Superset in your browser..."
        
        # Open browser based on OS
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open http://localhost:8088
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            xdg-open http://localhost:8088 2>/dev/null || echo "Please open http://localhost:8088 in your browser"
        fi
    else
        echo "⚠ Superset is still starting..."
        echo "Check logs with: docker-compose logs superset"
        echo "Access at: http://localhost:8088"
    fi
else
    echo "ERROR: Failed to start Superset!"
    echo "Check logs with: docker-compose logs superset"
    exit 1
fi

echo ""
echo "Useful Commands:"
echo "  View logs:    docker-compose logs -f superset"
echo "  Stop:         docker-compose stop superset"
echo "  Restart:      docker-compose restart superset"
echo "  Remove:       docker-compose down superset"
echo ""
