import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { AppBar, Box, Drawer, IconButton, Toolbar } from "@mui/material";
import { ReactNode, useState } from "react";
import { BrandLogo } from "../components/common/BrandLogo";
import { Sidebar } from "../components/navigation/Sidebar";
import { AdminUser, PageKey } from "../types";

interface AdminLayoutProps {
  activePage: PageKey;
  currentUser: AdminUser;
  onLogout: () => void;
  onPageChange: (page: PageKey) => void;
  children: ReactNode;
}

const drawerWidth = 268;
const mobileDrawerWidth = "min(84vw, 300px)";

export function AdminLayout({
  activePage,
  currentUser,
  onLogout,
  onPageChange,
  children,
}: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <Sidebar
      activePage={activePage}
      currentUser={currentUser}
      onLogout={() => {
        setMobileOpen(false);
        onLogout();
      }}
      onPageChange={(page) => {
        onPageChange(page);
        setMobileOpen(false);
      }}
    />
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          display: { md: "none" },
          backdropFilter: "blur(14px)",
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: 1.5 }}>
          <BrandLogo badgeSize={42} />
          <IconButton onClick={() => setMobileOpen(true)}>
            <MenuRoundedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: mobileDrawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          {sidebarContent}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          px: { xs: 1.25, sm: 2, md: 4, xl: 5 },
          pt: { xs: 10, sm: 10.5, md: 4.5 },
          pb: { xs: 2.5, md: 4 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
