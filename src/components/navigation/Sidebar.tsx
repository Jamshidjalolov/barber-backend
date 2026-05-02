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
      <Stack
        sx={{
          height: "100%",
          p: { xs: 2, md: 2.2 },
          gap: 3.2,
          background:
            "radial-gradient(circle at 14% 4%, rgba(139,92,246,0.2), transparent 28%), radial-gradient(circle at 88% 20%, rgba(34,211,238,0.12), transparent 26%)",
        }}
      >
        <BrandLogo badgeSize={48} tone="light" />

        <List
          sx={{
            p: 0.7,
            display: "grid",
            gap: 0.75,
            borderRadius: "20px",
            backgroundColor: alpha("#ffffff", 0.05),
            border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
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
                  background: selected
                    ? "linear-gradient(135deg, rgba(139,92,246,1) 0%, rgba(34,211,238,0.86) 100%)"
                    : "transparent",
                  "&.Mui-selected": {
                    background:
                      "linear-gradient(135deg, rgba(139,92,246,1) 0%, rgba(34,211,238,0.86) 100%)",
                    color: "#fff",
                    boxShadow: `0 16px 28px ${alpha("#8b5cf6", 0.28)}`,
                  },
                  "&.Mui-selected:hover": {
                    background:
                      "linear-gradient(135deg, rgba(139,92,246,1) 0%, rgba(34,211,238,0.86) 100%)",
                  },
                  "&:hover": {
                    backgroundColor: selected ? undefined : alpha("#ffffff", 0.07),
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
              "linear-gradient(180deg, rgba(21,21,36,0.78) 0%, rgba(11,12,24,0.7) 100%)",
            border: `1px solid ${alpha("#c4b5fd", 0.14)}`,
            boxShadow: "0 18px 42px rgba(0, 0, 0, 0.24)",
            backdropFilter: "blur(18px)",
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
                backgroundColor: alpha("#ffffff", 0.06),
                border: `1px solid ${alpha("#c4b5fd", 0.11)}`,
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "13px",
                  bgcolor: "#8b5cf6",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  boxShadow: `0 12px 24px ${alpha("#8b5cf6", 0.24)}`,
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
                  border: `1px solid ${alpha("#ffffff", 0.1)}`,
                  flexShrink: 0,
                  "&:hover": {
                    backgroundColor: alpha("#fb7185", 0.22),
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
                  backgroundColor: alpha("#8b5cf6", 0.18),
                  color: "#ddd6fe",
                  border: `1px solid ${alpha("#c4b5fd", 0.16)}`,
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
                  backgroundColor: alpha("#34d399", 0.12),
                  border: `1px solid ${alpha("#34d399", 0.14)}`,
                }}
              >
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: "#34d399",
                    boxShadow: `0 0 12px ${alpha("#34d399", 0.8)}`,
                  }}
                />
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#86efac" }}>
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
