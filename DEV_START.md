Dev Başlatma (Windows)

Hızlı başlatma için scriptler ekledim. Bu PC’yi sunucu gibi kullanıp diğer PC’den erişebilirsiniz.

1) Tek tıkla başlat (önerilen)
- PowerShell açın ve proje kök klasörde çalıştırın:
- Komut: Set-ExecutionPolicy -Scope Process Bypass; .\scripts\start-all.ps1
- Bu iki ayrı pencere açar:
  - Backend: http://0.0.0.0:8000
  - Frontend: http://0.0.0.0:3000

2) Ayrı ayrı başlatma (manuel)
- Backend:
  - Komut: .\scripts\start-backend.ps1
  - Not: python ve bağımlılıklar kurulu olmalı (requirements.txt)
- Frontend:
  - Komut: .\scripts\start-frontend.ps1
  - İlk seferde npm install otomatik çalışır.

3) Diğer PC’den erişim
- Bu PC: http://localhost:3000
- Diğer PC: http://<SUNUCU-IP>:3000 (ör. http://192.168.1.106:3000)
- API sağlık testi: http://<SUNUCU-IP>:8000/healthz

4) Giriş bilgileri (seed)
- E-posta: admin@example.com
- Parola: admin
- Org Slug: default-org

5) Notlar
- Frontend, API adresini otomatik olarak http://<SUNUCU-IP>:8000 şeklinde algılar; ekstra ayar gerekmez.
- Firewall’da 3000 ve 8000 TCP portlarına gelen bağlantılara izin verin.
- Hata alırsanız tarayıcıda Ctrl+F5 ile hard refresh yapın ve tekrar deneyin.

