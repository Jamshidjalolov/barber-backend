import { alpha, createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#111111",
    },
    secondary: {
      main: "#d5a546",
    },
    success: {
      main: "#3aa66f",
    },
    warning: {
      main: "#d6a622",
    },
    background: {
      default: "#f3ede3",
      paper: "#fbf6ee",
    },
    text: {
      primary: "#121212",
      secondary: "#766d5d",
    },
    divider: alpha("#2b241a", 0.08),
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
      fontWeight: 700,
      fontSize: "1.2rem",
    },
    h6: {
      fontWeight: 700,
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
      fontWeight: 600,
      fontSize: "0.94rem",
    },
    subtitle2: {
      fontWeight: 600,
      fontSize: "0.8rem",
      letterSpacing: "0.02em",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#f3ede3",
          backgroundImage:
            "radial-gradient(circle at top left, rgba(213, 165, 70, 0.14), transparent 26%), radial-gradient(circle at bottom right, rgba(122, 151, 121, 0.11), transparent 24%), linear-gradient(180deg, #f7f1e7 0%, #f2ebe0 55%, #efe6da 100%)",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
        },
        "#root": {
          minHeight: "100vh",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 22px 60px rgba(17, 17, 17, 0.05)",
          backgroundImage:
            "linear-gradient(180deg, rgba(255, 252, 247, 0.98) 0%, rgba(249, 243, 233, 0.96) 100%)",
          border: `1px solid ${alpha("#7a5d31", 0.07)}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${alpha("#121212", 0.08)}`,
          background:
            "linear-gradient(180deg, rgba(249,244,236,1) 0%, rgba(244,236,223,1) 100%)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha("#fbf6ee", 0.82),
          backgroundImage:
            "linear-gradient(180deg, rgba(251,246,238,0.96) 0%, rgba(247,240,229,0.88) 100%)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: alpha("#fffaf3", 0.88),
          transition: "box-shadow 180ms ease, border-color 180ms ease",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha("#7a5d31", 0.1),
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha("#7a5d31", 0.18),
          },
          "&.Mui-focused": {
            boxShadow: `0 0 0 4px ${alpha("#d5a546", 0.12)}`,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha("#d5a546", 0.4),
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: "none",
          fontWeight: 700,
        },
        contained: {
          boxShadow: "0 12px 22px rgba(17, 17, 17, 0.1)",
        },
        outlined: {
          borderColor: alpha("#121212", 0.12),
          backgroundColor: alpha("#fffaf3", 0.5),
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 700,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          height: 8,
          backgroundColor: alpha("#121212", 0.08),
        },
        bar: {
          borderRadius: 999,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: "#857b68",
          fontWeight: 700,
          backgroundColor: alpha("#d5a546", 0.05),
          borderBottom: `1px solid ${alpha("#121212", 0.08)}`,
        },
        body: {
          borderBottom: `1px solid ${alpha("#121212", 0.06)}`,
        },
      },
    },
  },
});
