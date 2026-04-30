import { Paper, PaperProps } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ReactNode } from "react";

interface SectionCardProps extends PaperProps {
  children: ReactNode;
}

export function SectionCard({ children, sx, ...rest }: SectionCardProps) {
  return (
    <Paper
      {...rest}
      sx={{
        p: { xs: 2, md: 2.6 },
        borderRadius: "18px",
        background:
          "linear-gradient(180deg, rgba(255,252,247,0.98) 0%, rgba(248,242,233,0.95) 100%)",
        border: `1px solid ${alpha("#7a5d31", 0.07)}`,
        boxShadow: "0 14px 30px rgba(58, 44, 23, 0.05)",
        backdropFilter: "blur(14px)",
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}
