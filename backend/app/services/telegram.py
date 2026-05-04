from __future__ import annotations

import asyncio
import logging
from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import httpx
from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.enums import BookingStatusEnum, RoleEnum
from app.models.barber import Barber
from app.models.booking import Booking
from app.models.discount import DiscountOffer
from app.models.user import User

logger = logging.getLogger(__name__)
try:
    UZBEK_TZ = ZoneInfo("Asia/Tashkent")
except ZoneInfoNotFoundError:
    UZBEK_TZ = timezone(timedelta(hours=5))


CUSTOMER_MENU = {
    "my": "📌 Bronlarim",
    "book": "✂️ Bron qilish",
    "discounts": "🏷 Skidkalar",
    "help": "ℹ️ Yordam",
}
BARBER_MENU = {
    "today": "📋 Bugungi bronlar",
    "pending": "⏳ Kutilayotganlar",
    "next": "⏰ Keyingi bron",
    "stats": "📊 Statistika",
    "discounts": "🏷 Skidkalarim",
}
ADMIN_MENU = {
    "today": "📣 Bugungi holat",
    "recent": "📋 So'nggi bronlar",
    "help": "ℹ️ Yordam",
}
SERVICE_OPTIONS = [
    ("s1", "Soch olish", "Soch olish"),
    ("s2", "Fade qirqim", "Fade qirqim"),
    ("s3", "Soch + soqol", "Soch + soqol"),
    ("s4", "Premium paket", "Premium paket"),
    ("s5", "Soqol dizayni", "Soqol dizayni"),
]
ACTIVE_STATUSES = [
    BookingStatusEnum.pending,
    BookingStatusEnum.accepted,
    BookingStatusEnum.in_service,
]


def to_local_time(value: datetime) -> datetime:
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(UZBEK_TZ)


def format_datetime_label(value: datetime) -> str:
    local = to_local_time(value)
    return local.strftime("%d.%m.%Y %H:%M")


def format_time_label(value: datetime) -> str:
    local = to_local_time(value)
    return local.strftime("%H:%M")


def format_price(value: int | None) -> str:
    return f"{int(value or 0):,}".replace(",", " ") + " so'm"


def build_map_link(latitude: float | None, longitude: float | None, address: str | None) -> str | None:
    if latitude is not None and longitude is not None:
        return f"https://www.google.com/maps?q={latitude},{longitude}"
    if address:
        return f"https://www.google.com/maps?q={address.replace(' ', '+')}"
    return None


def build_location_lines(barber: Barber) -> list[str]:
    lines: list[str] = []
    if barber.address:
        lines.append(f"Manzil: {barber.address}")
    map_link = build_map_link(barber.latitude, barber.longitude, barber.address)
    if map_link:
        lines.append(f"Xarita: {map_link}")
    return lines


def build_slots() -> list[str]:
    slots: list[str] = []
    for hour in range(9, 19):
        for minute in (0, 30):
            if hour == 18 and minute > 30:
                continue
            slots.append(f"{hour:02d}:{minute:02d}")
    return slots


def service_name_from_key(key: str) -> str | None:
    for service_key, service_name, _ in SERVICE_OPTIONS:
        if service_key == key:
            return service_name
    return None


def service_price(barber: Barber, service_key: str) -> int:
    mapping = {
        "s1": barber.price_haircut,
        "s2": barber.price_fade,
        "s3": barber.price_hair_beard,
        "s4": barber.price_premium,
        "s5": barber.price_beard,
    }
    return int(mapping.get(service_key, barber.price_haircut) or 0)


def date_token(value: date) -> str:
    return value.strftime("%Y%m%d")


def parse_date_token(value: str) -> date:
    return datetime.strptime(value, "%Y%m%d").date()


def slot_from_token(value: str) -> str:
    return f"{value[:2]}:{value[2:]}"


