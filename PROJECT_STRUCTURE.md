# توضیحات پروژه و ساختار فایل‌ها

این پروژه یک نمونه آموزشی و قابل ارائه در GitHub از یک **Healthcare EHR dApp** است. هدف پروژه این است که نشان دهد چگونه می‌توان یک جریان ساده پرونده الکترونیک سلامت را با ترکیب Python، FastAPI، Web3.py، Solidity، IPFS/Storage و رمزنگاری پیاده‌سازی کرد.

در این نسخه، اطلاعات پزشکی خام روی بلاکچین ذخیره نمی‌شود. داده پزشکی ابتدا رمزنگاری می‌شود، سپس در یک فضای off-chain ذخیره می‌شود و فقط آدرس/شناسه محتوایی آن همراه با hash متادیتا در قرارداد هوشمند ثبت می‌گردد.

> این پروژه برای آموزش، پایان‌نامه، نمونه‌کار و ارائه GitHub مناسب است؛ برای استفاده واقعی با داده پزشکی واقعی یا محیط production آماده نیست.

---

## ایده اصلی پروژه

جریان اصلی سیستم به این شکل است:

1. بیمار در سیستم ثبت‌نام می‌کند.
2. پزشک، پرستار، داروخانه یا مرکز تحقیقاتی نیز ثبت‌نام می‌کنند.
3. نقش‌های حرفه‌ای باید توسط مالک قرارداد یا admin تأیید شوند.
4. یک پزشک/پرستار/داروخانه/مرکز تحقیقاتی برای مشاهده پرونده بیمار درخواست دسترسی می‌دهد.
5. بیمار درخواست را در داشبورد خود می‌بیند و آن را تأیید یا رد می‌کند.
6. پس از تأیید بیمار، actor مجاز می‌تواند رکوردهای مجاز بیمار را مشاهده کند.
7. رکورد پزشکی به‌صورت رمزنگاری‌شده خارج از بلاکچین ذخیره می‌شود و CID/reference آن روی قرارداد ثبت می‌گردد.

---

## ساختار کلی پروژه

```text
healthcare-ehr-dapp-python/
├── contracts/
├── backend/
├── frontend/
├── scripts/
├── tests/
├── docs/
├── artifacts/
├── storage/
├── README.md
├── PROJECT_STRUCTURE.md
├── requirements.txt
├── .env.example
├── .gitignore
├── pytest.ini
└── LICENSE
```

---

## توضیح پوشه‌ها و فایل‌های اصلی

### 1. پوشه `contracts/`

محل قرارداد هوشمند Solidity پروژه است.

```text
contracts/
└── HealthcareEHR.sol
```

#### `HealthcareEHR.sol`

قرارداد اصلی پروژه است و این قابلیت‌ها را پیاده‌سازی می‌کند:

- تعریف نقش‌ها:
  - Patient
  - Doctor
  - Nurse
  - Pharmacy
  - Research Center
- ثبت Actorها
- تأیید Actorهای حرفه‌ای توسط owner
- ثبت درخواست دسترسی به پرونده بیمار
- تأیید، رد یا لغو دسترسی توسط بیمار
- ذخیره CID رکورد پزشکی رمزنگاری‌شده
- کنترل اینکه فقط بیمار یا Actor مجاز بتواند رکوردهای بیمار را بخواند

نکته مهم: متن واقعی اطلاعات پزشکی داخل قرارداد ذخیره نمی‌شود.

---

### 2. پوشه `backend/`

Backend پروژه با FastAPI و Web3.py نوشته شده است.

```text
backend/
├── app.py
├── config.py
├── crypto.py
├── did.py
├── ipfs_client.py
├── schemas.py
├── services.py
└── web3_client.py
```

#### `app.py`

فایل اصلی FastAPI است. routeهای API و صفحات frontend از اینجا سرو می‌شوند.

مسیرهای مهم:

- `/`
- `/register`
- `/patient`
- `/staff`
- `/admin`
- `/docs`
- `/api/actors/register`
- `/api/access/request`
- `/api/access/decide`
- `/api/records`
- `/api/records/read`

#### `config.py`

تنظیمات پروژه را از `.env` می‌خواند، از جمله:

