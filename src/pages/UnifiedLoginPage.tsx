import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import {
  alpha,
  Alert,
  Box,
  Button,
  Chip,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AuthShell } from "../components/auth/AuthShell";
import { ApiRole } from "../types";

interface UnifiedLoginPageProps {
  selectedRole: ApiRole;
  onRoleChange: (role: ApiRole) => void;
  onCustomerLogin: (phone: string, password: string, remember?: boolean) => Promise<void>;
  onBarberLogin: (username: string, password: string, remember?: boolean) => Promise<void>;
  onAdminLogin: (username: string, password: string, remember?: boolean) => Promise<void>;
  onOpenRegister: () => void;
}

const roleItems: Array<{
  role: ApiRole;
  label: string;
  icon: typeof PersonRoundedIcon;
}> = [
  { role: "customer", label: "Foydalanuvchi", icon: PersonRoundedIcon },
  { role: "barber", label: "Barber", icon: ContentCutRoundedIcon },
  { role: "admin", label: "Admin", icon: AdminPanelSettingsRoundedIcon },
];

export function UnifiedLoginPage({
  selectedRole,
  onRoleChange,
  onCustomerLogin,
  onBarberLogin,
  onAdminLogin,
  onOpenRegister,
}: UnifiedLoginPageProps) {
  const [customerValues, setCustomerValues] = useState({
    phone: "",
    password: "",
  });
  const [barberValues, setBarberValues] = useState({
    username: "",
    password: "",
  });
  const [adminValues, setAdminValues] = useState({
    username: "jamshidjalolov6767@gmail.com",
    password: "jamshid4884",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    setError("");
  }, [selectedRole]);

  const currentMeta = useMemo(() => {
    if (selectedRole === "customer") {
      return {
        eyebrow: "Kirish",
        title: "Kirish",
        description: "Rolni tanlang va kiriting.",
        loginLabel: "Telefon raqam",
        loginPlaceholder: "Telefon raqam",
        loginValue: customerValues.phone,
        passwordValue: customerValues.password,
      };
    }

    if (selectedRole === "barber") {
      return {
        eyebrow: "Kirish",
        title: "Kirish",
        description: "Rolni tanlang va kiriting.",
        loginLabel: "Login",
        loginPlaceholder: "Login",
        loginValue: barberValues.username,
        passwordValue: barberValues.password,
      };
    }

    return {
      eyebrow: "Kirish",
      title: "Kirish",
      description: "Rolni tanlang va kiriting.",
      loginLabel: "Login",
      loginPlaceholder: "Email yoki login",
      loginValue: adminValues.username,
      passwordValue: adminValues.password,
    };
  }, [adminValues.password, adminValues.username, barberValues.password, barberValues.username, customerValues.password, customerValues.phone, selectedRole]);

  const autofillSx = {
    "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus": {
      WebkitTextFillColor: "#f8fafc",
      WebkitBoxShadow: "0 0 0 100px #121326 inset",
      transition: "background-color 9999s ease-out 0s",
      caretColor: "#f8fafc",
      borderRadius: "14px",
    },
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSubmitting(true);

      if (selectedRole === "customer") {
        await onCustomerLogin(customerValues.phone, customerValues.password, rememberMe);
        return;
      }

      if (selectedRole === "barber") {
        await onBarberLogin(barberValues.username, barberValues.password, rememberMe);
        return;
      }

      await onAdminLogin(adminValues.username, adminValues.password, rememberMe);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Kirishda xato yuz berdi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow={currentMeta.eyebrow}
      title={currentMeta.title}
      description={currentMeta.description}
      contentTitle=""
      contentDescription=""
      highlights={[]}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: { xs: 1.25, md: 1.5 },
          borderRadius: "22px",
          background:
            "linear-gradient(180deg, rgba(18,18,31,0.86) 0%, rgba(10,11,22,0.78) 100%)",
          border: `1px solid ${alpha("#c4b5fd", 0.14)}`,
          boxShadow: "0 18px 44px rgba(0,0,0,0.28)",
          backdropFilter: "blur(18px)",
        }}
      >
        <Stack spacing={1.1}>
          <Stack direction="row" gap={0.7} flexWrap="wrap">
            {roleItems.map(({ role, label, icon: Icon }) => {
              const selected = selectedRole === role;

              return (
                <Chip
                  key={role}
                  icon={<Icon sx={{ fontSize: "0.95rem !important" }} />}
                  label={label}
                  clickable
                  onClick={() => onRoleChange(role)}
                  sx={{
                    height: 36,
                    borderRadius: "999px",
                    color: selected ? "#fff" : "#aab2c8",
                    background: selected
                      ? "linear-gradient(135deg, rgba(139,92,246,1) 0%, rgba(34,211,238,0.88) 100%)"
                      : alpha("#ffffff", 0.06),
                    border: `1px solid ${selected ? alpha("#67e8f9", 0.34) : alpha("#c4b5fd", 0.12)}`,
                    "& .MuiChip-icon": {
                      color: selected ? "#fff" : "#8d96ad",
                    },
                    "& .MuiChip-label": {
                      px: 1.05,
                      fontWeight: 700,
                    },
                  }}
                />
              );
            })}
          </Stack>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 0.45, fontSize: "0.88rem" }}>
              {currentMeta.loginLabel}
            </Typography>
            <TextField
              fullWidth
              autoComplete={selectedRole === "customer" ? "tel" : "username"}
              placeholder={currentMeta.loginPlaceholder}
              value={currentMeta.loginValue}
              onChange={(event) => {
                const value = event.target.value;
                setError("");

                if (selectedRole === "customer") {
                  setCustomerValues((current) => ({ ...current, phone: value }));
                  return;
                }

                if (selectedRole === "barber") {
                  setBarberValues((current) => ({ ...current, username: value }));
                  return;
                }

                setAdminValues((current) => ({ ...current, username: value }));
              }}
              InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {selectedRole === "customer" ? (
                      <PhoneIphoneRoundedIcon sx={{ color: "#8d96ad" }} />
                    ) : (
                      <PersonRoundedIcon sx={{ color: "#8d96ad" }} />
                    )}
                  </InputAdornment>
                ),
              }}
              sx={{
                ...autofillSx,
                "& .MuiOutlinedInput-root": {
                  minHeight: 54,
                  borderRadius: "17px",
                  backgroundColor: alpha("#101224", 0.92),
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: alpha("#c4b5fd", 0.14),
                },
                "& .MuiInputBase-input": {
                  py: 1.45,
                },
              }}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 0.45, fontSize: "0.88rem" }}>
              Parol
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Parolni kiriting"
              value={currentMeta.passwordValue}
              onChange={(event) => {
                const value = event.target.value;
                setError("");

                if (selectedRole === "customer") {
                  setCustomerValues((current) => ({ ...current, password: value }));
                  return;
                }

                if (selectedRole === "barber") {
                  setBarberValues((current) => ({ ...current, password: value }));
                  return;
                }

                setAdminValues((current) => ({ ...current, password: value }));
              }}
              InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                    <LockRoundedIcon sx={{ color: "#8d96ad" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                      edge="end"
                      onClick={() => setShowPassword((current) => !current)}
                      sx={{ width: 36, height: 36 }}
                    >
                      {showPassword ? (
                        <VisibilityOffRoundedIcon sx={{ fontSize: "1.08rem" }} />
                      ) : (
                        <VisibilityRoundedIcon sx={{ fontSize: "1.08rem" }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                ...autofillSx,
                "& .MuiOutlinedInput-root": {
                  minHeight: 54,
                  borderRadius: "17px",
                  backgroundColor: alpha("#101224", 0.92),
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: alpha("#c4b5fd", 0.14),
                },
                "& .MuiInputBase-input": {
                  py: 1.45,
                },
              }}
            />
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                sx={{ color: alpha("#c4b5fd", 0.62) }}
              />
            }
            label="Eslab qolish"
            sx={{
              mx: 0,
              width: "fit-content",
              color: "text.secondary",
              "& .MuiFormControlLabel-label": {
                fontSize: "0.86rem",
                fontWeight: 700,
              },
            }}
          />

          {error ? (
            <Alert severity="error" sx={{ borderRadius: "16px", alignItems: "center" }}>
              {error}
            </Alert>
          ) : null}

          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{
              minHeight: 52,
              borderRadius: "16px",
              mt: 0.15,
              fontSize: "0.98rem",
              boxShadow: "0 14px 26px rgba(17,17,17,0.12)",
            }}
          >
            {submitting ? "Kutib turing..." : "Kirish"}
          </Button>

          {selectedRole === "customer" ? (
            <Button
              type="button"
              variant="text"
              disabled={submitting}
              onClick={onOpenRegister}
              sx={{ borderRadius: "14px", textTransform: "none", fontWeight: 700 }}
            >
              Ro'yxatdan o'tish
            </Button>
          ) : null}
        </Stack>
      </Box>
    </AuthShell>
  );
}
