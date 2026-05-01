from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import httpx
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.enums import BookingStatusEnum, RoleEnum
from app.core.database import SessionLocal
from app.models.barber import Barber
from app.models.booking import Booking
from app.models.discount import DiscountOffer
from app.models.user import User

logger = logging.getLogger(__name__)
try:
    UZBEK_TZ = ZoneInfo("Asia/Tashkent")
except ZoneInfoNotFoundError:
    UZBEK_TZ = timezone(timedelta(hours=5))


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
            labels = [["📌 Mening navbatim", "🕒 Yaqin navbat"], ["🏷 Skidkalar"], ["ℹ️ Yordam"]]
        elif role == RoleEnum.barber:
            labels = [["📋 Bugungi navbatlar", "⏰ Keyingi navbat"], ["🏷 Skidkalarim", "📊 Holatim"]]
        else:
            labels = [["📣 Bugungi holat", "📋 So'nggi navbatlar"], ["ℹ️ Yordam"]]

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
    ) -> None:
        if not self.is_enabled() or not chat_id:
            return

        url = f"{settings.telegram_api_base}/bot{settings.telegram_bot_token}/sendMessage"
        payload: dict[str, object] = {
            "chat_id": chat_id,
            "text": text,
        }
        if role is not None:
            payload["reply_markup"] = self._keyboard(role)

        try:
            async with httpx.AsyncClient(timeout=20) as client:
                await client.post(url, json=payload)
        except Exception:
            logger.exception("Telegram sendMessage failed")

    async def send_admin_alert(self, text: str) -> None:
        await self.send_text(settings.telegram_admin_chat_id, text, role=RoleEnum.admin)

    async def send_booking_created(self, booking: Booking) -> None:
        location_lines = build_location_lines(booking.barber)
        customer_text = "\n".join(
            [
                "Yangi sorov yuborildi",
                f"Barber: {booking.barber.display_name}",
                f"Xizmat: {booking.service_name}",
                f"Vaqt: {format_datetime_label(booking.scheduled_for)}",
                "Holat: Javob kutilmoqda",
                *location_lines,
            ]
        )
        barber_text = "\n".join(
            [
                "Yangi bron sorovi",
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
                "Xizmat tugadi. Yana yangi bron qilishingiz mumkin.",
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
        )
        await self.send_admin_alert(
            "\n".join(
                [
                    "Bron holati ozgardi",
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
                discount.description or "Web dasturga kirib qulay vaqtni tanlang.",
                *location_lines,
            ]
        )
        barber_text = "\n".join(
            [
                "Skidka elon qilindi",
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
                    "Yangi skidka elon qilindi",
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
            "allowed_updates": ["message"],
        }
        async with httpx.AsyncClient(timeout=settings.telegram_poll_timeout_seconds + 10) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("result", []) if data.get("ok") else []

    async def _process_update(self, update: dict[str, object]) -> None:
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
                        "👋 Assalomu alaykum",
                        "Bu botni web dasturdagi QR yoki link orqali ulang.",
                        "Avval tizimga kirib, keyin Start bosing.",
                    ]
                ),
            )
            return

        _, role_value, subject_id = payload.split("_", 2)
        try:
            role = RoleEnum(role_value)
        except ValueError:
            await self.send_text(chat_id, "⚠️ Bu link noto'g'ri yoki eskirgan.")
            return

        user = (
            await session.execute(
                select(User).options(selectinload(User.barber_profile)).where(User.id == subject_id, User.role == role),
            )
        ).scalar_one_or_none()
        if not user:
            await self.send_text(chat_id, "⚠️ Foydalanuvchi topilmadi yoki link eskirgan.")
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
        await self._handle_menu(session, chat_id, "📊 Holatim" if role == RoleEnum.barber else "📌 Mening navbatim")

    async def _handle_menu(self, session, chat_id: str, text: str) -> None:
        user = (
            await session.execute(
                select(User).options(selectinload(User.barber_profile)).where(User.telegram_chat_id == chat_id),
            )
        ).scalar_one_or_none()

        if not user:
            barber = (
                await session.execute(
                    select(Barber).options(selectinload(Barber.user)).where(Barber.telegram_chat_id == chat_id),
                )
            ).scalar_one_or_none()
            user = barber.user if barber else None

        if not user:
            await self.send_text(
                chat_id,
                "\n".join(
                    [
                        "🔐 Bot hali ulanmagan",
                        "Web dasturdagi QR yoki link orqali Start bosing.",
                        "Shunda bron va eslatmalar shu yerga keladi.",
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

    async def _handle_customer_menu(self, session, user: User, text: str) -> None:
        current_booking = (
            await session.execute(
                select(Booking)
                .options(selectinload(Booking.barber).selectinload(Barber.user))
                .where(
                    Booking.customer_user_id == user.id,
                    Booking.status.in_(
                        [BookingStatusEnum.pending, BookingStatusEnum.accepted, BookingStatusEnum.in_service]
                    ),
                )
                .order_by(Booking.scheduled_for.asc())
            )
        ).scalars().first()

        if text in {"📌 Mening navbatim", "🕒 Yaqin navbat", "/menu", "/start"}:
            if not current_booking:
                await self.send_text(
                    user.telegram_chat_id,
                    "\n".join(
                        [
                            "📭 Faol navbat topilmadi",
                            "Web dastur orqali yangi bron qilishingiz mumkin.",
                        ]
                    ),
                    role=RoleEnum.customer,
                )
                return

            await self.send_text(
                user.telegram_chat_id,
                "\n".join(
                    [
                        "📌 Sizning navbatingiz",
                        f"💈 Barber: {current_booking.barber.display_name}",
                        f"✂️ Xizmat: {current_booking.service_name}",
                        f"🕒 Vaqt: {format_datetime_label(current_booking.scheduled_for)}",
                        f"🔄 Holat: {self._label_for_status(current_booking.status)}",
                    ]
                ),
                role=RoleEnum.customer,
            )
            return

        if text == "🏷 Skidkalar":
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
                await self.send_text(
                    user.telegram_chat_id,
                    "🏷 Hozircha faol skidka yo'q.",
                    role=RoleEnum.customer,
                )
                return

            await self.send_text(
                user.telegram_chat_id,
                "\n".join(
                    [
                        "🏷 Hozirgi skidkalar",
                        *[
                            f"🔥 {item.percent}% - {item.barber.display_name} ({format_time_label(item.starts_at)}-{format_time_label(item.ends_at)})"
                            for item in discounts
                        ],
                    ]
                ),
                role=RoleEnum.customer,
            )
            return

        await self.send_text(
            user.telegram_chat_id,
            "\n".join(
                [
                    "ℹ️ Yordam",
                    "📌 Mening navbatim - faol broningizni ko'rsatadi",
                    "🕒 Yaqin navbat - eng yaqin navbat vaqtini ko'rsatadi",
                    "🏷 Skidkalar - hozirgi chegirmalarni ko'rsatadi",
                ]
            ),
            role=RoleEnum.customer,
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

        if text in {"📋 Bugungi navbatlar", "/menu", "/start"}:
            if not bookings:
                await self.send_text(
                    user.telegram_chat_id,
                    "\n".join(
                        [
                            "📋 Bugun navbat yo'q",
                            "Yangi bron kelganda shu yerga xabar tushadi.",
                        ]
                    ),
                    role=RoleEnum.barber,
                )
                return

            busy_times = {format_time_label(item.scheduled_for) for item in bookings}
            free_times = [slot for slot in build_slots() if slot not in busy_times][:8]
            free_text = ", ".join(free_times) if free_times else "Bo'sh slot qolmagan"
            busy_text = ", ".join(sorted(busy_times)[:8]) if busy_times else "Hali band vaqt yo'q"
            booking_lines = [
                f"{self._status_icon(item.status)} {format_time_label(item.scheduled_for)} - {item.customer_name}"
                for item in bookings[:8]
            ]
            await self.send_text(
                user.telegram_chat_id,
                "\n".join(
                    [
                        f"📋 Bugungi navbatlar: {len(bookings)} ta",
                        *booking_lines,
                        "",
                        f"🟢 Bo'sh vaqtlar: {free_text}",
                        f"🔴 Band vaqtlar: {busy_text}",
                    ]
                ),
                role=RoleEnum.barber,
            )
            return

        if text == "⏰ Keyingi navbat":
            next_booking = next((item for item in bookings if to_local_time(item.scheduled_for) >= now_local), None)
            if not next_booking:
                await self.send_text(
                    user.telegram_chat_id,
                    "⏰ Hozircha keyingi navbat topilmadi.",
                    role=RoleEnum.barber,
                )
                return

            await self.send_text(
                user.telegram_chat_id,
                "\n".join(
                    [
                        "⏰ Keyingi navbat",
                        f"👤 Mijoz: {next_booking.customer_name}",
                        f"📞 Telefon: {next_booking.customer_phone}",
                        f"🕒 Vaqt: {format_datetime_label(next_booking.scheduled_for)}",
                    ]
                ),
                role=RoleEnum.barber,
            )
            return

        if text == "🏷 Skidkalarim":
            discounts = list(
                (
                    await session.execute(
                        select(DiscountOffer)
                        .where(
                            DiscountOffer.barber_id == barber.id,
                            DiscountOffer.ends_at >= datetime.now(timezone.utc),
                        )
                        .order_by(DiscountOffer.starts_at.asc())
                    )
                )
                .scalars()
                .all()
            )
            if not discounts:
                await self.send_text(
                    user.telegram_chat_id,
                    "🏷 Hozircha faol skidka yo'q.",
                    role=RoleEnum.barber,
                )
                return

            await self.send_text(
                user.telegram_chat_id,
                "\n".join(
                    [
                        "🏷 Sizning skidkalaringiz",
                        *[
                            f"🔥 {item.percent}% - {format_datetime_label(item.starts_at)} dan {format_time_label(item.ends_at)} gacha"
                            for item in discounts[:8]
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
        pending_count = sum(1 for item in bookings if item.status in [BookingStatusEnum.pending, BookingStatusEnum.accepted, BookingStatusEnum.in_service])
        await self.send_text(
            user.telegram_chat_id,
            "\n".join(
                [
                    "📊 Barber holati",
                    f"💈 Ism: {barber.display_name}",
                    f"📋 Bugungi navbatlar: {len(bookings)} ta",
                    f"✅ Tugallangan: {completed_count} ta",
                    f"⏳ Faol navbatlar: {pending_count} ta",
                    f"🏷 Faol skidkalar: {active_discounts_count} ta",
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

        if text in {"📣 Bugungi holat", "/menu", "/start"}:
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
            await self.send_text(
                user.telegram_chat_id,
                "\n".join(
                    [
                        "📣 Bugungi holat",
                        f"💈 Barberlar: {barbers} ta",
                        f"📋 Navbatlar: {total} ta",
                    ]
                ),
                role=RoleEnum.admin,
            )
            return

        recent = list(
            (
                await session.execute(
                    select(Booking)
                    .options(selectinload(Booking.barber))
                    .order_by(Booking.created_at.desc())
                    .limit(5)
                )
            )
            .scalars()
            .all()
        )
        if not recent:
            await self.send_text(user.telegram_chat_id, "📭 Hozircha navbat topilmadi.", role=RoleEnum.admin)
            return

        await self.send_text(
            user.telegram_chat_id,
            "\n".join(
                [
                    "📋 So'nggi navbatlar",
                    *[
                        f"{self._status_icon(item.status)} {item.customer_name} -> {item.barber.display_name} ({format_time_label(item.scheduled_for)})"
                        for item in recent
                    ],
                ]
            ),
            role=RoleEnum.admin,
        )

    def _welcome_message(self, role: RoleEnum, full_name: str, first_name: str) -> str:
        name = first_name or full_name.split(" ")[0]
        role_label = {
            RoleEnum.customer: "mijoz",
            RoleEnum.barber: "barber",
            RoleEnum.admin: "admin",
        }[role]
        return "\n".join(
            [
                f"👋 Assalomu alaykum, {name}",
                f"✅ Telegram bot {role_label} profilingizga ulandi.",
                "🔔 Endi bron, holat va eslatmalar shu yerga keladi.",
            ]
        )

    def _label_for_status(self, status: BookingStatusEnum) -> str:
        return {
            BookingStatusEnum.pending: "Kutilmoqda",
            BookingStatusEnum.accepted: "Tasdiqlandi",
            BookingStatusEnum.in_service: "Jarayonda",
            BookingStatusEnum.completed: "Tugallandi",
            BookingStatusEnum.rejected: "Rad etildi",
        }[status]

    def _status_icon(self, status: BookingStatusEnum) -> str:
        return {
            BookingStatusEnum.pending: "🟡",
            BookingStatusEnum.accepted: "🟢",
            BookingStatusEnum.in_service: "✂️",
            BookingStatusEnum.completed: "✅",
            BookingStatusEnum.rejected: "❌",
        }[status]


telegram_notifier = TelegramNotifier()


