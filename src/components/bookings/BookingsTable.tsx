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
    backgroundColor: alpha("#22d3ee", 0.12),
    color: "#67e8f9",
  },
  Kutilmoqda: {
    backgroundColor: alpha("#f6c85f", 0.14),
    color: "#fde68a",
  },
  Jarayonda: {
    backgroundColor: alpha("#8b5cf6", 0.14),
    color: "#ddd6fe",
  },
  Tugallandi: {
    backgroundColor: alpha("#34d399", 0.12),
    color: "#86efac",
  },
  "Rad etildi": {
    backgroundColor: alpha("#fb7185", 0.12),
    color: "#fecdd3",
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
                "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.035) 100%)",
              border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
              backdropFilter: "blur(14px)",
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
    <TableContainer
      sx={{
        overflowX: "auto",
        borderRadius: "16px",
        border: `1px solid ${alpha("#c4b5fd", 0.1)}`,
        backgroundColor: alpha("#ffffff", 0.03),
      }}
    >
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
