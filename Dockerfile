# Pokemon Game Corner - Production Docker Image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies (minimal)
RUN apt-get update && apt-get install -y \
    sqlite3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy application files
COPY *.py /app/
COPY *.js /app/
COPY *.css /app/
COPY *.html /app/
COPY *.md /app/
COPY *.sh /app/

# Make scripts executable
RUN chmod +x /app/*.sh

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Create non-root user for security
RUN useradd -m -u 1000 pokeslot && \
    chown -R pokeslot:pokeslot /app

USER pokeslot

# Expose ports
EXPOSE 5000 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:5000')" || exit 1

# Default command - run production servers
CMD ["bash", "/app/start-docker-fixed.sh"]