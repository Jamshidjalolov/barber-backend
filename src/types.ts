export type PageKey = "dashboard" | "barberlar" | "navbatlar" | "skidkalar";
export type AppMode = "auth" | "customer" | "admin" | "barber";
export type AuthScreen =
  | "customer-login"
  | "customer-register"
  | "barber-login"
  | "barber-register"
  | "admin-login";

export type ApiRole = "customer" | "barber" | "admin";
export type ApiBookingStatus =
  | "pending"
  | "accepted"
  | "in_service"
  | "completed"
  | "rejected";

export interface AuthUser {
  id: string;
  role: ApiRole;
  fullName: string;
  username?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
  telegramChatId?: string | null;
  telegramConnected?: boolean;
  barberProfileId?: string | null;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  role: string;
}

export interface AdminAccount extends AdminUser {
  password?: string;
}

export interface CustomerAccount {
  id: string;
  name: string;
  phone: string;
  photoUrl?: string | null;
  telegramChatId?: string | null;
  telegramConnected?: boolean;
  password?: string;
}

export interface CustomerProfile {
  name: string;
  phone: string;
  service: string;
  note: string;
}

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export type AvailabilityStatus = "bo'sh" | "band" | "ishlayapti" | "tugagan" | "yopildi";

export interface StatMetric {
  title: string;
  value: number;
  note: string;
  tone: "dark" | "light" | "success" | "warning";
}

export interface BarberBookingSummary {
  name: string;
  completed: number;
  pending: number;
}

export interface PerformanceItem {
  name: string;
  initials: string;
  avatarColor: string;
  completed: number;
  total: number;
}

export type BookingStatus =
  | "Tasdiqlandi"
  | "Kutilmoqda"
  | "Jarayonda"
  | "Tugallandi"
  | "Rad etildi";

export interface BookingItem {
  id: string;
  customer: string;
  customerId?: string;
  phone: string;
  service: string;
  barber: string;
  barberId?: string;
  barberUserId?: string;
  date: string;
  time: string;
  status: BookingStatus;
  payment: string;
  note?: string;
  originalPrice?: number;
  finalPrice?: number;
  appliedDiscountPercent?: number;
  rejectionReason?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface DiscountItem {
  id: string;
  barberId: string;
  barberUserId: string;
  barberName: string;
  title: string;
  description?: string;
  percent: number;
  startsAt: string;
  endsAt: string;
  date: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface BarberProfile {
  id: string;
  userId?: string;
  name: string;
  initials: string;
  avatarColor: string;
  photoUrl?: string;
  mediaUrl?: string;
  specialty: string;
  experience: string;
  username: string;
  password?: string;
  handle: string;
  totalBookings: number;
  todayBookings: number;
  rating: number;
  bio?: string;
  workStartTime: string;
  workEndTime: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  priceHaircut: number;
  priceFade: number;
  priceHairBeard: number;
  pricePremium: number;
  priceBeard: number;
  telegramChatId?: string;
  telegramConnected?: boolean;
}

export interface ApiAuthUser {
  id: string;
  role: ApiRole;
  full_name: string;
  username?: string | null;
  phone?: string | null;
  photo_url?: string | null;
  telegram_chat_id?: string | null;
  telegram_connected?: boolean;
  barber_profile_id?: string | null;
}

export interface ApiTokenResponse {
  access_token: string;
  token_type: string;
  user: ApiAuthUser;
}

export interface ApiBarber {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  specialty: string;
  experience_years: number;
  rating: number;
  bio?: string | null;
  photo_url?: string | null;
  media_url?: string | null;
  telegram_chat_id?: string | null;
  work_start_time: string;
  work_end_time: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  price_haircut: number;
  price_fade: number;
  price_hair_beard: number;
  price_premium: number;
  price_beard: number;
  total_bookings: number;
  today_bookings: number;
}

export interface ApiBooking {
  id: string;
  customer_user_id?: string | null;
  barber_id: string;
  barber_name: string;
  barber_user_id: string;
  customer_name: string;
  customer_phone: string;
  service_name: string;
  note?: string | null;
  status: ApiBookingStatus;
  rejection_reason?: string | null;
  scheduled_for: string;
  accepted_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  rejected_at?: string | null;
  original_price: number;
  final_price: number;
  applied_discount_percent?: number | null;
  created_at: string;
  updated_at: string;
}

export interface ApiDiscount {
  id: string;
  barber_id: string;
  barber_user_id: string;
  barber_name: string;
  title: string;
  description?: string | null;
  percent: number;
  starts_at: string;
  ends_at: string;
  created_at: string;
  updated_at: string;
}

export interface ApiAvailabilityBooking {
  id: string;
  barber_id: string;
  status: ApiBookingStatus;
  scheduled_for: string;
}

export interface ApiServiceOptions {
  items: string[];
}

export interface ApiTelegramMeta {
  enabled: boolean;
  bot_username?: string | null;
  reminder_minutes_before: number;
}

export interface BarberFormPayload {
  fullName: string;
  specialty: string;
  photoUrl?: string;
  mediaUrl?: string;
  rating: number;
  yearsExp: number;
  username: string;
  password?: string;
  bio?: string;
  workStartTime?: string;
  workEndTime?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  priceHaircut?: number;
  priceFade?: number;
  priceHairBeard?: number;
  pricePremium?: number;
  priceBeard?: number;
}

export interface DiscountFormPayload {
  barberId?: string;
  title: string;
  description?: string;
  percent: number;
  startsAt: string;
  endsAt: string;
}

export interface BarberSettingsPayload {
  fullName?: string;
  username?: string;
  specialty?: string;
  photoUrl?: string;
  mediaUrl?: string;
  rating?: number;
  yearsExp?: number;
  bio?: string;
  workStartTime: string;
  workEndTime: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  priceHaircut: number;
  priceFade: number;
  priceHairBeard: number;
  pricePremium: number;
  priceBeard: number;
}
