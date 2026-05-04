import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  createBarber,
  createBooking,
  createDiscount,
  createRealtimeSocket,
  deleteBarber,
  deleteBooking,
  deleteDiscount,
  getAvailabilityBookings,
  getBarbers,
  getBookings,
  getDiscounts,
  getMe,
  getMyBarberProfile,
  getServices,
  getTelegramMeta,
  login,
  registerCustomer,
  uploadMedia,
  updateMe,
  updateBarber,
  updateBookingStatus,
  updateMyBarberSettings,
} from "./src/api/client";
import { Card, Field, LoadingCard, Pill, PrimaryButton, SectionTitle, Stat } from "./src/components/ui";
import { colors, shadows } from "./src/theme/colors";
import {
  ApiAvailabilityBooking,
  ApiBarber,
  ApiBooking,
  ApiBookingStatus,
  ApiDiscount,
  ApiRole,
  AuthSession,
  AuthUser,
  BarberFormPayload,
  DiscountFormPayload,
  ProfileFormPayload,
} from "./src/types";
import { buildIsoFromLocal, buildTimeSlots, formatDateLabel, formatTime, getLocalDateInput } from "./src/utils/date";

type AuthMode = "login" | "register";
type TabKey = "home" | "book" | "barbers" | "bookings" | "discounts" | "profile";
type BookingSuccess = {
  barberName: string;
  serviceName: string;
  scheduledFor: string;
  salon: string;
  price: number;
};
type NotificationItem = {
  id: string;
  title: string;
  body: string;
  tone: string;
  tab: TabKey;
  smsPhone?: string;
  smsBody?: string;
};

const roleLabels: Record<ApiRole, string> = {
  customer: "Mijoz",
  barber: "Barber",
  admin: "Admin",
};

const defaultServices = ["Soch olish", "Fade", "Soch + soqol", "Premium"];
const HERO_IMAGE_URL = "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=900&q=80";
const SALON_IMAGE_URL = "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=600&q=80";

const serviceIcons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  "Soch olish": "content-cut",
  "Fade qirqim": "razor-double-edge",
  Fade: "razor-double-edge",
  "Soch + soqol": "face-man-shimmer",
  "Premium paket": "crown-outline",
  Premium: "crown-outline",
  "Soqol dizayni": "face-man",
  Styling: "hair-dryer-outline",
};

function getTabs(role: ApiRole): Array<{ key: TabKey; label: string }> {
  if (role === "customer") {
    return [
      { key: "home", label: "Bosh" },
      { key: "book", label: "Bron" },
      { key: "bookings", label: "Navbat" },
      { key: "discounts", label: "Skidka" },
      { key: "profile", label: "Profil" },
    ];
  }
  if (role === "barber") {
    return [
      { key: "home", label: "Bosh" },
      { key: "bookings", label: "Navbat" },
      { key: "discounts", label: "Skidka" },
      { key: "profile", label: "Profil" },
    ];
  }
  return [
    { key: "home", label: "Bosh" },
    { key: "barbers", label: "Barber" },
    { key: "bookings", label: "Navbat" },
    { key: "discounts", label: "Skidka" },
    { key: "profile", label: "Admin" },
  ];
}

function statusLabel(status: ApiBookingStatus) {
  if (status === "accepted") return "Tasdiqlandi";
  if (status === "in_service") return "Jarayonda";
  if (status === "completed") return "Tugallandi";
  if (status === "rejected") return "Rad etildi";
  return "Kutilmoqda";
}

function statusTone(status: ApiBookingStatus) {
  if (status === "completed") return colors.green;
  if (status === "rejected") return colors.red;
  if (status === "in_service") return colors.blue;
  if (status === "accepted") return colors.goldDark;
  return colors.muted;
}

function roleAccent(role: ApiRole) {
  if (role === "barber") return colors.green;
  if (role === "admin") return colors.purple;
  return colors.gold;
}

function topTitleForRole(role: ApiRole) {
  if (role === "barber") return "Mening ish joyim";
  if (role === "admin") return "Boshqaruv paneli";
  return "BARBERSHOP";
}

