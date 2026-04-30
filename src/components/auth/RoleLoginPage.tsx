import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { alpha, Alert, Box, Button, Chip, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import { FormEvent, ReactNode } from "react";
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
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const autofillSx = {
    "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus": {
      WebkitTextFillColor: "#111111",
      WebkitBoxShadow: "0 0 0 100px #fffdf9 inset",
      transition: "background-color 9999s ease-out 0s",
      caretColor: "#111111",
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
            "linear-gradient(180deg, rgba(255,252,247,0.94) 0%, rgba(255,255,255,1) 100%)",
          border: `1px solid ${alpha("#111111", 0.06)}`,
          boxShadow: "0 14px 34px rgba(17,17,17,0.05)",
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
                type={field.type ?? "text"}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                value={values[field.key] ?? ""}
                onChange={(event) => onChange(field.key, event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {field.key.toLowerCase().includes("phone") ? (
                        <PhoneIphoneRoundedIcon sx={{ color: "#a4aaba" }} />
                      ) : field.type === "password" ? (
                        <LockRoundedIcon sx={{ color: "#a4aaba" }} />
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
                    backgroundColor: alpha("#111111", 0.04),
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