- آدرس RPC اتریوم
- Chain ID
- private key مربوط به deployer
- آدرس قرارداد deploy شده
- تنظیمات IPFS/Pinata
- کلید رمزنگاری EHR

#### `crypto.py`

ماژول رمزنگاری پروژه است و از AES-256-GCM استفاده می‌کند. این فایل برای رمزنگاری و رمزگشایی payload رکوردهای پزشکی استفاده می‌شود.

#### `did.py`

برای ساخت DID-style identifier استفاده می‌شود. در این نسخه، DID به شکل آموزشی و ساده ساخته می‌شود، مانند:

```text
did:ethr:sepolia:0x...
```

#### `ipfs_client.py`

مسئول ذخیره و دریافت داده‌های off-chain است. دو حالت دارد:

- `local`: برای توسعه و تست محلی
- `pinata`: برای استفاده از Pinata/IPFS در demo عمومی‌تر

#### `schemas.py`

مدل‌های ورودی API با Pydantic در این فایل تعریف شده‌اند.

#### `services.py`

لایه service پروژه است. منطق اصلی backend در این فایل قرار دارد؛ مانند:

- ثبت actor
- تأیید actor
- درخواست دسترسی
- تأیید یا رد درخواست
- افزودن رکورد پزشکی
- خواندن رکورد پزشکی

#### `web3_client.py`

لایه اتصال به Ethereum است و با `web3.py` کار می‌کند. وظایف اصلی:

- اتصال به RPC
- بارگذاری artifact قرارداد
- deploy قرارداد
- ساخت و امضای transaction
- فراخوانی توابع contract

---

### 3. پوشه `frontend/`

Frontend ساده و نمایشی پروژه است. این frontend برای demo و ارائه پایان‌نامه مناسب است.

```text
frontend/
├── templates/
│   ├── base.html
│   ├── index.html
│   ├── register.html
│   ├── patient_dashboard.html
│   ├── staff_dashboard.html
│   └── admin_dashboard.html
└── static/
    ├── css/style.css
    └── js/main.js
```

#### صفحات اصلی

- `index.html`: صفحه معرفی و لینک به بخش‌های اصلی
- `register.html`: ثبت بیمار، پزشک، پرستار، داروخانه و مرکز تحقیقاتی
- `patient_dashboard.html`: داشبورد بیمار برای مدیریت درخواست‌ها و رکوردها
- `staff_dashboard.html`: داشبورد پزشک/پرستار/داروخانه/مرکز تحقیقاتی برای درخواست دسترسی و خواندن رکوردها
- `admin_dashboard.html`: داشبورد owner برای verify/unverify کردن actorهای حرفه‌ای

#### فایل‌های static

- `style.css`: طراحی ظاهری dark و responsive
- `main.js`: منطق اتصال فرم‌ها به APIهای FastAPI

---

### 4. پوشه `scripts/`

اسکریپت‌های اجرایی پروژه در این بخش هستند.

```text
scripts/
├── compile_contracts.py
├── deploy.py
├── make_demo_keys.py
└── demo_requests.http
```

#### `compile_contracts.py`

قرارداد Solidity را compile می‌کند و artifact خروجی را در مسیر `artifacts/` می‌سازد.

#### `deploy.py`

قرارداد را روی شبکه انتخاب‌شده deploy می‌کند. برای اجرای این فایل باید `.env` تنظیم شده باشد.

#### `make_demo_keys.py`

برای تولید حساب‌های demo استفاده می‌شود.

#### `demo_requests.http`

شامل نمونه درخواست‌های HTTP برای تست سریع API در VS Code یا JetBrains است.

---

### 5. پوشه `tests/`

تست‌های پایه پروژه در این پوشه هستند.

```text
tests/
├── test_contract_source.py
├── test_crypto.py
├── test_did.py
└── test_frontend_source.py
```

این تست‌ها برای بررسی موارد زیر هستند:

- صحت اولیه رمزنگاری و رمزگشایی
- ساخت DID
- وجود قابلیت‌های اصلی در قرارداد
- وجود فایل‌ها و routeهای frontend

---

### 6. پوشه `docs/`

مستندات تکمیلی پروژه در این بخش قرار دارد.