function iconForTab(tab: TabKey): keyof typeof Ionicons.glyphMap {
  if (tab === "home") return "home";
  if (tab === "book") return "calendar";
  if (tab === "barbers") return "people";
  if (tab === "bookings") return "reader";
  if (tab === "discounts") return "pricetag";
  return "person";
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "BB";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function nextStatus(status: ApiBookingStatus): { status: ApiBookingStatus; label: string } | null {
  if (status === "pending") return { status: "accepted", label: "Qabul qilish" };
  if (status === "accepted" || status === "in_service") return { status: "completed", label: "Tugatish" };
  return null;
}

function priceForService(barber: ApiBarber, service: string) {
  const lowered = service.toLowerCase();
  if (lowered.includes("fade")) return barber.price_fade;
  if (lowered.includes("premium")) return barber.price_premium;
  if ((lowered.includes("soch") && lowered.includes("soqol")) || lowered.includes("combo") || lowered.includes("hair beard")) {
    return barber.price_hair_beard;
  }
  if (lowered.includes("soqol") || lowered.includes("beard")) return barber.price_beard;
  return barber.price_haircut;
}

function defaultBarberForm(): BarberFormPayload {
  return {
    fullName: "",
    username: "",
    password: "",
    specialty: "Fade master",
    photoUrl: "",
    mediaUrl: "",
    rating: 4.8,
    yearsExp: 1,
    bio: "",
    workStartTime: "09:00",
    workEndTime: "18:30",
    address: "",
    latitude: null,
    longitude: null,
    priceHaircut: 70000,
    priceFade: 90000,
    priceHairBeard: 120000,
    pricePremium: 180000,
    priceBeard: 50000,
  };
}

function formFromBarber(barber: ApiBarber): BarberFormPayload {
  return {
    fullName: barber.full_name,
    username: barber.username,
    password: "",
    specialty: barber.specialty,
    photoUrl: barber.photo_url ?? "",
    mediaUrl: barber.media_url ?? "",
    rating: barber.rating,
    yearsExp: barber.experience_years,
    bio: barber.bio ?? "",
    workStartTime: barber.work_start_time,
    workEndTime: barber.work_end_time,
    address: barber.address ?? "",
    latitude: barber.latitude ?? null,
    longitude: barber.longitude ?? null,
    priceHaircut: barber.price_haircut,
    priceFade: barber.price_fade,
    priceHairBeard: barber.price_hair_beard,
    pricePremium: barber.price_premium,
    priceBeard: barber.price_beard,
  };
}

function defaultDiscountForm(): DiscountFormPayload {
  const today = getLocalDateInput();
  return {
    barberId: null,
    title: "Bugungi chegirma",
    description: "",
    percent: 15,
    startsAt: buildIsoFromLocal(today, "09:00") ?? new Date().toISOString(),
    endsAt: buildIsoFromLocal(today, "18:00") ?? new Date().toISOString(),
  };
}

function profileFormFromUser(user: AuthUser): ProfileFormPayload {
  return {
    fullName: user.fullName,
    username: user.username ?? "",
    phone: user.phone ?? "",
    password: "",
    photoUrl: user.photoUrl ?? "",
  };
}

function toNumber(value: string, fallback = 0) {
  const parsed = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sameLocalDay(iso: string, dateInput: string) {
  return getLocalDateInput(new Date(iso)) === dateInput;
}

function isPastLocalSlot(dateInput: string, time: string) {
  const value = new Date(`${dateInput}T${time}:00`);
  return Number.isNaN(value.getTime()) || value.getTime() <= Date.now();
}

function isVideoUrl(url?: string | null) {
  if (!url) return false;
  return /\.(mp4|mov|webm|m3u8)(\?.*)?$/i.test(url) || /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
}

async function openSms(phone: string, body: string) {
  const separator = Platform.OS === "ios" ? "&" : "?";
  const url = `sms:${phone}${separator}body=${encodeURIComponent(body)}`;
  const supported = await Linking.canOpenURL(url);
  if (!supported) {
    Alert.alert("SMS ochilmadi", "Bu qurilmada SMS ilovasi topilmadi.");
    return;
  }
  await Linking.openURL(url);
}

function buildTelegramLink(botUsername: string, role: ApiRole, subjectId: string) {
  return `https://t.me/${botUsername.replace("@", "")}?start=link_${role}_${subjectId}`;
}

function buildTelegramQrUrl(link: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=${encodeURIComponent(link)}`;
}

function AppModal({
  visible,
  title,
  subtitle,
  children,
  onClose,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.rowBetween}>
            <View style={styles.grow}>
              <Text style={styles.modalTitle}>{title}</Text>
              {subtitle ? <Text style={styles.modalSubtitle}>{subtitle}</Text> : null}
            </View>
            <Pressable onPress={onClose} style={({ pressed }) => [styles.modalClose, pressed && styles.pressed]}>
              <Ionicons name="close" size={20} color={colors.text} />
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

function TelegramConnectCard({
  botUsername,
  role,
  user,
  reminderMinutes,
}: {
  botUsername: string | null;
  role: ApiRole;
  user: AuthUser;
  reminderMinutes: number;
}) {
  if (!botUsername) return null;
  const linked = Boolean(user.telegramConnected);
  const link = buildTelegramLink(botUsername, role, user.id);

  return (
    <Card style={[styles.telegramCard, linked && styles.telegramCardLinked]}>
      <View style={styles.row}>
        <View style={[styles.telegramIcon, linked && styles.telegramIconLinked]}>
          <Ionicons name={linked ? "checkmark" : "paper-plane-outline"} size={22} color={linked ? "#07110d" : "#fff"} />
        </View>
        <View style={styles.grow}>
          <Text style={styles.cardTitle}>{linked ? "Telegram ulangan" : "Telegram ulash"}</Text>
          <Text style={styles.muted}>
            {linked
              ? user.telegramChatId ? `Chat ID: ${user.telegramChatId}` : "Bron va eslatmalar botga boradi."
              : `Bron holati va ${reminderMinutes} daqiqa oldingi eslatma Telegramga keladi.`}
          </Text>
        </View>
      </View>
      <View style={styles.telegramQrPanel}>
        <Image source={{ uri: buildTelegramQrUrl(link) }} style={styles.telegramQrImage} />
        <View style={styles.grow}>
          <Text style={styles.telegramQrTitle}>QR orqali tez ulash</Text>
          <Text style={styles.telegramQrText}>
            Kameradan skaner qiling yoki pastdagi tugma orqali botga o'ting. Bot ichida bron, status va eslatmalar ishlaydi.
          </Text>
        </View>
      </View>
      <PrimaryButton
        label={linked ? "Botni ochish" : "Telegram botni ulash"}
        tone={linked ? "ghost" : "gold"}
        onPress={() => Linking.openURL(link)}
      />
    </Card>
  );
}

async function sendBookingSms(booking: ApiBooking) {
  await openSms(
    booking.customer_phone,
    `Salom, ${booking.customer_name}. ${booking.service_name} broningiz ${formatDateLabel(booking.scheduled_for)} ${formatTime(booking.scheduled_for)} ga belgilangan.`,
  );
}

function AuthScreen({ onAuthenticated }: { onAuthenticated: (session: AuthSession) => void }) {
  const [role, setRole] = useState<ApiRole>("customer");
  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const canRegister = role === "customer";
  const identityLabel = role === "customer" ? "Telefon raqam" : "Username";
  const accent = roleAccent(role);
  const roleName = role === "customer" ? "BARBERSHOP" : role.toUpperCase();

  async function submit() {
    setError("");
    setLoading(true);
    try {
      if (mode === "register" && role === "customer") {
        onAuthenticated(await registerCustomer(fullName, identity, password));
      } else {
        onAuthenticated(await login(role, identity, password));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kirishda xato yuz berdi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.paper} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.authRoleTabs}>
            {(["customer", "barber", "admin"] as ApiRole[]).map((item) => (
              <Pressable
                key={item}
                onPress={() => {
                  setRole(item);
                  setMode("login");
                  setError("");
                }}
                style={({ pressed }) => [
                  styles.authRolePill,
                  role === item && { borderColor: roleAccent(item), backgroundColor: `${roleAccent(item)}18` },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.authRoleText, role === item && { color: roleAccent(item) }]}>{roleLabels[item]}</Text>
              </Pressable>
            ))}
          </View>

          {role === "customer" && mode === "login" ? (
            <ImageBackground source={{ uri: HERO_IMAGE_URL }} imageStyle={styles.authHeroImage} style={styles.authHero}>
              <View style={styles.heroScrim} />
              <View style={styles.authHeroLogo}>
                <MaterialCommunityIcons name="content-cut" size={24} color={colors.goldDark} />
                <Text style={styles.authHeroBrand}>BARBERSHOP</Text>
                <Text style={styles.authHeroSub}>CLASSIC & MODERN</Text>
              </View>
              <View style={styles.authHeroCopyWrap}>
                <Text style={styles.authHeroTitle}>Stay Sharp,{`\n`}Look Sharp.</Text>
                <Text style={styles.authHeroCopy}>Professional soch turmaklash xizmatlari bir joyda</Text>
              </View>
              <View style={styles.authHeroActions}>
                <PrimaryButton label="Kirish" onPress={() => setMode("login")} tone="gold" />
                <PrimaryButton label="Ro'yxatdan o'tish" onPress={() => setMode("register")} tone="ghost" />
              </View>
            </ImageBackground>
          ) : (
            <View style={styles.authBrand}>
              <View style={[styles.logoMark, { borderColor: accent }]}>
                <MaterialCommunityIcons name={role === "customer" ? "content-cut" : role === "barber" ? "razor-double-edge" : "shield-crown-outline"} size={34} color={accent} />
              </View>
              <Text style={[styles.appName, { color: accent }]}>{roleName}</Text>
              <Text style={styles.appSub}>{mode === "register" ? "Ro'yxatdan o'tish" : "Kirish"}</Text>
            </View>
          )}

          <View style={[styles.authCard, { borderColor: `${accent}33` }]}>
            <Text style={styles.authTitle}>{mode === "register" ? "Ro'yxatdan o'tish" : "Kirish"}</Text>
            {canRegister ? (
              <View style={styles.segment}>
                {(["login", "register"] as AuthMode[]).map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => setMode(item)}
                    style={[styles.segmentItem, mode === item && [styles.segmentItemActive, { backgroundColor: accent }]]}
                  >
                    <Text style={[styles.segmentText, mode === item && styles.segmentTextActive]}>
                      {item === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {mode === "register" ? (
              <View style={styles.authField}>
                <Ionicons name="person-outline" size={18} color={colors.muted} />
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Ism"
                  placeholderTextColor="rgba(203,213,225,0.52)"
                  style={styles.authInput}
                  autoCapitalize="words"
                />
              </View>
            ) : null}
            <View style={styles.authField}>
              <Ionicons name={role === "customer" ? "call-outline" : "person-circle-outline"} size={18} color={colors.muted} />
              <TextInput
                value={identity}
                onChangeText={setIdentity}
                placeholder={identityLabel}
                placeholderTextColor="rgba(203,213,225,0.52)"
                style={styles.authInput}
                keyboardType={role === "customer" ? "phone-pad" : "default"}
                autoCapitalize="none"
              />
            </View>
            <View style={styles.authField}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.muted} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Parol"
                placeholderTextColor="rgba(203,213,225,0.52)"
                style={styles.authInput}
                secureTextEntry={!passwordVisible}
              />
              <Pressable onPress={() => setPasswordVisible((value) => !value)} hitSlop={10}>
                <Ionicons name={passwordVisible ? "eye-off-outline" : "eye-outline"} size={18} color={colors.muted} />
              </Pressable>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <PrimaryButton
              label={mode === "register" ? "Hisob yaratish" : "Kirish"}
              onPress={submit}
              loading={loading}
              disabled={!identity || !password || (mode === "register" && !fullName)}
            />

            <View style={styles.authDivider}>
              <View style={styles.authDividerLine} />
              <Text style={styles.authDividerText}>yoki</Text>
              <View style={styles.authDividerLine} />
            </View>

            <View style={styles.socialRow}>
              {(["logo-google", "logo-apple", "call"] as Array<keyof typeof Ionicons.glyphMap>).map((icon) => (
                <Pressable key={icon} style={({ pressed }) => [styles.socialButton, pressed && styles.pressed]}>
                  <Ionicons name={icon} size={22} color={colors.text} />
                </Pressable>
              ))}
            </View>

            {canRegister ? (
              <Pressable
                onPress={() => setMode(mode === "login" ? "register" : "login")}
                style={styles.authSwitch}
              >
                <Text style={styles.authSwitchText}>
                  {mode === "login" ? "Hisobingiz yo'qmi? " : "Hisobingiz bormi? "}
                  <Text style={{ color: accent }}>{mode === "login" ? "Ro'yxatdan o'tish" : "Kirish"}</Text>
                </Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function BarberAvatar({ barber, size = 56 }: { barber: ApiBarber; size?: number }) {
  if (barber.photo_url) {
    return <Image source={{ uri: barber.photo_url }} style={[styles.avatarImage, { width: size, height: size }]} />;
  }
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: Math.round(size * 0.32) }]}>
      <Text style={styles.avatarText}>{initials(barber.full_name)}</Text>
    </View>
  );
}

function BarberMediaPreview({ barber }: { barber: ApiBarber }) {
  const mediaUrl = barber.media_url || barber.photo_url;
  if (!mediaUrl) return null;

  if (isVideoUrl(mediaUrl)) {
    return (
      <Pressable
        onPress={() => Linking.openURL(mediaUrl)}
        style={({ pressed }) => [styles.mediaPreview, styles.videoPreview, pressed && styles.pressed]}
      >
        <View style={styles.videoPlay}>
          <Ionicons name="play" size={24} color="#090b0d" />
        </View>
        <View style={styles.grow}>
          <Text style={styles.mediaTitle}>Barber videosi</Text>
          <Text style={styles.mediaSubtitle} numberOfLines={1}>{mediaUrl}</Text>
        </View>
      </Pressable>
    );
  }

  return <Image source={{ uri: mediaUrl }} style={styles.mediaImage} />;
}

function HeaderIcon({
  name,
  onPress,
  badgeCount = 0,
}: {
  name: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  badgeCount?: number;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.headerIcon, pressed && styles.pressed]}>
      <Ionicons name={name} size={22} color={colors.text} />
      {badgeCount > 0 ? (
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{badgeCount > 9 ? "9+" : badgeCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function SectionHeaderRow({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.panelSectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

function ServiceTile({
  service,
  barber,
  selected,
  onPress,
}: {
  service: string;
  barber?: ApiBarber;
  selected?: boolean;
  onPress?: () => void;
}) {
  const icon = serviceIcons[service] ?? "content-cut";
  const price = barber ? priceForService(barber, service) : 0;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.serviceTile, selected && styles.serviceTileActive, pressed && styles.pressed]}>
      <MaterialCommunityIcons name={icon} size={24} color={selected ? colors.goldDark : colors.gold} />
      <Text style={styles.serviceTitle} numberOfLines={1}>{service.replace(" qirqim", "")}</Text>
      <Text style={styles.servicePrice}>{price ? `${price.toLocaleString()} so'm` : "Narx bor"}</Text>
    </Pressable>
  );
}

function MiniBookingRow({
  booking,
  role,
}: {
  booking: ApiBooking;
  role: ApiRole;
}) {
  return (
    <View style={styles.miniBookingRow}>
      <Text style={styles.miniBookingTime}>{formatTime(booking.scheduled_for)}</Text>
      <View style={styles.grow}>
        <Text style={styles.miniBookingTitle}>{booking.service_name}</Text>
        <Text style={styles.miniBookingSub}>{role === "customer" ? booking.barber_name : booking.customer_name}</Text>
      </View>
      <View style={[styles.smallStatus, { backgroundColor: `${statusTone(booking.status)}22` }]}>
        <Text style={[styles.smallStatusText, { color: statusTone(booking.status) }]}>{statusLabel(booking.status)}</Text>
      </View>
    </View>
  );
}

function MetricCard({
  label,
  value,
  icon,
  accent = colors.gold,
}: {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  accent?: string;
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.rowBetween}>
        <Text style={styles.metricLabel}>{label}</Text>
        {icon ? <Ionicons name={icon} size={18} color={accent} /> : null}
      </View>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function QuickAction({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}>
      <Ionicons name={icon} size={24} color={colors.gold} />
      <Text style={styles.quickActionText}>{label}</Text>
    </Pressable>
  );
}

function BarberCard({
  barber,
  selected,
  service,
  onPress,
  footer,
}: {
  barber: ApiBarber;
  selected?: boolean;
  service?: string;
  onPress?: () => void;
  footer?: React.ReactNode;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <Card style={[styles.barberCard, selected && styles.selectedCard]}>
        <BarberMediaPreview barber={barber} />
        <View style={styles.row}>
          <BarberAvatar barber={barber} />
          <View style={styles.grow}>
            <Text style={styles.cardTitle}>{barber.full_name}</Text>
            <Text style={styles.muted}>{barber.specialty}</Text>
          </View>
          <View style={styles.ratingPill}>
            <Text style={styles.ratingText}>{barber.rating.toFixed(1)}</Text>
          </View>
        </View>
        <View style={styles.infoGrid}>
          <Text style={styles.infoText}>{barber.experience_years} yil tajriba</Text>
          <Text style={styles.infoText}>{barber.today_bookings} bugun</Text>
          <Text style={styles.infoText}>{service ? `${priceForService(barber, service).toLocaleString()} som` : "Narxlar bor"}</Text>
        </View>
        {barber.address ? <Text style={styles.addressText}>{barber.address}</Text> : null}
        {footer}
      </Card>
    </Pressable>
  );
}

function BookingCard({
  booking,
  role,
  onAdvance,
  onReject,
  onDelete,
}: {
  booking: ApiBooking;
  role: ApiRole;
  onAdvance?: (booking: ApiBooking) => void;
  onReject?: (booking: ApiBooking) => void;
  onDelete?: (booking: ApiBooking) => void;
}) {
  const action = nextStatus(booking.status);
  const title = role === "barber" ? booking.customer_name : booking.barber_name;
  const subtitle = role === "admin"
    ? `${booking.customer_name} • ${booking.customer_phone}`
    : booking.service_name;
  return (
    <Card style={styles.bookingCard}>
      <View style={styles.row}>
        <View style={styles.timeBox}>
          <Text style={styles.timeText}>{formatTime(booking.scheduled_for)}</Text>
          <Text style={styles.dateText}>{formatDateLabel(booking.scheduled_for)}</Text>
        </View>
        <View style={styles.grow}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.muted}>{subtitle}</Text>
          {role === "admin" ? <Text style={styles.muted}>{booking.service_name} • {booking.barber_name}</Text> : null}
          <Text style={styles.priceText}>{booking.final_price.toLocaleString()} som</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusTone(booking.status)}22` }]}>
          <Text style={[styles.statusText, { color: statusTone(booking.status) }]}>{statusLabel(booking.status)}</Text>
        </View>
      </View>
      {booking.note ? <Text style={styles.noteText}>{booking.note}</Text> : null}
      {role !== "customer" && action ? (
        <View style={styles.actionRow}>
          <PrimaryButton label={action.label} onPress={() => onAdvance?.(booking)} tone="gold" />
          <PrimaryButton label="SMS" onPress={() => sendBookingSms(booking)} tone="ghost" />
          {booking.status === "pending" || booking.status === "accepted" ? (
            <PrimaryButton label="Rad etish" onPress={() => onReject?.(booking)} tone="ghost" />
          ) : null}
          {role === "admin" ? <PrimaryButton label="Ochirish" onPress={() => onDelete?.(booking)} tone="ghost" /> : null}
        </View>
      ) : role === "admin" ? (
        <View style={styles.actionRow}>
          <PrimaryButton label="SMS" onPress={() => sendBookingSms(booking)} tone="ghost" />
          <PrimaryButton label="Ochirish" onPress={() => onDelete?.(booking)} tone="ghost" />
        </View>
      ) : null}
    </Card>
  );
}

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [tab, setTab] = useState<TabKey>("home");
  const [barbers, setBarbers] = useState<ApiBarber[]>([]);
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [availability, setAvailability] = useState<ApiAvailabilityBooking[]>([]);
  const [discounts, setDiscounts] = useState<ApiDiscount[]>([]);
  const [barberProfile, setBarberProfile] = useState<ApiBarber | null>(null);
  const [services, setServices] = useState<string[]>(defaultServices);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selectedBarberId, setSelectedBarberId] = useState("");
  const [selectedService, setSelectedService] = useState("Soch olish");
  const [bookingDate, setBookingDate] = useState(getLocalDateInput());
  const [bookingTime, setBookingTime] = useState("10:00");
  const [adminCustomerName, setAdminCustomerName] = useState("");
  const [adminCustomerPhone, setAdminCustomerPhone] = useState("");
  const [note, setNote] = useState("");
  const [barberForm, setBarberForm] = useState<BarberFormPayload>(defaultBarberForm);
  const [editingBarberId, setEditingBarberId] = useState("");
  const [discountForm, setDiscountForm] = useState<DiscountFormPayload>(defaultDiscountForm);
  const [profileForm, setProfileForm] = useState<ProfileFormPayload>({
    fullName: "",
    username: "",
    phone: "",
    password: "",
    photoUrl: "",
  });
  const [bookingFilter, setBookingFilter] = useState<ApiBookingStatus | "all">("all");
  const [searchText, setSearchText] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState<BookingSuccess | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [barberModalOpen, setBarberModalOpen] = useState(false);
  const [telegramBotUsername, setTelegramBotUsername] = useState<string | null>(null);
  const [reminderMinutes, setReminderMinutes] = useState(10);

  const role = session?.user.role ?? "customer";
  const visibleTabs = getTabs(role);
  const loadedOnceRef = useRef(false);
  const selectedBarber = barbers.find((item) => item.id === selectedBarberId) ?? barbers[0];

  const upcomingBookings = useMemo(
    () => [...bookings].filter((item) => item.status !== "completed" && item.status !== "rejected"),
    [bookings],
  );
  const completedToday = useMemo(() => bookings.filter((item) => item.status === "completed").length, [bookings]);
  const filteredBookings = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return bookings.filter((booking) => {
      const statusMatches = bookingFilter === "all" || booking.status === bookingFilter;
      const searchMatches = !query
        || booking.customer_name.toLowerCase().includes(query)
        || booking.customer_phone.toLowerCase().includes(query)
        || booking.barber_name.toLowerCase().includes(query)
        || booking.service_name.toLowerCase().includes(query);
      return statusMatches && searchMatches;
    });
  }, [bookingFilter, bookings, searchText]);
  const bookedSlots = useMemo(() => new Set(
    availability
      .filter((item) => item.barber_id === selectedBarber?.id && sameLocalDay(item.scheduled_for, bookingDate))
      .map((item) => formatTime(item.scheduled_for)),
  ), [availability, bookingDate, selectedBarber?.id]);
  const todayBookings = useMemo(
    () => bookings.filter((item) => sameLocalDay(item.scheduled_for, getLocalDateInput())),
    [bookings],
  );
  const revenue = useMemo(
    () => bookings
      .filter((item) => item.status === "completed")
      .reduce((sum, item) => sum + item.final_price, 0),
    [bookings],
  );
  const uniqueClients = useMemo(
    () => new Set(bookings.map((item) => item.customer_user_id ?? item.customer_phone)).size,
    [bookings],
  );
  const notificationItems = useMemo<NotificationItem[]>(() => {
    const bookingNotifications = [...bookings]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 12)
      .map((booking) => {
        const isCustomer = role === "customer";
        const person = isCustomer ? booking.barber_name : booking.customer_name;
        const title = booking.status === "pending"
          ? "Yangi bron"
          : `Bron ${statusLabel(booking.status).toLowerCase()}`;
        return {
          id: `booking-${booking.id}`,
          title,
          body: `${person} • ${booking.service_name} • ${formatDateLabel(booking.scheduled_for)} ${formatTime(booking.scheduled_for)}`,
          tone: statusTone(booking.status),
          tab: "bookings" as TabKey,
          smsPhone: isCustomer ? undefined : booking.customer_phone,
          smsBody: `Salom, ${booking.customer_name}. ${booking.service_name} broningiz ${formatDateLabel(booking.scheduled_for)} ${formatTime(booking.scheduled_for)} ga belgilangan.`,
        };
      });

    const discountNotifications = role === "customer"
      ? discounts.slice(0, 5).map((discount) => ({
        id: `discount-${discount.id}`,
        title: "Yangi skidka",
        body: `${discount.barber_name} • ${discount.percent}% chegirma • ${formatTime(discount.starts_at)}-${formatTime(discount.ends_at)}`,
        tone: colors.gold,
        tab: "discounts" as TabKey,
      }))
      : [];

    return [...bookingNotifications, ...discountNotifications];
  }, [bookings, discounts, role]);
  const dateChoices = useMemo(() => Array.from({ length: 4 }, (_, index) => {
    const value = new Date();
    value.setDate(value.getDate() + index);
    return {
      value: getLocalDateInput(value),
      kicker: index === 0 ? "Bugun" : value.toLocaleDateString("uz-UZ", { weekday: "short" }),
      label: value.toLocaleDateString("uz-UZ", { day: "2-digit", month: "short" }),
    };
  }), []);

  const loadData = useCallback(async () => {
    const isInitial = !loadedOnceRef.current;
    setInitialLoading(isInitial);
    setRefreshing(true);
    try {
      const [barberItems, serviceOptions, availabilityItems] = await Promise.all([
        getBarbers(),
        getServices(),
        getAvailabilityBookings().catch(() => []),
      ]);
      setBarbers(barberItems);
      setServices(serviceOptions.items.length ? serviceOptions.items : defaultServices);
      setAvailability(availabilityItems);
      if (!selectedBarberId && barberItems[0]) {
        setSelectedBarberId(barberItems[0].id);
      }
      if (session) {
        const [bookingItems, discountItems, profile, latestUser] = await Promise.all([
          getBookings(session.accessToken),
          getDiscounts(session.accessToken).catch(() => []),
          session.user.role === "barber"
            ? getMyBarberProfile(session.accessToken).catch(() => null)
            : Promise.resolve(null),
          getMe(session.accessToken).catch(() => session.user),
        ]);
        setBookings(bookingItems);
        setDiscounts(discountItems);
        setBarberProfile(profile);
        setSession((current) => {
          if (!current) return current;
          const unchanged =
            current.user.fullName === latestUser.fullName &&
            current.user.username === latestUser.username &&
            current.user.phone === latestUser.phone &&
            current.user.photoUrl === latestUser.photoUrl &&
            current.user.telegramChatId === latestUser.telegramChatId &&
            current.user.telegramConnected === latestUser.telegramConnected;
          return unchanged ? current : { ...current, user: latestUser };
        });
        if (profile && !editingBarberId) {
          setBarberForm(formFromBarber(profile));
        }
      }
    } catch (error) {
      Alert.alert("Xato", error instanceof Error ? error.message : "Malumot yuklanmadi.");
    } finally {
      setRefreshing(false);
      loadedOnceRef.current = true;
      setInitialLoading(false);
    }
  }, [editingBarberId, selectedBarberId, session]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    let active = true;
    getTelegramMeta()
      .then((meta) => {
        if (!active) return;
        setTelegramBotUsername(meta.bot_username ?? null);
        setReminderMinutes(meta.reminder_minutes_before);
      })
      .catch(() => {
        if (active) {
          setTelegramBotUsername(null);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    const subjectId = session.user.role === "admin" ? "global" : session.user.id;
    const socket = createRealtimeSocket(session.user.role, subjectId);

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as { message?: string; status?: ApiBookingStatus };
        if (payload.message) {
          setShowNotifications(false);
        }
        void loadData();
      } catch {
        void loadData();
      }
    };

    return () => {
      socket.close();
    };
  }, [loadData, session]);

  useEffect(() => {
    const slots = buildTimeSlots(9, 16);
    const selectedUnavailable = bookedSlots.has(bookingTime) || isPastLocalSlot(bookingDate, bookingTime);
    if (!selectedUnavailable) return;
    const nextOpenSlot = slots.find((slot) => !bookedSlots.has(slot) && !isPastLocalSlot(bookingDate, slot));
    if (nextOpenSlot) {
      setBookingTime(nextOpenSlot);
    }
  }, [bookedSlots, bookingDate, bookingTime]);

  async function submitBooking() {
    if (busy) return;
    if (!session || !selectedBarber) return;
    if (bookedSlots.has(bookingTime) || isPastLocalSlot(bookingDate, bookingTime)) {
      Alert.alert("Vaqt band", "Bu vaqt band yoki o'tib ketgan. Boshqa vaqt tanlang.");
      return;
    }
    const scheduledFor = buildIsoFromLocal(bookingDate, bookingTime);
    if (!scheduledFor) {
      Alert.alert("Vaqt xato", "Sana YYYY-MM-DD va vaqt HH:MM formatida bolsin.");
      return;
    }
    const customerName = role === "admin" ? adminCustomerName.trim() : session.user.fullName;
    const customerPhone = role === "admin" ? adminCustomerPhone.trim() : session.user.phone ?? "";
    if (!customerName || !customerPhone) {
      Alert.alert("Mijoz malumoti kerak", "Ism va telefon raqamni kiriting.");
      return;
    }
    setBusy(true);
    try {
      await createBooking(session.accessToken, {
        barberId: selectedBarber.id,
        customerName,
        customerPhone,
        serviceName: selectedService,
        scheduledFor,
        note,
      });
      setBookingSuccess({
        barberName: selectedBarber.full_name,
        serviceName: selectedService,
        scheduledFor,
        salon: selectedBarber.address || "CHOP CHOP Barbershop, Toshkent",
        price: priceForService(selectedBarber, selectedService),
      });
      setNote("");
      setAdminCustomerName("");
      setAdminCustomerPhone("");
      await loadData();
    } catch (error) {
      Alert.alert("Bron yaratilmadi", error instanceof Error ? error.message : "Qayta urinib koring.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAdvance(booking: ApiBooking) {
    if (busy) return;
    if (!session) return;
    const action = nextStatus(booking.status);
    if (!action) return;
    setBusy(true);
    try {
      await updateBookingStatus(session.accessToken, booking.id, action.status);
      await loadData();
    } catch (error) {
      Alert.alert("Status ozgarmadi", error instanceof Error ? error.message : "Qayta urinib koring.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReject(booking: ApiBooking) {
    if (busy) return;
    if (!session) return;
    setBusy(true);
    try {
      await updateBookingStatus(session.accessToken, booking.id, "rejected", "Mobil ilovadan rad etildi");
      await loadData();
    } catch (error) {
      Alert.alert("Status ozgarmadi", error instanceof Error ? error.message : "Qayta urinib koring.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteBooking(booking: ApiBooking) {
    if (busy) return;
    if (!session || role !== "admin") return;
    Alert.alert("Navbat ochirilsinmi?", `${booking.customer_name} - ${booking.service_name}`, [
      { text: "Bekor qilish", style: "cancel" },
      {
        text: "Ochirish",
        style: "destructive",
        onPress: async () => {
          setBusy(true);
          try {
            await deleteBooking(session.accessToken, booking.id);
            await loadData();
          } catch (error) {
            Alert.alert("Ochmadi", error instanceof Error ? error.message : "Qayta urinib koring.");
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  }

  async function saveBarberForm() {
    if (busy) return;
    if (!session || role !== "admin") return;
    if (!barberForm.fullName.trim() || !barberForm.username.trim() || !barberForm.specialty.trim()) {
      Alert.alert("Malumot yetarli emas", "Ism, username va mutaxassislikni kiriting.");
      return;
    }
    if (!editingBarberId && !barberForm.password?.trim()) {
      Alert.alert("Parol kerak", "Yangi barber uchun parol kiriting.");
      return;
    }
    setBusy(true);
    try {
      if (editingBarberId) {
        await updateBarber(session.accessToken, editingBarberId, barberForm);
      } else {
        await createBarber(session.accessToken, { ...barberForm, password: barberForm.password || "barber123" });
      }
      setEditingBarberId("");
      setBarberForm(defaultBarberForm());
      setBarberModalOpen(false);
      await loadData();
      Alert.alert("Tayyor", "Barber malumoti saqlandi.");
    } catch (error) {
      Alert.alert("Saqlanmadi", error instanceof Error ? error.message : "Qayta urinib koring.");
    } finally {
      setBusy(false);
    }
  }

  async function removeBarber(barber: ApiBarber) {
    if (busy) return;
    if (!session || role !== "admin") return;
    Alert.alert("Barber ochirilsinmi?", barber.full_name, [
      { text: "Bekor qilish", style: "cancel" },
      {
        text: "Ochirish",
        style: "destructive",
        onPress: async () => {
          setBusy(true);
          try {
            await deleteBarber(session.accessToken, barber.id);
            await loadData();
          } catch (error) {
            Alert.alert("Ochmadi", error instanceof Error ? error.message : "Qayta urinib koring.");
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  }

  async function saveProfileSettings() {
    if (busy) return;
    if (!session || role !== "barber") return;
    setBusy(true);
    try {
      await updateMyBarberSettings(session.accessToken, barberForm);
      await loadData();
      Alert.alert("Saqlandi", "Profil va narxlar yangilandi.");
    } catch (error) {
      Alert.alert("Saqlanmadi", error instanceof Error ? error.message : "Qayta urinib koring.");
    } finally {
      setBusy(false);
    }
  }

  async function saveDiscountForm() {
    if (busy) return;
    if (!session || (role !== "admin" && role !== "barber")) return;
    if (!discountForm.title.trim()) {
      Alert.alert("Sarlavha kerak", "Skidka nomini kiriting.");
      return;
    }
    setBusy(true);
    try {
      await createDiscount(session.accessToken, {
        ...discountForm,
        barberId: role === "admin" ? discountForm.barberId || selectedBarber?.id : null,
      });
      setDiscountForm(defaultDiscountForm());
      await loadData();
      Alert.alert("Skidka yaratildi", "Taklif panelda korinadi.");
    } catch (error) {
      Alert.alert("Skidka yaratilmadi", error instanceof Error ? error.message : "Qayta urinib koring.");
    } finally {
      setBusy(false);
    }
  }

  async function removeDiscount(discount: ApiDiscount) {
    if (busy) return;
    if (!session || (role !== "admin" && role !== "barber")) return;
    setBusy(true);
    try {
      await deleteDiscount(session.accessToken, discount.id);
      await loadData();
    } catch (error) {
      Alert.alert("Ochmadi", error instanceof Error ? error.message : "Qayta urinib koring.");
    } finally {
      setBusy(false);
    }
  }

  async function fillBarberLocation() {
    if (busy) return;
    const geo = (globalThis as unknown as {
      navigator?: {
        geolocation?: {
          getCurrentPosition: (
            success: (position: { coords: { latitude: number; longitude: number } }) => void,
            error?: (error: { message?: string }) => void,
            options?: { enableHighAccuracy?: boolean; timeout?: number; maximumAge?: number },
          ) => void;
        };
      };
    }).navigator?.geolocation;

    if (!geo) {
      Alert.alert("Lokatsiya yo'q", "Brauzer yoki qurilma geolokatsiyani qo'llamayapti.");
      return;
    }

    setBusy(true);
    try {
      const coords = await new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
        geo.getCurrentPosition(
          (position) => resolve({
            latitude: Number(position.coords.latitude.toFixed(6)),
            longitude: Number(position.coords.longitude.toFixed(6)),
          }),
          (error) => reject(new Error(error.message || "Lokatsiya olinmadi.")),
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
        );
      });
      setBarberForm((current) => ({
        ...current,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));
      Alert.alert("Lokatsiya olindi", `${coords.latitude}, ${coords.longitude}`);
    } catch (error) {
      Alert.alert("Lokatsiya olinmadi", error instanceof Error ? error.message : "Qayta urinib koring.");
    } finally {
      setBusy(false);
    }
  }

  async function pickAndUploadMedia(
    kind: "image" | "media",
    applyUrl: (url: string) => void,
  ) {
    if (busy) return;
    if (!session) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Ruxsat kerak", "Rasm yoki videoni tanlash uchun galereyaga ruxsat bering.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: kind === "image" ? ["images"] : ["images", "videos"],
      allowsEditing: kind === "image",
      quality: 0.85,
    });

    if (result.canceled || !result.assets.length) return;
    const asset = result.assets[0];
    const fallbackType = asset.type === "video" ? "video/mp4" : "image/jpeg";
    const fallbackName = asset.fileName || `${kind}-${Date.now()}.${asset.type === "video" ? "mp4" : "jpg"}`;
    const file = asset.file ?? {
      uri: asset.uri,
      name: fallbackName,
      type: asset.mimeType || fallbackType,
    };

    setBusy(true);
    try {
      const uploaded = await uploadMedia(session.accessToken, file);
      applyUrl(uploaded.url);
      Alert.alert("Yuklandi", "Fayl muvaffaqiyatli yuklandi.");
    } catch (error) {
      Alert.alert("Yuklanmadi", error instanceof Error ? error.message : "Qayta urinib koring.");
    } finally {
      setBusy(false);
    }
  }

  async function saveAccountSettings() {
    if (busy) return;
    if (!session) return;
    if (!profileForm.fullName.trim()) {
      Alert.alert("Ism kerak", "Ism familyani kiriting.");
      return;
    }
    if (role === "customer" && !profileForm.phone?.trim()) {
      Alert.alert("Telefon kerak", "Telefon raqamingizni kiriting.");
      return;
    }
    if (role !== "customer" && !profileForm.username?.trim()) {
      Alert.alert("Username kerak", "Kirish username'ini kiriting.");
      return;
    }
    if (profileForm.password && profileForm.password.length < 4) {
      Alert.alert("Parol qisqa", "Parol kamida 4 ta belgidan iborat bo'lsin.");
      return;
    }

    setBusy(true);
    try {
      const updatedUser = await updateMe(session.accessToken, {
        ...profileForm,
        fullName: profileForm.fullName.trim(),
        username: profileForm.username?.trim(),
        phone: profileForm.phone?.trim(),
        photoUrl: profileForm.photoUrl?.trim(),
      });
      setSession({ ...session, user: updatedUser });
      setProfileForm({ ...profileFormFromUser(updatedUser), password: "" });
      if (updatedUser.role === "barber") {
        await loadData();
      }
      Alert.alert("Saqlandi", "Profil ma'lumotlari yangilandi.");
    } catch (error) {
      Alert.alert("Saqlanmadi", error instanceof Error ? error.message : "Qayta urinib koring.");
    } finally {
      setBusy(false);
    }
  }

  function logoutNow() {
    setSession(null);
    setBookings([]);
    setDiscounts([]);
    setBarberProfile(null);
    setBookingFilter("all");
    setSearchText("");
    setProfileForm({ fullName: "", username: "", phone: "", password: "", photoUrl: "" });
    loadedOnceRef.current = false;
    setTab("home");
  }

  function confirmLogout() {
    setLogoutModalOpen(true);
  }

  if (!session) {
    return (
      <AuthScreen
        onAuthenticated={(nextSession) => {
          loadedOnceRef.current = false;
          setProfileForm(profileFormFromUser(nextSession.user));
          setSession(nextSession);
        }}
      />
    );
  }

  const renderBookingComposer = () => (
    <View style={styles.stack}>
      {selectedBarber ? (
        <Card style={styles.bookingPanel}>
          <View style={styles.bookingProfile}>
            <BarberAvatar barber={selectedBarber} size={64} />
            <View style={styles.grow}>
              <Text style={styles.profileName}>{selectedBarber.full_name}</Text>
              <Text style={styles.miniBarberRating}>★ {selectedBarber.rating.toFixed(1)} ({selectedBarber.total_bookings})</Text>
            </View>
          </View>
        </Card>
      ) : (
        <LoadingCard label="Barberlar yuklanmoqda..." />
      )}

      <Card style={styles.bookingPanel}>
        <Text style={styles.panelCardTitle}>Xizmatni tanlang</Text>
        <View style={styles.serviceList}>
          {services.map((service) => {
            const selected = selectedService === service;
            const price = selectedBarber ? priceForService(selectedBarber, service) : 0;
            const icon = serviceIcons[service] ?? "content-cut";
            return (
              <Pressable
                key={service}
                onPress={() => setSelectedService(service)}
                style={({ pressed }) => [styles.serviceOption, selected && styles.serviceOptionActive, pressed && styles.pressed]}
              >
                <View style={styles.serviceIconBox}>
                  <MaterialCommunityIcons name={icon} size={22} color={colors.goldDark} />
                </View>
                <View style={styles.grow}>
                  <Text style={styles.serviceOptionTitle}>{service.replace(" qirqim", "")}</Text>
                  <Text style={styles.serviceOptionPrice}>{price ? `${price.toLocaleString()} so'm` : "Narx bor"}</Text>
                </View>
                <View style={[styles.checkDot, selected && styles.checkDotActive]}>
                  {selected ? <Ionicons name="checkmark" size={16} color="#090b0d" /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <View style={styles.stack}>
        <Text style={styles.panelCardTitle}>Sana tanlang</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateStrip}>
          {dateChoices.map((item) => {
            const selected = bookingDate === item.value;
            return (
              <Pressable
                key={item.value}
                onPress={() => setBookingDate(item.value)}
                style={({ pressed }) => [styles.datePill, selected && styles.datePillActive, pressed && styles.pressed]}
              >
                <Text style={[styles.dateKicker, selected && styles.dateKickerActive]}>{item.kicker}</Text>
                <Text style={[styles.dateLabel, selected && styles.dateLabelActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.stack}>
        <Text style={styles.panelCardTitle}>Vaqt tanlang</Text>
        <View style={styles.timeGrid}>
          {buildTimeSlots(9, 16).map((slot) => {
            const booked = bookedSlots.has(slot);
            const expired = isPastLocalSlot(bookingDate, slot);
            const disabled = booked || expired;
            const selected = bookingTime === slot;
            return (
              <Pressable
                key={slot}
                onPress={() => {
                  if (!disabled) setBookingTime(slot);
                }}
                style={({ pressed }) => [styles.timeChip, disabled && styles.timeChipBooked, selected && styles.timeChipActive, pressed && !disabled && styles.pressed]}
              >
                <Text style={[styles.timeChipText, selected && styles.timeChipTextActive, disabled && styles.timeChipTextBooked]}>
                  {booked ? `${slot} band` : expired ? `${slot} o'tdi` : slot}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {role === "admin" ? (
        <Card style={styles.bookingPanel}>
          <Text style={styles.panelCardTitle}>Mijoz ma'lumoti</Text>
          <Field
            label="Mijoz ismi"
            value={adminCustomerName}
            onChangeText={setAdminCustomerName}
            placeholder="Mijoz ismi"
          />
          <Field
            label="Mijoz telefoni"
            value={adminCustomerPhone}
            onChangeText={setAdminCustomerPhone}
            keyboardType="phone-pad"
            placeholder="998901234567"
          />
        </Card>
      ) : null}

      <Field label="Izoh" value={note} onChangeText={setNote} placeholder="Masalan, fade qisqaroq" />

      <Card style={styles.locationRow}>
        <View style={styles.grow}>
          <Text style={styles.panelCardTitle}>Manzil</Text>
          <Text style={styles.muted}>{selectedBarber?.address || "CHOP CHOP Barbershop, Toshkent"}</Text>
        </View>
        <Ionicons name="chevron-forward" size={21} color={colors.muted} />
      </Card>

      <View style={styles.totalBar}>
        <View>
          <Text style={styles.totalLabel}>Jami</Text>
          <Text style={styles.totalValue}>{selectedBarber ? priceForService(selectedBarber, selectedService).toLocaleString() : 0} so'm</Text>
        </View>
        <PrimaryButton
          label={role === "admin" ? "Bron yaratish" : "Bronni tasdiqlash"}
          onPress={submitBooking}
          loading={busy}
          disabled={!selectedBarber || bookedSlots.has(bookingTime) || isPastLocalSlot(bookingDate, bookingTime)}
        />
      </View>
    </View>
  );

  const renderBookingSuccess = () => {
    if (!bookingSuccess) return null;
    return (
      <View style={styles.successScreen}>
        <View style={styles.successCheck}>
          <Ionicons name="checkmark" size={48} color="#fff" />
        </View>
        <Text style={styles.successTitle}>Bron muvaffaqiyatli tasdiqlandi!</Text>
        <Card style={styles.successCard}>
          {[
            { icon: "person-outline" as const, label: "Barber", value: bookingSuccess.barberName },
            { icon: "cut-outline" as const, label: "Xizmat", value: bookingSuccess.serviceName },
            { icon: "calendar-outline" as const, label: "Sana", value: `${formatDateLabel(bookingSuccess.scheduledFor)}, ${formatTime(bookingSuccess.scheduledFor)}` },
            { icon: "location-outline" as const, label: "Salon", value: bookingSuccess.salon },
            { icon: "card-outline" as const, label: "Narx", value: `${bookingSuccess.price.toLocaleString()} so'm` },
          ].map((item) => (
            <View key={item.label} style={styles.successDetailRow}>
              <Ionicons name={item.icon} size={20} color={colors.muted} />
              <View style={styles.grow}>
                <Text style={styles.successDetailLabel}>{item.label}</Text>
                <Text style={styles.successDetailValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </Card>
        <PrimaryButton
          label="Bronlarimga o'tish"
          onPress={() => {
            setBookingSuccess(null);
            setTab("bookings");
          }}
          tone="gold"
        />
        <Pressable
          onPress={() => {
            setBookingSuccess(null);
            setTab("home");
          }}
          style={styles.linkButton}
        >
          <Text style={styles.linkButtonText}>Asosiy sahifaga qaytish</Text>
        </Pressable>
      </View>
    );
  };

  const renderNotifications = () => (
    <View style={styles.stack}>
      <SectionTitle eyebrow="Bildirishnomalar" title="Bron va yangiliklar" />
      {notificationItems.length === 0 ? <Text style={styles.emptyText}>Hozircha bildirishnoma yo'q.</Text> : null}
      {notificationItems.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => {
            setShowNotifications(false);
            setTab(item.tab);
          }}
          style={({ pressed }) => [styles.notificationCard, pressed && styles.pressed]}
        >
          <View style={[styles.notificationDot, { backgroundColor: item.tone }]} />
          <View style={styles.grow}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationBody}>{item.body}</Text>
          </View>
          {item.smsPhone && item.smsBody ? (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                void openSms(item.smsPhone!, item.smsBody!);
              }}
              style={({ pressed }) => [styles.notificationSms, pressed && styles.pressed]}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.goldDark} />
            </Pressable>
          ) : (
            <Ionicons name="chevron-forward" size={19} color={colors.muted} />
          )}
        </Pressable>
      ))}
    </View>
  );

  const renderCustomerHome = () => (
    <View style={styles.stack}>
      {initialLoading ? <LoadingCard label="Ma'lumotlar yuklanmoqda..." /> : null}
      <ImageBackground
        source={{ uri: selectedBarber?.photo_url || HERO_IMAGE_URL }}
        imageStyle={styles.customerHeroImage}
        style={styles.customerHero}
      >
        <View style={styles.heroScrim} />
        <View style={styles.customerHeroContent}>
          <Text style={styles.heroBrand}>BARBERSHOP</Text>
          <Text style={styles.customerHeroTitle}>Stay Sharp,{`\n`}Look Sharp.</Text>
          <PrimaryButton label="Hozir bron qilish" onPress={() => setTab("book")} tone="gold" />
        </View>
      </ImageBackground>

      <TelegramConnectCard
        botUsername={telegramBotUsername}
        role={role}
        user={session.user}
        reminderMinutes={reminderMinutes}
      />

      <SectionHeaderRow title="Xizmatlarimiz" action="Barchasi" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tileStrip}>
        {services.slice(0, 5).map((service) => (
          <ServiceTile
            key={service}
            service={service}
            barber={selectedBarber}
            selected={selectedService === service}
            onPress={() => {
              setSelectedService(service);
              setTab("book");
            }}
          />
        ))}
      </ScrollView>

      <SectionHeaderRow title="Barberlar" action="Barchasi" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barberStrip}>
        {barbers.map((barber) => (
          <Pressable
            key={barber.id}
            onPress={() => {
              setSelectedBarberId(barber.id);
              setTab("book");
            }}
            style={({ pressed }) => [styles.miniBarberCard, selectedBarberId === barber.id && styles.miniBarberActive, pressed && styles.pressed]}
          >
            <BarberAvatar barber={barber} size={58} />
            <Text style={styles.miniBarberName} numberOfLines={1}>{barber.full_name.split(" ")[0]}</Text>
            <Text style={styles.miniBarberRating}>★ {barber.rating.toFixed(1)}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <SectionHeaderRow title="Salonlar" />
      <Card style={styles.salonCard}>
        <Image source={{ uri: SALON_IMAGE_URL }} style={styles.salonImage} />
        <View style={styles.grow}>
          <Text style={styles.cardTitle}>CHOP CHOP Barbershop</Text>
          <Text style={styles.muted}>{selectedBarber?.address || "Toshkent, Chilonzor 7-kvartal"}</Text>
          <Text style={styles.miniBarberRating}>★ 4.8 (120)</Text>
        </View>
        <Text style={styles.distanceText}>1.2 km</Text>
      </Card>

      {upcomingBookings.length ? (
        <>
          <SectionHeaderRow title="Yaqin bronlar" />
          {upcomingBookings.slice(0, 3).map((booking) => (
            <BookingCard key={booking.id} booking={booking} role={role} />
          ))}
        </>
      ) : null}
    </View>
  );

  const renderBarberHome = () => (
    <View style={styles.stack}>
      {initialLoading ? <LoadingCard label="Ish joyi yuklanmoqda..." /> : null}
      <Card style={styles.profileHeroCard}>
        <View style={styles.row}>
          {barberProfile ? <BarberAvatar barber={barberProfile} size={70} /> : <View style={styles.profileAvatar}><Text style={styles.avatarText}>{initials(session.user.fullName)}</Text></View>}
          <View style={styles.grow}>
            <View style={styles.row}>
              <Text style={styles.profileName}>{barberProfile?.full_name ?? session.user.fullName}</Text>
              <View style={styles.onlineBadge}>
                <Text style={styles.onlineText}>Online</Text>
              </View>
            </View>
            <Text style={styles.miniBarberRating}>★ {(barberProfile?.rating ?? 4.9).toFixed(1)} ({barberProfile?.total_bookings ?? bookings.length})</Text>
          </View>
        </View>
      </Card>

      <TelegramConnectCard
        botUsername={telegramBotUsername}
        role={role}
        user={session.user}
        reminderMinutes={reminderMinutes}
      />

      <Card style={styles.panelCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.panelCardTitle}>Bugungi bronlar</Text>
          <View style={styles.countBadge}><Text style={styles.countBadgeText}>{todayBookings.length} ta</Text></View>
        </View>
        {todayBookings.slice(0, 5).map((booking) => (
          <MiniBookingRow key={booking.id} booking={booking} role={role} />
        ))}
        {todayBookings.length === 0 ? <Text style={styles.emptyText}>Bugun navbat yoq.</Text> : null}
        <Pressable onPress={() => setTab("bookings")} style={styles.linkButton}>
          <Text style={styles.linkButtonText}>Barchasini ko'rish</Text>
        </Pressable>
      </Card>

      <Card style={styles.panelCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.panelCardTitle}>Statistikalar</Text>
          <View style={styles.countBadge}><Text style={styles.countBadgeText}>Bugun</Text></View>
        </View>
        <View style={styles.metricsRow}>
          <MetricCard label="Bronlar" value={todayBookings.length} />
          <MetricCard label="Bajarilgan" value={completedToday} accent={colors.green} />
          <MetricCard label="Daromad" value={`${Math.round(revenue / 1000)}K`} accent={colors.gold} />
        </View>
        <PrimaryButton label="Daromadni ko'rish" onPress={() => setTab("profile")} tone="gold" />
      </Card>
    </View>
  );

  const renderAdminHome = () => (
    <View style={styles.stack}>
      {initialLoading ? <LoadingCard label="Admin panel yuklanmoqda..." /> : null}
      <View style={styles.metricsRow}>
        <MetricCard label="Salonlar" value="6" icon="business-outline" accent={colors.purple} />
        <MetricCard label="Barberlar" value={barbers.length} icon="people-outline" accent={colors.green} />
        <MetricCard label="Mijozlar" value={uniqueClients || "0"} icon="person-outline" accent={colors.gold} />
      </View>
      <Card style={styles.revenueCard}>
        <Text style={styles.muted}>Bugungi daromad</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.revenueText}>{revenue.toLocaleString()} so'm</Text>
          <Ionicons name="stats-chart" size={26} color={colors.gold} />
        </View>
      </Card>

      <TelegramConnectCard
        botUsername={telegramBotUsername}
        role={role}
        user={session.user}
        reminderMinutes={reminderMinutes}
      />

      <SectionHeaderRow title="So'nggi bronlar" action="Barchasi" />
      <Card style={styles.panelCard}>
        {bookings.slice(0, 5).map((booking) => (
          <MiniBookingRow key={booking.id} booking={booking} role={role} />
        ))}
        {bookings.length === 0 ? <Text style={styles.emptyText}>Bronlar topilmadi.</Text> : null}
      </Card>

      <SectionHeaderRow title="Tezkor boshqaruv" />
      <View style={styles.quickGrid}>
        <QuickAction label="Salonlar" icon="business" onPress={() => setTab("profile")} />
        <QuickAction label="Barberlar" icon="people" onPress={() => setTab("barbers")} />
        <QuickAction label="Xizmatlar" icon="options" onPress={() => setTab("book")} />
        <QuickAction label="Statistika" icon="bar-chart" onPress={() => setTab("profile")} />
      </View>
    </View>
  );

  const renderHome = () => {
    if (role === "barber") return renderBarberHome();
    if (role === "admin") return renderAdminHome();
    return renderCustomerHome();
  };

  const renderBarbers = () => (
    <View style={styles.stack}>
      <SectionTitle eyebrow={role === "admin" ? "Admin boshqaruv" : "Jamoa"} title={role === "admin" ? "Barber panel" : "Barberlar"} />
      {initialLoading ? <LoadingCard label="Barberlar yuklanmoqda..." /> : null}
      {role === "admin" ? (
        <Card style={styles.formCard}>
          <Text style={styles.cardTitle}>Barber boshqaruvi</Text>
          <Text style={styles.muted}>Yangi barber qo'shish va tahrirlash alohida modalda ochiladi.</Text>
          <PrimaryButton
            label="Yangi barber qo'shish"
            tone="gold"
            onPress={() => {
              setEditingBarberId("");
              setBarberForm(defaultBarberForm());
              setBarberModalOpen(true);
            }}
          />
        </Card>
      ) : null}
      {barbers.map((barber) => (
        <BarberCard
          key={barber.id}
          barber={barber}
          selected={selectedBarberId === barber.id}
          service={selectedService}
          footer={role === "admin" ? (
            <View style={styles.actionRow}>
              <PrimaryButton
                label="Tahrirlash"
                tone="gold"
                onPress={() => {
                  setEditingBarberId(barber.id);
                  setBarberForm(formFromBarber(barber));
                  setBarberModalOpen(true);
                }}
              />
              <PrimaryButton label="Ochirish" tone="ghost" onPress={() => removeBarber(barber)} />
            </View>
          ) : null}
          onPress={() => {
            setSelectedBarberId(barber.id);
            if (role === "customer") {
              setTab("book");
            }
          }}
        />
      ))}
    </View>
  );

  const renderBookings = () => (
    <View style={styles.stack}>
      <SectionTitle eyebrow="Operatsiya" title="Navbatlar" />
      {initialLoading ? <LoadingCard label="Navbatlar yuklanmoqda..." /> : null}
      <Card style={styles.filterCard}>
        <Field
          label="Qidirish"
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Mijoz, barber yoki xizmat"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {(["all", "pending", "accepted", "in_service", "completed", "rejected"] as Array<ApiBookingStatus | "all">).map((status) => (
            <Pill
              key={status}
              label={status === "all" ? "Hammasi" : statusLabel(status)}
              selected={bookingFilter === status}
              onPress={() => setBookingFilter(status)}
            />
          ))}
        </ScrollView>
      </Card>
      {role === "admin" ? renderBookingComposer() : null}
      {filteredBookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          role={role}
          onAdvance={handleAdvance}
          onReject={handleReject}
          onDelete={handleDeleteBooking}
        />
      ))}
      {filteredBookings.length === 0 ? <Text style={styles.emptyText}>Navbatlar topilmadi.</Text> : null}
    </View>
  );

  const renderDiscounts = () => (
    <View style={styles.stack}>
      <SectionTitle eyebrow="Takliflar" title="Skidkalar" />
      {initialLoading ? <LoadingCard label="Skidkalar yuklanmoqda..." /> : null}
      {role !== "customer" ? (
        <Card style={styles.formCard}>
          <Text style={styles.cardTitle}>Yangi skidka</Text>
          {role === "admin" ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {barbers.map((barber) => (
                <Pill
                  key={barber.id}
                  label={barber.full_name}
                  selected={(discountForm.barberId || selectedBarber?.id) === barber.id}
                  onPress={() => {
                    setSelectedBarberId(barber.id);
                    setDiscountForm((current) => ({ ...current, barberId: barber.id }));
                  }}
                />
              ))}
            </ScrollView>
          ) : null}
          <Field
            label="Nomi"
            value={discountForm.title}
            onChangeText={(value) => setDiscountForm((current) => ({ ...current, title: value }))}
            placeholder="Bugungi chegirma"
          />
          <Field
            label="Tavsif"
            value={discountForm.description}
            onChangeText={(value) => setDiscountForm((current) => ({ ...current, description: value }))}
            placeholder="Faqat bugun"
          />
          <Field
            label="Foiz"
            value={String(discountForm.percent)}
            onChangeText={(value) => setDiscountForm((current) => ({ ...current, percent: toNumber(value, current.percent) }))}
            keyboardType="numeric"
          />
          <View style={styles.twoColumn}>
            <Field
              label="Boshlanish ISO"
              value={discountForm.startsAt}
              onChangeText={(value) => setDiscountForm((current) => ({ ...current, startsAt: value }))}
            />
            <Field
              label="Tugash ISO"
              value={discountForm.endsAt}
              onChangeText={(value) => setDiscountForm((current) => ({ ...current, endsAt: value }))}
            />
          </View>
          <PrimaryButton label="Skidka yaratish" onPress={saveDiscountForm} loading={busy} />
        </Card>
      ) : null}
      {discounts.map((discount) => (
        <Card key={discount.id} style={styles.discountCard}>
          <View style={styles.row}>
            <View style={styles.discountBadge}>
              <Text style={styles.discountPercent}>{discount.percent}%</Text>
            </View>
            <View style={styles.grow}>
              <Text style={styles.cardTitle}>{discount.title}</Text>
              <Text style={styles.muted}>{discount.barber_name}</Text>
              <Text style={styles.addressText}>
                {formatDateLabel(discount.starts_at)} {formatTime(discount.starts_at)} - {formatTime(discount.ends_at)}
              </Text>
            </View>
          </View>
          {discount.description ? <Text style={styles.noteText}>{discount.description}</Text> : null}
          {role !== "customer" ? (
            <PrimaryButton label="Skidkani ochirish" tone="ghost" onPress={() => removeDiscount(discount)} />
          ) : null}
        </Card>
      ))}
      {discounts.length === 0 ? <Text style={styles.emptyText}>Faol skidka topilmadi.</Text> : null}
    </View>
  );

  const renderProfile = () => (
    <View style={styles.stack}>
      <SectionTitle eyebrow={roleLabels[role]} title="Profil va sozlamalar" />
      <Card style={styles.profileCard}>
        <View style={styles.row}>
          {session.user.photoUrl ? (
            <Image source={{ uri: session.user.photoUrl }} style={styles.profilePhotoPreview} />
          ) : (
            <View style={styles.profileAvatar}>
              <Text style={styles.avatarText}>{initials(session.user.fullName)}</Text>
            </View>
          )}
          <View style={styles.grow}>
            <Text style={styles.cardTitle}>{session.user.fullName}</Text>
            <Text style={styles.muted}>{session.user.username ?? session.user.phone ?? roleLabels[role]}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{roleLabels[role]}</Text>
          </View>
        </View>
      </Card>

      <TelegramConnectCard
        botUsername={telegramBotUsername}
        role={role}
        user={session.user}
        reminderMinutes={reminderMinutes}
      />

      <Card style={styles.formCard}>
        <Text style={styles.cardTitle}>Sozlamalar</Text>
        <Field
          label="Ism familya"
          value={profileForm.fullName}
          onChangeText={(value) => setProfileForm((current) => ({ ...current, fullName: value }))}
          placeholder="Ism familya"
        />
        {role !== "customer" ? (
          <Field
            label="Username"
            value={profileForm.username}
            onChangeText={(value) => setProfileForm((current) => ({ ...current, username: value }))}
            placeholder="username"
            autoCapitalize="none"
          />
        ) : null}
        <Field
          label="Telefon"
          value={profileForm.phone}
          onChangeText={(value) => setProfileForm((current) => ({ ...current, phone: value }))}
          placeholder="998901234567"
          keyboardType="phone-pad"
        />
        <View style={styles.uploadRow}>
          <PrimaryButton
            label={profileForm.photoUrl ? "Rasmni almashtirish" : "Rasm tanlash"}
            tone="ghost"
            onPress={() => pickAndUploadMedia("image", (url) => setProfileForm((current) => ({ ...current, photoUrl: url })))}
            loading={busy}
          />
          {profileForm.photoUrl ? (
            <PrimaryButton
              label="Rasmni olib tashlash"
              tone="ghost"
              onPress={() => setProfileForm((current) => ({ ...current, photoUrl: "" }))}
              disabled={busy}
            />
          ) : null}
        </View>
        {profileForm.photoUrl ? (
          <Image source={{ uri: profileForm.photoUrl }} style={styles.settingsPhotoPreview} />
        ) : null}
        <Field
          label="Yangi parol"
          value={profileForm.password}
          onChangeText={(value) => setProfileForm((current) => ({ ...current, password: value }))}
          placeholder="O'zgartirmasangiz bo'sh qoldiring"
          secureTextEntry
        />
        <PrimaryButton label="Sozlamalarni saqlash" onPress={saveAccountSettings} loading={busy} />
      </Card>

      {role === "barber" ? (
        <Card style={styles.formCard}>
          <Text style={styles.cardTitle}>Barber profil</Text>
          {barberProfile ? (
            <View style={styles.profileSummary}>
              <Text style={styles.cardTitle}>{barberProfile.full_name}</Text>
              <Text style={styles.muted}>{barberProfile.specialty}</Text>
              <Text style={styles.priceText}>{barberProfile.total_bookings} umumiy bron • {barberProfile.today_bookings} bugun</Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>Profil yuklanmadi.</Text>
          )}
          <View style={styles.uploadRow}>
            <PrimaryButton
              label={barberForm.photoUrl ? "Rasmni almashtirish" : "Rasm tanlash"}
              tone="ghost"
              onPress={() => pickAndUploadMedia("image", (url) => setBarberForm((current) => ({ ...current, photoUrl: url })))}
              loading={busy}
            />
            <PrimaryButton
              label={barberForm.mediaUrl ? "Mediani almashtirish" : "Video/Rasm tanlash"}
              tone="ghost"
              onPress={() => pickAndUploadMedia("media", (url) => setBarberForm((current) => ({ ...current, mediaUrl: url })))}
              loading={busy}
            />
          </View>
          {barberForm.photoUrl ? <Image source={{ uri: barberForm.photoUrl }} style={styles.settingsPhotoPreview} /> : null}
          {barberForm.mediaUrl ? (
            <Text style={styles.uploadedFileText} numberOfLines={1}>Media yuklandi: {barberForm.mediaUrl}</Text>
          ) : null}
          <Field
            label="Bio"
            value={barberForm.bio}
            onChangeText={(value) => setBarberForm((current) => ({ ...current, bio: value }))}
            placeholder="Mijozlar ko'radigan tavsif"
          />
          <View style={styles.twoColumn}>
            <Field
              label="Ish boshlanishi"
              value={barberForm.workStartTime}
              onChangeText={(value) => setBarberForm((current) => ({ ...current, workStartTime: value }))}
            />
            <Field
              label="Ish tugashi"
              value={barberForm.workEndTime}
              onChangeText={(value) => setBarberForm((current) => ({ ...current, workEndTime: value }))}
            />
          </View>
          <Field
            label="Manzil"
            value={barberForm.address}
            onChangeText={(value) => setBarberForm((current) => ({ ...current, address: value }))}
            placeholder="Salon manzili"
          />
          <PrimaryButton label="Lokatsiyani olish" tone="ghost" onPress={fillBarberLocation} loading={busy} />
          <View style={styles.twoColumn}>
            <Field
              label="Latitude"
              value={barberForm.latitude == null ? "" : String(barberForm.latitude)}
              onChangeText={(value) => setBarberForm((current) => ({ ...current, latitude: value ? Number(value) : null }))}
              keyboardType="decimal-pad"
            />
            <Field
              label="Longitude"
              value={barberForm.longitude == null ? "" : String(barberForm.longitude)}
              onChangeText={(value) => setBarberForm((current) => ({ ...current, longitude: value ? Number(value) : null }))}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.priceGrid}>
            {([
              ["priceHaircut", "Soch"],
              ["priceFade", "Fade"],
              ["priceHairBeard", "Combo"],
              ["pricePremium", "Premium"],
              ["priceBeard", "Soqol"],
            ] as Array<[keyof BarberFormPayload, string]>).map(([key, label]) => (
              <Field
                key={key}
                label={label}
                value={String(barberForm[key] ?? "")}
                onChangeText={(value) => setBarberForm((current) => ({ ...current, [key]: toNumber(value, Number(current[key]) || 0) }))}
                keyboardType="numeric"
              />
            ))}
          </View>
          <PrimaryButton label="Profilni saqlash" onPress={saveProfileSettings} loading={busy} />
        </Card>
      ) : null}

      {role === "admin" ? (
        <View style={styles.stack}>
          <Card style={styles.analyticsCard}>
            <Text style={styles.cardTitle}>Admin analytics</Text>
            <View style={styles.statsRow}>
              <Stat label="Barber" value={barbers.length} tone="gold" />
              <Stat label="Mijoz" value={uniqueClients} tone="green" />
              <Stat label="Bron" value={bookings.length} />
            </View>
            <View style={styles.progressList}>
              {(["pending", "accepted", "in_service", "completed", "rejected"] as ApiBookingStatus[]).map((status) => {
                const count = bookings.filter((booking) => booking.status === status).length;
                const width = (bookings.length ? `${Math.max(8, Math.round((count / bookings.length) * 100))}%` : "8%") as `${number}%`;
                return (
                  <View key={status} style={styles.progressItem}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.muted}>{statusLabel(status)}</Text>
                      <Text style={styles.progressValue}>{count}</Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width, backgroundColor: statusTone(status) }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>
        </View>
      ) : null}

      <Card style={styles.profileCard}>
        <Text style={styles.cardTitle}>Hisob</Text>
        <Text style={styles.muted}>Rol: {roleLabels[role]}</Text>
        <Text style={styles.muted}>Sessiya: faol</Text>
        <PrimaryButton
          label="Chiqish"
          tone="ghost"
          onPress={confirmLogout}
        />
      </Card>
    </View>
  );

  const content = showNotifications
    ? renderNotifications()
    : bookingSuccess
    ? renderBookingSuccess()
    : tab === "home"
      ? renderHome()
      : tab === "book"
        ? renderBookingComposer()
      : tab === "barbers"
        ? renderBarbers()
        : tab === "bookings"
          ? renderBookings()
          : tab === "discounts"
            ? renderDiscounts()
            : renderProfile();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.paper} />
      <View style={styles.topBar}>
        {tab === "book" || bookingSuccess || showNotifications ? (
          <HeaderIcon
            name="chevron-back"
            onPress={() => {
              if (showNotifications) {
                setShowNotifications(false);
              } else if (bookingSuccess) {
                setBookingSuccess(null);
                setTab("book");
              } else {
                setTab("home");
              }
            }}
          />
        ) : <View style={styles.headerIcon} />}
        <View style={styles.topCenter}>
          <Text style={[styles.topTitle, { color: roleAccent(role) }]}>{showNotifications ? "Bildirishnomalar" : bookingSuccess ? "Bron tasdiqlandi" : topTitleForRole(role)}</Text>
          {role === "customer" ? <Text style={styles.topLabel}>CLASSIC CUTS</Text> : null}
        </View>
        <HeaderIcon
          name={showNotifications ? "notifications" : "notifications-outline"}
          onPress={() => setShowNotifications((value) => !value)}
          badgeCount={showNotifications ? 0 : notificationItems.length}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={colors.cyan} />}
      >
        {busy ? <LoadingCard label="Amal bajarilmoqda..." /> : null}
        {content}
      </ScrollView>
      <AppModal
        visible={logoutModalOpen}
        title="Chiqmoqchimisiz?"
        subtitle="Tasdiqlasangiz, akkauntingizdan chiqasiz."
        onClose={() => setLogoutModalOpen(false)}
      >
        <View style={styles.modalActions}>
          <PrimaryButton label="Bekor qilish" tone="ghost" onPress={() => setLogoutModalOpen(false)} />
          <PrimaryButton
            label="Chiqish"
            tone="gold"
            onPress={() => {
              setLogoutModalOpen(false);
              logoutNow();
            }}
          />
        </View>
      </AppModal>
      <AppModal
        visible={barberModalOpen}
        title={editingBarberId ? "Barberni tahrirlash" : "Yangi barber qo'shish"}
        subtitle="Rasm, media, lokatsiya, ish vaqti va narxlarni bir joyda sozlang."
        onClose={() => {
          setBarberModalOpen(false);
          setEditingBarberId("");
          setBarberForm(defaultBarberForm());
        }}
      >
        <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.modalForm}>
            <Field label="Ism" value={barberForm.fullName} onChangeText={(value) => setBarberForm((current) => ({ ...current, fullName: value }))} placeholder="Barber ismi" />
            <Field label="Username" value={barberForm.username} onChangeText={(value) => setBarberForm((current) => ({ ...current, username: value }))} placeholder="username" />
            <Field label={editingBarberId ? "Yangi parol (ixtiyoriy)" : "Parol"} value={barberForm.password} onChangeText={(value) => setBarberForm((current) => ({ ...current, password: value }))} secureTextEntry placeholder="barber123" />
            <Field label="Mutaxassislik" value={barberForm.specialty} onChangeText={(value) => setBarberForm((current) => ({ ...current, specialty: value }))} placeholder="Fade master" />
            <View style={styles.uploadRow}>
              <PrimaryButton label={barberForm.photoUrl ? "Rasmni almashtirish" : "Rasm tanlash"} tone="ghost" onPress={() => pickAndUploadMedia("image", (url) => setBarberForm((current) => ({ ...current, photoUrl: url })))} loading={busy} />
              <PrimaryButton label={barberForm.mediaUrl ? "Mediani almashtirish" : "Video/Rasm tanlash"} tone="ghost" onPress={() => pickAndUploadMedia("media", (url) => setBarberForm((current) => ({ ...current, mediaUrl: url })))} loading={busy} />
            </View>
            {barberForm.photoUrl ? <Image source={{ uri: barberForm.photoUrl }} style={styles.settingsPhotoPreview} /> : null}
            {barberForm.mediaUrl ? <Text style={styles.uploadedFileText} numberOfLines={1}>Media yuklandi: {barberForm.mediaUrl}</Text> : null}
            <Field label="Bio" value={barberForm.bio} onChangeText={(value) => setBarberForm((current) => ({ ...current, bio: value }))} placeholder="Barber haqida qisqa ma'lumot" />
            <View style={styles.twoColumn}>
              <Field label="Tajriba" value={String(barberForm.yearsExp)} onChangeText={(value) => setBarberForm((current) => ({ ...current, yearsExp: toNumber(value, current.yearsExp) }))} keyboardType="numeric" />
              <Field label="Reyting" value={String(barberForm.rating)} onChangeText={(value) => setBarberForm((current) => ({ ...current, rating: toNumber(value, current.rating) }))} keyboardType="decimal-pad" />
            </View>
            <Field label="Manzil" value={barberForm.address} onChangeText={(value) => setBarberForm((current) => ({ ...current, address: value }))} placeholder="Salon manzili" />
            <PrimaryButton label="Lokatsiyani olish" tone="ghost" onPress={fillBarberLocation} loading={busy} />
            <View style={styles.twoColumn}>
              <Field label="Latitude" value={barberForm.latitude == null ? "" : String(barberForm.latitude)} onChangeText={(value) => setBarberForm((current) => ({ ...current, latitude: value ? Number(value) : null }))} keyboardType="decimal-pad" />
              <Field label="Longitude" value={barberForm.longitude == null ? "" : String(barberForm.longitude)} onChangeText={(value) => setBarberForm((current) => ({ ...current, longitude: value ? Number(value) : null }))} keyboardType="decimal-pad" />
            </View>
            <View style={styles.twoColumn}>
              <Field label="Ish boshlanishi" value={barberForm.workStartTime} onChangeText={(value) => setBarberForm((current) => ({ ...current, workStartTime: value }))} placeholder="09:00" />
              <Field label="Ish tugashi" value={barberForm.workEndTime} onChangeText={(value) => setBarberForm((current) => ({ ...current, workEndTime: value }))} placeholder="18:30" />
            </View>
            <View style={styles.priceGrid}>
              {([
                ["priceHaircut", "Soch"],
                ["priceFade", "Fade"],
                ["priceHairBeard", "Combo"],
                ["pricePremium", "Premium"],
                ["priceBeard", "Soqol"],
              ] as Array<[keyof BarberFormPayload, string]>).map(([key, label]) => (
                <Field key={key} label={label} value={String(barberForm[key] ?? "")} onChangeText={(value) => setBarberForm((current) => ({ ...current, [key]: toNumber(value, Number(current[key]) || 0) }))} keyboardType="numeric" />
              ))}
            </View>
            <View style={styles.modalActions}>
              <PrimaryButton
                label="Bekor"
                tone="ghost"
                onPress={() => {
                  setBarberModalOpen(false);
                  setEditingBarberId("");
                  setBarberForm(defaultBarberForm());
                }}
              />
              <PrimaryButton label={editingBarberId ? "Saqlash" : "Qo'shish"} onPress={saveBarberForm} loading={busy} />
            </View>
          </View>
        </ScrollView>
      </AppModal>
      {!bookingSuccess ? <View style={styles.bottomNav}>
        {visibleTabs.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => {
              setBookingSuccess(null);
              setShowNotifications(false);
              setTab(item.key);
            }}
            style={[styles.navItem, tab === item.key && styles.navItemActive]}
          >
            <Ionicons
              name={iconForTab(item.key)}
              size={21}
              color={tab === item.key ? colors.goldDark : "rgba(255,255,255,0.72)"}
            />
            <Text style={[styles.navText, tab === item.key && styles.navTextActive]}>{item.label}</Text>
          </Pressable>
        ))}
      </View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.paper,
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  authScroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.paper,
  },
  authRoleTabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  authRolePill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: colors.line,
    borderRadius: 9,
    borderWidth: 1,
    flex: 1,
    minHeight: 38,
    justifyContent: "center",
  },
  authRoleText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
  },
  authBrand: {
    alignItems: "center",
    marginBottom: 22,
  },
  logoMark: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.cyan,
    borderRadius: 28,
    borderWidth: 2,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  logoText: {
    color: colors.gold,
    fontSize: 36,
    fontWeight: "900",
  },
  appName: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 12,
  },
  appSub: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 5,
  },
  authCard: {
    backgroundColor: "rgba(16,19,24,0.94)",
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
    padding: 14,
    borderColor: colors.lineStrong,
    ...shadows.soft,
  },
  authTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  authCopy: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  authHero: {
    borderColor: colors.lineStrong,
    borderRadius: 12,
    borderWidth: 1,
    height: 430,
    justifyContent: "space-between",
    marginBottom: 14,
    overflow: "hidden",
    padding: 20,
    ...shadows.soft,
  },
  authHeroImage: {
    borderRadius: 12,
  },
  authHeroLogo: {
    alignItems: "center",
    gap: 3,
  },
  authHeroBrand: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0,
  },
  authHeroSub: {
    color: colors.goldDark,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0,
  },
  authHeroCopyWrap: {
    gap: 10,
  },
  authHeroTitle: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 31,
  },
  authHeroCopy: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    maxWidth: 230,
  },
  authHeroActions: {
    gap: 10,
  },
  authField: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.055)",
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 12,
  },
  authInput: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    minHeight: 48,
    padding: 0,
  },
  authDivider: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginTop: 2,
  },
  authDividerLine: {
    backgroundColor: colors.lineStrong,
    flex: 1,
    height: 1,
  },
  authDividerText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  socialRow: {
    flexDirection: "row",
    gap: 14,
    justifyContent: "center",
  },
  socialButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: colors.lineStrong,
    borderRadius: 999,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  authSwitch: {
    alignItems: "center",
    minHeight: 28,
    justifyContent: "center",
  },
  authSwitchText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  modalBackdrop: {
    backgroundColor: "rgba(0,0,0,0.72)",
    flex: 1,
    justifyContent: "flex-end",
    padding: 14,
  },
  modalCard: {
    backgroundColor: "rgba(16,19,24,0.98)",
    borderColor: colors.lineStrong,
    borderRadius: 18,
    borderWidth: 1,
    gap: 16,
    maxHeight: "88%",
    padding: 16,
    ...shadows.soft,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  modalSubtitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 4,
  },
  modalClose: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },
  modalScroll: {
    maxHeight: 620,
  },
  modalForm: {
    gap: 13,
    paddingBottom: 4,
  },
  telegramCard: {
    backgroundColor: "rgba(34,158,217,0.12)",
    borderColor: "rgba(34,158,217,0.24)",
    gap: 13,
  },
  telegramCardLinked: {
    backgroundColor: "rgba(74,222,128,0.11)",
    borderColor: "rgba(74,222,128,0.22)",
  },
  telegramIcon: {
    alignItems: "center",
    backgroundColor: "#229ed9",
    borderRadius: 16,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  telegramIconLinked: {
    backgroundColor: colors.green,
  },
  telegramQrPanel: {
    alignItems: "center",
    backgroundColor: "rgba(2,6,23,0.44)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 13,
    padding: 12,
  },
  telegramQrImage: {
    backgroundColor: "#fff",
    borderRadius: 14,
    height: 96,
    width: 96,
  },
  telegramQrTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  telegramQrText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 4,
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  grow: {
    flex: 1,
    minWidth: 0,
  },
  segment: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 18,
    flexDirection: "row",
    padding: 4,
  },
  segmentItem: {
    alignItems: "center",
    borderRadius: 14,
    flex: 1,
    minHeight: 42,
    justifyContent: "center",
  },
  segmentItemActive: {
    backgroundColor: colors.purple,
    ...shadows.soft,
  },
  segmentText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "800",
  },
  segmentTextActive: {
    color: "#fff",
  },
  errorText: {
    backgroundColor: "rgba(251,113,133,0.12)",
    borderColor: "rgba(251,113,133,0.22)",
    borderRadius: 14,
    borderWidth: 1,
    color: colors.red,
    fontSize: 13,
    fontWeight: "700",
    padding: 12,
  },
  topBar: {
    alignItems: "center",
    backgroundColor: colors.paper,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 10,
  },
  topCenter: {
    alignItems: "center",
    flex: 1,
    gap: 1,
  },
  headerIcon: {
    alignItems: "center",
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  headerBadge: {
    alignItems: "center",
    backgroundColor: colors.red,
    borderColor: colors.paper,
    borderRadius: 999,
    borderWidth: 2,
    height: 19,
    justifyContent: "center",
    position: "absolute",
    right: 3,
    top: 4,
    minWidth: 19,
  },
  headerBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
  },
  topLabel: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  topTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0,
  },
  scroll: {
    backgroundColor: colors.paper,
    paddingHorizontal: 16,
    paddingBottom: 106,
    paddingTop: 4,
  },
  stack: {
    gap: 14,
  },
  customerHero: {
    borderRadius: 12,
    height: 230,
    justifyContent: "flex-end",
    overflow: "hidden",
    padding: 18,
    ...shadows.soft,
  },
  customerHeroImage: {
    borderRadius: 12,
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.42)",
  },
  customerHeroContent: {
    gap: 12,
    maxWidth: 220,
  },
  heroBrand: {
    color: colors.goldDark,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
  },
  customerHeroTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 31,
  },
  sectionRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  panelSectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  sectionAction: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  tileStrip: {
    gap: 10,
    paddingRight: 16,
  },
  serviceTile: {
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 10,
    borderWidth: 1,
    gap: 7,
    minHeight: 104,
    padding: 12,
    width: 96,
  },
  serviceTileActive: {
    borderColor: colors.gold,
    backgroundColor: "rgba(215,170,85,0.1)",
  },
  serviceTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  servicePrice: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700",
  },
  barberStrip: {
    gap: 14,
    paddingRight: 16,
  },
  miniBarberCard: {
    alignItems: "center",
    gap: 6,
    width: 72,
  },
  miniBarberActive: {
    opacity: 1,
  },
  miniBarberName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  miniBarberRating: {
    color: colors.goldDark,
    fontSize: 12,
    fontWeight: "800",
  },
  salonCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  salonImage: {
    backgroundColor: colors.haze,
    borderRadius: 10,
    height: 70,
    width: 86,
  },
  mediaImage: {
    backgroundColor: colors.haze,
    borderColor: colors.line,
    borderRadius: 10,
    borderWidth: 1,
    height: 142,
    width: "100%",
  },
  mediaPreview: {
    alignItems: "center",
    backgroundColor: "rgba(215,170,85,0.1)",
    borderColor: "rgba(215,170,85,0.2)",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 82,
    padding: 12,
  },
  videoPreview: {
    backgroundColor: "rgba(215,170,85,0.12)",
  },
  videoPlay: {
    alignItems: "center",
    backgroundColor: colors.gold,
    borderRadius: 999,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  mediaTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  mediaSubtitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },
  distanceText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  bookingPanel: {
    backgroundColor: "rgba(15,18,22,0.96)",
    borderColor: colors.lineStrong,
    gap: 13,
  },
  bookingProfile: {
    alignItems: "center",
    flexDirection: "row",
    gap: 13,
  },
  serviceList: {
    borderColor: colors.line,
    borderRadius: 11,
    borderWidth: 1,
    overflow: "hidden",
  },
  serviceOption: {
    alignItems: "center",
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 11,
    minHeight: 62,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  serviceOptionActive: {
    backgroundColor: "rgba(215,170,85,0.08)",
  },
  serviceIconBox: {
    alignItems: "center",
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  serviceOptionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  serviceOptionPrice: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  checkDot: {
    alignItems: "center",
    borderColor: colors.lineStrong,
    borderRadius: 999,
    borderWidth: 1,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  checkDotActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  dateStrip: {
    gap: 10,
    paddingRight: 16,
  },
  datePill: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 9,
    borderWidth: 1,
    minHeight: 58,
    justifyContent: "center",
    paddingHorizontal: 13,
    width: 84,
  },
  datePillActive: {
    backgroundColor: "rgba(215,170,85,0.11)",
    borderColor: colors.gold,
  },
  dateKicker: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
  },
  dateKickerActive: {
    color: colors.goldDark,
  },
  dateLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 3,
  },
  dateLabelActive: {
    color: colors.goldDark,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  timeChip: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 42,
    justifyContent: "center",
    width: "22.8%",
  },
  timeChipActive: {
    backgroundColor: "rgba(215,170,85,0.1)",
    borderColor: colors.gold,
  },
  timeChipBooked: {
    opacity: 0.45,
  },
  timeChipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  timeChipTextActive: {
    color: colors.goldDark,
  },
  timeChipTextBooked: {
    color: colors.muted,
    fontSize: 10,
  },
  locationRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  totalBar: {
    alignItems: "center",
    borderTopColor: colors.line,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 14,
    justifyContent: "space-between",
    paddingTop: 12,
  },
  totalLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  totalValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 3,
  },
  successScreen: {
    alignItems: "center",
    gap: 18,
    paddingTop: 28,
  },
  successCheck: {
    alignItems: "center",
    backgroundColor: "#10b981",
    borderRadius: 999,
    height: 92,
    justifyContent: "center",
    width: 92,
    boxShadow: "0px 18px 32px rgba(16, 185, 129, 0.34)",
    elevation: 9,
  },
  successTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 28,
    maxWidth: 260,
    textAlign: "center",
  },
  successCard: {
    alignSelf: "stretch",
    gap: 12,
  },
  successDetailRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 44,
  },
  successDetailLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
  },
  successDetailValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 2,
  },
  profileHeroCard: {
    backgroundColor: "rgba(14,18,22,0.96)",
    borderColor: colors.lineStrong,
    gap: 14,
  },
  profileName: {
    color: colors.text,
    flexShrink: 1,
    fontSize: 19,
    fontWeight: "900",
  },
  onlineBadge: {
    backgroundColor: "rgba(74,222,128,0.14)",
    borderColor: "rgba(74,222,128,0.22)",
    borderRadius: 7,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  onlineText: {
    color: colors.green,
    fontSize: 11,
    fontWeight: "900",
  },
  panelCard: {
    backgroundColor: "rgba(20,24,29,0.96)",
    borderColor: colors.lineStrong,
    gap: 13,
  },
  panelCardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  countBadge: {
    backgroundColor: "rgba(215,170,85,0.13)",
    borderColor: "rgba(215,170,85,0.22)",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  countBadgeText: {
    color: colors.goldDark,
    fontSize: 12,
    fontWeight: "900",
  },
  miniBookingRow: {
    alignItems: "center",
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 52,
    paddingVertical: 8,
  },
  miniBookingTime: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
    width: 56,
  },
  miniBookingTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  miniBookingSub: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  smallStatus: {
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  smallStatusText: {
    fontSize: 10,
    fontWeight: "900",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    backgroundColor: "rgba(255,255,255,0.055)",
    borderColor: colors.line,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    minHeight: 86,
    justifyContent: "space-between",
    padding: 12,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  metricValue: {
    color: colors.text,
    fontSize: 25,
    fontWeight: "900",
    marginTop: 10,
  },
  revenueCard: {
    backgroundColor: "rgba(20,24,29,0.96)",
    borderColor: colors.lineStrong,
    gap: 10,
  },
  revenueText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  linkButton: {
    alignItems: "center",
    minHeight: 36,
    justifyContent: "center",
  },
  linkButtonText: {
    color: colors.goldDark,
    fontSize: 14,
    fontWeight: "900",
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickAction: {
    alignItems: "center",
    backgroundColor: "rgba(20,24,29,0.96)",
    borderColor: colors.line,
    borderRadius: 10,
    borderWidth: 1,
    gap: 9,
    minHeight: 96,
    justifyContent: "center",
    padding: 12,
    width: "47%",
    ...shadows.soft,
  },
  quickActionText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  notificationCard: {
    alignItems: "center",
    backgroundColor: "rgba(20,24,29,0.96)",
    borderColor: colors.line,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 76,
    padding: 13,
    ...shadows.soft,
  },
  notificationDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  notificationTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  notificationBody: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 3,
  },
  notificationSms: {
    alignItems: "center",
    backgroundColor: "rgba(215,170,85,0.1)",
    borderColor: "rgba(215,170,85,0.2)",
    borderRadius: 999,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  formCard: {
    gap: 13,
    borderColor: colors.lineStrong,
  },
  filterCard: {
    gap: 12,
  },
  profileCard: {
    gap: 12,
  },
  analyticsCard: {
    gap: 16,
  },
  profileSummary: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  hero: {
    gap: 16,
    overflow: "hidden",
    backgroundColor: colors.darkPanel,
    borderColor: colors.lineStrong,
  },
  heroKicker: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  heroTitle: {
    color: "#fff",
    fontSize: 31,
    fontWeight: "900",
    letterSpacing: 0,
  },
  heroCopy: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 15,
    lineHeight: 23,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  horizontalList: {
    gap: 10,
    paddingRight: 18,
  },
  twoColumn: {
    gap: 12,
  },
  priceGrid: {
    gap: 10,
  },
  barberCard: {
    gap: 14,
  },
  selectedCard: {
    borderColor: colors.cyan,
    borderWidth: 2,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.purple,
    justifyContent: "center",
  },
  avatarImage: {
    borderRadius: 18,
    backgroundColor: colors.haze,
  },
  avatarText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900",
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  muted: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },
  ratingPill: {
    backgroundColor: "rgba(246,200,95,0.14)",
    borderColor: "rgba(246,200,95,0.22)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ratingText: {
    color: colors.goldDark,
    fontSize: 13,
    fontWeight: "900",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  infoText: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 999,
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  addressText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
  },
  bookingCard: {
    gap: 14,
  },
  timeBox: {
    alignItems: "center",
    backgroundColor: colors.purple,
    borderColor: "rgba(103,232,249,0.22)",
    borderWidth: 1,
    borderRadius: 18,
    minWidth: 70,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  timeText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900",
  },
  dateText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  priceText: {
    color: colors.cyan,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "900",
  },
  noteText: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 14,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    padding: 12,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  discountCard: {
    gap: 12,
  },
  discountBadge: {
    alignItems: "center",
    backgroundColor: colors.gold,
    borderColor: "rgba(246,200,95,0.24)",
    borderWidth: 1,
    borderRadius: 20,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  discountPercent: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
    paddingVertical: 10,
  },
  profileAvatar: {
    alignItems: "center",
    backgroundColor: colors.purple,
    borderColor: "rgba(103,232,249,0.22)",
    borderRadius: 20,
    borderWidth: 1,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  profilePhotoPreview: {
    backgroundColor: colors.haze,
    borderColor: colors.lineStrong,
    borderRadius: 20,
    borderWidth: 1,
    height: 58,
    width: 58,
  },
  settingsPhotoPreview: {
    alignSelf: "center",
    backgroundColor: colors.haze,
    borderColor: colors.lineStrong,
    borderRadius: 18,
    borderWidth: 1,
    height: 96,
    width: 96,
  },
  uploadRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  uploadedFileText: {
    backgroundColor: "rgba(103,232,249,0.08)",
    borderColor: "rgba(103,232,249,0.18)",
    borderRadius: 10,
    borderWidth: 1,
    color: colors.cyan,
    fontSize: 12,
    fontWeight: "800",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  progressList: {
    gap: 12,
  },
  progressItem: {
    gap: 6,
  },
  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressTrack: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 999,
    height: 9,
    overflow: "hidden",
  },
  progressFill: {
    borderRadius: 999,
    height: 9,
  },
  progressValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  bottomNav: {
    backgroundColor: "rgba(5,7,9,0.98)",
    borderColor: colors.line,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: "row",
    gap: 8,
    left: 0,
    paddingBottom: Platform.OS === "ios" ? 24 : 14,
    paddingHorizontal: 12,
    paddingTop: 12,
    position: "absolute",
    right: 0,
  },
  navItem: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    gap: 4,
    minHeight: 50,
    justifyContent: "center",
  },
  navItemActive: {
    backgroundColor: "rgba(215,170,85,0.1)",
    borderColor: "rgba(215,170,85,0.18)",
    borderWidth: 1,
  },
  navText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
  },
  navTextActive: {
    color: "#fff",
  },
  pressed: {
    opacity: 0.82,
  },
});
