# TeklifTakip

<p align="center">
  <b>Yerel ağda çalışan, giriş kontrollü teklif takip uygulaması</b><br>
  <b>Local network-based quotation tracking application with role-based access</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11%2B-blue" alt="Python 3.11+">
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688" alt="FastAPI">
  <img src="https://img.shields.io/badge/SQLite-Database-003B57" alt="SQLite">
  <img src="https://img.shields.io/badge/PWA-Enabled-5A0FC8" alt="PWA">
  <img src="https://img.shields.io/badge/Role-Admin%20%2F%20User-orange" alt="Admin/User">
  <img src="https://img.shields.io/badge/Network-Local%20LAN-success" alt="Local LAN">
</p>

---

## Türkçe

### Genel Bakış

**TeklifTakip**, ofis içinde verilen tekliflerin düzenli şekilde kayıt altına alınması, müşteri geçmişinin kolayca görüntülenmesi ve teklif süreçlerinin merkezi olarak yönetilmesi için geliştirilmiş bir uygulamadır.

Bu sistem özellikle şu ihtiyaçlar için tasarlanmıştır:

- gün içinde verilen tekliflerin unutulmaması
- müşterinin daha sonra tekrar dönüş yaptığında geçmiş tekliflerinin görülebilmesi
- araç / transfer / tur tekliflerinin tek yerden takip edilmesi
- tekliflerin satışa dönüp dönmediğinin raporlanabilmesi
- ofis içinde birden fazla kullanıcının aynı veri üzerinde çalışabilmesi

Uygulama yerel ağ üzerinde çalışır, kullanıcı girişi gerektirir ve **admin / user** rol yapısını destekler.

---

### Özellikler

- Admin / user rol sistemi
- Müşteri kayıtları ve teklif geçmişi
- Araç / transfer / tur teklifleri
- Teklif detay ekranı
- Araç listesi yönetimi
- Excel rapor dışa aktarma
- JSON yedek alma / geri yükleme
- Audit log ekranı
- PWA kabuğu
- SQLite veritabanı ile tek dosyada veri saklama

---

### Ekran Görüntüleri

> İstersen buraya kendi ekran görüntülerini ekleyebilirsin.  
> Aşağıdaki yollar örnek olarak bırakılmıştır.

#### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

#### Teklifler
![Teklifler](docs/screenshots/offers.png)

#### Müşteri Detayı
![Müşteri Detayı](docs/screenshots/customer-detail.png)

#### Admin Paneli
![Admin Paneli](docs/screenshots/admin-panel.png)

---

### Kullanım Senaryosu

TeklifTakip ile aşağıdaki akış kolayca yönetilebilir:

1. Müşteri aranır veya yeni müşteri oluşturulur.
2. Araç / transfer / tur teklifi girilir.
3. Teklifin fiyatı, kanalı ve durumu kaydedilir.
4. Aynı müşteri daha sonra tekrar döndüğünde geçmiş teklifleri görüntülenir.
5. Admin tarafında raporlar alınır ve veriler Excel / JSON olarak dışa aktarılır.

---

### Teknoloji Yapısı

- **Backend:** FastAPI
- **Veritabanı:** SQLite
- **Arayüz:** Sunucu tarafında servis edilen web arayüzü
- **Kurulum:** Yerel bilgisayarda çalıştırılabilir
- **Erişim:** Localhost veya yerel IP üzerinden LAN içi cihazlardan erişim
- **Destek:** PWA kabuğu sayesinde kurulabilir web uygulaması deneyimi

---

### Hızlı Kurulum (Windows)

1. Bilgisayarda **Python 3.11 veya üzeri** kurulu olmalıdır.
2. Proje klasörünü açın.
3. `start-local.bat` dosyasına çift tıklayın.
4. İlk açılışta gerekli paketler otomatik olarak yüklenir.
5. Tarayıcıda `http://localhost:3030` açılır.

---

### Terminal ile Kurulum

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

---

### Linux / macOS Kurulumu

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

---

### Varsayılan Giriş

- **Kullanıcı adı:** `admin`
- **Şifre:** `admin123`

> Güvenlik açısından ilk girişten sonra admin şifresinin değiştirilmesi tavsiye edilir.

---

### Yerel Ağdan Erişim

Sunucuyu çalıştıran bilgisayarın yerel IP adresini öğrenin.  
Örnek:

```text
http://192.168.1.25:3030
```