class TelegramNotifier:
    def __init__(self) -> None:
        self._offset = 0

    def is_enabled(self) -> bool:
        return bool(settings.telegram_bot_token and settings.telegram_bot_username)

    def build_start_payload(self, role: RoleEnum | str, subject_id: str) -> str:
        role_value = role.value if isinstance(role, RoleEnum) else role
        return f"link_{role_value}_{subject_id}"

    def build_deep_link(self, role: RoleEnum | str, subject_id: str) -> str | None:
        if not settings.telegram_bot_username:
            return None

        username = settings.telegram_bot_username.replace("@", "")
        payload = self.build_start_payload(role, subject_id)
        return f"https://t.me/{username}?start={payload}"

    def _keyboard(self, role: RoleEnum) -> dict[str, object]:
        if role == RoleEnum.customer:
            labels = [
                [CUSTOMER_MENU["my"], CUSTOMER_MENU["book"]],
                [CUSTOMER_MENU["discounts"], CUSTOMER_MENU["help"]],
            ]
        elif role == RoleEnum.barber:
            labels = [
                [BARBER_MENU["today"], BARBER_MENU["pending"]],
                [BARBER_MENU["next"], BARBER_MENU["stats"]],
                [BARBER_MENU["discounts"]],
            ]
        else:
            labels = [
                [ADMIN_MENU["today"], ADMIN_MENU["recent"]],
                [ADMIN_MENU["help"]],
            ]

        return {
            "keyboard": [[{"text": item} for item in row] for row in labels],
            "resize_keyboard": True,
            "is_persistent": True,
            "one_time_keyboard": False,
        }

    async def send_text(
        self,
        chat_id: str | None,
        text: str,
        *,
        role: RoleEnum | None = None,
        inline_keyboard: list[list[dict[str, str]]] | None = None,
    ) -> None:
        if not self.is_enabled() or not chat_id:
            return

        url = f"{settings.telegram_api_base}/bot{settings.telegram_bot_token}/sendMessage"
        payload: dict[str, object] = {
            "chat_id": chat_id,
            "text": text,
            "disable_web_page_preview": True,
        }
        if inline_keyboard is not None:
            payload["reply_markup"] = {"inline_keyboard": inline_keyboard}
        elif role is not None:
            payload["reply_markup"] = self._keyboard(role)

        try:
            async with httpx.AsyncClient(timeout=20) as client:
                await client.post(url, json=payload)
        except Exception:
            logger.exception("Telegram sendMessage failed")

    async def _answer_callback(self, callback_id: str, text: str | None = None) -> None:
        if not self.is_enabled() or not callback_id:
            return

        url = f"{settings.telegram_api_base}/bot{settings.telegram_bot_token}/answerCallbackQuery"
        payload: dict[str, object] = {"callback_query_id": callback_id}
        if text:
            payload["text"] = text

        try:
            async with httpx.AsyncClient(timeout=10) as client:
                await client.post(url, json=payload)
        except Exception:
            logger.exception("Telegram answerCallbackQuery failed")

    async def send_admin_alert(self, text: str) -> None:
        await self.send_text(settings.telegram_admin_chat_id, text, role=RoleEnum.admin)

    async def send_booking_created(self, booking: Booking) -> None:
        location_lines = build_location_lines(booking.barber)
        customer_text = "\n".join(
            [
                "Yangi bron so'rovi yuborildi",
                f"Barber: {booking.barber.display_name}",
                f"Xizmat: {booking.service_name}",
                f"Vaqt: {format_datetime_label(booking.scheduled_for)}",
                "Holat: javob kutilmoqda",
                *location_lines,
            ]
        )
        barber_text = "\n".join(
            [
                "Yangi bron so'rovi",
                f"Mijoz: {booking.customer_name}",
                f"Xizmat: {booking.service_name}",
                f"Vaqt: {format_datetime_label(booking.scheduled_for)}",
                f"Telefon: {booking.customer_phone}",
                *location_lines,
            ]
        )
        await self.send_text(
            booking.customer_user.telegram_chat_id if booking.customer_user else None,
            customer_text,
            role=RoleEnum.customer,
        )
        await self.send_text(
            booking.barber.user.telegram_chat_id or booking.barber.telegram_chat_id,
            barber_text,
            role=RoleEnum.barber,
            inline_keyboard=self._booking_action_keyboard(booking),
        )
        await self.send_admin_alert(
            "\n".join(
                [
                    "Yangi bron tushdi",
                    f"Mijoz: {booking.customer_name}",
                    f"Barber: {booking.barber.display_name}",
                    f"Vaqt: {format_datetime_label(booking.scheduled_for)}",
                    *location_lines,
                ]
            )
        )

    async def send_booking_status_update(self, booking: Booking) -> None:
        location_lines = build_location_lines(booking.barber)
        status_text = {
            BookingStatusEnum.accepted: (
                "Bron qabul qilindi",
                "Barber broningizni tasdiqladi.",
            ),
            BookingStatusEnum.in_service: (
                "Xizmat boshlandi",
                "Barber hozir navbatingiz bilan ishlayapti.",
            ),
            BookingStatusEnum.completed: (
                "Navbat yakunlandi",
                "Xizmat tugadi. Endi yangi bron qilishingiz mumkin.",
            ),
            BookingStatusEnum.rejected: (
                "Bron rad etildi",
                f"Sabab: {booking.rejection_reason or 'Sabab kiritilmagan'}",
            ),
        }.get(booking.status)
        if status_text:
            title, body = status_text
            await self.send_text(
                booking.customer_user.telegram_chat_id if booking.customer_user else None,
                "\n".join(
                    [
                        title,
                        f"Barber: {booking.barber.display_name}",
                        f"Vaqt: {format_datetime_label(booking.scheduled_for)}",
                        body,
                        *location_lines,
                    ]
                ),
                role=RoleEnum.customer,
            )
        await self.send_text(
            booking.barber.user.telegram_chat_id or booking.barber.telegram_chat_id,
            "\n".join(
                [
                    "Bron holati yangilandi",
                    f"Mijoz: {booking.customer_name}",
                    f"Vaqt: {format_datetime_label(booking.scheduled_for)}",
                    f"Holat: {self._label_for_status(booking.status)}",
                    *location_lines,
                ]
            ),
            role=RoleEnum.barber,
            inline_keyboard=self._booking_action_keyboard(booking),
        )
        await self.send_admin_alert(
            "\n".join(
                [
                    "Bron holati o'zgardi",
                    f"Mijoz: {booking.customer_name}",
                    f"Barber: {booking.barber.display_name}",
                    f"Holat: {self._label_for_status(booking.status)}",
                    *location_lines,
                ]
            )
        )

    async def send_booking_reminder(self, booking: Booking) -> None:
        location_lines = build_location_lines(booking.barber)
        await self.send_text(
            booking.customer_user.telegram_chat_id if booking.customer_user else None,
            "\n".join(
                [
                    "Eslatma",
                    "10 daqiqadan keyin navbatingiz bor.",
                    f"Barber: {booking.barber.display_name}",
                    f"Vaqt: {format_datetime_label(booking.scheduled_for)}",
                    *location_lines,
                ]
            ),
            role=RoleEnum.customer,
        )
        await self.send_text(
            booking.barber.user.telegram_chat_id or booking.barber.telegram_chat_id,
            "\n".join(
                [
                    "Yaqin navbat",
                    "10 daqiqadan keyin mijoz keladi.",
                    f"Mijoz: {booking.customer_name}",
                    f"Vaqt: {format_datetime_label(booking.scheduled_for)}",
                    *location_lines,
                ]
            ),
            role=RoleEnum.barber,
        )

    async def send_discount_created(self, discount: DiscountOffer, customer_chat_ids: list[str]) -> None:
        location_lines = build_location_lines(discount.barber)
        customer_text = "\n".join(
            [
                "Yangi skidka",
                f"Barber: {discount.barber.display_name}",
                f"Miqdor: {discount.percent}%",
                f"Vaqt: {format_datetime_label(discount.starts_at)} - {format_time_label(discount.ends_at)}",
                f"Nomi: {discount.title}",
                discount.description or "Web yoki mobil ilovadan qulay vaqtni tanlang.",
                *location_lines,
            ]
        )
        barber_text = "\n".join(
            [
                "Skidka e'lon qilindi",
                f"Miqdor: {discount.percent}%",
                f"Vaqt: {format_datetime_label(discount.starts_at)} - {format_time_label(discount.ends_at)}",
                f"Nomi: {discount.title}",
                *location_lines,
            ]
        )
        for chat_id in customer_chat_ids:
            await self.send_text(chat_id, customer_text, role=RoleEnum.customer)
        await self.send_text(
            discount.barber.user.telegram_chat_id or discount.barber.telegram_chat_id,
            barber_text,
            role=RoleEnum.barber,
        )
        await self.send_admin_alert(
            "\n".join(
                [
                    "Yangi skidka e'lon qilindi",
                    f"Barber: {discount.barber.display_name}",
                    f"Miqdor: {discount.percent}%",
                    f"Vaqt: {format_datetime_label(discount.starts_at)} - {format_time_label(discount.ends_at)}",
                    *location_lines,
                ]
            )
        )

    async def run_polling(self) -> None:
        if not self.is_enabled():
            return

        while True:
            try:
                updates = await self._fetch_updates()
                for update in updates:
                    self._offset = max(self._offset, int(update.get("update_id", 0)))
                    await self._process_update(update)
            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception("Telegram polling loop error")
                await asyncio.sleep(settings.telegram_poll_retry_seconds)

    async def _fetch_updates(self) -> list[dict[str, object]]:
        url = f"{settings.telegram_api_base}/bot{settings.telegram_bot_token}/getUpdates"
        payload = {
            "timeout": settings.telegram_poll_timeout_seconds,
            "offset": self._offset + 1,
            "allowed_updates": ["message", "callback_query"],
        }
        async with httpx.AsyncClient(timeout=settings.telegram_poll_timeout_seconds + 10) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("result", []) if data.get("ok") else []

    async def _process_update(self, update: dict[str, object]) -> None:
        callback_query = update.get("callback_query")
        if isinstance(callback_query, dict):
            await self._process_callback_query(callback_query)
            return

        message = update.get("message")
        if not isinstance(message, dict):
            return

        text = str(message.get("text") or "").strip()
        chat = message.get("chat")
        if not isinstance(chat, dict):
            return
        chat_id = str(chat.get("id") or "")
        from_user = message.get("from")
        first_name = from_user.get("first_name") if isinstance(from_user, dict) else None

        async with SessionLocal() as session:
            if text.startswith("/start"):
                await self._handle_start(session, chat_id, text, str(first_name or ""))
                return
            await self._handle_menu(session, chat_id, text)

    async def _process_callback_query(self, callback_query: dict[str, object]) -> None:
        callback_id = str(callback_query.get("id") or "")
        data = str(callback_query.get("data") or "")
        message = callback_query.get("message")
        chat_id = ""
        if isinstance(message, dict):
            chat = message.get("chat")
            if isinstance(chat, dict):
                chat_id = str(chat.get("id") or "")
        if not chat_id or not data:
            await self._answer_callback(callback_id)
            return

        async with SessionLocal() as session:
            await self._handle_callback(session, chat_id, data, callback_id)

    async def _handle_start(
        self,
        session,
        chat_id: str,
        text: str,
        first_name: str,
    ) -> None:
        payload = text.split(maxsplit=1)[1].strip() if " " in text else ""
        if not payload.startswith("link_"):
            await self.send_text(
                chat_id,
                "\n".join(
                    [
                        "Assalomu alaykum.",
                        "Bu botni web yoki mobil ilovadagi Telegram ulash linki/QR orqali ulang.",
                        "Avval tizimga kiring, keyin Start bosing.",
                    ]
                ),
            )
            return

        try:
            _, role_value, subject_id = payload.split("_", 2)
            role = RoleEnum(role_value)
        except ValueError:
            await self.send_text(chat_id, "Bu link noto'g'ri yoki eskirgan.")
            return

        user = (
            await session.execute(
                select(User).options(selectinload(User.barber_profile)).where(User.id == subject_id, User.role == role),
            )
        ).scalar_one_or_none()
        if not user:
            await self.send_text(chat_id, "Foydalanuvchi topilmadi yoki link eskirgan.")
            return

        existing_user = (
            await session.execute(select(User).where(User.telegram_chat_id == chat_id, User.id != user.id))
        ).scalar_one_or_none()
        if existing_user:
            existing_user.telegram_chat_id = None

        existing_barber = (
            await session.execute(select(Barber).where(Barber.telegram_chat_id == chat_id, Barber.user_id != user.id))
        ).scalar_one_or_none()
        if existing_barber:
            existing_barber.telegram_chat_id = None

        user.telegram_chat_id = chat_id
        if role == RoleEnum.barber and user.barber_profile:
            user.barber_profile.telegram_chat_id = chat_id

        await session.commit()
        await self.send_text(
            chat_id,
            self._welcome_message(role, user.full_name, first_name),
            role=role,
        )
        default_menu = BARBER_MENU["stats"] if role == RoleEnum.barber else CUSTOMER_MENU["my"]
        if role == RoleEnum.admin:
            default_menu = ADMIN_MENU["today"]
        await self._handle_menu(session, chat_id, default_menu)

    async def _handle_menu(self, session, chat_id: str, text: str) -> None:
        user = await self._get_user_by_chat_id(session, chat_id)
        if not user:
            await self.send_text(
                chat_id,
                "\n".join(
                    [
                        "Bot hali ulanmagan.",
                        "Web yoki mobil ilovadagi Telegram link/QR orqali Start bosing.",
                        "Shunda bron, eslatma va status xabarlari shu yerga keladi.",
                    ]
                ),
            )
            return

        if user.role == RoleEnum.customer:
            await self._handle_customer_menu(session, user, text)
            return
        if user.role == RoleEnum.barber:
            await self._handle_barber_menu(session, user, text)
            return
        await self._handle_admin_menu(session, user, text)

    async def _get_user_by_chat_id(self, session, chat_id: str) -> User | None:
        user = (
            await session.execute(
                select(User).options(selectinload(User.barber_profile)).where(User.telegram_chat_id == chat_id),
            )
        ).scalar_one_or_none()
        if user:
            return user

        barber = (
            await session.execute(
                select(Barber).options(selectinload(Barber.user)).where(Barber.telegram_chat_id == chat_id),
            )
        ).scalar_one_or_none()
        return barber.user if barber else None

    async def _handle_customer_menu(self, session, user: User, text: str) -> None:
        if text in {CUSTOMER_MENU["book"], "/book"}:
            await self._show_barber_picker(session, user)
            return

        if text == CUSTOMER_MENU["discounts"]:
            await self._show_customer_discounts(session, user)
            return

        if text in {CUSTOMER_MENU["my"], "/menu", "/start", ""}:
            current_booking = await self._get_customer_active_booking(session, user.id)
            if not current_booking:
                await self.send_text(
                    user.telegram_chat_id,
                    "\n".join(
                        [
                            "Faol bron topilmadi.",
                            "Bot ichidan yangi bron yaratishingiz mumkin.",
                        ]
                    ),
                    role=RoleEnum.customer,
                    inline_keyboard=[[{"text": "Bron qilish", "callback_data": "tm:book"}]],
                )
                return

            await self.send_text(
                user.telegram_chat_id,
                self._format_booking_detail(current_booking, include_customer=False),
                role=RoleEnum.customer,
            )
            return

        await self.send_text(
            user.telegram_chat_id,
            "\n".join(
                [
                    "Yordam",
                    f"{CUSTOMER_MENU['my']} - faol broningizni ko'rsatadi.",
                    f"{CUSTOMER_MENU['book']} - bot ichidan bron yaratadi.",
                    f"{CUSTOMER_MENU['discounts']} - faol skidkalarni ko'rsatadi.",
                ]
            ),
            role=RoleEnum.customer,
        )

    async def _get_customer_active_booking(self, session, user_id: str) -> Booking | None:
        return (
            await session.execute(
                select(Booking)
                .options(selectinload(Booking.barber).selectinload(Barber.user), selectinload(Booking.customer_user))
                .where(
                    Booking.customer_user_id == user_id,
                    Booking.status.in_(ACTIVE_STATUSES),
                )
                .order_by(Booking.scheduled_for.asc())
            )
        ).scalars().first()

    async def _show_customer_discounts(self, session, user: User) -> None:
        discounts = list(
            (
                await session.execute(
                    select(DiscountOffer)
                    .options(selectinload(DiscountOffer.barber).selectinload(Barber.user))
                    .where(DiscountOffer.ends_at >= datetime.now(timezone.utc))
                    .order_by(DiscountOffer.starts_at.asc())
                    .limit(6)
                )
            )
            .scalars()
            .all()
        )
        if not discounts:
            await self.send_text(user.telegram_chat_id, "Hozircha faol skidka yo'q.", role=RoleEnum.customer)
            return

        await self.send_text(
            user.telegram_chat_id,
            "\n".join(
                [
                    "Hozirgi skidkalar",
                    *[
                        f"{item.percent}% - {item.barber.display_name} ({format_time_label(item.starts_at)}-{format_time_label(item.ends_at)})"
                        for item in discounts
                    ],
                ]
            ),
            role=RoleEnum.customer,
        )

    async def _show_barber_picker(self, session, user: User) -> None:
        active_booking = await self._get_customer_active_booking(session, user.id)
        if active_booking:
            await self.send_text(
                user.telegram_chat_id,
                "\n".join(
                    [
                        "Sizda faol bron bor.",
                        "Yangi bron qilish uchun avvalgi bron tugashi yoki rad etilishi kerak.",
                        "",
                        self._format_booking_detail(active_booking, include_customer=False),
                    ]
                ),
                role=RoleEnum.customer,
            )
            return

        barbers = list(
            (
                await session.execute(
                    select(Barber)
                    .options(selectinload(Barber.user))
                    .order_by(Barber.rating.desc(), Barber.display_name.asc())
                    .limit(10)
                )
            )
            .scalars()
            .all()
        )
        if not barbers:
            await self.send_text(user.telegram_chat_id, "Hozircha barber topilmadi.", role=RoleEnum.customer)
            return

        rows = [
            [
                {
                    "text": f"{barber.display_name} - {barber.rating:.1f}",
                    "callback_data": f"tb:{barber.id}",
                }
            ]
            for barber in barbers
        ]
        await self.send_text(
            user.telegram_chat_id,
            "\n".join(
                [
                    "Barber tanlang",
                    "Keyingi qadamda xizmat, sana va bo'sh vaqtni tanlaysiz.",
                ]
            ),
            role=RoleEnum.customer,
            inline_keyboard=rows,
        )

    async def _show_service_picker(self, session, chat_id: str, barber_id: str) -> None:
        barber = await self._get_barber(session, barber_id)
        if not barber:
            await self.send_text(chat_id, "Barber topilmadi.", role=RoleEnum.customer)
            return

        rows: list[list[dict[str, str]]] = []
        for key, _, label in SERVICE_OPTIONS:
            rows.append(
                [
                    {
                        "text": f"{label} - {format_price(service_price(barber, key))}",
                        "callback_data": f"ts:{barber.id}:{key}",
                    }
                ]
            )

        await self.send_text(
            chat_id,
            "\n".join(
                [
                    f"Barber: {barber.display_name}",
                    f"Reyting: {barber.rating:.1f}",
                    *build_location_lines(barber),
                    "",
                    "Xizmat tanlang",
                ]
            ),
            role=RoleEnum.customer,
            inline_keyboard=rows,
        )

    async def _show_date_picker(self, session, chat_id: str, barber_id: str, service_key: str) -> None:
        barber = await self._get_barber(session, barber_id)
        service_name = service_name_from_key(service_key)
        if not barber or not service_name:
            await self.send_text(chat_id, "Tanlov topilmadi. Qaytadan bron qiling.", role=RoleEnum.customer)
            return

        today = datetime.now(UZBEK_TZ).date()
        rows: list[list[dict[str, str]]] = []
        for offset in range(5):
            selected = today + timedelta(days=offset)
            label = selected.strftime("%d.%m")
            if offset == 0:
                label = f"Bugun {label}"
            elif offset == 1:
                label = f"Ertaga {label}"
            rows.append(
                [
                    {
                        "text": label,
                        "callback_data": f"td:{barber_id}:{service_key}:{date_token(selected)}",
                    }
                ]
            )

        await self.send_text(
            chat_id,
            "\n".join(
                [
                    f"Xizmat: {service_name}",
                    f"Narx: {format_price(service_price(barber, service_key))}",
                    "Sana tanlang",
                ]
            ),
            role=RoleEnum.customer,
            inline_keyboard=rows,
        )

    async def _show_slot_picker(self, session, chat_id: str, barber_id: str, service_key: str, day_token: str) -> None:
        barber = await self._get_barber(session, barber_id)
        service_name = service_name_from_key(service_key)
        if not barber or not service_name:
            await self.send_text(chat_id, "Tanlov topilmadi. Qaytadan bron qiling.", role=RoleEnum.customer)
            return

        try:
            selected_day = parse_date_token(day_token)
        except ValueError:
            await self.send_text(chat_id, "Sana noto'g'ri. Qaytadan tanlang.", role=RoleEnum.customer)
            return

        slots = await self._available_slots_for_day(session, barber, selected_day)
        if not slots:
            await self.send_text(
                chat_id,
                "Bu kunda bo'sh vaqt qolmagan. Boshqa sana tanlang.",
                role=RoleEnum.customer,
                inline_keyboard=[[{"text": "Sana tanlash", "callback_data": f"ts:{barber_id}:{service_key}"}]],
            )
            return

        rows: list[list[dict[str, str]]] = []
        current_row: list[dict[str, str]] = []
        for slot in slots:
            current_row.append(
                {
                    "text": slot,
                    "callback_data": f"tt:{barber_id}:{service_key}:{day_token}:{slot.replace(':', '')}",
                }
            )
            if len(current_row) == 3:
                rows.append(current_row)
                current_row = []
        if current_row:
            rows.append(current_row)

        await self.send_text(
            chat_id,
            "\n".join(
                [
                    f"Sana: {selected_day.strftime('%d.%m.%Y')}",
                    f"Xizmat: {service_name}",
                    "Bo'sh vaqtni tanlang",
                ]
            ),
            role=RoleEnum.customer,
            inline_keyboard=rows,
        )

    async def _available_slots_for_day(self, session, barber: Barber, selected_day: date) -> list[str]:
        day_start = datetime.combine(selected_day, datetime.min.time(), tzinfo=UZBEK_TZ)
        day_end = day_start + timedelta(days=1)
        day_start_utc = day_start.astimezone(timezone.utc)
        day_end_utc = day_end.astimezone(timezone.utc)

        bookings = list(
            (
                await session.execute(
                    select(Booking).where(
                        Booking.barber_id == barber.id,
                        Booking.scheduled_for >= day_start_utc,
                        Booking.scheduled_for < day_end_utc,
                        Booking.status != BookingStatusEnum.rejected,
                    )
                )
            )
            .scalars()
            .all()
        )
        busy_times = {format_time_label(item.scheduled_for) for item in bookings}

        now_local = datetime.now(UZBEK_TZ)
        start_time = barber.work_start_time or "09:00"
        end_time = barber.work_end_time or "18:30"
        available: list[str] = []
        for slot in build_slots():
            slot_local = datetime.combine(
                selected_day,
                datetime.strptime(slot, "%H:%M").time(),
                tzinfo=UZBEK_TZ,
            )
            if slot < start_time or slot > end_time:
                continue
            if slot in busy_times:
                continue
            if slot_local <= now_local:
                continue
            available.append(slot)
        return available

    async def _get_barber(self, session, barber_id: str) -> Barber | None:
        return (
            await session.execute(
                select(Barber).options(selectinload(Barber.user)).where(Barber.id == barber_id),
            )
        ).scalar_one_or_none()

    async def _handle_callback(self, session, chat_id: str, data: str, callback_id: str) -> None:
        await self._answer_callback(callback_id)
        user = await self._get_user_by_chat_id(session, chat_id)
        if not user:
            await self.send_text(chat_id, "Bot ulanmagan. Ilovadan Telegram link/QR orqali ulang.")
            return

        if data == "tm:book":
            if user.role != RoleEnum.customer:
                await self.send_text(chat_id, "Bu amal faqat mijoz uchun.", role=user.role)
                return
            await self._show_barber_picker(session, user)
            return

        parts = data.split(":")
        action = parts[0] if parts else ""

        if action == "tb" and len(parts) == 2:
            await self._show_service_picker(session, chat_id, parts[1])
            return

        if action == "ts" and len(parts) == 3:
            await self._show_date_picker(session, chat_id, parts[1], parts[2])
            return

        if action == "td" and len(parts) == 4:
            await self._show_slot_picker(session, chat_id, parts[1], parts[2], parts[3])
            return

        if action == "tt" and len(parts) == 5:
            await self._create_booking_from_callback(session, user, chat_id, parts[1], parts[2], parts[3], parts[4])
            return

        if action in {"ba", "br", "bc"} and len(parts) == 2:
            await self._update_booking_from_callback(session, user, chat_id, action, parts[1])
            return

        await self.send_text(chat_id, "Bu tugma eskirgan. Menyudan qaytadan tanlang.", role=user.role)

    async def _create_booking_from_callback(
        self,
        session,
        user: User,
        chat_id: str,
        barber_id: str,
        service_key: str,
        day_token: str,
        slot_token: str,
    ) -> None:
        if user.role != RoleEnum.customer:
            await self.send_text(chat_id, "Bron yaratish faqat mijoz profili orqali ishlaydi.", role=user.role)
            return

        service_name = service_name_from_key(service_key)
        if not service_name:
            await self.send_text(chat_id, "Xizmat topilmadi. Qaytadan tanlang.", role=RoleEnum.customer)
            return

        phone = (user.phone or "").strip()
        if len(phone) < 7:
            await self.send_text(
                chat_id,
                "Bron qilish uchun profilingizda telefon raqam bo'lishi kerak. Ilovada Profil bo'limidan telefonni kiriting.",
                role=RoleEnum.customer,
            )
            return

        try:
            slot = slot_from_token(slot_token)
            selected_day = parse_date_token(day_token)
            scheduled_local = datetime.combine(
                selected_day,
                datetime.strptime(slot, "%H:%M").time(),
                tzinfo=UZBEK_TZ,
            )
        except ValueError:
            await self.send_text(chat_id, "Tanlangan vaqt noto'g'ri. Qaytadan bron qiling.", role=RoleEnum.customer)
            return

        from app.schemas.booking import BookingCreateRequest
        from app.services.bookings import create_booking

        try:
            booking = await create_booking(
                session,
                BookingCreateRequest(
                    barber_id=barber_id,
                    customer_name=user.full_name,
                    customer_phone=phone,
                    service_name=service_name,
                    scheduled_for=scheduled_local.astimezone(timezone.utc),
                    note="Telegram bot orqali yaratildi.",
                ),
                user,
            )
        except HTTPException as exc:
            await self.send_text(chat_id, str(exc.detail), role=RoleEnum.customer)
            return

        await self.send_text(
            chat_id,
            "\n".join(
                [
                    "Bron yuborildi.",
                    "Barber qabul qilganda yoki rad etganda shu yerga xabar keladi.",
                    "",
                    self._format_booking_detail(booking, include_customer=False),
                ]
            ),
            role=RoleEnum.customer,
        )

    async def _update_booking_from_callback(
        self,
        session,
        user: User,
        chat_id: str,
        action: str,
        booking_id: str,
    ) -> None:
        if user.role not in {RoleEnum.barber, RoleEnum.admin}:
            await self.send_text(chat_id, "Bu amal faqat barber yoki admin uchun.", role=user.role)
            return

        status_by_action = {
            "ba": BookingStatusEnum.accepted,
            "br": BookingStatusEnum.rejected,
            "bc": BookingStatusEnum.completed,
        }
        next_status = status_by_action[action]

        from app.schemas.booking import BookingStatusUpdateRequest
        from app.services.bookings import update_booking_status

        try:
            booking = await update_booking_status(
                session,
                booking_id,
                BookingStatusUpdateRequest(
                    status=next_status,
                    rejection_reason="Telegram bot orqali rad etildi." if next_status == BookingStatusEnum.rejected else None,
                ),
                user,
            )
        except HTTPException as exc:
            await self.send_text(chat_id, str(exc.detail), role=user.role)
            return

        await self.send_text(
            chat_id,
            "\n".join(
                [
                    "Bron yangilandi.",
                    self._format_booking_detail(booking, include_customer=True),
                ]
            ),
            role=user.role,
            inline_keyboard=self._booking_action_keyboard(booking),
        )

    async def _handle_barber_menu(self, session, user: User, text: str) -> None:
        barber = (
            await session.execute(
                select(Barber).options(selectinload(Barber.user)).where(Barber.user_id == user.id),
            )
        ).scalar_one_or_none()
        if not barber:
            return

        now_local = datetime.now(UZBEK_TZ)
        day_start = now_local.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        day_start_utc = day_start.astimezone(timezone.utc)
        day_end_utc = day_end.astimezone(timezone.utc)

        bookings = list(
            (
                await session.execute(
                    select(Booking)
                    .options(selectinload(Booking.barber).selectinload(Barber.user), selectinload(Booking.customer_user))
                    .where(
                        Booking.barber_id == barber.id,
                        Booking.scheduled_for >= day_start_utc,
                        Booking.scheduled_for < day_end_utc,
                        Booking.status != BookingStatusEnum.rejected,
                    )
                    .order_by(Booking.scheduled_for.asc())
                )
            )
            .scalars()
            .all()
        )

        if text in {BARBER_MENU["today"], "/menu", "/start"}:
            if not bookings:
                await self.send_text(
                    user.telegram_chat_id,
                    "\n".join(
                        [
                            "Bugun bron yo'q.",
                            "Yangi bron kelganda shu yerga xabar tushadi.",
                        ]
                    ),
                    role=RoleEnum.barber,
                )
                return

            busy_times = {format_time_label(item.scheduled_for) for item in bookings}
            free_times = [slot for slot in build_slots() if slot not in busy_times][:8]
            free_text = ", ".join(free_times) if free_times else "Bo'sh slot qolmagan"
            await self.send_text(
                user.telegram_chat_id,
                "\n".join(
                    [
                        f"Bugungi bronlar: {len(bookings)} ta",
                        f"Bo'sh vaqtlar: {free_text}",
                        "Boshqarish uchun pastdagi bron tugmalaridan foydalaning.",
                    ]
                ),
                role=RoleEnum.barber,
            )
            for item in bookings[:8]:
                await self.send_text(
                    user.telegram_chat_id,
                    self._format_booking_detail(item, include_customer=True),
                    role=RoleEnum.barber,
                    inline_keyboard=self._booking_action_keyboard(item),
                )
            return

        if text == BARBER_MENU["pending"]:
            pending_bookings = list(
                (
                    await session.execute(
                        select(Booking)
                        .options(selectinload(Booking.barber).selectinload(Barber.user), selectinload(Booking.customer_user))
                        .where(
                            Booking.barber_id == barber.id,
                            Booking.status == BookingStatusEnum.pending,
                            Booking.scheduled_for >= datetime.now(timezone.utc),
                        )
                        .order_by(Booking.scheduled_for.asc())
                        .limit(10)
                    )
                )
                .scalars()
                .all()
            )
            if not pending_bookings:
                await self.send_text(user.telegram_chat_id, "Kutilayotgan bron yo'q.", role=RoleEnum.barber)
                return

            await self.send_text(
                user.telegram_chat_id,
                f"Kutilayotgan bronlar: {len(pending_bookings)} ta",
                role=RoleEnum.barber,
            )
            for item in pending_bookings:
                await self.send_text(
                    user.telegram_chat_id,
                    self._format_booking_detail(item, include_customer=True),
                    role=RoleEnum.barber,
                    inline_keyboard=self._booking_action_keyboard(item),
                )
            return

        if text == BARBER_MENU["next"]:
            next_booking = next((item for item in bookings if to_local_time(item.scheduled_for) >= now_local), None)
            if not next_booking:
                await self.send_text(user.telegram_chat_id, "Hozircha keyingi bron topilmadi.", role=RoleEnum.barber)
                return

            await self.send_text(
                user.telegram_chat_id,
                self._format_booking_detail(next_booking, include_customer=True),
                role=RoleEnum.barber,
                inline_keyboard=self._booking_action_keyboard(next_booking),
            )
            return

        if text == BARBER_MENU["discounts"]:
            discounts = list(
                (
                    await session.execute(
                        select(DiscountOffer)
                        .where(
                            DiscountOffer.barber_id == barber.id,
                            DiscountOffer.ends_at >= datetime.now(timezone.utc),
                        )
                        .order_by(DiscountOffer.starts_at.asc())
                        .limit(8)
                    )
                )
                .scalars()
                .all()
            )
            if not discounts:
                await self.send_text(user.telegram_chat_id, "Hozircha faol skidka yo'q.", role=RoleEnum.barber)
                return

            await self.send_text(
                user.telegram_chat_id,
                "\n".join(
                    [
                        "Sizning skidkalaringiz",
                        *[
                            f"{item.percent}% - {format_datetime_label(item.starts_at)} dan {format_time_label(item.ends_at)} gacha"
                            for item in discounts
                        ],
                    ]
                ),
                role=RoleEnum.barber,
            )
            return

        active_discounts_count = len(
            list(
                (
                    await session.execute(
                        select(DiscountOffer).where(
                            DiscountOffer.barber_id == barber.id,
                            DiscountOffer.ends_at >= datetime.now(timezone.utc),
                        )
                    )
                )
                .scalars()
                .all()
            )
        )
        completed_count = sum(1 for item in bookings if item.status == BookingStatusEnum.completed)
        active_count = sum(1 for item in bookings if item.status in ACTIVE_STATUSES)
        await self.send_text(
            user.telegram_chat_id,
            "\n".join(
                [
                    "Barber statistikasi",
                    f"Ism: {barber.display_name}",
                    f"Bugungi bronlar: {len(bookings)} ta",
                    f"Tugallangan: {completed_count} ta",
                    f"Faol bronlar: {active_count} ta",
                    f"Faol skidkalar: {active_discounts_count} ta",
                ]
            ),
            role=RoleEnum.barber,
        )

    async def _handle_admin_menu(self, session, user: User, text: str) -> None:
        now_local = datetime.now(UZBEK_TZ)
        day_start = now_local.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        day_start_utc = day_start.astimezone(timezone.utc)
        day_end_utc = day_end.astimezone(timezone.utc)

        if text in {ADMIN_MENU["today"], "/menu", "/start"}:
            total = (
                await session.execute(
                    select(func.count(Booking.id)).where(
                        Booking.scheduled_for >= day_start_utc,
                        Booking.scheduled_for < day_end_utc,
                        Booking.status != BookingStatusEnum.rejected,
                    )
                )
            ).scalar_one()
            barbers = (await session.execute(select(func.count(Barber.id)))).scalar_one()
            pending = (
                await session.execute(
                    select(func.count(Booking.id)).where(
                        Booking.scheduled_for >= day_start_utc,
                        Booking.scheduled_for < day_end_utc,
                        Booking.status == BookingStatusEnum.pending,
                    )
                )
            ).scalar_one()
            await self.send_text(
                user.telegram_chat_id,
                "\n".join(
                    [
                        "Bugungi holat",
                        f"Barberlar: {barbers} ta",
                        f"Bronlar: {total} ta",
                        f"Kutilayotgan: {pending} ta",
                    ]
                ),
                role=RoleEnum.admin,
            )
            return

        recent = list(
            (
                await session.execute(
                    select(Booking)
                    .options(selectinload(Booking.barber).selectinload(Barber.user), selectinload(Booking.customer_user))
                    .order_by(Booking.created_at.desc())
                    .limit(5)
                )
            )
            .scalars()
            .all()
        )
        if not recent:
            await self.send_text(user.telegram_chat_id, "Hozircha bron topilmadi.", role=RoleEnum.admin)
            return

        await self.send_text(
            user.telegram_chat_id,
            "\n".join(
                [
                    "So'nggi bronlar",
                    *[
                        f"{self._status_icon(item.status)} {item.customer_name} -> {item.barber.display_name} ({format_time_label(item.scheduled_for)})"
                        for item in recent
                    ],
                ]
            ),
            role=RoleEnum.admin,
        )

    def _booking_action_keyboard(self, booking: Booking) -> list[list[dict[str, str]]] | None:
        if booking.status == BookingStatusEnum.pending:
            return [
                [
                    {"text": "Qabul qilish", "callback_data": f"ba:{booking.id}"},
                    {"text": "Rad etish", "callback_data": f"br:{booking.id}"},
                ]
            ]
        if booking.status in {BookingStatusEnum.accepted, BookingStatusEnum.in_service}:
            return [[{"text": "Tugatish", "callback_data": f"bc:{booking.id}"}]]
        return None

    def _format_booking_detail(self, booking: Booking, *, include_customer: bool) -> str:
        lines = [
            "Bron ma'lumoti",
            f"Barber: {booking.barber.display_name}",
            f"Xizmat: {booking.service_name}",
            f"Vaqt: {format_datetime_label(booking.scheduled_for)}",
            f"Holat: {self._label_for_status(booking.status)}",
            f"Narx: {format_price(booking.final_price)}",
        ]
        if include_customer:
            lines.insert(2, f"Mijoz: {booking.customer_name}")
            lines.insert(3, f"Telefon: {booking.customer_phone}")
        if booking.rejection_reason:
            lines.append(f"Sabab: {booking.rejection_reason}")
        lines.extend(build_location_lines(booking.barber))
        return "\n".join(lines)

    def _welcome_message(self, role: RoleEnum, full_name: str, first_name: str) -> str:
        name = first_name or full_name.split(" ")[0]
        role_label = {
            RoleEnum.customer: "mijoz",
            RoleEnum.barber: "barber",
            RoleEnum.admin: "admin",
        }[role]
        return "\n".join(
            [
                f"Assalomu alaykum, {name}",
                f"Telegram bot {role_label} profilingizga ulandi.",
                "Endi bron, holat va eslatmalar shu yerga keladi.",
            ]
        )

    def _label_for_status(self, status: BookingStatusEnum) -> str:
        return {
            BookingStatusEnum.pending: "Kutilmoqda",
            BookingStatusEnum.accepted: "Qabul qilindi",
            BookingStatusEnum.in_service: "Jarayonda",
            BookingStatusEnum.completed: "Tugallandi",
            BookingStatusEnum.rejected: "Rad etildi",
        }[status]

    def _status_icon(self, status: BookingStatusEnum) -> str:
        return {
            BookingStatusEnum.pending: "Kutilmoqda",
            BookingStatusEnum.accepted: "Qabul qilindi",
            BookingStatusEnum.in_service: "Jarayonda",
            BookingStatusEnum.completed: "Tugallandi",
            BookingStatusEnum.rejected: "Rad etildi",
        }[status]


telegram_notifier = TelegramNotifier()
