import { Alert, Box, CircularProgress, Snackbar, Stack, Typography } from "@mui/material";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  createDiscount,
  createBarber,
  createBooking,
  deleteDiscount,
  deleteBarber,
  deleteBooking,
  getAvailabilityBookings,
  getBarbers,
  getBookings,
  getDiscounts,
  getMe,
  getServiceOptions,
  getTelegramMeta,
  loginAdmin,
  loginBarber,
  loginCustomer,
  registerCustomer,
  uploadMedia,
  updateBarber,
  updateMyBarberSettings,
  updateBookingStatus,
} from "./lib/api";
import {
  buildBookingsByBarber,
  buildDashboardMetrics,
  buildPerformanceItems,
  buildRecentBookings,
  mapApiAvailabilityToItem,
  mapApiBarberToProfile,
  mapApiBookingToItem,
  mapApiDiscountToItem,
  mapApiUserToAuthUser,
  mapAuthUserToAdmin,
  mapAuthUserToCustomer,
  mapUiStatusToApi,
  normalizePhone,
} from "./lib/mappers";
import { createRealtimeSocket } from "./lib/realtime";
import {
  readStoredBarberPasswords,
  readStoredSession,
  removeStoredBarberPassword,
  writeStoredBarberPassword,
  writeStoredSession,
} from "./lib/session";
import { AdminLayout } from "./layouts/AdminLayout";
import { AdminSettingsPage } from "./pages/AdminSettingsPage";
import { BarbersPage } from "./pages/BarbersPage";
import { BarberPanelPage } from "./pages/BarberPanelPage";
import { BookingsPage } from "./pages/BookingsPage";
import { CustomerBookingPage } from "./pages/CustomerBookingPage";
import { CustomerRegisterPage } from "./pages/CustomerRegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DiscountsPage } from "./pages/DiscountsPage";
import { UnifiedLoginPage } from "./pages/UnifiedLoginPage";
import {
  AdminUser,
  AppMode,
  AuthScreen,
  AuthSession,
  BarberFormPayload,
  BarberProfile,
  BarberSettingsPayload,
  BookingItem,
  BookingStatus,
  CustomerAccount,
  DiscountFormPayload,
  DiscountItem,
  PageKey,
} from "./types";

const DEFAULT_TELEGRAM_BOT_USERNAME = "Barber_shop_001_bot";

function isTerminalStatus(status: BookingStatus) {
  return status === "Tugallandi" || status === "Rad etildi";
}

function findTrackedBookingId(items: BookingItem[], customer: CustomerAccount) {
  const customerBookings = [...items]
    .filter(
      (item) =>
        item.customerId === customer.id ||
        normalizePhone(item.phone) === normalizePhone(customer.phone),
    )
    .sort((left, right) =>
      `${right.date}${right.time}`.localeCompare(`${left.date}${left.time}`),
    );

  return customerBookings.find((item) => !isTerminalStatus(item.status))?.id ?? null;
}

function mergeBookings(primary: BookingItem[], secondary: BookingItem[]) {
  const map = new Map<string, BookingItem>();
  [...primary, ...secondary].forEach((item) => {
    map.set(item.id, item);
  });
  return [...map.values()];
}

function readAuthScreenFromHash(): AuthScreen {
  if (typeof window === "undefined") {
    return "customer-login";
  }

  const hash = window.location.hash.toLowerCase();

  if (hash === "#register" || hash === "#customer-register") {
    return "customer-register";
  }

  if (hash === "#barber-login") {
    return "barber-login";
  }

  if (hash === "#admin-login") {
    return "admin-login";
  }

  return "customer-login";
}

function writeAuthHash(screen: AuthScreen) {
  if (typeof window === "undefined") {
    return;
  }

  const nextHash =
    screen === "customer-login"
      ? ""
      : screen === "customer-register"
        ? "#register"
        : `#${screen}`;
  const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;

  window.history.replaceState(null, "", nextUrl);
}

