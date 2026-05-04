import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import FmdGoodRoundedIcon from "@mui/icons-material/FmdGoodRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import NearMeRoundedIcon from "@mui/icons-material/NearMeRounded";
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { BarberAvailabilitySection, AvailabilitySlot } from "../components/customer/BarberAvailabilitySection";
import { BookedSlotDetailsDialog } from "../components/customer/BookedSlotDetailsDialog";
import { CustomerBarberList } from "../components/customer/CustomerBarberList";
import { CustomerDiscountBoard } from "../components/customer/CustomerDiscountBoard";
import { CustomerHeroCard } from "../components/customer/CustomerHeroCard";
import { CustomerNearbyBarbersPage } from "../components/customer/CustomerNearbyBarbersPage";
import { CustomerNotificationScreen } from "../components/customer/CustomerNotificationScreen";
import { CustomerProfileCard } from "../components/customer/CustomerProfileCard";
import { TelegramQRCode } from "../components/common/TelegramQRCode";
import { LogoutConfirmDialog } from "../components/navigation/LogoutConfirmDialog";
import {
  AvailabilityStatus,
  BarberProfile,
  BookingItem,
  BookingStatus,
  CustomerAccount,
  CustomerProfile,
  DiscountItem,
  GeoCoordinates,
} from "../types";
import { formatUzbekReadableDate, getLocalIsoDate } from "../utils/date";

interface CustomerBookingPageProps {
  signedInCustomer: CustomerAccount | null;
  barbers: BarberProfile[];
  discounts: DiscountItem[];
  serviceOptions: string[];
  bookings: BookingItem[];
  availabilityItems: BookingItem[];
  telegramBotUsername?: string;
  reminderMinutes: number;
  onCreateBooking: (payload: {
    barberId: string;
    customerName: string;
    customerPhone: string;
    serviceName: string;
    note?: string;
    date: string;
    time: string;
  }) => Promise<BookingItem>;
  trackedBookingId: string | null;
  onClearTrackedBooking: () => void;
  onLogout: () => void;
}

type BookingStep = "barbers" | "nearby" | "time" | "details" | "notification";
type SelectionSource = "barbers" | "nearby";

interface ConfirmedBookingState {
  barber: BarberProfile;
  customer: CustomerProfile;
  dateIso: string;
  time: string;
}

function createInitialCustomer(customer: CustomerAccount | null, serviceOptions: string[]): CustomerProfile {
  return {
    name: customer?.name ?? "",
    phone: customer?.phone ?? "",
    service: serviceOptions[0] ?? "Soch olish",
    note: "",
  };
}

function getDateAtMidnight(offset = 0) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date;
}

function getIsoDate(date: Date) {
  return getLocalIsoDate(date);
}

