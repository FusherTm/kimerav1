FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Proje kodunu image'a kopyala
COPY . .

# Paket yapısı kullanıyorsun: backend/app/main.py
# app klasörünün paket olduğundan emin ol (app/__init__.py olmalı)
RUN test -f app/__init__.py || touch app/__init__.py

EXPOSE 8002

# Hedef: app.main:app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
