import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import { Alert, alpha, Box, Snackbar, Stack } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { BarberAppointmentsBoard, BarberScheduleFilter } from "../components/barber-panel/BarberAppointmentsBoard";
import { BookingDetailsDialog } from "../components/barber-panel/BookingDetailsDialog";
import { BarberDiscountManager } from "../components/barber-panel/BarberDiscountManager";
import { BarberSettingsDialog } from "../components/barber-panel/BarberSettingsDialog";
import { RejectBookingDialog } from "../components/barber-panel/RejectBookingDialog";
import { BarberStatsOverview } from "../components/barber-panel/BarberStatsOverview";
import { BarberWorkspaceHero } from "../components/barber-panel/BarberWorkspaceHero";
import { LogoutConfirmDialog } from "../components/navigation/LogoutConfirmDialog";
import { BarberProfile, BarberSettingsPayload, BookingItem, BookingStatus, DiscountFormPayload, DiscountItem } from "../types";
import { formatUzbekReadableDate, formatUzbekReadableIsoDate, getLocalIsoDate } from "../utils/date";

interface BarberPanelPageProps {
  barber: BarberProfile;
  bookings: BookingItem[];
  discounts: DiscountItem[];
  latestBookingId: string | null;
  telegramBotUsername?: string;
  reminderMinutes: number;
  onLogout: () => void;
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus, rejectionReason?: string) => void;
  onCreateDiscount: (payload: DiscountFormPayload) => Promise<DiscountItem>;
  onDeleteDiscount: (discountId: string) => Promise<void>;
  onUpdateSettings: (payload: BarberSettingsPayload) => Promise<BarberProfile>;
  onUploadMedia: (file: File) => Promise<string>;
}

function matchesBarber(booking: BookingItem, barber: BarberProfile) {
  if (booking.barberId && booking.barberId === barber.id) {
    return true;
  }

  if (booking.barberUserId && barber.userId && booking.barberUserId === barber.userId) {
    return true;
  }

  const bookingBarber = booking.barber.trim().toLowerCase();
  const fullName = barber.name.trim().toLowerCase();
  const firstName = (barber.name.split(" ")[0] ?? "").trim().toLowerCase();

  return bookingBarber === fullName || bookingBarber === firstName;
}

