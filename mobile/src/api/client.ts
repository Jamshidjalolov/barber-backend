import {
  NativeModules,
  Platform,
} from "react-native";
import {
  ApiAuthUser,
  ApiBarber,
  ApiBooking,
  ApiBookingStatus,
  ApiDiscount,
  ApiRole,
  ApiServiceOptions,
  ApiTokenResponse,
  AuthSession,
  AuthUser,
} from "../types";

declare const process:
  | {
      env?: Record<string, string | undefined>;
    }
  | undefined;

const envBaseUrl = typeof process !== "undefined" ? process.env?.EXPO_PUBLIC_API_BASE_URL : undefined;
const LOCAL_API_PORT = "8001";
const LOCAL_API_PATH = "/api/v1";

function getExpoDevServerHost() {
  const scriptURL = (NativeModules.SourceCode as { scriptURL?: string } | undefined)?.scriptURL;
  if (!scriptURL) {
    return null;
  }

  try {
    return new URL(scriptURL).hostname;
  } catch {
    return scriptURL.match(/^[a-z]+:\/\/([^/:]+)/i)?.[1] ?? null;
  }
}

function resolveApiBaseUrl() {
  if (envBaseUrl) {
    return envBaseUrl.replace(/\/$/, "");
  }

  const devServerHost = getExpoDevServerHost();
  if (devServerHost && devServerHost !== "localhost" && devServerHost !== "127.0.0.1") {
    return `http://${devServerHost}:${LOCAL_API_PORT}${LOCAL_API_PATH}`;
  }

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${LOCAL_API_PORT}${LOCAL_API_PATH}`;
  }

  return `http://localhost:${LOCAL_API_PORT}${LOCAL_API_PATH}`;
}

export const API_BASE_URL = resolveApiBaseUrl();

type RequestOptions = RequestInit & {
  token?: string;
};

function mapUser(user: ApiAuthUser): AuthUser {
  return {
    id: user.id,
    role: user.role,
    fullName: user.full_name,
    username: user.username,
    phone: user.phone,
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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    body,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
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

export function registerBarber(payload: {
  fullName: string;
  specialty: string;
  username: string;
  password: string;
}) {
  return request<ApiTokenResponse>("/auth/barber/register", {
    method: "POST",
    body: JSON.stringify({
      full_name: payload.fullName,
      specialty: payload.specialty,
      username: payload.username,
      password: payload.password,
      rating: 4.8,
      experience_years: 1,
      photo_url: null,
      bio: null,
    }),
  }).then(mapSession);
}

export function getBarbers() {
  return request<ApiBarber[]>("/barbers");
}

export function getBookings(token: string) {
  return request<ApiBooking[]>("/bookings", { token });
}

export function getDiscounts(token: string) {
  return request<ApiDiscount[]>("/discounts", { token });
}

export function getServices() {
  return request<ApiServiceOptions>("/meta/services");
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
