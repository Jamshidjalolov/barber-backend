# Barber Mobile

React Native / Expo mobil ilova. Backend shu mavjud FastAPI API bilan ishlaydi.

## Ishga tushirish

```bash
cd mobile
npm install
npm run start
```

Expo Go orqali QR kodni scan qiling yoki Android/iOS emulatorni tanlang.

## Backend URL

Default API:

```text
https://barber-backend.onrender.com/api/v1
```

Boshqa backend ishlatsangiz `mobile/.env` yarating:

```text
EXPO_PUBLIC_API_BASE_URL=https://your-render-service.onrender.com/api/v1
```

## Ekranlar

- Mijoz: login/register, barber tanlash, service tanlash, sana/vaqt bilan bron qilish, navbatlar va skidkalar.
- Barber: login/register, o'z navbatlari, qabul qilish, boshlash, tugatish, rad etish.
- Admin: login, umumiy metrikalar, barberlar va barcha navbatlar.
