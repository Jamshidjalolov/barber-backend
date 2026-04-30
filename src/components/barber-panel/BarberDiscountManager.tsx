import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import {
  Alert,
  alpha,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FormEvent, ReactNode, useMemo, useState } from "react";
import { DiscountFormPayload, DiscountItem } from "../../types";
import { formatUzbekReadableIsoDate, getLocalIsoDate } from "../../utils/date";

interface BarberDiscountManagerProps {
  open: boolean;
  items: DiscountItem[];
  onClose: () => void;
  onCreate: (payload: DiscountFormPayload) => Promise<DiscountItem>;
  onDelete: (discountId: string) => Promise<void>;
}

function getTodayIso() {
  return getLocalIsoDate();
}

function formatTimeRange(item: DiscountItem) {
  return `${item.startTime} - ${item.endTime}`;
}

export function BarberDiscountManager({
  open,
  items,
  onClose,
  onCreate,
  onDelete,
}: BarberDiscountManagerProps) {
  const [title, setTitle] = useState("Bugungi skidka");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getTodayIso());
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("13:00");
  const [percent, setPercent] = useState("15");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sortedItems = useMemo(
    () =>
      [...items].sort((left, right) =>
        `${right.date}${right.startTime}`.localeCompare(`${left.date}${left.startTime}`),
      ),
    [items],
  );

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const numericPercent = Number(percent);

    if (trimmedTitle.length < 2) {
      setError("Skidka nomini to'liqroq yozing.");
      return;
    }

    if (!date || !startTime || !endTime) {
      setError("Sana va vaqtlarni to'liq kiriting.");
      return;
    }

    if (!Number.isFinite(numericPercent) || numericPercent < 1 || numericPercent > 90) {
      setError("Skidka 1 dan 90 foizgacha bo'lishi kerak.");
      return;
    }

    const startsAt = new Date(`${date}T${startTime}:00`);
    const endsAt = new Date(`${date}T${endTime}:00`);

    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      setError("Vaqt noto'g'ri kiritildi.");
      return;
    }

    if (endsAt <= startsAt) {
      setError("Tugash vaqti boshlanishdan keyin bo'lishi kerak.");
      return;
    }

    try {
      setSaving(true);
      await onCreate({
        title: trimmedTitle,
        description: trimmedDescription || undefined,
        percent: numericPercent,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
      });
      setSuccess("Skidka saqlandi va xabar yuborildi.");
      setDescription("");
      setPercent("15");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Skidkani saqlab bo'lmadi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (discountId: string) => {
    try {
      setDeletingId(discountId);
      await onDelete(discountId);
      setSuccess("Skidka olib tashlandi.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Skidkani olib tashlab bo'lmadi.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: "30px",
          width: "min(1080px, calc(100% - 24px))",
          background:
            "linear-gradient(180deg, rgba(255,252,247,0.99) 0%, rgba(249,244,236,0.99) 100%)",
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Stack direction="row" spacing={1.3} alignItems="center">
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "18px",
                  backgroundColor: alpha("#d5a546", 0.16),
                  color: "#a1741a",
                }}
              >
                <SavingsRoundedIcon />
              </Box>
              <Box>
                <Typography variant="h5">Skidka boshqaruvi</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                  Sana, vaqt va foizni belgilang. Qolganlari avtomatik yuboriladi.
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                icon={<LocalOfferRoundedIcon sx={{ fontSize: "1rem !important" }} />}
                label={`${sortedItems.length} ta faol skidka`}
                sx={{
                  height: 34,
                  borderRadius: "999px",
                  backgroundColor: alpha("#d5a546", 0.12),
                  color: "#8f6617",
                  "& .MuiChip-label": { px: 1.1, fontWeight: 700 },
                }}
              />
              <IconButton
                onClick={onClose}
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "14px",
                  border: `1px solid ${alpha("#111111", 0.08)}`,
                }}
              >
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 0.98fr) minmax(340px, 1.02fr)" },
              gap: 1.5,
            }}
          >
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                p: 1.5,
                borderRadius: "24px",
                backgroundColor: alpha("#ffffff", 0.84),
                border: `1px solid ${alpha("#111111", 0.06)}`,
                boxShadow: "0 16px 34px rgba(17,17,17,0.04)",
              }}
            >
              <Stack spacing={1.25}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                    gap: 1.1,
                  }}
                >
                  <Field
                    label="Skidka nomi"
                    value={title}
                    onChange={setTitle}
                    placeholder="Masalan, tushlik aksiyasi"
                  />
                  <Field
                    label="Foiz"
                    value={percent}
                    onChange={setPercent}
                    placeholder="15"
                    type="number"
                  />
                  <Field label="Sana" value={date} onChange={setDate} type="date" />
                  <Field
                    label="Izoh"
                    value={description}
                    onChange={setDescription}
                    placeholder="Masalan, fade va soqol"
                  />
                  <Field
                    label="Boshlanish"
                    value={startTime}
                    onChange={setStartTime}
                    type="time"
                  />
                  <Field
                    label="Tugash"
                    value={endTime}
                    onChange={setEndTime}
                    type="time"
                  />
                </Box>

                {error ? (
                  <Alert severity="error" sx={{ borderRadius: "16px" }}>
                    {error}
                  </Alert>
                ) : null}

                {success ? (
                  <Alert severity="success" sx={{ borderRadius: "16px" }}>
                    {success}
                  </Alert>
                ) : null}

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    startIcon={<LocalOfferRoundedIcon />}
                    sx={{
                      minHeight: 48,
                      px: 2.1,
                      borderRadius: "16px",
                      textTransform: "none",
                      fontWeight: 800,
                      boxShadow: "none",
                    }}
                  >
                    {saving ? "Saqlanmoqda..." : "Skidka qo'yish"}
                  </Button>

                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => {
                      setTitle("Bugungi skidka");
                      setDescription("");
                      setDate(getTodayIso());
                      setStartTime("10:00");
                      setEndTime("13:00");
                      setPercent("15");
                      resetMessages();
                    }}
                    sx={{
                      minHeight: 48,
                      px: 2.1,
                      borderRadius: "16px",
                      textTransform: "none",
                      borderColor: alpha("#111111", 0.12),
                    }}
                  >
                    Tozalash
                  </Button>
                </Stack>
              </Stack>
            </Box>

            <Box
              sx={{
                p: 1.3,
                borderRadius: "24px",
                backgroundColor: alpha("#fffdfa", 0.84),
                border: `1px solid ${alpha("#111111", 0.06)}`,
              }}
            >
              <Stack spacing={1}>
                <Typography variant="subtitle1" sx={{ px: 0.4 }}>
                  Qo'yilgan skidkalar
                </Typography>

                {sortedItems.length ? (
                  sortedItems.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        p: 1.2,
                        borderRadius: "20px",
                        border: `1px solid ${alpha("#111111", 0.06)}`,
                        backgroundColor: "#fff",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Stack
                            direction="row"
                            spacing={0.8}
                            alignItems="center"
                            flexWrap="wrap"
                            useFlexGap
                          >
                            <Typography variant="subtitle1">{item.title}</Typography>
                            <Chip
                              size="small"
                              label={`${item.percent}%`}
                              sx={{
                                height: 26,
                                borderRadius: "999px",
                                backgroundColor: alpha("#3aa66f", 0.12),
                                color: "#207a49",
                                "& .MuiChip-label": { px: 1, fontWeight: 800 },
                              }}
                            />
                          </Stack>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
                            {item.description || "Izoh kiritilmagan"}
                          </Typography>
                        </Box>

                        <IconButton
                          onClick={() => void handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: "12px",
                            border: `1px solid ${alpha("#b65b5b", 0.18)}`,
                            color: "#b65b5b",
                          }}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={0.9}
                        sx={{ mt: 1.05 }}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <MetaPill
                          icon={<CalendarMonthRoundedIcon sx={{ fontSize: "0.95rem" }} />}
                          label={formatUzbekReadableIsoDate(item.date)}
                        />
                        <MetaPill
                          icon={<AccessTimeRoundedIcon sx={{ fontSize: "0.95rem" }} />}
                          label={formatTimeRange(item)}
                        />
                      </Stack>
                    </Box>
                  ))
                ) : (
                  <Box
                    sx={{
                      p: 1.4,
                      borderRadius: "20px",
                      border: `1px dashed ${alpha("#111111", 0.12)}`,
                      color: "text.secondary",
                      backgroundColor: alpha("#111111", 0.02),
                    }}
                  >
                    Hozircha skidka yo'q. Yangi skidka qo'ysangiz foydalanuvchi va botga xabar boradi.
                  </Box>
                )}
              </Stack>
            </Box>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <Stack spacing={0.7}>
      <Typography variant="subtitle2" sx={{ color: "#4a4338" }}>
        {label}
      </Typography>
      <TextField
        fullWidth
        size="small"
        variant="outlined"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        InputLabelProps={type === "date" || type === "time" ? { shrink: true } : undefined}
        sx={{
          "& .MuiOutlinedInput-root": {
            minHeight: 50,
            borderRadius: "16px",
            backgroundColor: alpha("#fffaf3", 0.82),
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha("#7a5d31", 0.1),
          },
          "& .MuiInputBase-input": {
            py: 1.6,
          },
        }}
      />
    </Stack>
  );
}

function MetaPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <Stack
      direction="row"
      spacing={0.55}
      alignItems="center"
      sx={{
        px: 1,
        py: 0.75,
        borderRadius: "999px",
        backgroundColor: alpha("#111111", 0.04),
        color: "#5f5b54",
      }}
    >
      {icon}
      <Typography variant="caption" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>
    </Stack>
  );
}
