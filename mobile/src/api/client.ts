import {
  ApiAuthUser,
  ApiAvailabilityBooking,
  ApiBarber,
  ApiBooking,
  ApiBookingStatus,
  ApiDiscount,
  ApiRole,
  ApiServiceOptions,
  ApiTelegramMeta,
  ApiTokenResponse,
  AuthSession,
  AuthUser,
  BarberFormPayload,
  BarberSettingsPayload,
  DiscountFormPayload,
  ProfileFormPayload,
} from "../types";

declare const process:
  | {
      env?: Record<string, string | undefined>;
    }
  | undefined;

const envBaseUrl = typeof process !== "undefined" ? process.env?.EXPO_PUBLIC_API_BASE_URL : undefined;
const PRODUCTION_API_BASE_URL = "https://barber-backend-i5kz.onrender.com/api/v1";
const LEGACY_API_HOST = "barber-backend.onrender.com";

function resolveApiBaseUrl() {
  const configuredUrl = envBaseUrl?.replace(/\/$/, "");
  if (configuredUrl && !configuredUrl.includes(LEGACY_API_HOST)) {
    return configuredUrl;
  }

  return PRODUCTION_API_BASE_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();

type RequestOptions = RequestInit & {
  token?: string;
};

type BookingQuery = {
  status?: ApiBookingStatus;
  barberId?: string;
  customerUserId?: string;
  dateFrom?: string;
  dateTo?: string;
};

function withQuery(path: string, query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

function mapUser(user: ApiAuthUser): AuthUser {
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

function mapSession(payload: ApiTokenResponse): AuthSession {
  return {
    accessToken: payload.access_token,
    user: mapUser(payload.user),
  };
}

function formatApiError(payload: unknown) {
  if (typeof payload === "string") {
    return payload;
  }
  if (Array.isArray(payload)) {
    return payload
      .map((item) => {
        if (!item || typeof item !== "object") {
          return String(item);
        }
        const issue = item as { loc?: Array<string | number>; msg?: string };
        const field = issue.loc?.[issue.loc.length - 1];
        return field ? `${field}: ${issue.msg ?? "xato"}` : issue.msg ?? "xato";
      })
      .join(", ");
  }
  if (payload && typeof payload === "object") {
    const message = (payload as { detail?: string; message?: string }).detail
      ?? (payload as { detail?: string; message?: string }).message;
    if (message) {
      return message;
    }
  }
  return "Sorovni bajarib bolmadi.";
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, body, ...rest } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    body,
    headers: {
      ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    try {
      const payload = await response.json();
      throw new Error(formatApiError(payload.detail ?? payload));
    } catch (error) {
      if (error instanceof Error && error.message !== "JSON Parse error: Unexpected end of input") {
        throw error;
      }
      throw new Error(await response.text());
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function login(role: ApiRole, usernameOrPhone: string, password: string) {
  const path = role === "customer" ? "/auth/customer/login" : `/auth/${role}/login`;
  const body = role === "customer"
    ? { phone: usernameOrPhone, password }
    : { username: usernameOrPhone, password };
  return request<ApiTokenResponse>(path, {
    method: "POST",
    body: JSON.stringify(body),
  }).then(mapSession);
}

export function registerCustomer(fullName: string, phone: string, password: string) {
  return request<ApiTokenResponse>("/auth/customer/register", {
    method: "POST",
    body: JSON.stringify({ full_name: fullName, phone, password }),
  }).then(mapSession);
}

export function getMe(token: string) {
  return request<ApiAuthUser>("/auth/me", { token }).then(mapUser);
}

export function updateMe(token: string, payload: ProfileFormPayload) {
  return request<ApiAuthUser>("/auth/me", {
    method: "PATCH",
    token,
    body: JSON.stringify({
      full_name: payload.fullName,
      username: payload.username || null,
      phone: payload.phone || null,
      password: payload.password || undefined,
      photo_url: payload.photoUrl || null,
    }),
  }).then(mapUser);
}

export function uploadMedia(token: string, file: Blob | { uri: string; name: string; type: string }) {
  const form = new FormData();
  form.append("file", file as Blob);
  return request<{ url: string; content_type: string; filename: string }>("/uploads/media", {
    method: "POST",
    token,
    body: form,
  });
}

export function getBarbers() {
  return request<ApiBarber[]>("/barbers");
}

export function getMyBarberProfile(token: string) {
  return request<ApiBarber>("/barbers/me", { token });
}

function toBarberPayload(payload: BarberFormPayload | BarberSettingsPayload) {
  return {
    full_name: payload.fullName,
    username: payload.username,
    password: "password" in payload ? payload.password || undefined : undefined,
    specialty: payload.specialty,
    photo_url: payload.photoUrl || null,
    media_url: payload.mediaUrl || null,
    rating: payload.rating,
    experience_years: payload.yearsExp,
    bio: payload.bio || null,
    work_start_time: payload.workStartTime,
    work_end_time: payload.workEndTime,
    address: payload.address || null,
    latitude: payload.latitude ?? null,
    longitude: payload.longitude ?? null,
    price_haircut: payload.priceHaircut,
    price_fade: payload.priceFade,
    price_hair_beard: payload.priceHairBeard,
    price_premium: payload.pricePremium,
    price_beard: payload.priceBeard,
  };
}

export function createBarber(token: string, payload: BarberFormPayload) {
  return request<ApiBarber>("/barbers", {
    method: "POST",
    token,
    body: JSON.stringify(toBarberPayload(payload)),
  });
}

export function updateBarber(token: string, barberId: string, payload: BarberFormPayload) {
  return request<ApiBarber>(`/barbers/${barberId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(toBarberPayload(payload)),
  });
}

export function updateMyBarberSettings(token: string, payload: BarberSettingsPayload) {
  return request<ApiBarber>("/barbers/me", {
    method: "PATCH",
    token,
    body: JSON.stringify(toBarberPayload(payload)),
  });
}

export function deleteBarber(token: string, barberId: string) {
  return request<void>(`/barbers/${barberId}`, {
    method: "DELETE",
    token,
  });
}

export function getBookings(token: string, query: BookingQuery = {}) {
  return request<ApiBooking[]>(
    withQuery("/bookings", {
      status: query.status,
      barber_id: query.barberId,
      customer_user_id: query.customerUserId,
      date_from: query.dateFrom,
      date_to: query.dateTo,
    }),
    { token },
  );
}

export function getAvailabilityBookings(dateFrom?: string, dateTo?: string) {
  return request<ApiAvailabilityBooking[]>(
    withQuery("/bookings/availability", {
      date_from: dateFrom,
      date_to: dateTo,
    }),
  );
}

export function getDiscounts(token: string) {
  return request<ApiDiscount[]>("/discounts", { token });
}

export function createDiscount(token: string, payload: DiscountFormPayload) {
  return request<ApiDiscount>("/discounts", {
    method: "POST",
    token,
    body: JSON.stringify({
      barber_id: payload.barberId ?? null,
      title: payload.title,
      description: payload.description || null,
      percent: payload.percent,
      starts_at: payload.startsAt,
      ends_at: payload.endsAt,
    }),
  });
}

export function deleteDiscount(token: string, discountId: string) {
  return request<void>(`/discounts/${discountId}`, {
    method: "DELETE",
    token,
  });
}

export function getServices() {
  return request<ApiServiceOptions>("/meta/services");
}

export function getTelegramMeta() {
  return request<ApiTelegramMeta>("/meta/telegram");
}

export function createRealtimeSocket(role: ApiRole, subjectId: string) {
  const url = new URL(API_BASE_URL);
  const wsOrigin = url.origin.replace(/^http/, "ws");
  const apiPath = url.pathname.replace(/\/$/, "");
  return new WebSocket(`${wsOrigin}${apiPath}/realtime/ws/${role}/${subjectId}`);
}

export function createBooking(
  token: string,
  payload: {
    barberId: string;
    customerName: string;
    customerPhone: string;
    serviceName: string;
    scheduledFor: string;
    note?: string;
  },
) {
  return request<ApiBooking>("/bookings", {
    method: "POST",
    token,
    body: JSON.stringify({
      barber_id: payload.barberId,
      customer_name: payload.customerName,
      customer_phone: payload.customerPhone,
      service_name: payload.serviceName,
      scheduled_for: payload.scheduledFor,
      note: payload.note || null,
    }),
  });
}

export function updateBookingStatus(
  token: string,
  bookingId: string,
  status: ApiBookingStatus,
  rejectionReason?: string,
) {
  return request<ApiBooking>(`/bookings/${bookingId}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({
      status,
      rejection_reason: rejectionReason || null,
    }),
  });
}

export function deleteBooking(token: string, bookingId: string) {
  return request<void>(`/bookings/${bookingId}`, {
    method: "DELETE",
    token,
  });
}
