# Barbershop Backend

Bu papka `FastAPI + PostgreSQL + JWT + Alembic` backend scaffoldi uchun yozildi.

## Nima bor

- `auth` router: foydalanuvchi, barber va admin uchun alohida login endpointlari
- `bookings` router: bron yaratish, ro'yxat olish va statusni yangilash
- `realtime` router: websocket ulanish nuqtasi
- `telegram` service: booking create/accept/reject holatlarini botga yuborish uchun tayyor qatlam
- `alembic`: boshlang'ich migratsiya

## Status oqimi

Backend ichida statuslar mashina uchun inglizcha saqlanadi:

- `pending`
- `accepted`
- `in_service`
- `completed`
- `rejected`

Frontenddagi o'zbekcha statuslar keyin API adapter orqali shu qiymatlarga map qilinadi.

## Neon PostgreSQL ulash

1. Neon dashboardda project yarating.
2. `Connect` bo'limidan PostgreSQL connection string oling. `psql` komandasini emas, faqat URLni oling.
3. `backend/.env.example` nusxasidan `backend/.env` yarating.
4. `DATABASE_URL` qiymatiga Neon URLni qo'ying:

```env
DATABASE_URL=postgresql://neondb_owner:password@ep-example.us-east-1.aws.neon.tech/neondb?sslmode=require
```

Neon pooled URL ham ishlaydi. URL ichida `channel_binding=require` bo'lsa ham backend uni avtomatik olib tashlaydi, chunki `asyncpg` driveri uni SQLAlchemy orqali connection keyword sifatida qabul qilmaydi.

## Local ishga tushirish

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8001
```

Backend start bo'lganda Alembic migrationlar avtomatik ishlaydi va admin user seed qilinadi. Agar `DATABASE_URL` noto'g'ri bo'lsa, backend ochiq port ko'rsatib turmaydi, logda aniq DB xatosi chiqadi.

## Render deploy

Render service environment variables:

- `DATABASE_URL`: Neon connection string
- `FRONTEND_URL`: Vercel frontend URL
- `CORS_ALLOWED_ORIGIN_REGEX`: `https://.*\.vercel\.app`
- `JWT_SECRET_KEY`: kuchli random secret

Render start command `backend/render-start.sh` orqali ishlaydi va FastAPI lifespan yoqilgan bo'lishi kerak, shunda migration/seed avtomatik yuradi.

## Realtime oqim

- Customer notification sahifasi uchun polling yoki websocket ishlatish mumkin
- `app/services/realtime.py` ichida websocket connection manager tayyor
- `bookings` route status o'zgarganda realtime event yuboradi

## Telegram bot oqimi

- `TELEGRAM_BOT_TOKEN` va `TELEGRAM_ADMIN_CHAT_ID` berilsa
- yangi booking
- booking accepted
- booking rejected
- booking completed

holatlari bo'yicha Telegram xabar yuboriladi.
