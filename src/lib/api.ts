import {
  ApiBarber,
  ApiBooking,
  ApiBookingStatus,
  ApiDiscount,
  ApiServiceOptions,
  ApiTelegramMeta,
  ApiTokenResponse,
  ApiAuthUser,
  ApiAvailabilityBooking,
  BarberFormPayload,
  BarberSettingsPayload,
  DiscountFormPayload,
} from "../types";
import { getSafeImageUrl } from "./media";

const LOCAL_API_URL_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/;
const LOCAL_API_BASE_URL = "http://127.0.0.1:8001/api/v1";
const PRODUCTION_API_BASE_URL = "https://barber-backend.onrender.com/api/v1";

function resolveApiBaseUrl() {
  const configuredUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "");
  if (!configuredUrl) {
    return import.meta.env.DEV ? LOCAL_API_BASE_URL : PRODUCTION_API_BASE_URL;
  }
  if (import.meta.env.PROD && LOCAL_API_URL_PATTERN.test(configuredUrl)) {
    return PRODUCTION_API_BASE_URL;
  }
  return configuredUrl;
}

export const API_BASE_URL = resolveApiBaseUrl();
const API_REQUEST_TIMEOUT_MS = 8_000;

interface RequestOptions extends RequestInit {
  token?: string;
}

function formatApiDetail(detail: unknown) {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
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

  if (detail && typeof detail === "object") {
    const maybeMessage = (detail as { message?: string; detail?: string }).message
      ?? (detail as { message?: string; detail?: string }).detail;
    if (maybeMessage) {
      return maybeMessage;
    }
  }

  return "So'rovni bajarib bo'lmadi.";
}

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, signal, ...rest } = options;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS);
  const abortRequest = () => controller.abort();
  signal?.addEventListener("abort", abortRequest, { once: true });

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Backend javob bermayapti. Lokal backend ishlab turganini tekshiring.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
    signal?.removeEventListener("abort", abortRequest);
  }

  if (!response.ok) {
    let message = "So'rovni bajarib bo'lmadi.";
    try {
      const payload = await response.json();
      message = formatApiDetail(payload.detail ?? payload);
    } catch {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function loginCustomer(phone: string, password: string) {
  return apiRequest<ApiTokenResponse>("/auth/customer/login", {
    method: "POST",
    body: JSON.stringify({ phone, password }),
  });
}

export function registerCustomer(fullName: string, phone: string, password: string) {
  return apiRequest<ApiTokenResponse>("/auth/customer/register", {
    method: "POST",
    body: JSON.stringify({
      full_name: fullName,
      phone,
      password,
    }),
  });
}

export function loginBarber(username: string, password: string) {
  return apiRequest<ApiTokenResponse>("/auth/barber/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function registerBarber(payload: BarberFormPayload) {
  return apiRequest<ApiTokenResponse>("/auth/barber/register", {
    method: "POST",
    body: JSON.stringify({
      full_name: payload.fullName,
      specialty: payload.specialty,
      photo_url: getSafeImageUrl(payload.photoUrl) ?? null,
      rating: payload.rating,
      experience_years: payload.yearsExp,
      username: payload.username,
      password: payload.password,
      bio: payload.bio || null,
    }),
  });
}

export function loginAdmin(username: string, password: string) {
  return apiRequest<ApiTokenResponse>("/auth/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function getMe(token: string) {
  return apiRequest<ApiAuthUser>("/auth/me", { token });
}

export function getBarbers(token?: string) {
  return apiRequest<ApiBarber[]>("/barbers", { token });
}

export function getMyBarberProfile(token: string) {
  return apiRequest<ApiBarber>("/barbers/me", { token });
}

export function createBarber(token: string, payload: BarberFormPayload) {
  return apiRequest<ApiBarber>("/barbers", {
    method: "POST",
    token,
    body: JSON.stringify({
      full_name: payload.fullName,
      specialty: payload.specialty,
      photo_url: getSafeImageUrl(payload.photoUrl) ?? null,
      rating: payload.rating,
      experience_years: payload.yearsExp,
      username: payload.username,
      password: payload.password,
      bio: payload.bio || null,
    }),
  });
}

export function updateBarber(token: string, barberId: string, payload: BarberFormPayload) {
  return apiRequest<ApiBarber>(`/barbers/${barberId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify({
      full_name: payload.fullName,
      specialty: payload.specialty,
      photo_url: getSafeImageUrl(payload.photoUrl) ?? null,
      rating: payload.rating,
      experience_years: payload.yearsExp,
      username: payload.username,
      password: payload.password || undefined,
      bio: payload.bio || null,
    }),
  });
}

export function updateMyBarberSettings(token: string, payload: BarberSettingsPayload) {
  return apiRequest<ApiBarber>("/barbers/me", {
    method: "PATCH",
    token,
    body: JSON.stringify({
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
    }),
  });
}

export function deleteBarber(token: string, barberId: string) {
  return apiRequest<void>(`/barbers/${barberId}`, {
    method: "DELETE",
    token,
  });
}

export function getServiceOptions() {
  return apiRequest<ApiServiceOptions>("/meta/services");
}

export function getTelegramMeta() {
  return apiRequest<ApiTelegramMeta>("/meta/telegram");
}

export function getDiscounts(token: string) {
  return apiRequest<ApiDiscount[]>("/discounts", { token });
}

export function createDiscount(token: string, payload: DiscountFormPayload) {
  return apiRequest<ApiDiscount>("/discounts", {
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
  return apiRequest<void>(`/discounts/${discountId}`, {
    method: "DELETE",
    token,
  });
}

export function getBookings(token: string) {
  return apiRequest<ApiBooking[]>("/bookings", { token });
}

export function getAvailabilityBookings() {
  return apiRequest<ApiAvailabilityBooking[]>("/bookings/availability");
}

export function createBooking(
  token: string,
  payload: {
    barberId: string;
    customerName: string;
    customerPhone: string;
    serviceName: string;
    note?: string;
    scheduledFor: string;
  },
) {
  return apiRequest<ApiBooking>("/bookings", {
    method: "POST",
    token,
    body: JSON.stringify({
      barber_id: payload.barberId,
      customer_name: payload.customerName,
      customer_phone: payload.customerPhone,
      service_name: payload.serviceName,
      note: payload.note || null,
      scheduled_for: payload.scheduledFor,
    }),
  });
}

export function updateBookingStatus(
  token: string,
  bookingId: string,
  status: ApiBookingStatus,
  rejectionReason?: string,
) {
  return apiRequest<ApiBooking>(`/bookings/${bookingId}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({
      status,
      rejection_reason: rejectionReason || null,
    }),
  });
}

export function deleteBooking(token: string, bookingId: string) {
  return apiRequest<void>(`/bookings/${bookingId}`, {
    method: "DELETE",
    token,
  });
}

export function getBookingTracking(bookingId: string) {
  return apiRequest<ApiBooking>(`/bookings/${bookingId}/tracking`);
}
