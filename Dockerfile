FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

WORKDIR /app

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Copy backend code
COPY backend/ .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Start Ollama in background and run Flask app
CMD ollama serve & sleep 5 && ollama pull llama2 && gunicorn --bind 0.0.0.0:5000 --workers 2 --timeout 120 app:app
