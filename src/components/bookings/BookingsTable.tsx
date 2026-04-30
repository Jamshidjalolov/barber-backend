import {
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { BookingItem, BookingStatus } from "../../types";

interface BookingsTableProps {
  items: BookingItem[];
}

const statusColorMap: Record<
  BookingStatus,
  "default" | "success" | "warning" | "info"
> = {
  Tasdiqlandi: "info",
  Kutilmoqda: "warning",
  Jarayonda: "default",
  Tugallandi: "success",
  "Rad etildi": "default",
};

const statusLabelStyles: Record<BookingStatus, Record<string, string | number>> = {
  Tasdiqlandi: {
    backgroundColor: alpha("#1976d2", 0.1),
    color: "#1565c0",
  },
  Kutilmoqda: {
    backgroundColor: alpha("#d6a622", 0.14),
    color: "#9a7410",
  },
  Jarayonda: {
    backgroundColor: alpha("#121212", 0.08),
    color: "#111111",
  },
  Tugallandi: {
    backgroundColor: alpha("#3aa66f", 0.12),
    color: "#1f7d4c",
  },
  "Rad etildi": {
    backgroundColor: alpha("#d96868", 0.12),
    color: "#a23c3c",
  },
};

export function BookingsTable({ items }: BookingsTableProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (isMobile) {
    return (
      <Stack spacing={1.25}>
        {items.map((item) => (
          <Box
            key={item.id}
            sx={{
              p: 1.6,
              borderRadius: "18px",
              background:
                "linear-gradient(180deg, rgba(255,251,244,0.96) 0%, rgba(247,239,226,0.92) 100%)",
              border: `1px solid ${alpha("#7a5d31", 0.08)}`,
            }}
          >
            <Stack spacing={1.1}>
              <Stack
                direction="row"
                spacing={1}
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.3 }}>
                    {item.customer}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.id}
                  </Typography>
                </Box>
                <Chip
                  label={item.status}
                  color={statusColorMap[item.status]}
                  sx={statusLabelStyles[item.status]}
                />
              </Stack>

              <Typography variant="body2">{item.service}</Typography>

              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                sx={{ color: "text.secondary" }}
              >
                <Typography variant="body2">{item.barber}</Typography>
                <Typography variant="body2">{item.time}</Typography>
                <Typography variant="body2">{item.payment}</Typography>
              </Stack>
            </Stack>
          </Box>
        ))}
      </Stack>
    );
  }

  return (
    <TableContainer sx={{ overflowX: "auto" }}>
      <Table sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow>
            <TableCell>Buyurtma</TableCell>
            <TableCell>Mijoz</TableCell>
            <TableCell>Xizmat</TableCell>
            <TableCell>Barber</TableCell>
            <TableCell>Vaqt</TableCell>
            <TableCell>Holat</TableCell>
            <TableCell align="right">To'lov</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell>
                <Typography variant="subtitle2">{item.id}</Typography>
              </TableCell>
              <TableCell>{item.customer}</TableCell>
              <TableCell>{item.service}</TableCell>
              <TableCell>{item.barber}</TableCell>
              <TableCell>{item.time}</TableCell>
              <TableCell>
                <Chip
                  label={item.status}
                  color={statusColorMap[item.status]}
                  sx={statusLabelStyles[item.status]}
                />
              </TableCell>
              <TableCell align="right">{item.payment}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
