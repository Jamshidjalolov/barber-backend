import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import {
  alpha,
  Alert,
  Box,
  Button,
  Chip,
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
  onCustomerLogin: (phone: string, password: string) => Promise<void>;
  onBarberLogin: (username: string, password: string) => Promise<void>;
  onAdminLogin: (username: string, password: string) => Promise<void>;
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
      WebkitTextFillColor: "#111111",
      WebkitBoxShadow: "0 0 0 100px #fffdf9 inset",
      transition: "background-color 9999s ease-out 0s",
      caretColor: "#111111",
      borderRadius: "14px",
    },
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSubmitting(true);

      if (selectedRole === "customer") {
        await onCustomerLogin(customerValues.phone, customerValues.password);
        return;
      }

      if (selectedRole === "barber") {
        await onBarberLogin(barberValues.username, barberValues.password);
        return;
      }

      await onAdminLogin(adminValues.username, adminValues.password);
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
            "linear-gradient(180deg, rgba(255,252,247,0.94) 0%, rgba(255,255,255,1) 100%)",
          border: `1px solid ${alpha("#111111", 0.06)}`,
          boxShadow: "0 14px 34px rgba(17,17,17,0.05)",
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
                    color: selected ? "#fff" : "#4c5568",
                    backgroundColor: selected ? "#111111" : alpha("#111111", 0.04),
                    border: `1px solid ${selected ? "#111111" : alpha("#111111", 0.06)}`,
                    "& .MuiChip-icon": {
                      color: selected ? "#fff" : "#80889b",
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
                      <PhoneIphoneRoundedIcon sx={{ color: "#a4aaba" }} />
                    ) : (
                      <PersonRoundedIcon sx={{ color: "#a4aaba" }} />
                    )}
                  </InputAdornment>
                ),
              }}
              sx={{
                ...autofillSx,
                "& .MuiOutlinedInput-root": {
                  minHeight: 54,
                  borderRadius: "17px",
                  backgroundColor: alpha("#fffdf9", 0.96),
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: alpha("#7a5d31", 0.12),
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
              type="password"
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
                    <LockRoundedIcon sx={{ color: "#a4aaba" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                ...autofillSx,
                "& .MuiOutlinedInput-root": {
                  minHeight: 54,
                  borderRadius: "17px",
                  backgroundColor: alpha("#fffdf9", 0.96),
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: alpha("#7a5d31", 0.12),
                },
                "& .MuiInputBase-input": {
                  py: 1.45,
                },
              }}
            />
          </Box>

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
