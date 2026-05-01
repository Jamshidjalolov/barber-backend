export function getLocalDateInput(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function formatTime(isoString: string) {
  const date = new Date(isoString);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function formatDateLabel(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "short",
  });
}

export function buildIsoFromLocal(date: string, time: string) {
  const value = new Date(`${date}T${time}:00`);
  return Number.isNaN(value.getTime()) ? null : value.toISOString();
}

export function buildTimeSlots(start = 9, end = 19) {
  const slots: string[] = [];
  for (let hour = start; hour <= end; hour += 1) {
    for (const minute of [0, 30]) {
      if (hour === end && minute > 0) {
        continue;
      }
      slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
    }
  }
  return slots;
}
