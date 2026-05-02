import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { alpha, Alert, Box, Button, Chip, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import { FormEvent, ReactNode, useState } from "react";
import { AuthShell } from "./AuthShell";

interface LoginField {
  key: string;
  label: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
}

interface RoleLoginPageProps {
  eyebrow: string;
  title: string;
  description: string;
  contentTitle: string;
  contentDescription: string;
  submitLabel: string;
  highlights: Array<{ title: string; description: string }>;
  demoHints: string[];
  values: Record<string, string>;
  fields: LoginField[];
  error: string;
  isSubmitting?: boolean;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onBack?: () => void;
  children?: ReactNode;
}

export function RoleLoginPage({
  eyebrow,
  title,
  description,
  contentTitle,
  contentDescription,
  submitLabel,
  highlights,
  demoHints,
  values,
  fields,
  error,
  isSubmitting = false,
  secondaryActionLabel,
  onSecondaryAction,
  onChange,
  onSubmit,
  onBack,
  children,
}: RoleLoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const autofillSx = {
    "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus": {
      WebkitTextFillColor: "#f8fafc",
      WebkitBoxShadow: "0 0 0 100px #121326 inset",
      transition: "background-color 9999s ease-out 0s",
      caretColor: "#f8fafc",
      borderRadius: "14px",
    },
  };

  return (
    <AuthShell
      eyebrow={eyebrow}
      title={title}
      description={description}
      contentTitle={contentTitle}
      contentDescription={contentDescription}
      highlights={highlights}
      onBack={onBack}
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
        <Stack spacing={1}>
          {fields.map((field) => (
            <Box key={field.key}>
              <Typography variant="subtitle2" sx={{ mb: 0.45, fontSize: "0.88rem" }}>
                {field.label}
              </Typography>
              <TextField
                fullWidth
                type={field.type === "password" && showPassword ? "text" : field.type ?? "text"}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                value={values[field.key] ?? ""}
                onChange={(event) => onChange(field.key, event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {field.key.toLowerCase().includes("phone") ? (
                        <PhoneIphoneRoundedIcon sx={{ color: "#8d96ad" }} />
                      ) : field.type === "password" ? (
                        <LockRoundedIcon sx={{ color: "#8d96ad" }} />
                      ) : (
                        <PersonRoundedIcon sx={{ color: "#8d96ad" }} />
                      )}
                    </InputAdornment>
                  ),
                  endAdornment:
                    field.type === "password" ? (
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
                    ) : undefined,
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
                  "& .MuiInputAdornment-root": {
                    color: "#98a0b2",
                  },
                }}
              />
            </Box>
          ))}

          {error ? (
            <Alert
              severity="error"
              sx={{
                borderRadius: "16px",
                alignItems: "center",
              }}
            >
              {error}
            </Alert>
          ) : null}

          {demoHints.length ? (
            <Stack direction="row" flexWrap="wrap" gap={0.6} sx={{ pt: 0.1 }}>
              {demoHints.map((hint) => (
                <Chip
                  key={hint}
                  label={hint}
                  size="small"
                  sx={{
                    borderRadius: "999px",
                    backgroundColor: alpha("#ffffff", 0.06),
                    color: "#cbd5e1",
                    border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
                    "& .MuiChip-label": {
                      px: 1,
                      fontWeight: 600,
                    },
                  }}
                />
              ))}
            </Stack>
          ) : null}

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{
              minHeight: 52,
              borderRadius: "16px",
              mt: 0.2,
              fontSize: "0.98rem",
              boxShadow: "0 14px 26px rgba(17,17,17,0.12)",
            }}
          >
            {isSubmitting ? "Kutib turing..." : submitLabel}
          </Button>

          {secondaryActionLabel && onSecondaryAction ? (
            <Button
              type="button"
              variant="text"
              disabled={isSubmitting}
              onClick={onSecondaryAction}
              sx={{ borderRadius: "14px", textTransform: "none", fontWeight: 700 }}
            >
              {secondaryActionLabel}
            </Button>
          ) : null}
        </Stack>

        {children}
      </Box>
    </AuthShell>
  );
}
