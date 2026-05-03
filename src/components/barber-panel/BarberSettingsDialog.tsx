import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FmdGoodRoundedIcon from "@mui/icons-material/FmdGoodRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import OndemandVideoRoundedIcon from "@mui/icons-material/OndemandVideoRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import SellRoundedIcon from "@mui/icons-material/SellRounded";
import {
  alpha,
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChangeEvent, FormEvent, ReactNode, useEffect, useState } from "react";
import { BarberProfile, BarberSettingsPayload } from "../../types";
import { BarberLocationPickerMap } from "../maps/BarberLocationPickerMap";

interface BarberSettingsDialogProps {
  open: boolean;
  barber: BarberProfile;
  onClose: () => void;
  onSubmit: (payload: BarberSettingsPayload) => Promise<unknown>;
  onUploadMedia: (file: File) => Promise<string>;
}

interface FormValues {
  fullName: string;
  username: string;
  specialty: string;
  photoUrl: string;
  mediaUrl: string;
  rating: string;
  yearsExp: string;
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

function toFormValues(barber: BarberProfile): FormValues {
  return {
    fullName: barber.name,
    username: barber.username,
    specialty: barber.specialty,
    photoUrl: barber.photoUrl ?? "",
    mediaUrl: barber.mediaUrl ?? "",
    rating: barber.rating.toString(),
    yearsExp: barber.experience.match(/\d+/)?.[0] ?? "0",
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

export function BarberSettingsDialog({
  open,
  barber,
  onClose,
  onSubmit,
  onUploadMedia,
}: BarberSettingsDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [formValues, setFormValues] = useState<FormValues>(() => toFormValues(barber));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [uploadingField, setUploadingField] = useState<"photoUrl" | "mediaUrl" | null>(null);

  useEffect(() => {
    if (open) {
      setFormValues(toFormValues(barber));
      setError("");
    }
  }, [barber, open]);

  const handleLocationChange = (coords: { latitude: number; longitude: number }) => {
    setFormValues((current) => ({
      ...current,
      latitude: coords.latitude.toFixed(6),
      longitude: coords.longitude.toFixed(6),
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

    try {
      setError("");
      setUploadingField(field);
      const url = await onUploadMedia(file);
      setFormValues((current) => ({
        ...current,
        [field]: url,
      }));
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
        handleLocationChange({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
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
    setError("");

    const priceHaircut = Number(formValues.priceHaircut);
    const priceFade = Number(formValues.priceFade);
    const priceHairBeard = Number(formValues.priceHairBeard);
    const pricePremium = Number(formValues.pricePremium);
    const priceBeard = Number(formValues.priceBeard);
    const rating = Number(formValues.rating);
    const yearsExp = Number(formValues.yearsExp);
    const latitude = formValues.latitude ? Number(formValues.latitude) : undefined;
    const longitude = formValues.longitude ? Number(formValues.longitude) : undefined;

    if (formValues.fullName.trim().length < 2 || formValues.specialty.trim().length < 2 || formValues.username.trim().length < 3) {
      setError("Ism, mutaxassislik va username to'liq kiritilishi kerak.");
      return;
    }

    if (!formValues.workStartTime || !formValues.workEndTime) {
      setError("Ish vaqtini to'liq kiriting.");
      return;
    }

    if (formValues.workEndTime <= formValues.workStartTime) {
      setError("Ish tugash vaqti boshlanishdan keyin bo'lishi kerak.");
      return;
    }

    if ([priceHaircut, priceFade, priceHairBeard, pricePremium, priceBeard].some((value) => !Number.isFinite(value) || value < 0)) {
      setError("Narxlar 0 dan katta yoki teng bo'lishi kerak.");
      return;
    }

    if (!Number.isFinite(rating) || rating < 0 || rating > 5 || !Number.isFinite(yearsExp) || yearsExp < 0) {
      setError("Reyting va tajriba to'g'ri kiritilishi kerak.");
      return;
    }

    if ((latitude !== undefined && !Number.isFinite(latitude)) || (longitude !== undefined && !Number.isFinite(longitude))) {
      setError("Lokatsiya koordinatalari noto'g'ri.");
      return;
    }

    try {
      setSaving(true);
      await onSubmit({
        fullName: formValues.fullName.trim(),
        username: formValues.username.trim(),
        specialty: formValues.specialty.trim(),
        photoUrl: formValues.photoUrl.trim(),
        mediaUrl: formValues.mediaUrl.trim(),
        rating,
        yearsExp,
        bio: formValues.bio.trim() || undefined,
        workStartTime: formValues.workStartTime,
        workEndTime: formValues.workEndTime,
        address: formValues.address.trim() || undefined,
        latitude,
        longitude,
        priceHaircut,
        priceFade,
        priceHairBeard,
        pricePremium,
        priceBeard,
      });
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Sozlamalarni saqlab bo'lmadi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={fullScreen}
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit,
        sx: {
          borderRadius: fullScreen ? 0 : "28px",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(18,18,31,0.96) 0%, rgba(9,10,20,0.94) 100%)",
          border: fullScreen ? "none" : `1px solid ${alpha("#c4b5fd", 0.16)}`,
        },
      }}
    >
      <DialogTitle sx={{ px: { xs: 2.2, md: 2.6 }, py: { xs: 1.8, md: 2.1 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5">Ish sozlamalari</Typography>
            <Typography variant="body2" color="text.primary">
              Ish vaqti, narxlar va lokatsiyani shu yerda boshqaring.
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2.2, md: 2.6 }, py: { xs: 2, md: 2.3 } }}>
        <Stack spacing={1.6}>
          <Panel
            icon={<PersonRoundedIcon sx={{ fontSize: "1rem" }} />}
            title="Profil ko'rinishi"
          >
            <Stack spacing={1.2}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ xs: "stretch", sm: "center" }}>
                <Avatar
                  variant="rounded"
                  src={formValues.photoUrl}
                  sx={{
                    width: 74,
                    height: 74,
                    borderRadius: "20px",
                    bgcolor: barber.avatarColor,
                    fontWeight: 800,
                  }}
                >
                  {barber.initials}
                </Avatar>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flex={1}>
                  <Button
                    component="label"
                    variant="outlined"
                    disabled={Boolean(uploadingField)}
                    startIcon={<AddPhotoAlternateRoundedIcon />}
                    sx={{ minHeight: 46, borderRadius: "14px", textTransform: "none" }}
                  >
                    {uploadingField === "photoUrl" ? "Rasm yuklanmoqda..." : formValues.photoUrl ? "Rasmni almashtirish" : "Rasm tanlash"}
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
                    sx={{ minHeight: 46, borderRadius: "14px", textTransform: "none" }}
                  >
                    {uploadingField === "mediaUrl" ? "Media yuklanmoqda..." : formValues.mediaUrl ? "Mediani almashtirish" : "Video/Rasm tanlash"}
                    <Box
                      component="input"
                      type="file"
                      accept="image/*,video/*"
                      sx={{ display: "none" }}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => void handleUpload(event, "mediaUrl")}
                    />
                  </Button>
                </Stack>
              </Stack>
              <GridFields>
                <Field label="Ism familya" value={formValues.fullName} onChange={(value) => setFormValues((current) => ({ ...current, fullName: value }))} placeholder="Ism familya" />
                <Field label="Username" value={formValues.username} onChange={(value) => setFormValues((current) => ({ ...current, username: value }))} placeholder="username" />
                <Field label="Mutaxassislik" value={formValues.specialty} onChange={(value) => setFormValues((current) => ({ ...current, specialty: value }))} placeholder="Fade master" />
                <Field label="Reyting" type="number" value={formValues.rating} onChange={(value) => setFormValues((current) => ({ ...current, rating: value }))} placeholder="4.8" />
                <Field label="Tajriba yili" type="number" value={formValues.yearsExp} onChange={(value) => setFormValues((current) => ({ ...current, yearsExp: value }))} placeholder="3" />
              </GridFields>
              <Field label="Bio" value={formValues.bio} onChange={(value) => setFormValues((current) => ({ ...current, bio: value }))} placeholder="Mijozlar ko'radigan tavsif" />
              {formValues.mediaUrl ? (
                <Typography variant="caption" color="text.secondary">
                  Media yuklandi va mijozlar barber kartasida ko'radi.
                </Typography>
              ) : null}
            </Stack>
          </Panel>

          <Panel
          icon={<ScheduleRoundedIcon sx={{ fontSize: "1rem" }} />}
          title="Ish vaqti"
        >
            <GridFields>
              <Field label="Boshlanish" type="time" value={formValues.workStartTime} onChange={(value) => setFormValues((current) => ({ ...current, workStartTime: value }))} />
              <Field label="Tugash" type="time" value={formValues.workEndTime} onChange={(value) => setFormValues((current) => ({ ...current, workEndTime: value }))} />
            </GridFields>
          </Panel>

          <Panel
            icon={<SellRoundedIcon sx={{ fontSize: "1rem" }} />}
            title="Xizmat narxlari"
          >
            <GridFields>
              <Field label="Soch olish" type="number" value={formValues.priceHaircut} onChange={(value) => setFormValues((current) => ({ ...current, priceHaircut: value }))} />
              <Field label="Fade qirqim" type="number" value={formValues.priceFade} onChange={(value) => setFormValues((current) => ({ ...current, priceFade: value }))} />
              <Field label="Soch + soqol" type="number" value={formValues.priceHairBeard} onChange={(value) => setFormValues((current) => ({ ...current, priceHairBeard: value }))} />
              <Field label="Premium paket" type="number" value={formValues.pricePremium} onChange={(value) => setFormValues((current) => ({ ...current, pricePremium: value }))} />
              <Field label="Soqol dizayni" type="number" value={formValues.priceBeard} onChange={(value) => setFormValues((current) => ({ ...current, priceBeard: value }))} />
            </GridFields>
          </Panel>

          <Panel
            icon={<FmdGoodRoundedIcon sx={{ fontSize: "1rem" }} />}
            title="Lokatsiya"
          >
            <Stack spacing={1.2}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
                <Typography variant="body2" color="text.primary">
                  Xarita ustidan nuqtani bosing yoki markerni suring.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleUseCurrentLocation}
                  disabled={locating}
                  startIcon={<MyLocationRoundedIcon />}
                  sx={{ alignSelf: { xs: "stretch", sm: "center" }, borderRadius: "14px", textTransform: "none" }}
                >
                  {locating ? "Joy olinmoqda..." : "Mening joyim"}
                </Button>
              </Stack>

              <BarberLocationPickerMap
                value={
                  formValues.latitude && formValues.longitude
                    ? {
                        latitude: Number(formValues.latitude),
                        longitude: Number(formValues.longitude),
                      }
                    : null
                }
                address={formValues.address}
                onChange={handleLocationChange}
              />

              <GridFields columns={{ xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }}>
              <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                <Field label="Manzil" value={formValues.address} onChange={(value) => setFormValues((current) => ({ ...current, address: value }))} placeholder="Masalan, Chilonzor 5-kvartal" />
              </Box>
              <Field label="Latitude" type="number" value={formValues.latitude} onChange={(value) => setFormValues((current) => ({ ...current, latitude: value }))} placeholder="41.2995" />
              <Field label="Longitude" type="number" value={formValues.longitude} onChange={(value) => setFormValues((current) => ({ ...current, longitude: value }))} placeholder="69.2401" />
              </GridFields>
            </Stack>
          </Panel>

          {error ? (
            <Alert severity="error" sx={{ borderRadius: "16px" }}>
              {error}
            </Alert>
          ) : null}

          <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={1.2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{ minWidth: 160, minHeight: 48, borderRadius: "16px", textTransform: "none" }}
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              sx={{ minWidth: 220, minHeight: 48, borderRadius: "16px", textTransform: "none", fontWeight: 700 }}
            >
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function Panel({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        p: 1.35,
        borderRadius: "22px",
        backgroundColor: alpha("#ffffff", 0.05),
        border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
      }}
    >
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1.2 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "12px",
            display: "grid",
            placeItems: "center",
            backgroundColor: alpha("#22d3ee", 0.12),
            color: "#67e8f9",
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle1">{title}</Typography>
      </Stack>
      {children}
    </Box>
  );
}

function GridFields({
  children,
  columns = { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
}: {
  children: ReactNode;
  columns?: { xs: string; md: string };
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: columns,
        gap: 1.1,
      }}
    >
      {children}
    </Box>
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
      <Typography variant="subtitle2" sx={{ color: (theme) => theme.palette.text.primary }}>
        {label}
      </Typography>
      <TextField
        fullWidth
        size="small"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        sx={{
          "& .MuiOutlinedInput-root": {
            minHeight: 48,
            borderRadius: "16px",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                ? alpha("#ffffff", 0.06)
                : alpha("#f7efe8", 0.95),
          },
          "& .MuiInputBase-input": {
            color: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.92)"),
          },
          "& .MuiInputBase-input::placeholder": {
            color: (theme) => (theme.palette.mode === "dark" ? "rgba(255,255,255,0.58)" : "rgba(0,0,0,0.5)"),
          },
        }}
      />
    </Stack>
  );
}
