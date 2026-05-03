import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  createBarber,
  createBooking,
  createDiscount,
  deleteBarber,
  deleteBooking,
  deleteDiscount,
  getAvailabilityBookings,
  getBarbers,
  getBookings,
  getDiscounts,
  getMyBarberProfile,
  getServices,
  login,
  registerBarber,
  registerCustomer,
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
  BarberFormPayload,
  DiscountFormPayload,
} from "./src/types";
import { buildIsoFromLocal, buildTimeSlots, formatDateLabel, formatTime, getLocalDateInput } from "./src/utils/date";

type AuthMode = "login" | "register";
type TabKey = "home" | "book" | "barbers" | "bookings" | "discounts" | "profile";

const roleLabels: Record<ApiRole, string> = {
  customer: "Mijoz",
  barber: "Barber",
  admin: "Admin",
};

const defaultServices = ["Soch olish", "Fade", "Soch + soqol", "Premium"];

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

function defaultBarberForm(): BarberFormPayload {
  return {
    fullName: "",
    username: "",
    password: "",
    specialty: "Fade master",
    photoUrl: "",
    rating: 4.8,
    yearsExp: 1,
    bio: "",
    workStartTime: "09:00",
    workEndTime: "18:30",
    address: "",
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
    rating: barber.rating,
    yearsExp: barber.experience_years,
    bio: barber.bio ?? "",
    workStartTime: barber.work_start_time,
    workEndTime: barber.work_end_time,
    address: barber.address ?? "",
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

function toNumber(value: string, fallback = 0) {
  const parsed = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sameLocalDay(iso: string, dateInput: string) {
  return getLocalDateInput(new Date(iso)) === dateInput;
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
      <StatusBar barStyle="light-content" backgroundColor={colors.paper} />
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
            <Text style={styles.authCopy}>Rolingizni tanlang va panelga kiring.</Text>

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
          {booking.status === "pending" || booking.status === "accepted" ? (
            <PrimaryButton label="Rad etish" onPress={() => onReject?.(booking)} tone="ghost" />
          ) : null}
          {role === "admin" ? <PrimaryButton label="Ochirish" onPress={() => onDelete?.(booking)} tone="ghost" /> : null}
        </View>
      ) : role === "admin" ? (
        <View style={styles.actionRow}>
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
  const [bookingFilter, setBookingFilter] = useState<ApiBookingStatus | "all">("all");
  const [searchText, setSearchText] = useState("");

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
        const [bookingItems, discountItems, profile] = await Promise.all([
          getBookings(session.accessToken),
          getDiscounts(session.accessToken).catch(() => []),
          session.user.role === "barber"
            ? getMyBarberProfile(session.accessToken).catch(() => null)
            : Promise.resolve(null),
        ]);
        setBookings(bookingItems);
        setDiscounts(discountItems);
        setBarberProfile(profile);
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

  async function submitBooking() {
    if (!session || !selectedBarber) return;
    if (bookedSlots.has(bookingTime)) {
      Alert.alert("Vaqt band", "Bu vaqtda barber band. Boshqa vaqt tanlang.");
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
      setNote("");
      setAdminCustomerName("");
      setAdminCustomerPhone("");
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

  async function handleDeleteBooking(booking: ApiBooking) {
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
      await loadData();
      Alert.alert("Tayyor", "Barber malumoti saqlandi.");
    } catch (error) {
      Alert.alert("Saqlanmadi", error instanceof Error ? error.message : "Qayta urinib koring.");
    } finally {
      setBusy(false);
    }
  }

  async function removeBarber(barber: ApiBarber) {
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

  if (!session) {
    return (
      <AuthScreen
        onAuthenticated={(nextSession) => {
          loadedOnceRef.current = false;
          setSession(nextSession);
        }}
      />
    );
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
        <Stat label={role === "admin" ? "Barber" : "Bugun"} value={role === "admin" ? barbers.length : todayBookings.length} tone="gold" />
        <Stat label={role === "admin" ? "Mijoz" : "Faol"} value={role === "admin" ? uniqueClients : upcomingBookings.length} tone="green" />
        <Stat label={role === "admin" ? "Daromad" : "Tugagan"} value={role === "admin" ? `${Math.round(revenue / 1000)}k` : completedToday} />
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
          <Pill
            key={slot}
            label={bookedSlots.has(slot) ? `${slot} band` : slot}
            selected={bookingTime === slot}
            tone={bookedSlots.has(slot) ? "dark" : "light"}
            onPress={() => {
              if (!bookedSlots.has(slot)) {
                setBookingTime(slot);
              }
            }}
          />
        ))}
      </ScrollView>
      {role === "admin" ? (
        <>
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
        </>
      ) : null}
      <Field label="Izoh" value={note} onChangeText={setNote} placeholder="Masalan, fade qisqaroq" />
      {selectedBarber ? (
        <BarberCard barber={selectedBarber} service={selectedService} selected />
      ) : (
        <Text style={styles.muted}>Hali barber topilmadi.</Text>
      )}
      <PrimaryButton
        label={role === "admin" ? "Mijoz uchun bron qilish" : "Bron qilish"}
        onPress={submitBooking}
        loading={busy}
        disabled={!selectedBarber || bookedSlots.has(bookingTime)}
      />
    </Card>
  );

  const renderHome = () => (
    <View style={styles.stack}>
      {renderHero()}
      {initialLoading ? <LoadingCard label="Ma'lumotlar yuklanmoqda..." /> : null}
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
      <SectionTitle eyebrow={role === "admin" ? "Admin boshqaruv" : "Jamoa"} title={role === "admin" ? "Barber panel" : "Barberlar"} />
      {initialLoading ? <LoadingCard label="Barberlar yuklanmoqda..." /> : null}
      {role === "admin" ? (
        <Card style={styles.formCard}>
          <Text style={styles.cardTitle}>{editingBarberId ? "Barberni tahrirlash" : "Yangi barber qo'shish"}</Text>
          <Field
            label="Ism"
            value={barberForm.fullName}
            onChangeText={(value) => setBarberForm((current) => ({ ...current, fullName: value }))}
            placeholder="Barber ismi"
          />
          <Field
            label="Username"
            value={barberForm.username}
            onChangeText={(value) => setBarberForm((current) => ({ ...current, username: value }))}
            placeholder="username"
          />
          <Field
            label={editingBarberId ? "Yangi parol (ixtiyoriy)" : "Parol"}
            value={barberForm.password}
            onChangeText={(value) => setBarberForm((current) => ({ ...current, password: value }))}
            secureTextEntry
            placeholder="barber123"
          />
          <Field
            label="Mutaxassislik"
            value={barberForm.specialty}
            onChangeText={(value) => setBarberForm((current) => ({ ...current, specialty: value }))}
            placeholder="Fade master"
          />
          <View style={styles.twoColumn}>
            <Field
              label="Tajriba"
              value={String(barberForm.yearsExp)}
              onChangeText={(value) => setBarberForm((current) => ({ ...current, yearsExp: toNumber(value, current.yearsExp) }))}
              keyboardType="numeric"
            />
            <Field
              label="Reyting"
              value={String(barberForm.rating)}
              onChangeText={(value) => setBarberForm((current) => ({ ...current, rating: toNumber(value, current.rating) }))}
              keyboardType="decimal-pad"
            />
          </View>
          <Field
            label="Manzil"
            value={barberForm.address}
            onChangeText={(value) => setBarberForm((current) => ({ ...current, address: value }))}
            placeholder="Salon manzili"
          />
          <View style={styles.twoColumn}>
            <Field
              label="Ish boshlanishi"
              value={barberForm.workStartTime}
              onChangeText={(value) => setBarberForm((current) => ({ ...current, workStartTime: value }))}
              placeholder="09:00"
            />
            <Field
              label="Ish tugashi"
              value={barberForm.workEndTime}
              onChangeText={(value) => setBarberForm((current) => ({ ...current, workEndTime: value }))}
              placeholder="18:30"
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
          <View style={styles.actionRow}>
            <PrimaryButton label={editingBarberId ? "Saqlash" : "Qo'shish"} onPress={saveBarberForm} loading={busy} />
            {editingBarberId ? (
              <PrimaryButton
                label="Bekor"
                tone="ghost"
                onPress={() => {
                  setEditingBarberId("");
                  setBarberForm(defaultBarberForm());
                }}
              />
            ) : null}
          </View>
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
          <View style={styles.profileAvatar}>
            <Text style={styles.avatarText}>{initials(session.user.fullName)}</Text>
          </View>
          <View style={styles.grow}>
            <Text style={styles.cardTitle}>{session.user.fullName}</Text>
            <Text style={styles.muted}>{session.user.username ?? session.user.phone ?? roleLabels[role]}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{roleLabels[role]}</Text>
          </View>
        </View>
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
      </Card>
    </View>
  );

  const content = tab === "home"
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
            setBarberProfile(null);
            setBookingFilter("all");
            setSearchText("");
            loadedOnceRef.current = false;
            setTab("home");
          }}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={colors.cyan} />}
      >
        {busy ? <LoadingCard label="Amal bajarilmoqda..." /> : null}
        {content}
      </ScrollView>
      <View style={styles.bottomNav}>
        {visibleTabs.map((item) => (
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
    backgroundColor: colors.paper,
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
    gap: 14,
    borderColor: colors.lineStrong,
  },
  authTitle: {
    color: colors.text,
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
    backgroundColor: "rgba(5,5,10,0.94)",
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 8,
  },
  topLabel: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  topTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  scroll: {
    backgroundColor: colors.paper,
    paddingHorizontal: 18,
    paddingBottom: 104,
    paddingTop: 8,
  },
  stack: {
    gap: 14,
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
    backgroundColor: "rgba(9,10,20,0.96)",
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
    backgroundColor: colors.purple,
    borderColor: "rgba(103,232,249,0.22)",
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
