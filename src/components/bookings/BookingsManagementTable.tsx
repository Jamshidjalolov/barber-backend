import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import {
  Box,
  Chip,
  IconButton,
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
import { SectionCard } from "../common/SectionCard";

interface BookingsManagementTableProps {
  items: BookingItem[];
  onDelete: (booking: BookingItem) => void;
}

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

export function BookingsManagementTable({
  items,
  onDelete,
}: BookingsManagementTableProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (isMobile) {
    return (
      <SectionCard sx={{ p: { xs: 1.25, sm: 1.5 } }}>
        {items.length === 0 ? (
          <Box sx={{ py: 3.5, textAlign: "center" }}>
            <Typography variant="h6" sx={{ mb: 0.75 }}>
              Hech narsa topilmadi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Qidiruv yoki filter qiymatlarini o'zgartirib ko'ring.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.25}>
            {items.map((item) => (
              <Box
                key={item.id}
                sx={{
                  p: 1.5,
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
                      <Typography variant="subtitle1" sx={{ mb: 0.25 }}>
                        {item.customer}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.phone}
                      </Typography>
                    </Box>

                    <IconButton
                      onClick={() => onDelete(item)}
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "12px",
                        border: `1px solid ${alpha("#c4b5fd", 0.14)}`,
                        color: "#cbd5e1",
                        flexShrink: 0,
                      }}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Typography variant="body2">{item.barber}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.service}
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    useFlexGap
                  >
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Typography variant="body2" color="text.secondary">
                        {item.time}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.id}
                      </Typography>
                    </Stack>
                    <Chip label={item.status} sx={statusLabelStyles[item.status]} />
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </SectionCard>
    );
  }

  return (
    <SectionCard sx={{ p: 0, overflow: "hidden" }}>
      <TableContainer
        sx={{
          overflowX: "auto",
          backgroundColor: alpha("#ffffff", 0.03),
        }}
      >
        <Table sx={{ minWidth: 840 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ pl: 3 }}>Mijoz</TableCell>
              <TableCell>Barber</TableCell>
              <TableCell>Vaqt</TableCell>
              <TableCell>Holat</TableCell>
              <TableCell>Buyurtma ID</TableCell>
              <TableCell align="right" sx={{ pr: 3 }}>
                Amal
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ py: 6, textAlign: "center" }}>
                  <Typography variant="h6" sx={{ mb: 0.75 }}>
                    Hech narsa topilmadi
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Qidiruv yoki filter qiymatlarini o'zgartirib ko'ring.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ pl: 3, py: 2.25 }}>
                    <Typography variant="subtitle1" sx={{ mb: 0.35 }}>
                      {item.customer}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1">{item.barber}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.service}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.time}</TableCell>
                  <TableCell>
                    <Chip label={item.status} sx={statusLabelStyles[item.status]} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {item.id}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ pr: 3 }}>
                    <IconButton
                      onClick={() => onDelete(item)}
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "12px",
                        border: `1px solid ${alpha("#c4b5fd", 0.14)}`,
                        color: "#cbd5e1",
                      }}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </SectionCard>
  );
}
