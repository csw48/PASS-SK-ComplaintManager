# Stage 1: Build Frontend
FROM node:18.19.1 AS frontend-builder

WORKDIR /ComplaintsManager/complaints-frontend

COPY complaints-frontend/package*.json ./
RUN npm install
COPY complaints-frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM python:3.12 AS backend-builder

WORKDIR /ComplaintsManager

COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy the setup and complaints directories
COPY setup/ .

# Stage 3: Final Image
FROM python:3.12

WORKDIR /ComplaintsManager

# Copy backend and frontend static files from previous stages
COPY --from=backend-builder /ComplaintsManager /ComplaintsManager
COPY --from=frontend-builder /ComplaintsManager/complaints-frontend/build /ComplaintsManager/static

# Expose the port the app runs on
EXPOSE 8000

# Start the application
CMD ["gunicorn", "--chdir", "setup", "--bind", ":8000", "setup.wsgi:application"]
