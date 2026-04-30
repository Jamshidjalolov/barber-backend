import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import { Stack } from "@mui/material";
import { useMemo, useState } from "react";
import { BookingsDateNavigator } from "../components/bookings/BookingsDateNavigator";
import {
  BookingStatusFilter,
  BookingsFiltersCard,
} from "../components/bookings/BookingsFiltersCard";
import { BookingsManagementTable } from "../components/bookings/BookingsManagementTable";
import { DeleteBookingDialog } from "../components/bookings/DeleteBookingDialog";
import { PageHeader } from "../components/common/PageHeader";
import { BookingItem } from "../types";
import { formatUzbekReadableIsoDate, getLocalIsoDate } from "../utils/date";

interface BookingsPageProps {
  items: BookingItem[];
  onDeleteBooking: (bookingId: string) => Promise<void>;
}

function formatDateLabel(isoDate: string) {
  if (!isoDate) {
    return "Navbatlar topilmadi";
  }

  const todayIso = getLocalIsoDate();
  const prefix = isoDate === todayIso ? "Bugun" : "Tanlangan kun";

  return `${prefix} - ${formatUzbekReadableIsoDate(isoDate)}`;
}

function sortByTime(items: BookingItem[]) {
  return [...items].sort((left, right) => left.time.localeCompare(right.time));
}

export function BookingsPage({ items, onDeleteBooking }: BookingsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBarber, setSelectedBarber] = useState("all");
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>("all");
  const [bookingToDelete, setBookingToDelete] = useState<BookingItem | null>(null);

  const availableDates = useMemo(
    () => [...new Set(items.map((item) => item.date))].sort(),
    [items],
  );

  const defaultDate = useMemo(() => {
    if (availableDates.length === 0) {
      return "";
    }

    const todayIso = getLocalIsoDate();
    return availableDates.includes(todayIso) ? todayIso : availableDates[0];
  }, [availableDates]);

  const [selectedDate, setSelectedDate] = useState(defaultDate);

  const safeSelectedDate = availableDates.includes(selectedDate)
    ? selectedDate
    : defaultDate;

  const dateIndex = availableDates.indexOf(safeSelectedDate);

  const dateItems = useMemo(
    () => sortByTime(items.filter((item) => item.date === safeSelectedDate)),
    [items, safeSelectedDate],
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return dateItems.filter((item) => {
      const matchesSearch =
        query.length === 0 ||
        [item.customer, item.phone, item.id, item.barber, item.service]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesBarber =
        selectedBarber === "all" || item.barber === selectedBarber;

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "done"
            ? item.status === "Tugallandi"
            : item.status === "Kutilmoqda" ||
              item.status === "Tasdiqlandi" ||
              item.status === "Jarayonda";

      return matchesSearch && matchesBarber && matchesStatus;
    });
  }, [dateItems, searchQuery, selectedBarber, statusFilter]);

  const counts = useMemo(
    () => ({
      total: dateItems.length,
      done: dateItems.filter((item) => item.status === "Tugallandi").length,
      pending: dateItems.filter(
        (item) =>
          item.status === "Kutilmoqda" ||
          item.status === "Tasdiqlandi" ||
          item.status === "Jarayonda",
      ).length,
    }),
    [dateItems],
  );

  const barbers = useMemo(
    () => [...new Set(items.map((item) => item.barber))].sort(),
    [items],
  );

  const handleDeleteConfirm = async () => {
    if (!bookingToDelete) {
      return;
    }

    await onDeleteBooking(bookingToDelete.id);
    setBookingToDelete(null);
  };

  return (
    <Stack spacing={2.4}>
      <PageHeader
        title="Navbatlar"
        subtitle="Barcha navbatlarni kuzatish va boshqarish"
        icon={<EventNoteRoundedIcon sx={{ fontSize: "1.2rem" }} />}
        eyebrow="Admin paneli"
      />

      <BookingsDateNavigator
        label={formatDateLabel(safeSelectedDate)}
        total={counts.total}
        done={counts.done}
        pending={counts.pending}
        canGoPrev={dateIndex > 0}
        canGoNext={dateIndex < availableDates.length - 1}
        onPrev={() => {
          if (dateIndex > 0) {
            setSelectedDate(availableDates[dateIndex - 1]);
          }
        }}
        onNext={() => {
          if (dateIndex < availableDates.length - 1) {
            setSelectedDate(availableDates[dateIndex + 1]);
          }
        }}
      />

      <BookingsFiltersCard
        searchQuery={searchQuery}
        selectedBarber={selectedBarber}
        statusFilter={statusFilter}
        barbers={barbers}
        onSearchChange={setSearchQuery}
        onBarberChange={setSelectedBarber}
        onStatusChange={setStatusFilter}
      />

      <BookingsManagementTable items={filteredItems} onDelete={setBookingToDelete} />

      <DeleteBookingDialog
        open={Boolean(bookingToDelete)}
        booking={bookingToDelete}
        onClose={() => setBookingToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </Stack>
  );
}