function createTimeSlotsForRange(startTime: string, endTime: string) {
  const result: string[] = [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;

  for (let total = startTotal; total <= endTotal; total += 30) {
    const hour = Math.floor(total / 60);
    const minute = total % 60;
    result.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
  }

  return result;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTimeLabel(time: string) {
  const [rawHour, rawMinute] = time.split(":").map(Number);
  const suffix = rawHour >= 12 ? "PM" : "AM";
  const hour = rawHour % 12 || 12;
  return `${hour}:${String(rawMinute).padStart(2, "0")} ${suffix}`;
}

function formatMoney(value: number) {
  return `${value.toLocaleString("uz-UZ")} so'm`;
}

function buildDayTitle(offset: number) {
  if (offset === 0) {
    return "Bugun";
  }

  if (offset === 1) {
    return "Ertaga";
  }

  return `${offset + 1}-kun`;
}

function mapBookingStatus(
  booking: BookingItem | undefined,
  dateIso: string,
  slotTime: string,
): AvailabilityStatus {
  if (booking) {
    if (booking.status === "Rad etildi") {
      return "bo'sh";
    }

    if (booking.status === "Jarayonda") {
      return "ishlayapti";
    }

    return "band";
  }

  const todayIso = getIsoDate(getDateAtMidnight());

  if (
    dateIso === todayIso &&
    timeToMinutes(slotTime) < timeToMinutes(new Date().toTimeString().slice(0, 5))
  ) {
    return "tugagan";
  }

  return "bo'sh";
}

function barberMatches(booking: BookingItem, barber: BarberProfile) {
  return (
    booking.barberId === barber.id ||
    booking.barberUserId === barber.userId ||
    booking.barber === barber.name
  );
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function computeDistanceKm(from: GeoCoordinates, to: { latitude?: number; longitude?: number }) {
  if (typeof to.latitude !== "number" || typeof to.longitude !== "number") {
    return undefined;
  }

  const earthRadiusKm = 6371;
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getServicePrice(barber: BarberProfile, serviceName: string) {
  if (serviceName === "Fade qirqim") {
    return barber.priceFade;
  }

  if (serviceName === "Soch + soqol") {
    return barber.priceHairBeard;
  }

  if (serviceName === "Premium paket") {
    return barber.pricePremium;
  }

  if (serviceName === "Soqol dizayni") {
    return barber.priceBeard;
  }

  return barber.priceHaircut;
}

function getApplicableDiscount(
  items: DiscountItem[],
  dateIso: string,
  selectedTime?: string | null,
) {
  return (
    [...items]
      .filter((item) => {
        if (item.date !== dateIso) {
          return false;
        }

        if (!selectedTime) {
          return true;
        }

        const slotMinutes = timeToMinutes(selectedTime);
        return (
          slotMinutes >= timeToMinutes(item.startTime) &&
          slotMinutes <= timeToMinutes(item.endTime)
        );
      })
      .sort((left, right) => right.percent - left.percent)[0] ?? null
  );
}

export function CustomerBookingPage({
  signedInCustomer,
  barbers,
  discounts,
  serviceOptions,
  bookings,
  availabilityItems,
  telegramBotUsername,
  reminderMinutes,
  onCreateBooking,
  trackedBookingId,
  onClearTrackedBooking,
  onLogout,
}: CustomerBookingPageProps) {
  const [step, setStep] = useState<BookingStep>(trackedBookingId ? "notification" : "barbers");
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(barbers[0]?.id ?? null);
  const [dateOffset, setDateOffset] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerProfile>(() =>
    createInitialCustomer(signedInCustomer, serviceOptions),
  );
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBookingState | null>(null);
  const [feedback, setFeedback] = useState("");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [localTrackedBookingId, setLocalTrackedBookingId] = useState<string | null>(trackedBookingId);
  const [lastSeenStatus, setLastSeenStatus] = useState<BookingStatus | null>(null);
  const [lastRefreshAt, setLastRefreshAt] = useState(() => new Date());
  const [customerCoords, setCustomerCoords] = useState<GeoCoordinates | null>(null);
  const [selectionSource, setSelectionSource] = useState<SelectionSource>("barbers");
  const [bookedSlotPreview, setBookedSlotPreview] = useState<BookingItem | null>(null);

  const activeTrackedBookingId = localTrackedBookingId ?? trackedBookingId;

  useEffect(() => {
    if (!selectedBarberId && barbers[0]) {
      setSelectedBarberId(barbers[0].id);
      return;
    }

    if (selectedBarberId && !barbers.some((item) => item.id === selectedBarberId)) {
      setSelectedBarberId(barbers[0]?.id ?? null);
    }
  }, [barbers, selectedBarberId]);

  const requestCurrentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setFeedback("Brauzer lokatsiyani o'qiy olmadi");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCustomerCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => setFeedback("Joylashuvni olib bo'lmadi"),
      {
        enableHighAccuracy: false,
        timeout: 6000,
        maximumAge: 10 * 60 * 1000,
      },
    );
  };

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCustomerCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => undefined,
      {
        enableHighAccuracy: false,
        timeout: 6000,
        maximumAge: 10 * 60 * 1000,
      },
    );
  }, []);

  const rankedBarbers = useMemo(
    () =>
      [...barbers]
        .map((item) => ({
          ...item,
          distanceKm: customerCoords ? computeDistanceKm(customerCoords, item) : undefined,
        }))
        .sort((left, right) => {
          if (typeof left.distanceKm === "number" && typeof right.distanceKm === "number") {
            return left.distanceKm - right.distanceKm;
          }
          if (typeof left.distanceKm === "number") {
            return -1;
          }
          if (typeof right.distanceKm === "number") {
            return 1;
          }
          return right.todayBookings - left.todayBookings;
        }),
    [barbers, customerCoords],
  );

  const nearestBarber = rankedBarbers[0];
  const mappableBarbers = useMemo(
    () =>
      rankedBarbers.filter(
        (item) => typeof item.latitude === "number" && typeof item.longitude === "number",
      ),
    [rankedBarbers],
  );

  const selectedBarber = useMemo(
    () => rankedBarbers.find((item) => item.id === selectedBarberId) ?? rankedBarbers[0] ?? null,
    [rankedBarbers, selectedBarberId],
  );

  const selectedDate = useMemo(() => getDateAtMidnight(dateOffset), [dateOffset]);
  const selectedDateIso = getIsoDate(selectedDate);
  const selectedDateLabel = formatUzbekReadableDate(selectedDate);
  const selectedTimeLabel = selectedTime ? formatTimeLabel(selectedTime) : "";
  const selectedWorkHoursLabel = selectedBarber
    ? `${selectedBarber.workStartTime} - ${selectedBarber.workEndTime}`
    : "09:00 - 18:30";

  const visibleDiscounts = useMemo(
    () =>
      [...discounts]
        .filter((item) => item.isActive)
        .sort((left, right) =>
          `${left.date}${left.startTime}`.localeCompare(`${right.date}${right.startTime}`),
        ),
    [discounts],
  );

  const selectedBarberDiscounts = useMemo(
    () =>
      selectedBarber
        ? visibleDiscounts.filter(
            (item) =>
              item.barberId === selectedBarber.id || item.barberUserId === selectedBarber.userId,
          )
        : [],
    [selectedBarber, visibleDiscounts],
  );

  const selectedBarberDiscount = useMemo(
    () => getApplicableDiscount(selectedBarberDiscounts, selectedDateIso, selectedTime),
    [selectedBarberDiscounts, selectedDateIso, selectedTime],
  );

  const selectedSlots = useMemo<AvailabilitySlot[]>(() => {
    if (!selectedBarber) {
      return [];
    }

    const todaysBookings = availabilityItems.filter(
      (item) =>
        item.date === selectedDateIso &&
        item.status !== "Rad etildi" &&
        barberMatches(item, selectedBarber),
    );

    return createTimeSlotsForRange(selectedBarber.workStartTime, selectedBarber.workEndTime).map(
      (time) => {
        const booking = todaysBookings.find((item) => item.time === time);
        return {
          time,
          status: mapBookingStatus(booking, selectedDateIso, time),
          booking,
        };
      },
    );
  }, [availabilityItems, selectedBarber, selectedDateIso]);

  const slotSummary = useMemo(
    () => ({
      available: selectedSlots.filter((slot) => slot.status === "bo'sh").length,
      busy: selectedSlots.filter((slot) => slot.status === "band").length,
      active: selectedSlots.filter((slot) => slot.status === "ishlayapti").length,
    }),
    [selectedSlots],
  );

  const selectedBasePrice = useMemo(
    () => (selectedBarber ? getServicePrice(selectedBarber, customer.service) : 0),
    [customer.service, selectedBarber],
  );
  const selectedFinalPrice = useMemo(() => {
    if (!selectedBarberDiscount) {
      return selectedBasePrice;
    }
    return Math.round(selectedBasePrice * (1 - selectedBarberDiscount.percent / 100));
  }, [selectedBarberDiscount, selectedBasePrice]);

  const trackedBooking = useMemo(
    () => bookings.find((item) => item.id === activeTrackedBookingId) ?? null,
    [activeTrackedBookingId, bookings],
  );
  const hasLockedBooking = Boolean(
    trackedBooking &&
      trackedBooking.status !== "Tugallandi" &&
      trackedBooking.status !== "Rad etildi",
  );

  const trackedBarber = useMemo(() => {
    if (!trackedBooking) {
      return confirmedBooking?.barber ?? rankedBarbers[0] ?? null;
    }

    return (
      rankedBarbers.find((item) => barberMatches(trackedBooking, item)) ??
      confirmedBooking?.barber ??
      rankedBarbers[0] ??
      null
    );
  }, [confirmedBooking?.barber, rankedBarbers, trackedBooking]);

  useEffect(() => {
    if (trackedBookingId && !localTrackedBookingId) {
      setLocalTrackedBookingId(trackedBookingId);
    }
  }, [localTrackedBookingId, trackedBookingId]);

  useEffect(() => {
    setCustomer(createInitialCustomer(signedInCustomer, serviceOptions));
  }, [serviceOptions, signedInCustomer]);

  useEffect(() => {
    if (!trackedBooking || trackedBooking.status === lastSeenStatus) {
      return;
    }

    if (lastSeenStatus !== null) {
      setFeedback(getStatusFeedback(trackedBooking.status));
    }

    setLastSeenStatus(trackedBooking.status);
  }, [lastSeenStatus, trackedBooking]);

  useEffect(() => {
    setLastRefreshAt(new Date());

    if (!trackedBooking || trackedBooking.status === "Tugallandi" || trackedBooking.status === "Rad etildi") {
      return;
    }

    const interval = window.setInterval(() => {
      setLastRefreshAt(new Date());
    }, 5000);

    return () => window.clearInterval(interval);
  }, [trackedBooking?.id, trackedBooking?.status]);

  const handleBarberPreview = (barber: BarberProfile) => {
    setSelectedBarberId(barber.id);
  };

  const handleBarberSelect = (barber: BarberProfile, source: SelectionSource = "barbers") => {
    if (hasLockedBooking) {
      setSelectedBarberId(barber.id);
      setStep("notification");
      return;
    }

    setSelectionSource(source);
    setSelectedBarberId(barber.id);
    setSelectedTime(null);
    setStep("time");
  };

  const handleDiscountChoose = (barberId: string) => {
    const barber = rankedBarbers.find((item) => item.id === barberId);
    if (barber) {
      handleBarberSelect(barber, "barbers");
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedBarber || !selectedTime || !customer.name.trim() || !customer.phone.trim()) {
      return;
    }

    try {
      const created = await onCreateBooking({
        barberId: selectedBarber.id,
        customerName: customer.name.trim(),
        customerPhone: customer.phone.trim(),
        serviceName: customer.service || serviceOptions[0] || "Soch olish",
        note: customer.note.trim() || undefined,
        date: selectedDateIso,
        time: selectedTime,
      });

      setLocalTrackedBookingId(created.id);
      setConfirmedBooking({
        barber: selectedBarber,
        customer: {
          ...customer,
          name: customer.name.trim(),
          phone: customer.phone.trim(),
        },
        dateIso: selectedDateIso,
        time: selectedTime,
      });
      setLastSeenStatus(created.status);
      setStep("notification");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Bron yuborilmadi");
    }
  };

  const handleShare = async () => {
    const shareBooking = trackedBooking;
    const shareBarber = trackedBarber;

    if (!shareBooking || !shareBarber) {
      return;
    }

    const shareText = [
      `Bron ID: #${shareBooking.id}`,
      `Barber: ${shareBarber.name}`,
      `Sana: ${formatUzbekReadableDate(new Date(`${shareBooking.date}T00:00:00`))}`,
      `Vaqt: ${formatTimeLabel(shareBooking.time)}`,
      `Mijoz: ${shareBooking.customer}`,
      `Narx: ${formatMoney(shareBooking.finalPrice ?? shareBooking.originalPrice ?? 0)}`,
    ].join("\n");

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "Navbat tafsiloti",
          text: shareText,
        });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setFeedback("Tafsilot nusxalandi");
      }
    } catch {
      setFeedback("Ulashish bekor qilindi");
    }
  };

  const resetFlow = () => {
    setStep("barbers");
    setDateOffset(0);
    setSelectedTime(null);
    setConfirmedBooking(null);
    setCustomer(createInitialCustomer(signedInCustomer, serviceOptions));
    setLocalTrackedBookingId(null);
    setLastSeenStatus(null);
    onClearTrackedBooking();
  };

  const barberStepContent = (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 320px" },
        gap: { xs: 2.25, lg: 2.75 },
        alignItems: "start",
      }}
    >
      <Stack spacing={2.35}>
        <CustomerHeroCard
          customerName={signedInCustomer?.name}
          onOpenMap={() => {
            if (!customerCoords) {
              requestCurrentLocation();
            }
            setStep("nearby");
          }}
          onLogout={() => setLogoutOpen(true)}
        />

        <CustomerDiscountBoard items={visibleDiscounts} onChooseBarber={handleDiscountChoose} />

        {rankedBarbers.length ? (
          <CustomerBarberList
            items={rankedBarbers}
            discounts={visibleDiscounts}
            onSelect={(barber) => handleBarberSelect(barber, "barbers")}
          />
        ) : (
          <Alert severity="warning" sx={{ borderRadius: "20px" }}>
            Hozircha barberlar topilmadi.
          </Alert>
        )}
      </Stack>

      <Box sx={{ display: { xs: "none", lg: "block" } }}>
        <DesktopAsideCard
          title="Qisqacha"
          description="Yaqin barber va bo'sh vaqt"
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 0.85,
            }}
          >
            <InfoMetric
              icon={<GroupsRoundedIcon sx={{ fontSize: "1rem" }} />}
              label="Barberlar"
              value={`${rankedBarbers.length} ta`}
            />
            <InfoMetric
              icon={<CheckCircleRoundedIcon sx={{ fontSize: "1rem" }} />}
              label="Bo'sh vaqtlar"
              value={`${slotSummary.available} ta`}
            />
            <InfoMetric
              icon={<ContentCutRoundedIcon sx={{ fontSize: "1rem" }} />}
              label="Faol skidka"
              value={visibleDiscounts.length ? `${visibleDiscounts.length} ta` : "yo'q"}
            />
            <InfoMetric
              icon={<AccessTimeRoundedIcon sx={{ fontSize: "1rem" }} />}
              label="Ish vaqti"
              value={selectedWorkHoursLabel}
            />
          </Box>

          <Stack spacing={0.85}>
            {rankedBarbers.slice(0, 2).map((barber) => (
              <Stack
                key={barber.id}
                direction="row"
                spacing={0.8}
                alignItems="center"
                sx={{
                  p: 0.85,
                  borderRadius: "16px",
                  backgroundColor: alpha("#ffffff", 0.06),
                  border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
                }}
              >
                <Avatar
                  variant="rounded"
                  src={barber.photoUrl}
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: "14px",
                    bgcolor: barber.avatarColor,
                    fontWeight: 800,
                  }}
                >
                  {barber.initials}
                </Avatar>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontSize: "0.9rem" }}>
                    {barber.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.78rem" }}>
                    {typeof barber.distanceKm === "number"
                      ? `${barber.distanceKm.toFixed(1)} km`
                      : barber.specialty}
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  label={`${barber.todayBookings} ta bugun`}
                  sx={{
                    height: 24,
                    borderRadius: "999px",
                    backgroundColor: alpha("#111111", 0.05),
                    "& .MuiChip-label": { px: 0.9, fontWeight: 700, fontSize: "0.7rem" },
                  }}
                />
              </Stack>
            ))}
          </Stack>
        </DesktopAsideCard>
      </Box>
    </Box>
  );

  const timeStepContent = selectedBarber ? (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 320px" },
        gap: { xs: 2.25, lg: 2.75 },
        alignItems: "start",
      }}
    >
      <BarberAvailabilitySection
        barber={selectedBarber}
        slots={selectedSlots}
        selectedTime={selectedTime}
        dayTitle={buildDayTitle(dateOffset)}
        daySubtitle={selectedDateLabel}
        workHoursLabel={selectedWorkHoursLabel}
        priceLabel={`Narx ${formatMoney(selectedBasePrice)}`}
        canGoPrev={dateOffset > 0}
        canGoNext={dateOffset < 2}
        onBack={() => setStep(selectionSource === "nearby" ? "nearby" : "barbers")}
        onPrevDay={() => {
          setDateOffset((current) => Math.max(0, current - 1));
          setSelectedTime(null);
        }}
        onNextDay={() => {
          setDateOffset((current) => Math.min(2, current + 1));
          setSelectedTime(null);
        }}
        onSelectTime={setSelectedTime}
        onOpenBookedSlot={setBookedSlotPreview}
        onContinue={() => setStep("details")}
      />

      <Box sx={{ display: { xs: "none", lg: "block" } }}>
        <DesktopAsideCard
          title="Tanlangan barber"
          description="Qulay vaqtni tanlang"
        >
          <Stack
            direction="row"
            spacing={1.1}
            alignItems="center"
            sx={{
              p: 1.1,
              borderRadius: "18px",
              backgroundColor: alpha("#ffffff", 0.06),
              border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
            }}
          >
            <Avatar
              variant="rounded"
              src={selectedBarber.photoUrl}
              sx={{
                width: 56,
                height: 56,
                borderRadius: "18px",
                bgcolor: selectedBarber.avatarColor,
              }}
            >
              {selectedBarber.initials}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontSize: "1rem" }}>
                {selectedBarber.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedBarber.specialty}
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={0.9} sx={{ mt: 1.15 }}>
            <InfoMetric
              icon={<CalendarMonthRoundedIcon sx={{ fontSize: "1rem" }} />}
              label="Sana"
              value={selectedDateLabel}
            />
            <InfoMetric
              icon={<AccessTimeRoundedIcon sx={{ fontSize: "1rem" }} />}
              label="Ish vaqti"
              value={selectedWorkHoursLabel}
            />
            <InfoMetric
              icon={<CheckCircleRoundedIcon sx={{ fontSize: "1rem" }} />}
              label="Bo'sh slot"
              value={`${slotSummary.available} ta`}
            />
          </Stack>

          {selectedBarberDiscount ? (
            <Box
              sx={{
                mt: 1.1,
                p: 0.95,
                borderRadius: "16px",
                backgroundColor: alpha("#34d399", 0.1),
                border: `1px solid ${alpha("#34d399", 0.16)}`,
              }}
            >
              <Typography variant="subtitle2" sx={{ color: "#86efac", mb: 0.3 }}>
                Shu barberdagi skidka
              </Typography>
              <Typography variant="body2" sx={{ color: "#bbf7d0", fontWeight: 700 }}>
                {selectedBarberDiscount.percent}% | {selectedBarberDiscount.startTime} - {selectedBarberDiscount.endTime}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {selectedBarberDiscount.title}
              </Typography>
            </Box>
          ) : null}

          {selectedTime ? (
            <Chip
              label={`Tanlandi: ${selectedTimeLabel}`}
              sx={{
                mt: 1.2,
                height: 32,
                borderRadius: "999px",
                background:
                  "linear-gradient(135deg, rgba(139,92,246,1) 0%, rgba(34,211,238,0.88) 100%)",
                color: "#fff",
                "& .MuiChip-label": { px: 1.15, fontWeight: 700, fontSize: "0.78rem" },
              }}
            />
          ) : null}
        </DesktopAsideCard>
      </Box>
    </Box>
  ) : null;

  const detailsStepContent =
    selectedBarber && selectedTime ? (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 320px" },
          gap: { xs: 2.25, lg: 2.75 },
          alignItems: "start",
        }}
      >
        <Stack spacing={2.1}>
          <CustomerProfileCard
            barber={selectedBarber}
            dateLabel={selectedDateLabel}
            timeLabel={selectedTimeLabel}
            workHoursLabel={selectedWorkHoursLabel}
            originalPriceLabel={formatMoney(selectedBasePrice)}
            finalPriceLabel={formatMoney(selectedFinalPrice)}
            discountPercent={selectedBarberDiscount?.percent}
            serviceOptions={serviceOptions}
            value={customer}
            onBack={() => setStep("time")}
            onChange={(field, nextValue) =>
              setCustomer((current) => ({ ...current, [field]: nextValue }))
            }
            onSubmit={handleConfirmBooking}
          />

          {signedInCustomer && telegramBotUsername ? (
            <TelegramQRCode
              botUsername={telegramBotUsername}
              role="customer"
              subjectId={signedInCustomer.id}
              size={128}
              compact
              linked={Boolean(signedInCustomer.telegramConnected)}
              chatId={signedInCustomer.telegramChatId ?? undefined}
              title={signedInCustomer.telegramConnected ? "Telegram sozlamalari" : "Telegram botni ulash"}
              description={
                signedInCustomer.telegramConnected
                  ? "Bron statuslari, eslatmalar va bot ichidagi bron qilish shu akkauntga ulangan."
                  : `Start bosing. Bron va ${reminderMinutes} daqiqa oldingi eslatmalar Telegramga keladi.`
              }
            />
          ) : null}
        </Stack>

        <Box sx={{ display: { xs: "none", lg: "block" } }}>
          <DesktopAsideCard
            title="Navbat tafsiloti"
            description="Tasdiqlashdan oldin tekshirib oling"
          >
            <Stack spacing={0.9}>
              <InfoMetric
                icon={<ContentCutRoundedIcon sx={{ fontSize: "1rem" }} />}
                label="Barber"
                value={selectedBarber.name}
              />
              <InfoMetric
                icon={<CalendarMonthRoundedIcon sx={{ fontSize: "1rem" }} />}
                label="Sana"
                value={selectedDateLabel}
              />
              <InfoMetric
                icon={<AccessTimeRoundedIcon sx={{ fontSize: "1rem" }} />}
                label="Vaqt"
                value={selectedTimeLabel}
              />
              <InfoMetric
                icon={<CheckCircleRoundedIcon sx={{ fontSize: "1rem" }} />}
                label="Yakuniy narx"
                value={formatMoney(selectedFinalPrice)}
              />
            </Stack>

            {selectedBarberDiscount ? (
              <Box
                sx={{
                  mt: 1.05,
                  p: 0.95,
                  borderRadius: "16px",
                  backgroundColor: alpha("#f6c85f", 0.1),
                  border: `1px solid ${alpha("#f6c85f", 0.18)}`,
                }}
              >
                <Typography variant="subtitle2" sx={{ color: "#fde68a", mb: 0.3 }}>
                  Shu barberdagi skidka
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {selectedBarberDiscount.percent}% | {selectedBarberDiscount.title}
                </Typography>
              </Box>
            ) : null}
          </DesktopAsideCard>
        </Box>
      </Box>
    ) : null;

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          px: { xs: 0, sm: 2.5, lg: 3 },
          py: { xs: 0, sm: 2.5, lg: 3 },
          background:
            "radial-gradient(circle at 16% 8%, rgba(139,92,246,0.28), transparent 30%), radial-gradient(circle at 88% 4%, rgba(34,211,238,0.14), transparent 28%), linear-gradient(135deg, #05050a 0%, #10071d 52%, #06111e 100%)",
        }}
      >
        <Box
          sx={{
            width: "min(1180px, 100%)",
            minHeight: { xs: "100vh", sm: "calc(100vh - 32px)" },
            mx: "auto",
            px: { xs: 2, sm: 2.6, lg: 3.2 },
            py: { xs: 2.4, sm: 2.9, lg: 3.2 },
            borderRadius: { xs: 0, sm: "34px" },
            background:
              "linear-gradient(180deg, rgba(10,11,22,0.78) 0%, rgba(6,7,14,0.72) 100%)",
            border: { xs: "none", sm: `1px solid ${alpha("#c4b5fd", 0.13)}` },
            boxShadow: { xs: "none", sm: "0 34px 100px rgba(0,0,0,0.42)" },
            backdropFilter: "blur(24px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AnimatePresence mode="wait">
            <Box
              key={step}
              component={motion.div}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              sx={{ display: "flex", flexDirection: "column", flex: 1 }}
            >
              {step === "barbers" ? barberStepContent : null}
              {step === "nearby" ? (
                <CustomerNearbyBarbersPage
                  customerCoords={customerCoords}
                  nearestBarber={nearestBarber ?? null}
                  selectedBarber={selectedBarber}
                  barbers={mappableBarbers}
                  onBack={() => setStep("barbers")}
                  onUseCurrentLocation={requestCurrentLocation}
                  onPreviewBarber={handleBarberPreview}
                  onChooseBarber={(barber) => handleBarberSelect(barber, "nearby")}
                  onChangeCustomerCoords={setCustomerCoords}
                />
              ) : null}
              {step === "time" ? timeStepContent : null}
              {step === "details" ? detailsStepContent : null}

              {step === "notification" && trackedBooking && trackedBarber ? (
                <Box sx={{ maxWidth: 760, width: "100%", mx: "auto" }}>
                  <CustomerNotificationScreen
                    barber={trackedBarber}
                    booking={trackedBooking}
                    dateLabel={formatUzbekReadableDate(new Date(`${trackedBooking.date}T00:00:00`))}
                    timeLabel={formatTimeLabel(trackedBooking.time)}
                    lastRefreshLabel={lastRefreshAt.toLocaleTimeString("uz-UZ")}
                    isAutoRefreshing={
                      trackedBooking.status !== "Tugallandi" && trackedBooking.status !== "Rad etildi"
                    }
                    onShare={handleShare}
                    onBackHome={() => setStep("barbers")}
                    onReset={
                      trackedBooking.status === "Tugallandi" || trackedBooking.status === "Rad etildi"
                        ? resetFlow
                        : undefined
                    }
                  />
                </Box>
              ) : null}
            </Box>
          </AnimatePresence>
        </Box>
      </Box>

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={2200}
        onClose={() => setFeedback("")}
        message={feedback}
        action={
          trackedBooking ? (
            <Button
              color="secondary"
              size="small"
              onClick={() => {
                setStep("notification");
                setFeedback("");
              }}
              sx={{ fontWeight: 700 }}
            >
              Ko'rish
            </Button>
          ) : undefined
        }
      />

      <LogoutConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => {
          setLogoutOpen(false);
          onLogout();
        }}
        message="Haqiqatan ham chiqmoqchimisiz? Tasdiqlasangiz, foydalanuvchi sahifasidan chiqasiz."
      />

      <BookedSlotDetailsDialog
        open={Boolean(bookedSlotPreview)}
        booking={bookedSlotPreview}
        onClose={() => setBookedSlotPreview(null)}
      />
    </>
  );
}

