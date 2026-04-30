import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import {
  alpha,
  Avatar,
  Box,
  Chip,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { AdminUser, PageKey } from "../../types";
import { BrandLogo } from "../common/BrandLogo";
import { LogoutConfirmDialog } from "./LogoutConfirmDialog";

interface SidebarProps {
  activePage: PageKey;
  currentUser: AdminUser;
  onLogout: () => void;
  onPageChange: (page: PageKey) => void;
}

const navigationItems = [
  { key: "dashboard" as const, label: "Bosh sahifa", icon: DashboardRoundedIcon },
  { key: "barberlar" as const, label: "Barberlar", icon: Groups2RoundedIcon },
  { key: "navbatlar" as const, label: "Navbatlar", icon: EventNoteRoundedIcon },
  { key: "skidkalar" as const, label: "Skidkalar", icon: LocalOfferRoundedIcon },
];

function formatLoginLabel(username: string) {
  return username.includes("@") ? username : `@${username}`;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "AD";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function Sidebar({
  activePage,
  currentUser,
  onLogout,
  onPageChange,
}: SidebarProps) {
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <>
      <Stack sx={{ height: "100%", p: { xs: 2, md: 2.2 }, gap: 3.2 }}>
        <BrandLogo badgeSize={48} />

        <List
          sx={{
            p: 0.7,
            display: "grid",
            gap: 0.75,
            borderRadius: "20px",
            backgroundColor: alpha("#fffaf3", 0.52),
            border: `1px solid ${alpha("#7a5d31", 0.06)}`,
          }}
        >
          {navigationItems.map(({ key, label, icon: Icon }) => {
            const selected = activePage === key;

            return (
              <ListItemButton
                key={key}
                selected={selected}
                onClick={() => onPageChange(key)}
                sx={{
                  minHeight: 48,
                  borderRadius: "14px",
                  px: 1.6,
                  color: selected ? "#fff" : "text.secondary",
                  backgroundColor: selected ? "primary.main" : "transparent",
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "#fff",
                    boxShadow: "0 10px 18px rgba(17, 17, 17, 0.12)",
                  },
                  "&.Mui-selected:hover": {
                    backgroundColor: "primary.main",
                  },
                  "&:hover": {
                    backgroundColor: selected
                      ? "primary.main"
                      : alpha("#121212", 0.04),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
                  <Icon sx={{ fontSize: "1.15rem" }} />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    fontWeight: 700,
                    color: "inherit",
                    fontSize: "0.92rem",
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>

        <Box
          sx={{
            mt: "auto",
            p: 1,
            borderRadius: "18px",
            background:
              "linear-gradient(180deg, rgba(255,252,247,0.98) 0%, rgba(246,238,225,0.96) 100%)",
            border: `1px solid ${alpha("#7a5d31", 0.09)}`,
            boxShadow: "0 10px 24px rgba(17, 17, 17, 0.04)",
          }}
        >
          <Stack spacing={0.85}>
            <Stack
              direction="row"
              spacing={0.9}
              alignItems="center"
              sx={{
                p: 0.75,
                borderRadius: "14px",
                backgroundColor: alpha("#ffffff", 0.72),
                border: `1px solid ${alpha("#111111", 0.04)}`,
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "13px",
                  bgcolor: "#111111",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                }}
              >
                {getInitials(currentUser.name)}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    lineHeight: 1.1,
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {currentUser.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  title={formatLoginLabel(currentUser.username)}
                  sx={{
                    mt: 0.2,
                    fontSize: "0.76rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                  }}
                >
                  {formatLoginLabel(currentUser.username)}
                </Typography>
              </Box>

              <IconButton
                onClick={() => setLogoutOpen(true)}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "11px",
                  backgroundColor: "#111111",
                  color: "#fff",
                  flexShrink: 0,
                  "&:hover": {
                    backgroundColor: "#1f1f1f",
                  },
                }}
              >
                <LogoutRoundedIcon sx={{ fontSize: "0.95rem" }} />
              </IconButton>
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={0.8}>
              <Chip
                label={currentUser.role}
                size="small"
                sx={{
                  height: 25,
                  borderRadius: "10px",
                  backgroundColor: alpha("#d5a546", 0.14),
                  color: "#8f6a0c",
                  "& .MuiChip-label": {
                    px: 1.05,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                  },
                }}
              />

              <Stack
                direction="row"
                spacing={0.55}
                alignItems="center"
                sx={{
                  px: 0.8,
                  py: 0.42,
                  borderRadius: "999px",
                  backgroundColor: alpha("#3aa66f", 0.1),
                }}
              >
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: "#3aa66f",
                  }}
                />
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#28774d" }}>
                  Online
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Stack>

      <LogoutConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => {
          setLogoutOpen(false);
          onLogout();
        }}
      />
    </>
  );
}