Diğer cihazların aynı yerel ağa bağlı olması gerekir.  
Windows Güvenlik Duvarı izin isterse erişime izin verilmelidir.

---

### Veri Dosyası

Tüm veriler aşağıdaki dosyada tutulur:

```text
data.sqlite
```

Bu dosya silinmediği sürece veriler korunur.

---

### Yedekleme

Yedekleme işlemleri admin paneli üzerinden yapılabilir:

- **Admin > Yedekleme > JSON Yedek İndir**
- **Admin > Yedekleme > JSON Geri Yükle**

Ayrıca raporlar Excel formatında dışa aktarılabilir.

---

### Proje Yapısı

```text
tekliftakip/
├── app.py
├── requirements.txt
├── start-local.bat
├── start-local.sh
├── .gitignore
├── public/
├── docs/
└── README.md
```

---

### Önemli Notlar

- Bu sürüm merkezi yerel sunucu mantığıyla çalışır.
- PWA kabuğu kurulabilir yapıdadır, ancak canlı veri işlemleri için sunucuya erişim gerekir.
- `data.sqlite` dosyası GitHub'a push edilmemelidir.
- `.venv` klasörü repoya dahil edilmemelidir.

---

## English

### Overview

**TeklifTakip** is a quotation tracking application designed to help offices manage quotations in a centralized way, keep customer history organized, and quickly access previous offers when needed.

It is especially useful for:

- keeping daily quotations properly recorded
- reviewing previous offers when a customer returns later
- managing vehicle / transfer / tour quotations in one place
- tracking whether quotations turn into sales or are lost
- allowing multiple office users to work on the same data

The application runs on a local network, requires authentication, and supports **admin / user** roles.

---

### Features

- Admin / user role system
- Customer records and quotation history
- Vehicle / transfer / tour quotations
- Offer detail screen
- Vehicle list management
- Excel report export
- JSON backup and restore
- Audit log screen
- PWA shell
- Single-file data storage with SQLite database

---

### Screenshots

> You can replace these sample image paths with your own screenshots.

#### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

#### Offers
![Offers](docs/screenshots/offers.png)

#### Customer Detail
![Customer Detail](docs/screenshots/customer-detail.png)

#### Admin Panel
![Admin Panel](docs/screenshots/admin-panel.png)

---

### Typical Workflow

TeklifTakip makes the following flow easy to manage:

1. Search for an existing customer or create a new one.
2. Create a vehicle / transfer / tour quotation.
3. Save pricing, channel, and quotation status.
4. When the same customer returns later, review past quotations instantly.
5. Generate reports and export data as Excel / JSON from the admin panel.

---

### Tech Stack

- **Backend:** FastAPI
- **Database:** SQLite
- **Frontend:** Web interface served by the local application
- **Deployment:** Runnable on a local computer
- **Access:** Localhost or local IP over LAN
- **Support:** Installable PWA shell experience

---

### Quick Setup (Windows)

1. Make sure **Python 3.11 or later** is installed.
2. Open the project folder.
3. Double-click `start-local.bat`.
4. Required packages will be installed automatically on first launch.
5. The application will open in the browser at `http://localhost:3030`.

---

### Setup via Terminal

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

---

### Linux / macOS Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

---

### Default Login

- **Username:** `admin`
- **Password:** `admin123`

> For security reasons, it is strongly recommended to change the default admin password after the first login.

---

### Access from the Local Network

Find the local IP address of the computer running the server.  
Example:

```text
http://192.168.1.25:3030
```

Other devices must be connected to the same local network.  
If Windows Firewall asks for permission, access should be allowed.

---

### Data File

All data is stored in:

```text
data.sqlite
```

As long as this file is not deleted, your data remains محفوظ.

---

### Backup

Backup operations can be performed from the admin panel:

- **Admin > Backup > Download JSON Backup**
- **Admin > Backup > Restore JSON Backup**

Reports can also be exported in Excel format.

---

### Project Structure

```text
tekliftakip/
├── app.py
├── requirements.txt
├── start-local.bat
├── start-local.sh
├── .gitignore
├── public/
├── docs/
└── README.md
```

---

### Important Notes

- This version works with a centralized local server architecture.
- The PWA shell is installable, but live data operations still require access to the running server.
- The `data.sqlite` file should not be pushed to GitHub.
- The `.venv` folder should not be included in the repository.

---

## License

This project is currently prepared for private / internal office use.  
You may adapt and extend it according to your own workflow.

---

## Author

Developed and customized for office quotation tracking workflow needs.