function getSortStamp(item: BookingItem) {
  const source = item.createdAt || item.updatedAt;
  if (source) {
    const parsed = new Date(source).getTime();
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  const fallback = new Date(`${item.date}T${item.time}:00`).getTime();
  return Number.isNaN(fallback) ? 0 : fallback;
}

function sortByLatestRequest(items: BookingItem[], highlightedBookingId?: string | null) {
  return [...items].sort((left, right) => {
    if (highlightedBookingId) {
      if (left.id === highlightedBookingId) {
        return -1;
      }
      if (right.id === highlightedBookingId) {
        return 1;
      }
    }

    const rightStamp = getSortStamp(right);
    const leftStamp = getSortStamp(left);

    if (rightStamp !== leftStamp) {
      return rightStamp - leftStamp;
    }

    return right.time.localeCompare(left.time);
  });
}

export function BarberPanelPage({
  barber,
  bookings,
  discounts,
  latestBookingId,
  telegramBotUsername,
  reminderMinutes,
  onLogout,
  onUpdateBookingStatus,
  onCreateDiscount,
  onDeleteDiscount,
  onUpdateSettings,
  onUploadMedia,
}: BarberPanelPageProps) {
  const [selectedDate, setSelectedDate] = useState(getLocalIsoDate());
  const [filter, setFilter] = useState<BarberScheduleFilter>("all");
  const [highlightedBookingId, setHighlightedBookingId] = useState<string | null>(latestBookingId);
  const [feedback, setFeedback] = useState<{ message: string; tone: "success" | "info" } | null>(null);
  const [rejectTarget, setRejectTarget] = useState<BookingItem | null>(null);
  const [detailTarget, setDetailTarget] = useState<BookingItem | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [discountsOpen, setDiscountsOpen] = useState(false);
  const scheduleRef = useRef<HTMLDivElement | null>(null);
  const notifiedBookingIdRef = useRef<string | null>(null);

  const barberBookings = useMemo(
    () => bookings.filter((item) => matchesBarber(item, barber)),
    [bookings, barber],
  );
  const barberDiscounts = useMemo(
    () =>
      discounts
        .filter((item) => item.barberId === barber.id || item.barberUserId === barber.userId)
        .sort((left, right) =>
          `${left.date}${left.startTime}`.localeCompare(`${right.date}${right.startTime}`),
        ),
    [barber.id, barber.userId, discounts],
  );

  const availableDates = useMemo(() => {
    const dates = [...new Set(barberBookings.map((item) => item.date))].sort();
    const todayIso = getLocalIsoDate();

    return dates.includes(todayIso) ? dates : [todayIso, ...dates];
  }, [barberBookings]);

  useEffect(() => {
    if (!availableDates.includes(selectedDate)) {
      setSelectedDate(availableDates[0] ?? getLocalIsoDate());
    }
  }, [availableDates, selectedDate]);

  const dateIndex = availableDates.indexOf(selectedDate);

  const selectedDateBookings = useMemo(
    () => barberBookings.filter((item) => item.date === selectedDate),
    [barberBookings, selectedDate],
  );

  const counts = useMemo(
    () => ({
      total: selectedDateBookings.length,
      awaiting: selectedDateBookings.filter((item) => item.status === "Kutilmoqda").length,
      accepted: selectedDateBookings.filter((item) =>
        item.status === "Tasdiqlandi" || item.status === "Jarayonda",
      ).length,
      completed: selectedDateBookings.filter((item) => item.status === "Tugallandi").length,
      rejected: selectedDateBookings.filter((item) => item.status === "Rad etildi").length,
    }),
    [selectedDateBookings],
  );

  const filteredBookings = useMemo(() => {
    let items = selectedDateBookings;

    if (filter === "rejected") {
      items = selectedDateBookings.filter((item) => item.status === "Rad etildi");
      return sortByLatestRequest(items, highlightedBookingId);
    }

    if (filter === "completed") {
      items = selectedDateBookings.filter((item) => item.status === "Tugallandi");
      return sortByLatestRequest(items, highlightedBookingId);
    }

    if (filter === "pending") {
      items = selectedDateBookings.filter(
        (item) =>
          item.status === "Kutilmoqda" ||
          item.status === "Tasdiqlandi" ||
          item.status === "Jarayonda",
      );
      return sortByLatestRequest(items, highlightedBookingId);
    }

    return sortByLatestRequest(items, highlightedBookingId);
  }, [filter, highlightedBookingId, selectedDateBookings]);

  const latestBooking = useMemo(() => {
    if (latestBookingId) {
      const tracked = bookings.find((item) => item.id === latestBookingId);
      if (tracked && matchesBarber(tracked, barber)) {
        return tracked;
      }
    }

    return sortByLatestRequest(barberBookings)[0] ?? null;
  }, [barber, barberBookings, bookings, latestBookingId]);

  useEffect(() => {
    if (!latestBooking || notifiedBookingIdRef.current === latestBooking.id) {
      return;
    }

    notifiedBookingIdRef.current = latestBooking.id;
    setSelectedDate(latestBooking.date);
    setHighlightedBookingId(latestBooking.id);
    setFeedback({
      message: `Yangi bron: ${latestBooking.customer} ${latestBooking.time} ga yozildi`,
      tone: "success",
    });
  }, [latestBooking]);

  const handleAdvanceStatus = (booking: BookingItem) => {
    if (booking.status === "Tugallandi" || booking.status === "Rad etildi") {
      return;
    }

    const nextStatus =
      booking.status === "Kutilmoqda"
        ? "Tasdiqlandi"
        : "Tugallandi";

    onUpdateBookingStatus(booking.id, nextStatus);
    setFeedback({
      message:
        nextStatus === "Tasdiqlandi"
          ? `${booking.customer} broni qabul qilindi`
          : `${booking.customer} uchun navbat tugatildi`,
      tone: "success",
    });
  };

  const handleRejectConfirm = (reason: string) => {
    if (!rejectTarget) {
      return;
    }

    onUpdateBookingStatus(rejectTarget.id, "Rad etildi", reason);
    setFeedback({
      message: `${rejectTarget.customer} broni rad etildi`,
      tone: "info",
    });
    setRejectTarget(null);
  };

  const handleCopyPhone = async (booking: BookingItem) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(booking.phone);
        setFeedback({
          message: `${booking.customer} telefoni nusxalandi`,
          tone: "info",
        });
      }
    } catch {
      setFeedback({
        message: "Telefonni nusxalab bo'lmadi",
        tone: "info",
      });
    }
  };

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          px: { xs: 1.25, sm: 2.5, xl: 3.25 },
          py: { xs: 1.5, sm: 2.5, xl: 3 },
          background:
            "radial-gradient(circle at 12% -8%, rgba(139,92,246,0.2), transparent 28%), radial-gradient(circle at 90% 4%, rgba(34,211,238,0.12), transparent 26%)",
        }}
      >
        <Box sx={{ width: "min(1360px, 100%)", mx: "auto" }}>
          <Stack spacing={2.2}>
            <BarberWorkspaceHero
              barber={barber}
              dateLabel={formatUzbekReadableIsoDate(selectedDate) || formatUzbekReadableDate(new Date())}
              pendingCount={counts.awaiting}
              activeDiscountCount={barberDiscounts.length}
              latestBooking={latestBooking}
              onOpenDiscounts={() => setDiscountsOpen(true)}
              onOpenSettings={() => setSettingsOpen(true)}
              onLogout={() => setLogoutOpen(true)}
            />

            <BarberStatsOverview
              total={counts.total}
              accepted={counts.accepted}
              completed={counts.completed}
              rejected={counts.rejected}
              progressValue={counts.total === 0 ? 0 : (counts.completed / counts.total) * 100}
              onOpenSchedule={() =>
                scheduleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            />

            {latestBooking ? (
              <Alert
                icon={<CampaignRoundedIcon fontSize="inherit" />}
                severity="success"
                sx={{
                  borderRadius: "20px",
                  alignItems: "center",
                  "& .MuiAlert-message": { width: "100%" },
                }}
              >
                <strong>{latestBooking.customer}</strong> navbat oldi. {latestBooking.time} dagi bron jadvalda ko&apos;rinib turibdi.
              </Alert>
            ) : null}

            <Box ref={scheduleRef}>
              <BarberAppointmentsBoard
                items={filteredBookings}
                selectedDateLabel={formatUzbekReadableIsoDate(selectedDate)}
                total={counts.total}
                pending={counts.awaiting + counts.accepted}
                completed={counts.completed}
                rejected={counts.rejected}
                filter={filter}
                highlightedBookingId={highlightedBookingId}
                canGoPrev={dateIndex > 0}
                canGoNext={dateIndex >= 0 && dateIndex < availableDates.length - 1}
                onPrevDate={() => {
                  if (dateIndex > 0) {
                    setSelectedDate(availableDates[dateIndex - 1]);
                  }
                }}
                onNextDate={() => {
                  if (dateIndex >= 0 && dateIndex < availableDates.length - 1) {
                    setSelectedDate(availableDates[dateIndex + 1]);
                  }
                }}
                onFilterChange={setFilter}
                onOpenDetails={setDetailTarget}
                onCopyPhone={handleCopyPhone}
                onAdvanceStatus={handleAdvanceStatus}
                onRejectBooking={setRejectTarget}
              />
            </Box>
          </Stack>
        </Box>
      </Box>

      <RejectBookingDialog
        booking={rejectTarget}
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
      />

      <BarberSettingsDialog
        open={settingsOpen}
        barber={barber}
        onClose={() => setSettingsOpen(false)}
        onSubmit={onUpdateSettings}
        onUploadMedia={onUploadMedia}
        telegramBotUsername={telegramBotUsername}
        reminderMinutes={reminderMinutes}
      />

      <BarberDiscountManager
        open={discountsOpen}
        items={barberDiscounts}
        onClose={() => setDiscountsOpen(false)}
        onCreate={onCreateDiscount}
        onDelete={onDeleteDiscount}
      />

      <BookingDetailsDialog
        open={Boolean(detailTarget)}
        booking={detailTarget}
        onClose={() => setDetailTarget(null)}
      />

      <LogoutConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => {
          setLogoutOpen(false);
          onLogout();
        }}
        message="Haqiqatan ham chiqmoqchimisiz? Tasdiqlasangiz, barber paneldan chiqasiz."
      />

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={2600}
        onClose={() => setFeedback(null)}
      >
        <Alert
          onClose={() => setFeedback(null)}
          severity={feedback?.tone ?? "info"}
          icon={feedback?.tone === "success" ? <AssignmentTurnedInRoundedIcon fontSize="inherit" /> : undefined}
          sx={{ width: "100%" }}
        >
          {feedback?.message}
        </Alert>
      </Snackbar>
    </>
  );
}
