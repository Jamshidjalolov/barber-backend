export type ApiRole = "customer" | "barber" | "admin";
export type ApiBookingStatus = "pending" | "accepted" | "in_service" | "completed" | "rejected";

export type AuthUser = {
  id: string;
  role: ApiRole;
  fullName: string;
  username?: string | null;
  phone?: string | null;
  barberProfileId?: string | null;
};

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

export type ApiAuthUser = {
  id: string;
  role: ApiRole;
  full_name: string;
  username?: string | null;
  phone?: string | null;
  barber_profile_id?: string | null;
};

export type ApiTokenResponse = {
  access_token: string;
  user: ApiAuthUser;
};

export type ApiBarber = {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  specialty: string;
  experience_years: number;
  rating: number;
  bio?: string | null;
  photo_url?: string | null;
  work_start_time: string;
  work_end_time: string;
  address?: string | null;
  price_haircut: number;
  price_fade: number;
  price_hair_beard: number;
  price_premium: number;
  price_beard: number;
  total_bookings: number;
  today_bookings: number;
};

export type ApiBooking = {
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
  original_price: number;
  final_price: number;
  applied_discount_percent?: number | null;
  created_at: string;
  updated_at: string;
};

export type ApiDiscount = {
  id: string;
  barber_id: string;
  barber_user_id: string;
  barber_name: string;
  title: string;
  description?: string | null;
  percent: number;
  starts_at: string;
  ends_at: string;
};

export type ApiServiceOptions = {
  items: string[];
};
