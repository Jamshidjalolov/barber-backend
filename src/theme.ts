import { alpha, createTheme } from "@mui/material/styles";

const neonPurple = "#8b5cf6";
const neonCyan = "#22d3ee";
const luxuryGold = "#f6c85f";
const ink = "#05050a";
const panel = "#11111d";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: neonPurple,
      light: "#c4b5fd",
      dark: "#5b21b6",
      contrastText: "#ffffff",
    },
    secondary: {
      main: neonCyan,
      light: "#67e8f9",
      dark: "#0891b2",
      contrastText: "#031014",
    },
    success: {
      main: "#34d399",
    },
    warning: {
      main: luxuryGold,
    },
    error: {
      main: "#fb7185",
    },
    background: {
      default: ink,
      paper: alpha(panel, 0.82),
    },
    text: {
      primary: "#f8fafc",
      secondary: "#aab2c8",
    },
    divider: alpha("#c4b5fd", 0.13),
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Manrope", "Segoe UI", sans-serif',
    h3: {
      fontWeight: 800,
      fontSize: "2.05rem",
      lineHeight: 1.05,
    },
    h4: {
      fontWeight: 800,
      fontSize: "1.6rem",
      lineHeight: 1.1,
    },
    h5: {
      fontWeight: 800,
      fontSize: "1.2rem",
    },
    h6: {
      fontWeight: 800,
      fontSize: "1rem",
    },
    body1: {
      fontSize: "0.94rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.88rem",
      lineHeight: 1.5,
    },
    subtitle1: {
      fontWeight: 700,
      fontSize: "0.94rem",
    },
    subtitle2: {
      fontWeight: 700,
      fontSize: "0.8rem",
      letterSpacing: "0.02em",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: ink,
          backgroundImage:
            "radial-gradient(circle at 12% -8%, rgba(139,92,246,0.32), transparent 32%), radial-gradient(circle at 92% 6%, rgba(34,211,238,0.18), transparent 30%), radial-gradient(circle at 50% 112%, rgba(246,200,95,0.14), transparent 35%), linear-gradient(135deg, #05050a 0%, #0b0714 36%, #12091f 62%, #07111d 100%)",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
          color: "#f8fafc",
          WebkitFontSmoothing: "antialiased",
          textRendering: "optimizeLegibility",
        },
        "#root": {
          minHeight: "100vh",
        },
        "::selection": {
          backgroundColor: alpha(neonCyan, 0.35),
          color: "#ffffff",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          color: "#f8fafc",
          boxShadow: "0 24px 70px rgba(0, 0, 0, 0.38)",
          backgroundImage:
            "linear-gradient(180deg, rgba(19,19,32,0.88) 0%, rgba(12,12,22,0.78) 100%)",
          border: `1px solid ${alpha("#c4b5fd", 0.13)}`,
          backdropFilter: "blur(22px)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          color: "#f8fafc",
          backgroundImage:
            "linear-gradient(180deg, rgba(19,19,32,0.86) 0%, rgba(12,12,22,0.76) 100%)",
          border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
          backdropFilter: "blur(18px)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${alpha("#c4b5fd", 0.13)}`,
          background:
            "linear-gradient(180deg, rgba(8,8,16,0.98) 0%, rgba(17,10,31,0.96) 54%, rgba(6,12,22,0.98) 100%)",
          boxShadow: "18px 0 60px rgba(0,0,0,0.28)",
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: alpha("#020617", 0.68),
          backdropFilter: "blur(10px)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          color: "#f8fafc",
          background:
            "linear-gradient(180deg, rgba(18,18,31,0.96) 0%, rgba(9,10,20,0.94) 100%)",
          border: `1px solid ${alpha("#c4b5fd", 0.16)}`,
          boxShadow: "0 34px 100px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.06)",
          backdropFilter: "blur(24px)",
          backgroundImage:
            "linear-gradient(180deg, rgba(18,18,31,0.96) 0%, rgba(9,10,20,0.94) 100%)",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: "#f8fafc",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: "#f8fafc",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          borderTop: `1px solid ${alpha("#c4b5fd", 0.1)}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          color: "#f8fafc",
          backgroundColor: alpha("#080814", 0.78),
          backgroundImage:
            "linear-gradient(180deg, rgba(10,10,20,0.88) 0%, rgba(10,10,20,0.66) 100%)",
          borderBottom: `1px solid ${alpha("#c4b5fd", 0.13)}`,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          color: "#f8fafc",
          backgroundColor: alpha("#0f1020", 0.82),
          transition: "box-shadow 180ms ease, border-color 180ms ease, background-color 180ms ease",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha("#c4b5fd", 0.16),
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(neonCyan, 0.36),
          },
          "&.Mui-focused": {
            boxShadow: `0 0 0 4px ${alpha(neonPurple, 0.18)}`,
            backgroundColor: alpha("#111827", 0.92),
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(neonPurple, 0.62),
          },
        },
        input: {
          color: "#f8fafc",
          "&::placeholder": {
            color: alpha("#cbd5e1", 0.62),
            opacity: 1,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#aab2c8",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: "none",
          fontWeight: 800,
        },
        contained: {
          background:
            "linear-gradient(135deg, rgba(139,92,246,1) 0%, rgba(34,211,238,0.92) 100%)",
          boxShadow: `0 18px 34px ${alpha(neonPurple, 0.3)}`,
          "&:hover": {
            boxShadow: `0 22px 42px ${alpha(neonCyan, 0.24)}`,
          },
          "&.Mui-disabled": {
            color: alpha("#ffffff", 0.62),
            background: alpha("#1e293b", 0.72),
          },
        },
        outlined: {
          color: "#f8fafc",
          borderColor: alpha("#c4b5fd", 0.2),
          backgroundColor: alpha("#0f1020", 0.48),
          "&:hover": {
            borderColor: alpha(neonCyan, 0.5),
            backgroundColor: alpha(neonCyan, 0.08),
          },
        },
        text: {
          color: "#c4b5fd",
          "&:hover": {
            backgroundColor: alpha(neonPurple, 0.1),
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 800,
          borderColor: alpha("#c4b5fd", 0.16),
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#e5e7eb",
          transition: "transform 160ms ease, background-color 160ms ease, border-color 160ms ease",
          "&:hover": {
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          height: 8,
          backgroundColor: alpha("#c4b5fd", 0.12),
        },
        bar: {
          borderRadius: 999,
          background: `linear-gradient(90deg, ${neonPurple} 0%, ${neonCyan} 100%)`,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: "#c4b5fd",
          fontWeight: 800,
          backgroundColor: alpha("#8b5cf6", 0.08),
          borderBottom: `1px solid ${alpha("#c4b5fd", 0.14)}`,
        },
        body: {
          color: "#f8fafc",
          borderBottom: `1px solid ${alpha("#c4b5fd", 0.09)}`,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          backdropFilter: "blur(14px)",
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          backgroundColor: alpha("#10101c", 0.92),
          border: `1px solid ${alpha("#c4b5fd", 0.16)}`,
          color: "#f8fafc",
          boxShadow: "0 20px 50px rgba(0,0,0,0.36)",
        },
      },
    },
  },
});
