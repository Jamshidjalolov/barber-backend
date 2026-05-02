import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import {
  alpha,
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  IconButton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { getSafeImageUrl, normalizeImageUrlInput } from "../../lib/media";
import { BarberFormPayload, BarberProfile } from "../../types";

interface BarberFormDialogProps {
  open: boolean;
  mode: "add" | "edit";
  onClose: () => void;
  onSubmit: (payload: BarberFormPayload) => void | Promise<void>;
  initialBarber?: BarberProfile | null;
}

interface BarberFormValues {
  fullName: string;
  specialty: string;
  photoUrl: string;
  rating: string;
  yearsExp: string;
  username: string;
  password: string;
  bio: string;
}

const emptyValues: BarberFormValues = {
  fullName: "",
  specialty: "",
  photoUrl: "",
  rating: "4.8",
  yearsExp: "1",
  username: "",
  password: "",
  bio: "",
};

function buildInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "YB";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function normalizeUsername(username: string) {
  return username.trim().replace(/^@+/, "");
}

function getYearsValue(experience: string) {
  const match = experience.match(/\d+/);
  return match?.[0] ?? "1";
}

function toFormValues(barber?: BarberProfile | null): BarberFormValues {
  if (!barber) {
    return emptyValues;
  }

  return {
    fullName: barber.name,
    specialty: barber.specialty,
    photoUrl: barber.photoUrl ?? "",
    rating: barber.rating.toString(),
    yearsExp: getYearsValue(barber.experience),
    username: barber.username,
    password: barber.password ?? "",
    bio: barber.bio ?? "",
  };
}

function Field({
  label,
  endAdornment,
  ...props
}: {
  label: string;
  name: keyof BarberFormValues;
  value: string;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  placeholder: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  endAdornment?: ReactNode;
}) {
  return (
    <Stack spacing={0.85}>
      <Typography variant="subtitle2" sx={{ color: (theme) => theme.palette.text.primary }}>
        {label}
      </Typography>
      <TextField
        fullWidth
        size="small"
        variant="outlined"
        {...props}
        sx={{
          "& .MuiOutlinedInput-root": {
            minHeight: props.multiline ? "unset" : 50,
            borderRadius: "16px",
            backgroundColor: (theme) => theme.palette.background.paper,
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha("#7a5d31", 0.1),
          },
          "& .MuiInputBase-input": {
            py: 1.6,
            color: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.92)"),
          },
          "& .MuiInputBase-input::placeholder": {
            color: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,0.58)" : "rgba(0,0,0,0.5)"),
          },
        }}
        InputProps={
          endAdornment
            ? {
                endAdornment: (
                  <InputAdornment position="end">
                    {endAdornment}
                  </InputAdornment>
                ),
              }
            : undefined
        }
      />
    </Stack>
  );
}

