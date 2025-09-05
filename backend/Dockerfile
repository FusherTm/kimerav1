FROM python:3.11-slim
WORKDIR /app
ENV PYTHONPATH=/app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8002
# Ensure the application directory is on the Python path when running the server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002", "--app-dir", "/app"]
