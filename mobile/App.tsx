import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  createBooking,
  getBarbers,
  getBookings,
  getDiscounts,
  getServices,
  login,
  registerBarber,
  registerCustomer,
  updateBookingStatus,
} from "./src/api/client";
import { Card, Field, Pill, PrimaryButton, SectionTitle, Stat } from "./src/components/ui";
import { colors, shadows } from "./src/theme/colors";
import { ApiBarber, ApiBooking, ApiBookingStatus, ApiDiscount, ApiRole, AuthSession } from "./src/types";
import { buildIsoFromLocal, buildTimeSlots, formatDateLabel, formatTime, getLocalDateInput } from "./src/utils/date";

type AuthMode = "login" | "register";
type TabKey = "home" | "barbers" | "bookings" | "discounts";

const roleLabels: Record<ApiRole, string> = {
  customer: "Mijoz",
  barber: "Barber",
  admin: "Admin",
};

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "home", label: "Bosh" },
  { key: "barbers", label: "Barberlar" },
  { key: "bookings", label: "Navbatlar" },
  { key: "discounts", label: "Skidkalar" },
];
const defaultServices = ["Soch olish", "Fade", "Soch + soqol", "Premium"];

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

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "BB";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function nextStatus(status: ApiBookingStatus): { status: ApiBookingStatus; label: string } | null {
  if (status === "pending") return { status: "accepted", label: "Qabul qilish" };
  if (status === "accepted") return { status: "in_service", label: "Boshlash" };
  if (status === "in_service") return { status: "completed", label: "Tugatish" };
  return null;
}

function priceForService(barber: ApiBarber, service: string) {
  const lowered = service.toLowerCase();
  if (lowered.includes("fade")) return barber.price_fade;
  if (lowered.includes("premium")) return barber.price_premium;
  if (lowered.includes("soqol") || lowered.includes("beard")) return barber.price_beard;
  if (lowered.includes("combo") || lowered.includes("hair beard")) return barber.price_hair_beard;
  return barber.price_haircut;
}

