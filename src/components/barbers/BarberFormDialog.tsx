import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FmdGoodRoundedIcon from "@mui/icons-material/FmdGoodRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import OndemandVideoRoundedIcon from "@mui/icons-material/OndemandVideoRounded";
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
  onUploadMedia?: (file: File) => Promise<string>;
  initialBarber?: BarberProfile | null;
}

interface BarberFormValues {
  fullName: string;
  specialty: string;
  photoUrl: string;
  mediaUrl: string;
  rating: string;
  yearsExp: string;
  username: string;
  password: string;
  bio: string;
  workStartTime: string;
  workEndTime: string;
  address: string;
  latitude: string;
  longitude: string;
  priceHaircut: string;
  priceFade: string;
  priceHairBeard: string;
  pricePremium: string;
  priceBeard: string;
}

const emptyValues: BarberFormValues = {
  fullName: "",
  specialty: "",
  photoUrl: "",
  mediaUrl: "",
  rating: "4.8",
  yearsExp: "1",
  username: "",
  password: "",
  bio: "",
  workStartTime: "09:00",
  workEndTime: "18:30",
  address: "",
  latitude: "",
  longitude: "",
  priceHaircut: "70000",
  priceFade: "90000",
  priceHairBeard: "120000",
  pricePremium: "180000",
  priceBeard: "50000",
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
    mediaUrl: barber.mediaUrl ?? "",
    rating: barber.rating.toString(),
    yearsExp: getYearsValue(barber.experience),
    username: barber.username,
    password: barber.password ?? "",
    bio: barber.bio ?? "",
    workStartTime: barber.workStartTime,
    workEndTime: barber.workEndTime,
    address: barber.address ?? "",
    latitude: barber.latitude?.toString() ?? "",
    longitude: barber.longitude?.toString() ?? "",
    priceHaircut: barber.priceHaircut.toString(),
    priceFade: barber.priceFade.toString(),
    priceHairBeard: barber.priceHairBeard.toString(),
    pricePremium: barber.pricePremium.toString(),
    priceBeard: barber.priceBeard.toString(),
  };
}

