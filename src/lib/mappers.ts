import {
  AdminUser,
  ApiAuthUser,
  ApiAvailabilityBooking,
  ApiBarber,
  ApiBooking,
  ApiBookingStatus,
  ApiDiscount,
  AuthUser,
  BarberSettingsPayload,
  BarberBookingSummary,
  BarberFormPayload,
  BarberProfile,
  BookingItem,
  BookingStatus,
  CustomerAccount,
  DiscountItem,
  PerformanceItem,
  StatMetric,
} from "../types";
import { getLocalIsoDate } from "../utils/date";
import { getSafeImageUrl } from "./media";

const AVATAR_COLORS = ["#191919", "#d5a546", "#3aa66f", "#5a7bd8", "#b8684d", "#6d7486"];

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export function buildInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "BB";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function colorFromSeed(seed: string) {
  const hash = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function mapApiUserToAuthUser(user: ApiAuthUser): AuthUser {
  return {
    id: user.id,
    role: user.role,
    fullName: user.full_name,
    username: user.username,
    phone: user.phone,
    photoUrl: user.photo_url,
    telegramChatId: user.telegram_chat_id,
    telegramConnected: user.telegram_connected,
    barberProfileId: user.barber_profile_id,
  };
}

export function mapAuthUserToAdmin(user: AuthUser): AdminUser {
  return {
    id: user.id,
    name: user.fullName,
    username: user.username ?? "",
    role: "Administrator",
  };
}

export function mapAuthUserToCustomer(user: AuthUser): CustomerAccount {
  return {
    id: user.id,
    name: user.fullName,
    phone: user.phone ?? "",
    photoUrl: user.photoUrl,
    telegramChatId: user.telegramChatId,
    telegramConnected: user.telegramConnected,
  };
}

export function mapApiBarberToProfile(item: ApiBarber): BarberProfile {
  return {
    id: item.id,
    userId: item.user_id,
    name: item.full_name,
    initials: buildInitials(item.full_name),
    avatarColor: colorFromSeed(item.full_name),
    photoUrl: getSafeImageUrl(item.photo_url) ?? undefined,
    mediaUrl: getSafeImageUrl(item.media_url) ?? undefined,
    specialty: item.specialty,
    experience: `${item.experience_years} yil tajriba`,
    username: item.username,
    handle: `@${item.username}`,
    totalBookings: item.total_bookings,
    todayBookings: item.today_bookings,
    rating: item.rating,
    bio: item.bio ?? undefined,
    workStartTime: item.work_start_time,
    workEndTime: item.work_end_time,
    address: item.address ?? undefined,
    latitude: item.latitude ?? undefined,
    longitude: item.longitude ?? undefined,
    priceHaircut: item.price_haircut,
    priceFade: item.price_fade,
    priceHairBeard: item.price_hair_beard,
    pricePremium: item.price_premium,
    priceBeard: item.price_beard,
    telegramChatId: item.telegram_chat_id ?? undefined,
    telegramConnected: Boolean(item.telegram_chat_id),
  };
}

function mapApiStatusToUi(status: ApiBookingStatus): BookingStatus {
  if (status === "accepted") {
    return "Tasdiqlandi";
  }
  if (status === "in_service") {
    return "Jarayonda";
  }
  if (status === "completed") {
    return "Tugallandi";
  }
  if (status === "rejected") {
    return "Rad etildi";
  }
  return "Kutilmoqda";
}

export function mapUiStatusToApi(status: BookingStatus): ApiBookingStatus {
  if (status === "Tasdiqlandi") {
    return "accepted";
  }
  if (status === "Jarayonda") {
    return "in_service";
  }
  if (status === "Tugallandi") {
    return "completed";
  }
  if (status === "Rad etildi") {
    return "rejected";
  }
  return "pending";
}

function toLocalDateAndTime(isoString: string) {
  const date = new Date(isoString);
  const localDate = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
  const localTime = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return { localDate, localTime };
}

export function mapApiBookingToItem(item: ApiBooking): BookingItem {
  const { localDate, localTime } = toLocalDateAndTime(item.scheduled_for);
  return {
    id: item.id,
    customer: item.customer_name,
    customerId: item.customer_user_id ?? undefined,
    phone: item.customer_phone,
    service: item.service_name,
    barber: item.barber_name,
    barberId: item.barber_id,
    barberUserId: item.barber_user_id,
    date: localDate,
    time: localTime,
    status: mapApiStatusToUi(item.status),
    payment: "-",
    note: item.note ?? undefined,
    originalPrice: item.original_price,
    finalPrice: item.final_price,
    appliedDiscountPercent: item.applied_discount_percent ?? undefined,
    rejectionReason: item.rejection_reason ?? undefined,
    updatedAt: item.updated_at,
    createdAt: item.created_at,
  };
}

export function mapApiDiscountToItem(item: ApiDiscount): DiscountItem {
  const starts = toLocalDateAndTime(item.starts_at);
  const ends = toLocalDateAndTime(item.ends_at);

  return {
    id: item.id,
    barberId: item.barber_id,
    barberUserId: item.barber_user_id,
    barberName: item.barber_name,
    title: item.title,
    description: item.description ?? undefined,
    percent: item.percent,
    startsAt: item.starts_at,
    endsAt: item.ends_at,
    date: starts.localDate,
    startTime: starts.localTime,
    endTime: ends.localTime,
    isActive: new Date(item.ends_at).getTime() >= Date.now(),
  };
}

export function mapApiAvailabilityToItem(item: ApiAvailabilityBooking): BookingItem {
  const { localDate, localTime } = toLocalDateAndTime(item.scheduled_for);
  return {
    id: item.id,
    customer: "",
    phone: "",
    service: "",
    barber: "",
    barberId: item.barber_id,
    date: localDate,
    time: localTime,
    status: mapApiStatusToUi(item.status),
    payment: "-",
  };
}

export function buildBarberPayload(profile: BarberProfile): BarberFormPayload {
  const yearsExp = Number(profile.experience.match(/\d+/)?.[0] ?? 0);
  return {
    fullName: profile.name,
    specialty: profile.specialty,
    photoUrl: getSafeImageUrl(profile.photoUrl) ?? "",
    mediaUrl: getSafeImageUrl(profile.mediaUrl) ?? "",
    rating: profile.rating,
    yearsExp,
    username: profile.username,
    password: profile.password,
    bio: profile.bio ?? "",
    workStartTime: profile.workStartTime,
    workEndTime: profile.workEndTime,
    address: profile.address,
    latitude: profile.latitude,
    longitude: profile.longitude,
    priceHaircut: profile.priceHaircut,
    priceFade: profile.priceFade,
    priceHairBeard: profile.priceHairBeard,
    pricePremium: profile.pricePremium,
    priceBeard: profile.priceBeard,
  };
}

export function buildBarberSettingsPayload(profile: BarberProfile): BarberSettingsPayload {
  return {
    fullName: profile.name,
    username: profile.username,
    specialty: profile.specialty,
    photoUrl: getSafeImageUrl(profile.photoUrl) ?? "",
    mediaUrl: getSafeImageUrl(profile.mediaUrl) ?? "",
    rating: profile.rating,
    yearsExp: Number(profile.experience.match(/\d+/)?.[0] ?? 0),
    bio: profile.bio ?? "",
    workStartTime: profile.workStartTime,
    workEndTime: profile.workEndTime,
    address: profile.address,
    latitude: profile.latitude,
    longitude: profile.longitude,
    priceHaircut: profile.priceHaircut,
    priceFade: profile.priceFade,
    priceHairBeard: profile.priceHairBeard,
    pricePremium: profile.pricePremium,
    priceBeard: profile.priceBeard,
  };
}

function isPendingStatus(status: BookingStatus) {
  return status === "Kutilmoqda" || status === "Tasdiqlandi" || status === "Jarayonda";
}

export function buildDashboardMetrics(bookings: BookingItem[], barbers: BarberProfile[]): StatMetric[] {
  const todayIso = getLocalIsoDate();
  const todayItems = bookings.filter((item) => item.date === todayIso);
  const completed = todayItems.filter((item) => item.status === "Tugallandi");
  const pending = todayItems.filter((item) => isPendingStatus(item.status));
  const activeBarberIds = new Set(
    todayItems
      .filter((item) => item.status === "Jarayonda" || item.status === "Tasdiqlandi")
      .map((item) => item.barberId)
      .filter(Boolean),
  );
  const nearestPending = [...pending].sort((left, right) => left.time.localeCompare(right.time))[0];

  return [
    {
      title: "Jami navbatlar",
      value: todayItems.length,
      note: todayItems.length ? `Bugun ${todayItems.length} ta navbat bor` : "Bugun navbat yo'q",
      tone: "dark",
    },
    {
      title: "Ishdagi barberlar",
      value: activeBarberIds.size,
      note: `${barbers.length} barberdan ${activeBarberIds.size} tasi hozir band`,
      tone: "light",
    },
    {
      title: "Tugagan xizmatlar",
      value: completed.length,
      note: completed.length ? `Bugun ${completed.length} ta xizmat tugadi` : "Hali xizmat tugamagan",
      tone: "success",
    },
    {
      title: "Navbat kutayotganlar",
      value: pending.length,
      note: nearestPending ? `Eng yaqin navbat ${nearestPending.time} da` : "Kutilayotgan navbat yo'q",
      tone: "warning",
    },
  ];
}

export function buildBookingsByBarber(bookings: BookingItem[], barbers: BarberProfile[]): BarberBookingSummary[] {
  const todayIso = getLocalIsoDate();
  return barbers.map((barber) => {
    const barberItems = bookings.filter((item) => item.date === todayIso && item.barberId === barber.id);
    return {
      name: barber.name.split(" ")[0] ?? barber.name,
      completed: barberItems.filter((item) => item.status === "Tugallandi").length,
      pending: barberItems.filter((item) => isPendingStatus(item.status)).length,
    };
  });
}

export function buildPerformanceItems(bookings: BookingItem[], barbers: BarberProfile[]): PerformanceItem[] {
  const todayIso = getLocalIsoDate();
  return barbers.map((barber) => {
    const barberItems = bookings.filter((item) => item.date === todayIso && item.barberId === barber.id);
    const completed = barberItems.filter((item) => item.status === "Tugallandi").length;
    return {
      name: barber.name.split(" ")[0] ?? barber.name,
      initials: barber.initials,
      avatarColor: barber.avatarColor,
      completed,
      total: barberItems.length || 1,
    };
  });
}

export function buildRecentBookings(bookings: BookingItem[], limit = 6) {
  return [...bookings]
    .sort((left, right) => `${right.date}${right.time}`.localeCompare(`${left.date}${left.time}`))
    .slice(0, limit);
}