function AuthScreen({ onAuthenticated }: { onAuthenticated: (session: AuthSession) => void }) {
  const [role, setRole] = useState<ApiRole>("customer");
  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canRegister = role !== "admin";
  const identityLabel = role === "customer" ? "Telefon raqam" : "Username";

  async function submit() {
    setError("");
    setLoading(true);
    try {
      if (mode === "register" && role === "customer") {
        onAuthenticated(await registerCustomer(fullName, identity, password));
      } else if (mode === "register" && role === "barber") {
        onAuthenticated(await registerBarber({ fullName, specialty, username: identity, password }));
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
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.authBrand}>
            <View style={styles.logoMark}>
              <Text style={styles.logoText}>B</Text>
            </View>
            <Text style={styles.appName}>Barber Mobile</Text>
            <Text style={styles.appSub}>Navbat, barber va mijozlar bir joyda.</Text>
          </View>

          <Card style={styles.authCard}>
            <Text style={styles.authTitle}>Hisobga kirish</Text>
            <Text style={styles.authCopy}>Backend shu mavjud Render API orqali ishlaydi.</Text>

            <View style={styles.rowWrap}>
              {(["customer", "barber", "admin"] as ApiRole[]).map((item) => (
                <Pill
                  key={item}
                  label={roleLabels[item]}
                  selected={role === item}
                  onPress={() => {
                    setRole(item);
                    setMode("login");
                    setError("");
                  }}
                />
              ))}
            </View>

            {canRegister ? (
              <View style={styles.segment}>
                {(["login", "register"] as AuthMode[]).map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => setMode(item)}
                    style={[styles.segmentItem, mode === item && styles.segmentItemActive]}
                  >
                    <Text style={[styles.segmentText, mode === item && styles.segmentTextActive]}>
                      {item === "login" ? "Kirish" : "Royxatdan otish"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {mode === "register" ? (
              <Field label="Toliq ism" value={fullName} onChangeText={setFullName} placeholder="Jamshid Jalolov" />
            ) : null}
            {mode === "register" && role === "barber" ? (
              <Field label="Mutaxassislik" value={specialty} onChangeText={setSpecialty} placeholder="Fade master" />
            ) : null}
            <Field
              label={identityLabel}
              value={identity}
              onChangeText={setIdentity}
              placeholder={role === "customer" ? "998901234567" : "username"}
              keyboardType={role === "customer" ? "phone-pad" : "default"}
            />
            <Field label="Parol" value={password} onChangeText={setPassword} secureTextEntry placeholder="Parol" />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <PrimaryButton
              label={mode === "register" ? "Hisob yaratish" : "Kirish"}
              onPress={submit}
              loading={loading}
              disabled={!identity || !password || (mode === "register" && !fullName)}
            />
          </Card>
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

function BarberCard({
  barber,
  selected,
  service,
  onPress,
}: {
  barber: ApiBarber;
  selected?: boolean;
  service?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <Card style={[styles.barberCard, selected && styles.selectedCard]}>
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
      </Card>
    </Pressable>
  );
}

function BookingCard({
  booking,
  role,
  onAdvance,
  onReject,
}: {
  booking: ApiBooking;
  role: ApiRole;
  onAdvance?: (booking: ApiBooking) => void;
  onReject?: (booking: ApiBooking) => void;
}) {
  const action = nextStatus(booking.status);
  return (
    <Card style={styles.bookingCard}>
      <View style={styles.row}>
        <View style={styles.timeBox}>
          <Text style={styles.timeText}>{formatTime(booking.scheduled_for)}</Text>
          <Text style={styles.dateText}>{formatDateLabel(booking.scheduled_for)}</Text>
        </View>
        <View style={styles.grow}>
          <Text style={styles.cardTitle}>{role === "barber" ? booking.customer_name : booking.barber_name}</Text>
          <Text style={styles.muted}>{booking.service_name}</Text>
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
          {booking.status === "pending" || booking.status === "accepted" ? (
            <PrimaryButton label="Rad etish" onPress={() => onReject?.(booking)} tone="ghost" />
          ) : null}
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
  const [discounts, setDiscounts] = useState<ApiDiscount[]>([]);
  const [services, setServices] = useState<string[]>(defaultServices);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selectedBarberId, setSelectedBarberId] = useState("");
  const [selectedService, setSelectedService] = useState("Soch olish");
  const [bookingDate, setBookingDate] = useState(getLocalDateInput());
  const [bookingTime, setBookingTime] = useState("10:00");
  const [note, setNote] = useState("");

  const role = session?.user.role ?? "customer";
  const selectedBarber = barbers.find((item) => item.id === selectedBarberId) ?? barbers[0];

  const upcomingBookings = useMemo(
    () => [...bookings].filter((item) => item.status !== "completed" && item.status !== "rejected"),
    [bookings],
  );
  const completedToday = useMemo(() => bookings.filter((item) => item.status === "completed").length, [bookings]);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [barberItems, serviceOptions] = await Promise.all([getBarbers(), getServices()]);
      setBarbers(barberItems);
      setServices(serviceOptions.items.length ? serviceOptions.items : defaultServices);
      if (!selectedBarberId && barberItems[0]) {
        setSelectedBarberId(barberItems[0].id);
      }
      if (session) {
        const [bookingItems, discountItems] = await Promise.all([
          getBookings(session.accessToken),
          getDiscounts(session.accessToken).catch(() => []),
        ]);
        setBookings(bookingItems);
        setDiscounts(discountItems);
      }
    } catch (error) {
      Alert.alert("Xato", error instanceof Error ? error.message : "Malumot yuklanmadi.");
    } finally {
      setRefreshing(false);
    }
  }, [selectedBarberId, session]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function submitBooking() {
    if (!session || !selectedBarber) return;
    const scheduledFor = buildIsoFromLocal(bookingDate, bookingTime);
    if (!scheduledFor) {
      Alert.alert("Vaqt xato", "Sana YYYY-MM-DD va vaqt HH:MM formatida bolsin.");
      return;
    }
    setBusy(true);
    try {
      await createBooking(session.accessToken, {
        barberId: selectedBarber.id,
        customerName: session.user.fullName,
        customerPhone: session.user.phone ?? "",
        serviceName: selectedService,
        scheduledFor,
        note,
      });
      setNote("");
      Alert.alert("Bron yuborildi", "Barber tasdiqlashini kuting.");
      await loadData();
      setTab("bookings");
    } catch (error) {
      Alert.alert("Bron yaratilmadi", error instanceof Error ? error.message : "Qayta urinib koring.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAdvance(booking: ApiBooking) {
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

  if (!session) {
    return <AuthScreen onAuthenticated={setSession} />;
  }

  const renderHero = () => (
    <Card dark style={styles.hero}>
      <Text style={styles.heroKicker}>{roleLabels[role]} panel</Text>
      <Text style={styles.heroTitle}>Salom, {session.user.fullName.split(" ")[0]}</Text>
      <Text style={styles.heroCopy}>
        {role === "customer"
          ? "Bugungi qulay vaqtni tanlang va navbatni bir necha soniyada bron qiling."
          : role === "barber"
            ? "Navbatlarni boshqaring, statuslarni tez yangilang va mijoz oqimini kuzating."
            : "Barberlar, navbatlar va kunlik natijalarni mobil paneldan kuzating."}
      </Text>
      <View style={styles.statsRow}>
        <Stat label="Barber" value={barbers.length} tone="gold" />
        <Stat label="Faol navbat" value={upcomingBookings.length} tone="green" />
        <Stat label="Tugagan" value={completedToday} />
      </View>
    </Card>
  );

  const renderBookingComposer = () => (
    <Card style={styles.stack}>
      <SectionTitle eyebrow="Tez bron" title="Navbat yaratish" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
        {services.map((service) => (
          <Pill
            key={service}
            label={service}
            selected={selectedService === service}
            onPress={() => setSelectedService(service)}
          />
        ))}
      </ScrollView>
      <View style={styles.twoColumn}>
        <Field label="Sana" value={bookingDate} onChangeText={setBookingDate} placeholder="2026-05-01" />
        <Field label="Vaqt" value={bookingTime} onChangeText={setBookingTime} placeholder="10:00" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
        {buildTimeSlots(9, 18).map((slot) => (
          <Pill key={slot} label={slot} selected={bookingTime === slot} onPress={() => setBookingTime(slot)} />
        ))}
      </ScrollView>
      <Field label="Izoh" value={note} onChangeText={setNote} placeholder="Masalan, fade qisqaroq" />
      {selectedBarber ? (
        <BarberCard barber={selectedBarber} service={selectedService} selected />
      ) : (
        <Text style={styles.muted}>Hali barber topilmadi.</Text>
      )}
      <PrimaryButton label="Bron qilish" onPress={submitBooking} loading={busy} disabled={!selectedBarber} />
    </Card>
  );

  const renderHome = () => (
    <View style={styles.stack}>
      {renderHero()}
      {role === "customer" ? renderBookingComposer() : null}
      <SectionTitle eyebrow="Yaqin navbatlar" title={role === "customer" ? "Mening navbatlarim" : "Bugungi ishlar"} />
      {bookings.slice(0, 4).map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          role={role}
          onAdvance={handleAdvance}
          onReject={handleReject}
        />
      ))}
      {bookings.length === 0 ? <Text style={styles.emptyText}>Hozircha navbat yoq.</Text> : null}
    </View>
  );

  const renderBarbers = () => (
    <View style={styles.stack}>
      <SectionTitle eyebrow="Jamoa" title="Barberlar" />
      {barbers.map((barber) => (
        <BarberCard
          key={barber.id}
          barber={barber}
          selected={selectedBarberId === barber.id}
          service={selectedService}
          onPress={() => {
            setSelectedBarberId(barber.id);
            if (role === "customer") {
              setTab("home");
            }
          }}
        />
      ))}
    </View>
  );

  const renderBookings = () => (
    <View style={styles.stack}>
      <SectionTitle eyebrow="Operatsiya" title="Navbatlar" />
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          role={role}
          onAdvance={handleAdvance}
          onReject={handleReject}
        />
      ))}
      {bookings.length === 0 ? <Text style={styles.emptyText}>Navbatlar topilmadi.</Text> : null}
    </View>
  );

  const renderDiscounts = () => (
    <View style={styles.stack}>
      <SectionTitle eyebrow="Takliflar" title="Skidkalar" />
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
        </Card>
      ))}
      {discounts.length === 0 ? <Text style={styles.emptyText}>Faol skidka topilmadi.</Text> : null}
    </View>
  );

  const content = tab === "home"
    ? renderHome()
    : tab === "barbers"
      ? renderBarbers()
      : tab === "bookings"
        ? renderBookings()
        : renderDiscounts();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topLabel}>{roleLabels[role]}</Text>
          <Text style={styles.topTitle}>Barber Mobile</Text>
        </View>
        <PrimaryButton
          label="Chiqish"
          tone="ghost"
          onPress={() => {
            setSession(null);
            setBookings([]);
            setDiscounts([]);
            setTab("home");
          }}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={colors.gold} />}
      >
        {content}
      </ScrollView>
      <View style={styles.bottomNav}>
        {tabs.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => setTab(item.key)}
            style={[styles.navItem, tab === item.key && styles.navItemActive]}
          >
            <Text style={[styles.navText, tab === item.key && styles.navTextActive]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
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
  },
  authBrand: {
    alignItems: "center",
    marginBottom: 22,
  },
  logoMark: {
    alignItems: "center",
    backgroundColor: colors.ink,
    borderColor: colors.gold,
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
    color: colors.ink,
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
    gap: 14,
  },
  authTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "900",
  },
  authCopy: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
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
    backgroundColor: colors.haze,
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
    backgroundColor: colors.surface,
    ...shadows.soft,
  },
  segmentText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "800",
  },
  segmentTextActive: {
    color: colors.ink,
  },
  errorText: {
    backgroundColor: "#fff0ee",
    borderColor: "#f3ccc6",
    borderRadius: 14,
    borderWidth: 1,
    color: colors.red,
    fontSize: 13,
    fontWeight: "700",
    padding: 12,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 8,
  },
  topLabel: {
    color: colors.goldDark,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  topTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "900",
  },
  scroll: {
    paddingHorizontal: 18,
    paddingBottom: 104,
    paddingTop: 8,
  },
  stack: {
    gap: 14,
  },
  hero: {
    gap: 16,
    overflow: "hidden",
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
  barberCard: {
    gap: 14,
  },
  selectedCard: {
    borderColor: colors.gold,
    borderWidth: 2,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.ink,
    justifyContent: "center",
  },
  avatarImage: {
    borderRadius: 18,
    backgroundColor: colors.haze,
  },
  avatarText: {
    color: colors.gold,
    fontSize: 17,
    fontWeight: "900",
  },
  cardTitle: {
    color: colors.ink,
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
    backgroundColor: "#fff4d6",
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
    backgroundColor: colors.haze,
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
    backgroundColor: colors.ink,
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
    color: colors.ink,
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
    backgroundColor: colors.paper,
    borderRadius: 14,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    padding: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  discountCard: {
    gap: 12,
  },
  discountBadge: {
    alignItems: "center",
    backgroundColor: colors.gold,
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
  bottomNav: {
    backgroundColor: "rgba(255,250,243,0.96)",
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
    borderRadius: 16,
    flex: 1,
    minHeight: 46,
    justifyContent: "center",
  },
  navItemActive: {
    backgroundColor: colors.ink,
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