export function BarberFormDialog({
  open,
  mode,
  onClose,
  onSubmit,
  initialBarber,
}: BarberFormDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [formValues, setFormValues] = useState<BarberFormValues>(emptyValues);
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setFormValues(toFormValues(initialBarber));
      setError("");
      setPasswordVisible(false);
    }
  }, [initialBarber, open]);

  const preview = useMemo(() => {
    const username = normalizeUsername(formValues.username);
    const fullName = formValues.fullName.trim() || "Yangi barber";
    const specialty = formValues.specialty.trim() || "Yo'nalish kiritilmagan";
    const yearsExp = Number(formValues.yearsExp) || 0;
    const rating = Number(formValues.rating) || 0;

    return {
      name: fullName,
      specialty,
      handle: username ? `@${username}` : "@username",
      experience: `${yearsExp} yil tajriba`,
      rating: rating.toFixed(1),
      initials: buildInitials(fullName),
      photoUrl: getSafeImageUrl(formValues.photoUrl),
    };
  }, [formValues]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setError("");
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const username = normalizeUsername(formValues.username);
    const fullName = formValues.fullName.trim();
    const specialty = formValues.specialty.trim();
    const password = formValues.password.trim();
    const yearsExp = Math.min(60, Math.max(0, Number(formValues.yearsExp) || 0));
    const rating = Math.min(5, Math.max(0, Number(formValues.rating) || 0));
    const photoUrl = normalizeImageUrlInput(formValues.photoUrl);

    if (fullName.length < 2) {
      setError("Ism kamida 2 ta harf bo'lishi kerak.");
      return;
    }

    if (specialty.length < 2) {
      setError("Mutaxassislik kamida 2 ta harf bo'lishi kerak.");
      return;
    }

    if (username.length < 3) {
      setError("Login kamida 3 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    if (mode === "add" && password.length < 4) {
      setError("Parol kamida 4 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    try {
      await onSubmit({
        fullName,
        specialty,
        photoUrl: photoUrl && getSafeImageUrl(photoUrl) ? photoUrl : "",
        rating,
        yearsExp,
        username,
        password: password || undefined,
        bio: formValues.bio.trim() || undefined,
      });

      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Barberni saqlab bo'lmadi.",
      );
    }
  };

  const title =
    mode === "edit"
      ? "Barber ma'lumotlarini tahrirlash"
      : "Yangi barber qo'shish";
  const subtitle =
    mode === "edit"
      ? "Kerakli maydonlarni yangilang va saqlang"
      : "Barcha maydonlar bitta oynada to'liq ko'rinadi";
  const submitLabel = mode === "edit" ? "Saqlash" : "Barber qo'shish";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={isMobile}
      maxWidth="lg"
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit,
        sx: {
          width: isMobile ? "100%" : "min(1200px, calc(100% - 24px))",
          borderRadius: isMobile ? 0 : "28px",
          overflow: "hidden",
          maxHeight: isMobile ? "100dvh" : "calc(100dvh - 24px)",
        },
      }}
    >
      <DialogTitle sx={{ px: { xs: 2.5, md: 3 }, py: { xs: 2, md: 2.25 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" sx={{ mb: 0.35 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ opacity: 0.95 }}>
              {subtitle}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ borderRadius: "14px" }}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent
        sx={{
          px: { xs: 2.5, md: 3 },
          py: { xs: 2.25, md: 2.5 },
          overflowY: "auto",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 2.25, md: 2.5 }}
          alignItems="stretch"
        >
          <Box
            sx={{
              width: { xs: "100%", md: 280 },
              flexShrink: 0,
              p: { xs: 2.25, md: 2.5 },
              borderRadius: "24px",
              background:
                "linear-gradient(160deg, rgba(17,17,17,1) 0%, rgba(42,42,42,1) 58%, rgba(213,165,70,0.92) 100%)",
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <AutoAwesomeRoundedIcon sx={{ fontSize: "1rem", color: "#f8d06c" }} />
                <Typography variant="subtitle2" sx={{ color: alpha("#fff", 0.82) }}>
                  Jonli ko'rinish
                </Typography>
              </Stack>

              <Stack
                spacing={2}
                sx={{
                  p: 2,
                  borderRadius: "22px",
                        backgroundColor: alpha("#fff", 0.08),
                        border: `1px solid ${alpha("#fff", 0.08)}`,
                        backdropFilter: "blur(16px)",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    variant="rounded"
                    src={preview.photoUrl}
                    sx={{
                      width: 68,
                      height: 68,
                      borderRadius: "20px",
                      bgcolor: "#1d1d1d",
                      border: `1px solid ${alpha("#fff", 0.12)}`,
                      fontWeight: 800,
                    }}
                  >
                    {preview.initials}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" sx={{ color: "#fff", mb: 0.5 }}>
                      {preview.name}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <StarRoundedIcon sx={{ color: "#f8d06c", fontSize: "1rem" }} />
                      <Typography variant="body2" sx={{ color: alpha("#fff", 0.84) }}>
                        {preview.rating} reyting
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>

                <Box>
                  <Typography
                    variant="body1"
                    sx={{ color: alpha("#fff", 0.88), mb: 0.45 }}
                  >
                    {preview.specialty}
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha("#fff", 0.68) }}>
                    {preview.experience} / {preview.handle}
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ color: alpha("#fff", 0.72), lineHeight: 1.6 }}>
                  Telegram ulash barber saqlangandan keyin o&apos;z kartasida alohida chiqadi.
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack spacing={1.75} sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                },
                gap: 1.75,
              }}
            >
              <Box sx={{ gridColumn: { sm: "1 / -1", lg: "span 2" } }}>
                <Field
                  label="To'liq ism"
                  name="fullName"
                  value={formValues.fullName}
                  onChange={handleChange}
                  placeholder="Masalan, Jamshid Sobirov"
                />
              </Box>

              <Field
                label="Mutaxassisligi"
                name="specialty"
                value={formValues.specialty}
                onChange={handleChange}
                placeholder="Fade va line-up"
              />

              <Field
                label="Rasm manzili"
                name="photoUrl"
                value={formValues.photoUrl}
                onChange={handleChange}
                placeholder="https://..."
              />

              <Field
                label="Reyting"
                name="rating"
                value={formValues.rating}
                onChange={handleChange}
                placeholder="4.8"
                type="number"
              />

              <Field
                label="Tajriba yili"
                name="yearsExp"
                value={formValues.yearsExp}
                onChange={handleChange}
                placeholder="1"
                type="number"
              />

              <Field
                label="Username"
                name="username"
                value={formValues.username}
                onChange={handleChange}
                placeholder="jamshid"
              />

              <Field
                label="Parol"
                name="password"
                value={formValues.password}
                onChange={handleChange}
                placeholder={mode === "edit" ? "Yangi parol kiriting" : "cut123"}
                type={passwordVisible ? "text" : "password"}
                endAdornment={
                  <IconButton
                    onClick={() => setPasswordVisible((current) => !current)}
                    edge="end"
                    size="small"
                    sx={{ color: "#8e7650" }}
                  >
                    {passwordVisible ? (
                      <VisibilityOffRoundedIcon fontSize="small" />
                    ) : (
                      <VisibilityRoundedIcon fontSize="small" />
                    )}
                  </IconButton>
                }
              />

              <Box>
                <Field
                  label="Qisqa bio"
                  name="bio"
                  value={formValues.bio}
                  onChange={handleChange}
                  placeholder="Barber haqida qisqa tavsif..."
                  multiline
                  rows={3}
                />
              </Box>
            </Box>

            {error ? (
              <Alert severity="error" sx={{ borderRadius: "16px" }}>
                {error}
              </Alert>
            ) : null}

            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              spacing={1.5}
              justifyContent="flex-end"
              sx={{ pt: 0.25 }}
            >
              <Button
                onClick={onClose}
                variant="outlined"
                sx={{
                  minWidth: 180,
                  minHeight: 50,
                  borderRadius: "18px",
                  textTransform: "none",
                  borderColor: alpha("#121212", 0.12),
                  color: "text.secondary",
                }}
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  minWidth: 220,
                  minHeight: 50,
                  borderRadius: "18px",
                  fontWeight: 700,
                }}
              >
                {submitLabel}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