function parseOptionalNumber(value: string) {
  if (!value.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
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
            backgroundColor: alpha("#ffffff", 0.06),
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha("#c4b5fd", 0.16),
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
  onUploadMedia,
  initialBarber,
}: BarberFormDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [formValues, setFormValues] = useState<BarberFormValues>(emptyValues);
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [uploadingField, setUploadingField] = useState<"photoUrl" | "mediaUrl" | null>(null);
  const [locating, setLocating] = useState(false);

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
      mediaUrl: getSafeImageUrl(formValues.mediaUrl),
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

  const setFieldValue = (name: keyof BarberFormValues, value: string) => {
    setError("");
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    field: "photoUrl" | "mediaUrl",
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    if (!onUploadMedia) {
      setError("Fayl yuklash uchun avval tizimga kiring.");
      return;
    }

    try {
      setError("");
      setUploadingField(field);
      const url = await onUploadMedia(file);
      setFieldValue(field, url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Faylni yuklab bo'lmadi.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleUseCurrentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Brauzer lokatsiyani o'qiy olmadi.");
      return;
    }

    setError("");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormValues((current) => ({
          ...current,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError("Joriy joylashuvni olib bo'lmadi.");
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 5 * 60 * 1000,
      },
    );
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
    const mediaUrl = normalizeImageUrlInput(formValues.mediaUrl);
    const latitude = parseOptionalNumber(formValues.latitude);
    const longitude = parseOptionalNumber(formValues.longitude);
    const prices = {
      priceHaircut: Number(formValues.priceHaircut),
      priceFade: Number(formValues.priceFade),
      priceHairBeard: Number(formValues.priceHairBeard),
      pricePremium: Number(formValues.pricePremium),
      priceBeard: Number(formValues.priceBeard),
    };

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

    if (!formValues.workStartTime || !formValues.workEndTime || formValues.workEndTime <= formValues.workStartTime) {
      setError("Ish vaqti to'g'ri kiritilishi kerak.");
      return;
    }

    if ((latitude !== undefined && !Number.isFinite(latitude)) || (longitude !== undefined && !Number.isFinite(longitude))) {
      setError("Lokatsiya koordinatalari noto'g'ri.");
      return;
    }

    if (Object.values(prices).some((value) => !Number.isFinite(value) || value < 0)) {
      setError("Xizmat narxlari 0 dan katta yoki teng bo'lishi kerak.");
      return;
    }

    try {
      await onSubmit({
        fullName,
        specialty,
        photoUrl: photoUrl && getSafeImageUrl(photoUrl) ? photoUrl : "",
        mediaUrl: mediaUrl && getSafeImageUrl(mediaUrl) ? mediaUrl : "",
        rating,
        yearsExp,
        username,
        password: password || undefined,
        bio: formValues.bio.trim() || undefined,
        workStartTime: formValues.workStartTime,
        workEndTime: formValues.workEndTime,
        address: formValues.address.trim() || undefined,
        latitude,
        longitude,
        ...prices,
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
          background:
            "linear-gradient(180deg, rgba(18,18,31,0.96) 0%, rgba(9,10,20,0.94) 100%)",
          border: isMobile ? "none" : `1px solid ${alpha("#c4b5fd", 0.16)}`,
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

              <Box sx={{ gridColumn: { sm: "1 / -1", lg: "span 2" } }}>
                <Stack spacing={0.85}>
                  <Typography variant="subtitle2" sx={{ color: (theme) => theme.palette.text.primary }}>
                    Rasm va video
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <Button
                      component="label"
                      variant="outlined"
                      disabled={Boolean(uploadingField)}
                      startIcon={<AddPhotoAlternateRoundedIcon />}
                      sx={{ minHeight: 50, borderRadius: "16px", textTransform: "none" }}
                    >
                      {uploadingField === "photoUrl" ? "Rasm yuklanmoqda..." : preview.photoUrl ? "Rasmni almashtirish" : "Rasm tanlash"}
                      <Box
                        component="input"
                        type="file"
                        accept="image/*"
                        sx={{ display: "none" }}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => void handleUpload(event, "photoUrl")}
                      />
                    </Button>
                    <Button
                      component="label"
                      variant="outlined"
                      disabled={Boolean(uploadingField)}
                      startIcon={<OndemandVideoRoundedIcon />}
                      sx={{ minHeight: 50, borderRadius: "16px", textTransform: "none" }}
                    >
                      {uploadingField === "mediaUrl" ? "Media yuklanmoqda..." : preview.mediaUrl ? "Mediani almashtirish" : "Video/Rasm tanlash"}
                      <Box
                        component="input"
                        type="file"
                        accept="image/*,video/*"
                        sx={{ display: "none" }}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => void handleUpload(event, "mediaUrl")}
                      />
                    </Button>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Fayllar backendga yuklanadi, URL qo'lda kiritilmaydi.
                  </Typography>
                </Stack>
              </Box>

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
                label="Ish boshlanishi"
                name="workStartTime"
                value={formValues.workStartTime}
                onChange={handleChange}
                placeholder="09:00"
                type="time"
              />

              <Field
                label="Ish tugashi"
                name="workEndTime"
                value={formValues.workEndTime}
                onChange={handleChange}
                placeholder="18:30"
                type="time"
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

              <Box sx={{ gridColumn: "1 / -1" }}>
                <Stack spacing={1}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <FmdGoodRoundedIcon sx={{ color: "#67e8f9", fontSize: "1rem" }} />
                      <Typography variant="subtitle2">Lokatsiya</Typography>
                    </Stack>
                    <Button
                      variant="outlined"
                      onClick={handleUseCurrentLocation}
                      disabled={locating}
                      startIcon={<MyLocationRoundedIcon />}
                      sx={{ borderRadius: "14px", textTransform: "none" }}
                    >
                      {locating ? "Joy olinmoqda..." : "Mening joyim"}
                    </Button>
                  </Stack>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr" },
                      gap: 1.25,
                    }}
                  >
                    <Field
                      label="Manzil"
                      name="address"
                      value={formValues.address}
                      onChange={handleChange}
                      placeholder="Masalan, Chilonzor 7-kvartal"
                    />
                    <Field
                      label="Latitude"
                      name="latitude"
                      value={formValues.latitude}
                      onChange={handleChange}
                      placeholder="41.2995"
                      type="number"
                    />
                    <Field
                      label="Longitude"
                      name="longitude"
                      value={formValues.longitude}
                      onChange={handleChange}
                      placeholder="69.2401"
                      type="number"
                    />
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ gridColumn: "1 / -1" }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                      lg: "repeat(5, minmax(0, 1fr))",
                    },
                    gap: 1.25,
                  }}
                >
                  <Field label="Soch olish" name="priceHaircut" value={formValues.priceHaircut} onChange={handleChange} placeholder="70000" type="number" />
                  <Field label="Fade" name="priceFade" value={formValues.priceFade} onChange={handleChange} placeholder="90000" type="number" />
                  <Field label="Soch + soqol" name="priceHairBeard" value={formValues.priceHairBeard} onChange={handleChange} placeholder="120000" type="number" />
                  <Field label="Premium" name="pricePremium" value={formValues.pricePremium} onChange={handleChange} placeholder="180000" type="number" />
                  <Field label="Soqol" name="priceBeard" value={formValues.priceBeard} onChange={handleChange} placeholder="50000" type="number" />
                </Box>
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
                  borderColor: alpha("#c4b5fd", 0.18),
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
