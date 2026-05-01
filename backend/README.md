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

## Ishga tushirish

1. `backend/.env.example` nusxasidan `.env` yarating
2. PostgreSQL bazani tayyorlang
3. `pip install -e .`
4. `alembic upgrade head`
5. `uvicorn app.main:app --reload`

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