function LoadingScreen({ label }: { label: string }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle at 18% 10%, rgba(139,92,246,0.28), transparent 32%), radial-gradient(circle at 84% 12%, rgba(34,211,238,0.16), transparent 28%), #05050a",
        px: 2,
      }}
    >
      <Stack
        spacing={1.4}
        alignItems="center"
        sx={{
          p: 3,
          borderRadius: "28px",
          background:
            "linear-gradient(180deg, rgba(18,18,31,0.88) 0%, rgba(10,11,22,0.78) 100%)",
          border: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: "0 24px 70px rgba(0,0,0,0.38)",
          backdropFilter: "blur(18px)",
        }}
      >
        <CircularProgress />
        <Typography variant="body1">{label}</Typography>
      </Stack>
    </Box>
  );
}

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [appMode, setAppMode] = useState<AppMode>("auth");
  const [authScreen, setAuthScreen] = useState<AuthScreen>(() => readAuthScreenFromHash());
  const [activePage, setActivePage] = useState<PageKey>("dashboard");
  const [barbers, setBarbers] = useState<BarberProfile[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);
  const [availabilityBookings, setAvailabilityBookings] = useState<BookingItem[]>([]);
  const [serviceOptions, setServiceOptions] = useState<string[]>([]);
  const [latestBookingId, setLatestBookingId] = useState<string | null>(null);
  const [trackedCustomerBookingId, setTrackedCustomerBookingId] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [telegramBotUsername, setTelegramBotUsername] = useState<string | undefined>(DEFAULT_TELEGRAM_BOT_USERNAME);
  const [reminderMinutes, setReminderMinutes] = useState(10);
  const [realtimeNotice, setRealtimeNotice] = useState<{
    message: string;
    tone: "success" | "info" | "warning";
  } | null>(null);

  const currentAdmin: AdminUser | null = useMemo(() => {
    if (session?.user.role !== "admin") {
      return null;
    }

    return mapAuthUserToAdmin(session.user);
  }, [session]);

  const currentCustomer: CustomerAccount | null = useMemo(() => {
    if (session?.user.role !== "customer") {
      return null;
    }

    return mapAuthUserToCustomer(session.user);
  }, [session]);

  const currentBarber: BarberProfile | null = useMemo(() => {
    if (session?.user.role !== "barber") {
      return null;
    }

    return (
      barbers.find(
        (item) => item.userId === session.user.id || item.id === session.user.barberProfileId,
      ) ?? null
    );
  }, [barbers, session]);

  const syncSessionData = useCallback(
    async (activeSession: AuthSession, quiet = false) => {
      if (!quiet) {
        setSyncing(true);
      }

      try {
        const storedBarberPasswords = readStoredBarberPasswords();
        const commonRequests = [
          getBarbers(activeSession.accessToken),
          getServiceOptions(),
          getDiscounts(activeSession.accessToken),
        ] as const;

        if (activeSession.user.role === "customer") {
          const [apiBarbers, apiServices, apiDiscounts, apiBookings, apiAvailability] = await Promise.all([
            ...commonRequests,
            getBookings(activeSession.accessToken),
            getAvailabilityBookings(),
          ]);

          const mappedBarbers = apiBarbers.map((item) => ({
            ...mapApiBarberToProfile(item),
            password: storedBarberPasswords[item.id],
          }));
          const mappedDiscounts = apiDiscounts.map(mapApiDiscountToItem);
          const mappedBookings = apiBookings.map(mapApiBookingToItem);
          const mappedAvailability = apiAvailability.map(mapApiAvailabilityToItem);
          const customer = mapAuthUserToCustomer(activeSession.user);

          setBarbers(mappedBarbers);
          setServiceOptions(apiServices.items);
          setDiscounts(mappedDiscounts);
          setBookings(mappedBookings);
          setAvailabilityBookings(mergeBookings(mappedAvailability, mappedBookings));
          setTrackedCustomerBookingId((current) => {
            const currentItem = current ? mappedBookings.find((item) => item.id === current) : null;
            if (currentItem && !isTerminalStatus(currentItem.status)) {
              return current;
            }
            return findTrackedBookingId(mappedBookings, customer);
          });
          return;
        }

        const [apiBarbers, apiServices, apiDiscounts, apiBookings] = await Promise.all([
          ...commonRequests,
          getBookings(activeSession.accessToken),
        ]);

        const mappedBarbers = apiBarbers.map((item) => ({
          ...mapApiBarberToProfile(item),
          password: storedBarberPasswords[item.id],
        }));
        const mappedDiscounts = apiDiscounts.map(mapApiDiscountToItem);
        const mappedBookings = apiBookings.map(mapApiBookingToItem);

        setBarbers(mappedBarbers);
        setServiceOptions(apiServices.items);
        setDiscounts(mappedDiscounts);
        setBookings(mappedBookings);
        setAvailabilityBookings(mappedBookings);
      } finally {
        if (!quiet) {
          setSyncing(false);
        }
      }
    },
    [],
  );

  const switchToAuth = useCallback((screen: AuthScreen) => {
    writeStoredSession(null);
    writeAuthHash(screen);
    setSession(null);
    setAppMode("auth");
    setAuthScreen(screen);
    setDiscounts([]);
    setTrackedCustomerBookingId(null);
    setLatestBookingId(null);
    setGlobalError("");
  }, []);

  const applySession = useCallback(
    (nextSession: AuthSession, remember = true) => {
      writeStoredSession(nextSession, remember);
      writeAuthHash("customer-login");
      setSession(nextSession);
      setAppMode(nextSession.user.role === "customer" ? "customer" : nextSession.user.role);
      setAuthScreen("customer-login");
      setGlobalError("");

      void syncSessionData(nextSession).catch((error) => {
        setGlobalError(
          error instanceof Error
            ? error.message
            : "Backend ma'lumotlarini yuklab bo'lmadi.",
        );
      });
    },
    [syncSessionData],
  );

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const stored = readStoredSession();
      if (!stored) {
        if (active) {
          setBooting(false);
        }
        return;
      }

      try {
        const me = await getMe(stored.accessToken);
        const nextSession: AuthSession = {
          accessToken: stored.accessToken,
          user: mapApiUserToAuthUser(me),
        };

        if (!active) {
          return;
        }

        setSession(nextSession);
        setAppMode(nextSession.user.role === "customer" ? "customer" : nextSession.user.role);
        writeAuthHash("customer-login");
        await syncSessionData(nextSession);
      } catch {
        writeStoredSession(null);
        if (active) {
          setSession(null);
          setAppMode("auth");
          setAuthScreen(readAuthScreenFromHash());
        }
      } finally {
        if (active) {
          setBooting(false);
        }
      }
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, [syncSessionData]);

  useEffect(() => {
    let active = true;

    const loadTelegramMeta = async () => {
      try {
        const meta = await getTelegramMeta();
        if (!active) {
          return;
        }
        setTelegramBotUsername(meta.bot_username ?? DEFAULT_TELEGRAM_BOT_USERNAME);
        setReminderMinutes(meta.reminder_minutes_before);
      } catch {
        if (active) {
          setTelegramBotUsername(DEFAULT_TELEGRAM_BOT_USERNAME);
        }
      }
    };

    void loadTelegramMeta();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (appMode !== "auth") {
      return;
    }

    writeAuthHash(authScreen);
  }, [appMode, authScreen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleHashChange = () => {
      if (!session) {
        setAuthScreen(readAuthScreenFromHash());
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const subjectId = session.user.role === "admin" ? "global" : session.user.id;
    const socket = createRealtimeSocket(session.user.role, subjectId);

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as {
          booking_id?: string;
          event?: string;
          message?: string;
          status?: string;
        };
        if (payload.booking_id) {
          setLatestBookingId(payload.booking_id);
        }
        if (payload.message) {
          setRealtimeNotice({
            message: payload.message,
            tone:
              payload.event === "booking.reminder"
                ? "warning"
                : payload.event === "discount.deleted"
                  ? "info"
                : payload.status === "rejected"
                  ? "info"
                  : "success",
          });
        }
        void syncSessionData(session, true);
      } catch {
        // ignore malformed realtime payloads
      }
    };

    return () => {
      socket.close();
    };
  }, [session, syncSessionData]);

  const handleCustomerLogin = async (phone: string, password: string, remember = true) => {
    const response = await loginCustomer(phone, password);
    await applySession({
      accessToken: response.access_token,
      user: mapApiUserToAuthUser(response.user),
    }, remember);
  };

  const handleCustomerRegister = async (fullName: string, phone: string, password: string) => {
    const response = await registerCustomer(fullName, phone, password);
    await applySession({
      accessToken: response.access_token,
      user: mapApiUserToAuthUser(response.user),
    });
  };

  const handleBarberLogin = async (username: string, password: string, remember = true) => {
    const response = await loginBarber(username, password);
    await applySession({
      accessToken: response.access_token,
      user: mapApiUserToAuthUser(response.user),
    }, remember);
  };

  const handleAdminLogin = async (username: string, password: string, remember = true) => {
    const response = await loginAdmin(username, password);
    await applySession({
      accessToken: response.access_token,
      user: mapApiUserToAuthUser(response.user),
    }, remember);
  };

  const handleCreateBooking = async (payload: {
    barberId: string;
    customerName: string;
    customerPhone: string;
    serviceName: string;
    note?: string;
    date: string;
    time: string;
  }) => {
    if (!session || session.user.role !== "customer") {
      throw new Error("Bron yuborish uchun foydalanuvchi sifatida kirish kerak.");
    }

    const scheduledFor = new Date(`${payload.date}T${payload.time}:00`).toISOString();
    const apiBooking = await createBooking(session.accessToken, {
      barberId: payload.barberId,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      serviceName: payload.serviceName,
      note: payload.note,
      scheduledFor,
    });
    const mapped = mapApiBookingToItem(apiBooking);
    setBookings((current) => [mapped, ...current.filter((item) => item.id !== mapped.id)]);
    setAvailabilityBookings((current) => [mapped, ...current.filter((item) => item.id !== mapped.id)]);
    setLatestBookingId(mapped.id);
    setTrackedCustomerBookingId(mapped.id);
    return mapped;
  };

  const handleUpdateBookingStatus = async (
    bookingId: string,
    status: BookingStatus,
    rejectionReason?: string,
  ) => {
    if (!session || (session.user.role !== "barber" && session.user.role !== "admin")) {
      throw new Error("Bron holatini o'zgartirish uchun ruxsat yo'q.");
    }

    const apiBooking = await updateBookingStatus(
      session.accessToken,
      bookingId,
      mapUiStatusToApi(status),
      rejectionReason,
    );
    const mapped = mapApiBookingToItem(apiBooking);
    setBookings((current) => current.map((item) => (item.id === mapped.id ? mapped : item)));
    setAvailabilityBookings((current) =>
      current.map((item) => (item.id === mapped.id ? mapped : item)),
    );
    setLatestBookingId(mapped.id);
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!session || session.user.role !== "admin") {
      throw new Error("Bronni o'chirish uchun admin ruxsati kerak.");
    }

    await deleteBooking(session.accessToken, bookingId);
    setBookings((current) => current.filter((item) => item.id !== bookingId));
    setAvailabilityBookings((current) => current.filter((item) => item.id !== bookingId));
  };

  const handleCreateBarber = async (payload: BarberFormPayload) => {
    if (!session || session.user.role !== "admin") {
      throw new Error("Barber qo'shish uchun admin ruxsati kerak.");
    }

    const apiBarber = await createBarber(session.accessToken, payload);
    const mapped = {
      ...mapApiBarberToProfile(apiBarber),
      password: payload.password,
    };
    if (payload.password) {
      writeStoredBarberPassword(mapped.id, payload.password);
    }
    setBarbers((current) => [mapped, ...current.filter((item) => item.id !== mapped.id)]);
  };

  const handleUpdateBarber = async (barberId: string, payload: BarberFormPayload) => {
    if (!session || session.user.role !== "admin") {
      throw new Error("Barberni tahrirlash uchun admin ruxsati kerak.");
    }

    const apiBarber = await updateBarber(session.accessToken, barberId, payload);
    const mapped = mapApiBarberToProfile(apiBarber);
    if (payload.password) {
      writeStoredBarberPassword(mapped.id, payload.password);
    }
    setBarbers((current) =>
      current.map((item) =>
        item.id === mapped.id
          ? {
              ...mapped,
              password: payload.password || item.password,
            }
          : item,
      ),
    );
  };

  const handleDeleteBarber = async (barberId: string) => {
    if (!session || session.user.role !== "admin") {
      throw new Error("Barberni o'chirish uchun admin ruxsati kerak.");
    }

    await deleteBarber(session.accessToken, barberId);
    removeStoredBarberPassword(barberId);
    setBarbers((current) => current.filter((item) => item.id !== barberId));
  };

  const handleUploadMedia = async (file: File) => {
    if (!session) {
      throw new Error("Fayl yuklash uchun avval tizimga kiring.");
    }

    const uploaded = await uploadMedia(session.accessToken, file);
    return uploaded.url;
  };

  const handleCreateDiscount = async (payload: DiscountFormPayload) => {
    if (!session || (session.user.role !== "barber" && session.user.role !== "admin")) {
      throw new Error("Skidka qo'yish uchun barber yoki admin sifatida kirish kerak.");
    }

    const apiDiscount = await createDiscount(session.accessToken, payload);
    const mapped = mapApiDiscountToItem(apiDiscount);
    setDiscounts((current) => [mapped, ...current.filter((item) => item.id !== mapped.id)]);
    return mapped;
  };

  const handleDeleteDiscount = async (discountId: string) => {
    if (!session || (session.user.role !== "barber" && session.user.role !== "admin")) {
      throw new Error("Skidkani olib tashlash uchun ruxsat yo'q.");
    }

    await deleteDiscount(session.accessToken, discountId);
    setDiscounts((current) => current.filter((item) => item.id !== discountId));
  };

  const handleUpdateMyBarberSettings = async (payload: BarberSettingsPayload) => {
    if (!session || session.user.role !== "barber") {
      throw new Error("Sozlamalarni o'zgartirish uchun barber sifatida kirish kerak.");
    }

    const apiBarber = await updateMyBarberSettings(session.accessToken, payload);
    const mapped = mapApiBarberToProfile(apiBarber);
    setBarbers((current) => current.map((item) => (item.id === mapped.id ? mapped : item)));
    return mapped;
  };

  const dashboardMetrics = useMemo(() => buildDashboardMetrics(bookings, barbers), [bookings, barbers]);
  const chartItems = useMemo(() => buildBookingsByBarber(bookings, barbers), [bookings, barbers]);
  const performanceItems = useMemo(
    () => buildPerformanceItems(bookings, barbers),
    [bookings, barbers],
  );
  const recentItems = useMemo(() => buildRecentBookings(bookings), [bookings]);

  const page = useMemo(() => {
    if (activePage === "barberlar") {
      return (
        <BarbersPage
          items={barbers}
          onCreateBarber={handleCreateBarber}
          onUpdateBarber={handleUpdateBarber}
          onDeleteBarber={handleDeleteBarber}
          onUploadMedia={handleUploadMedia}
        />
      );
    }

    if (activePage === "navbatlar") {
      return <BookingsPage items={bookings} onDeleteBooking={handleDeleteBooking} />;
    }

    if (activePage === "skidkalar") {
      return (
        <DiscountsPage
          items={discounts}
          onDeleteDiscount={handleDeleteDiscount}
        />
      );
    }

    if (activePage === "sozlamalar" && currentAdmin) {
      return (
        <AdminSettingsPage
          currentUser={currentAdmin}
          telegramBotUsername={telegramBotUsername}
          reminderMinutes={reminderMinutes}
        />
      );
    }

    return (
      <DashboardPage
        metrics={dashboardMetrics}
        chartItems={chartItems}
        performanceItems={performanceItems}
        recentItems={recentItems}
        discounts={discounts}
      />
    );
  }, [
    activePage,
        barbers,
    bookings,
    chartItems,
    discounts,
    dashboardMetrics,
    performanceItems,
    recentItems,
    telegramBotUsername,
    reminderMinutes,
    currentAdmin,
    session,
  ]);

  const noticeNode = (
    <Snackbar
      open={Boolean(realtimeNotice)}
      autoHideDuration={3400}
      onClose={() => setRealtimeNotice(null)}
    >
      <Alert
        onClose={() => setRealtimeNotice(null)}
        severity={realtimeNotice?.tone ?? "info"}
        sx={{ width: "100%" }}
      >
        {realtimeNotice?.message}
      </Alert>
    </Snackbar>
  );

  const renderWithNotice = (content: ReactNode) => (
    <>
      {content}
      {noticeNode}
    </>
  );

  const authRole =
    authScreen === "admin-login"
      ? "admin"
      : authScreen === "barber-login"
        ? "barber"
        : "customer";

  if (booting) {
    return <LoadingScreen label="Ilova va session tekshirilmoqda..." />;
  }

  if (appMode === "auth") {
    if (
      authScreen === "customer-login" ||
      authScreen === "barber-login" ||
      authScreen === "admin-login"
    ) {
      return renderWithNotice(
        <UnifiedLoginPage
          selectedRole={authRole}
          onRoleChange={(role) =>
            setAuthScreen(
              role === "admin"
                ? "admin-login"
                : role === "barber"
                  ? "barber-login"
                  : "customer-login",
            )
          }
          onCustomerLogin={handleCustomerLogin}
          onBarberLogin={handleBarberLogin}
          onAdminLogin={handleAdminLogin}
          onOpenRegister={() => setAuthScreen("customer-register")}
        />
      );
    }

    if (authScreen === "customer-register") {
      return renderWithNotice(
        <CustomerRegisterPage
          onBack={() => setAuthScreen("customer-login")}
          onOpenLogin={() => setAuthScreen("customer-login")}
          onRegister={handleCustomerRegister}
        />
      );
    }

    return renderWithNotice(
      <UnifiedLoginPage
        selectedRole="customer"
        onRoleChange={(role) =>
          setAuthScreen(
            role === "admin"
              ? "admin-login"
              : role === "barber"
                ? "barber-login"
                : "customer-login",
          )
        }
        onCustomerLogin={handleCustomerLogin}
        onBarberLogin={handleBarberLogin}
        onAdminLogin={handleAdminLogin}
        onOpenRegister={() => setAuthScreen("customer-register")}
      />
    );
  }

  if (syncing && !barbers.length) {
    return <LoadingScreen label="Backend ma'lumotlari yuklanmoqda..." />;
  }

  if (appMode === "customer" && currentCustomer) {
    return renderWithNotice(
      <CustomerBookingPage
        signedInCustomer={currentCustomer}
        barbers={barbers}
        discounts={discounts}
        serviceOptions={serviceOptions}
        bookings={bookings}
        availabilityItems={availabilityBookings}
        telegramBotUsername={telegramBotUsername}
        reminderMinutes={reminderMinutes}
        onCreateBooking={handleCreateBooking}
        trackedBookingId={trackedCustomerBookingId}
        onClearTrackedBooking={() => setTrackedCustomerBookingId(null)}
        onLogout={() => switchToAuth("customer-login")}
      />
    );
  }

  if (appMode === "barber" && currentBarber) {
    return renderWithNotice(
      <BarberPanelPage
        barber={currentBarber}
        bookings={bookings}
        discounts={discounts}
        latestBookingId={latestBookingId}
        telegramBotUsername={telegramBotUsername}
        reminderMinutes={reminderMinutes}
        onLogout={() => switchToAuth("barber-login")}
        onUpdateBookingStatus={handleUpdateBookingStatus}
        onCreateDiscount={handleCreateDiscount}
        onDeleteDiscount={handleDeleteDiscount}
        onUpdateSettings={handleUpdateMyBarberSettings}
        onUploadMedia={handleUploadMedia}
      />
    );
  }

  if (appMode === "barber") {
    return <LoadingScreen label="Barber profili yuklanmoqda..." />;
  }

  if (appMode === "admin" && currentAdmin) {
    return renderWithNotice(
      <AdminLayout
        activePage={activePage}
        currentUser={currentAdmin}
        onLogout={() => switchToAuth("admin-login")}
        onPageChange={setActivePage}
      >
        <Stack spacing={1.5}>
          {globalError ? <Alert severity="error">{globalError}</Alert> : null}
          {page}
        </Stack>
      </AdminLayout>
    );
  }

  if (appMode === "admin") {
    return <LoadingScreen label="Admin ma'lumotlari yuklanmoqda..." />;
  }

  if (appMode === "customer") {
    return <LoadingScreen label="Foydalanuvchi ma'lumotlari yuklanmoqda..." />;
  }

  return renderWithNotice(
    <UnifiedLoginPage
      selectedRole="customer"
      onRoleChange={(role) =>
        setAuthScreen(
          role === "admin"
            ? "admin-login"
            : role === "barber"
              ? "barber-login"
              : "customer-login",
        )
      }
      onCustomerLogin={handleCustomerLogin}
      onBarberLogin={handleBarberLogin}
      onAdminLogin={handleAdminLogin}
      onOpenRegister={() => setAuthScreen("customer-register")}
    />
  );
}