function getStatusFeedback(status: BookingStatus) {
  if (status === "Rad etildi") {
    return "Bron so'rovi rad etildi";
  }

  if (status === "Tasdiqlandi") {
    return "Barber broningizni qabul qildi";
  }

  if (status === "Jarayonda") {
    return "Navbatingiz boshlandi";
  }

  if (status === "Tugallandi") {
    return "Navbatingiz yakunlandi";
  }

  return "Bron so'rovi yuborildi";
}

function DesktopAsideCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        p: 1.3,
        borderRadius: "22px",
        border: `1px solid ${alpha("#c4b5fd", 0.14)}`,
        background:
          "linear-gradient(180deg, rgba(19,20,34,0.84) 0%, rgba(10,11,22,0.72) 100%)",
        boxShadow: "0 20px 48px rgba(0,0,0,0.26)",
        backdropFilter: "blur(18px)",
        position: "sticky",
        top: 24,
      }}
    >
      <Typography variant="h6" sx={{ fontSize: "0.98rem", mb: description ? 0.3 : 0.8 }}>
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.45, mb: 1.05, fontSize: "0.82rem" }}>
          {description}
        </Typography>
      ) : null}
      {children}
    </Box>
  );
}

function InfoMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Stack
      direction="row"
      spacing={0.8}
      alignItems="center"
      sx={{
        p: 0.85,
        borderRadius: "14px",
        backgroundColor: alpha("#ffffff", 0.06),
        border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
      }}
    >
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: "10px",
          display: "grid",
          placeItems: "center",
          color: "#67e8f9",
          backgroundColor: alpha("#22d3ee", 0.12),
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: "#8d96ad", fontSize: "0.67rem" }}>
          {label}
        </Typography>
        <Typography variant="subtitle2" sx={{ fontSize: "0.86rem", mt: 0.05 }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}