```text
docs/
├── FLOW_MAPPING.md
├── FRONTEND_PHASE2.md
├── SECURITY_NOTES.md
└── legacy_source/
```

#### `FLOW_MAPPING.md`

توضیح می‌دهد که flowهای پروژه قدیمی Web3.js چگونه به نسخه جدید Python/Web3.py تبدیل شده‌اند.

#### `FRONTEND_PHASE2.md`

راهنمای صفحات frontend و نحوه استفاده از آن‌هاست.

#### `SECURITY_NOTES.md`

محدودیت‌های امنیتی نسخه demo را توضیح می‌دهد.

#### `legacy_source/`

کدهای قدیمی پایان‌نامه و نسخه Web3.js در این پوشه نگهداری شده‌اند تا در GitHub مشخص باشد پروژه از کدام ایده اولیه توسعه داده شده است.

---

### 7. پوشه `artifacts/`

بعد از اجرای compile، فایل artifact قرارداد در این پوشه ساخته می‌شود:

```text
artifacts/HealthcareEHR.json
```

این فایل شامل ABI و bytecode قرارداد است.

---

### 8. پوشه `storage/local_ipfs/`

در حالت local، داده‌های رمزنگاری‌شده به‌جای IPFS واقعی در این مسیر ذخیره می‌شوند. این کار برای تست و توسعه آفلاین مفید است.

فایل‌های JSON تولیدشده در این مسیر نباید در Git commit شوند.

---

## فایل‌های ریشه پروژه

### `README.md`

صفحه اصلی پروژه برای GitHub است. شامل معرفی پروژه، راهنمای نصب، اجرای local، اجرای Sepolia، توضیح APIها و محدودیت‌های امنیتی است.

### `PROJECT_STRUCTURE.md`

همین فایل است و ساختار پروژه را به زبان فارسی توضیح می‌دهد.

### `.env.example`

نمونه فایل تنظیمات پروژه است. برای اجرا باید از آن کپی بگیرید:

```bash
cp .env.example .env
```

سپس مقادیر لازم را در `.env` تنظیم کنید.

### `.gitignore`

برای جلوگیری از commit شدن فایل‌های حساس و اضافی استفاده می‌شود، مانند:

- `.env`
- فایل‌های cache پایتون
- محیط مجازی
- داده‌های local storage

### `requirements.txt`

لیست dependencyهای Python پروژه است.

### `pytest.ini`

تنظیمات pytest برای اجرای تست‌هاست.

### `LICENSE`

لایسنس پروژه. در این نسخه از MIT License استفاده شده است.

---

## flow پیشنهادی برای اجرای demo

1. نصب dependencyها
2. ساخت فایل `.env`
3. اجرای Anvil یا اتصال به Sepolia
4. تولید کلید رمزنگاری
5. compile قرارداد
6. deploy قرارداد
7. قرار دادن آدرس قرارداد در `.env`
8. اجرای FastAPI
9. ثبت بیمار و actorهای حرفه‌ای
10. verify کردن actor حرفه‌ای از صفحه admin
11. درخواست دسترسی از صفحه staff
12. تأیید دسترسی از صفحه patient
13. افزودن رکورد پزشکی
14. خواندن رکورد توسط actor مجاز

---

## نکات مهم برای GitHub

برای انتشار در GitHub این موارد را رعایت کنید:

- فایل `.env` را commit نکنید.
- private key واقعی داخل README یا کد قرار ندهید.
- داده پزشکی واقعی در IPFS یا testnet ذخیره نکنید.
- اگر می‌خواهید پروژه حرفه‌ای‌تر شود، فاز بعدی باید اضافه‌کردن MetaMask/Wallet Signing باشد.

---

## وضعیت تکمیل پروژه

این نسخه برای **نمونه‌کار GitHub، ارائه پایان‌نامه و demo آموزشی** آماده است.

اما برای production هنوز کامل نیست، چون:

- signing هنوز سمت backend demo انجام می‌شود.
- احراز هویت واقعی کاربر وجود ندارد.
- DID به‌صورت کامل و استاندارد production پیاده‌سازی نشده است.
- مدیریت کلید رمزنگاری برای هر بیمار/رکورد جدا نشده است.
- audit و database production ندارد.
