# Multi-stage Dockerfile for NeuroPet: AI Lab (Telegram Mini App)

# --- Stage 1: Build Frontend (React + Vite + Tailwind) ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# --- Stage 2: Production Python Backend (FastAPI) ---
FROM python:3.11-slim AS production
WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Install dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/app ./app

# Copy built frontend static files from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 8000

# Run FastAPI app with dynamic PORT (supports Render, Railway, Heroku and standard VPS)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
