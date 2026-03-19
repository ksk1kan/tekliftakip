# TeklifTakip v1.0 (FastAPI)

Yerel ağda çalışan, giriş kontrollü teklif takip uygulaması.

## Özellikler
- Admin / user rolü
- Müşteri kayıtları ve teklif geçmişi
- Araç / transfer / tur teklifleri
- Takip listesi
- Araç listesi yönetimi
- Excel rapor dışa aktarma
- JSON yedek alma / geri yükleme
- Audit log ekranı
- PWA kabuğu
- SQLite veritabanı ile tek dosyada veri saklama

## Hızlı Kurulum (Windows)
1. Bilgisayarda Python 3.11+ kurulu olsun.
2. Bu klasörü açın.
3. `start-local.bat` dosyasına çift tıklayın.
4. İlk açılışta gerekli paketler yüklenir.
5. Tarayıcıda `http://localhost:3030` açılır.

## Terminal ile Kurulum
```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Linux/macOS:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

## Varsayılan Giriş
- Kullanıcı adı: `admin`
- Şifre: `admin123`

İlk iş olarak admin kullanıcısını seçip yeni şifre belirlemeniz tavsiye edilir.

## Yerel Ağdan Erişim
Sunucuyu çalıştıran bilgisayarın yerel IP adresini öğrenin.
Örnek:
`http://192.168.1.25:3030`

Diğer cihazlar aynı ağda olmalı. Windows Güvenlik Duvarı izin isterse erişime izin verin.

## Veri Dosyası
Veriler `data.sqlite` içinde tutulur.

## Yedekleme
- Admin > Yedekleme > JSON Yedek İndir
- Admin > Yedekleme > JSON Geri Yükle

## Not
Bu sürüm merkezi yerel sunucu mantığıyla çalışır. PWA kabuğu kurulabilir ancak canlı veri işlemleri için sunucu erişimi gerekir.
