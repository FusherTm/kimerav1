Geliştirme Ortamı Çalıştırma Rehberi (Windows)

Amaç: Backend + Frontend’i sorunsuz başlatmak, veritabanını (Postgres) hazırlamak ve verileri kalıcı tutmak.

Önkoşullar
- Docker Desktop (Compose v2)
- Python 3.10+ ve bu repo kökünde `.venv` (start script bunu otomatik kullanır)
- Node.js 18+

Yol A — Lokal Backend/Frontend + Docker’daki Postgres (Önerilen)
1) Postgres’i başlat
   - `cd ops`
   - `docker compose up -d postgres`
2) `erp` veritabanını oluştur (bir kez)
   - `cd C:\projects\kimerav1`
   - `./scripts/create-db.ps1`  (varsayılan: localhost:5432, user/pass: postgres/postgres)
3) Admin’i seed et (bir kez, ya da ihtiyaç olduğunda)
   - `./scripts/seed-dev.ps1`
4) Uygulamayı başlat
   - `Set-ExecutionPolicy -Scope Process Bypass; .\scripts\start-all.ps1`
   - Frontend: `http://localhost:3000` — Backend: `http://localhost:8000`

Yol B — Tamamen Docker Compose ile
1) Tüm stack’i başlat
   - `cd ops`
   - `docker compose up --build`
2) Admin’i seed et (iki seçenekten biri)
   - Host’tan (5432 dışa açık):
     - `cd C:\projects\kimerav1`
     - `$env:DATABASE_URL='postgresql://postgres:postgres@localhost:5432/erp'; .\.venv\Scripts\python.exe backend\seed_admin.py`
   - Ya da container içinde:
     - `docker compose exec backend python /app/seed_admin.py`
3) Adresler
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:8000`

Giriş Bilgileri (Seed)
- E‑posta: `admin@example.com`
- Parola: `admin`
- Org Slug: `default-org`

Sık Karşılaşılan Konular
- 500 Internal Server Error `/auth/token` sırasında: DB bağlantısı hatalı veya `erp` DB’si yok. Önce DB’yi oluştur (Yukarıdaki 2. adım), sonra seed et (3. adım).
- 401 `/me/permissions`: Login öncesi normaldir.
- Port çakışması: 5432 başka bir Postgres tarafından kullanılıyorsa Docker’daki Postgres dışa açılamaz. Ya lokal servisi durdur ya da compose’daki portu değiştir.

Veri Kalıcılığı (Data Persistence)
- Compose Named Volume: Postgres verisi `ops_db-data` adlı volume’da tutulur; container silinse bile veri kalır.
  - Veriyi silmemek için `docker compose down -v` VE `docker volume prune` komutlarından kaçın.
- Yedekleme (opsiyonel):
  - `docker compose exec -T postgres pg_dump -U postgres erp > erp_backup.sql`
  - `docker compose exec -T postgres psql -U postgres -d erp < erp_backup.sql`

Yararlı Komutlar
- Alembic (gerekirse):
  - `cd backend`
  - `alembic revision --autogenerate -m "dev changes"`
  - `alembic upgrade head`
- Seed’i tekrar çalıştırma:
  - `./scripts/seed-dev.ps1`

