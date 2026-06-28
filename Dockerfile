FROM python:3.11-slim

# Install only the system deps Chromium actually needs (minimal set)
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libatspi2.0-0 \
    fonts-liberation \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install only chromium (not firefox/webkit) to keep image small
RUN python -m playwright install chromium

COPY . .

EXPOSE 10000

# 1 worker — each request opens a browser; more workers = OOM on free tier
# preload saves ~100MB RAM by sharing app code across workers
CMD ["gunicorn", "app:app", \
     "--bind", "0.0.0.0:10000", \
     "--workers", "1", \
     "--timeout", "300", \
     "--log-level", "info", \
     "--preload"]
