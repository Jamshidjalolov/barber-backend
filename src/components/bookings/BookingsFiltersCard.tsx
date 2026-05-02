import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  alpha,
  Box,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { SectionCard } from "../common/SectionCard";

export type BookingStatusFilter = "all" | "pending" | "done";

interface BookingsFiltersCardProps {
  searchQuery: string;
  selectedBarber: string;
  statusFilter: BookingStatusFilter;
  barbers: string[];
  onSearchChange: (value: string) => void;
  onBarberChange: (value: string) => void;
  onStatusChange: (value: BookingStatusFilter) => void;
}

const filterButtons: Array<{ value: BookingStatusFilter; label: string }> = [
  { value: "all", label: "Barchasi" },
  { value: "pending", label: "Kutilayotgan" },
  { value: "done", label: "Tugallangan" },
];

export function BookingsFiltersCard({
  searchQuery,
  selectedBarber,
  statusFilter,
  barbers,
  onSearchChange,
  onBarberChange,
  onStatusChange,
}: BookingsFiltersCardProps) {
  return (
    <SectionCard sx={{ px: { xs: 2, md: 2.5 }, py: { xs: 1.75, md: 2 } }}>
      <Stack
        direction={{ xs: "column", xl: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", xl: "center" }}
      >
        <TextField
          fullWidth
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Mijoz, telefon, ID yoki xizmat bo'yicha qidiring"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              minHeight: 52,
              borderRadius: "18px",
              backgroundColor: alpha("#ffffff", 0.06),
            },
          }}
        />

        <Select
          value={selectedBarber}
          onChange={(event: SelectChangeEvent) => onBarberChange(event.target.value)}
          displayEmpty
          sx={{
            minWidth: { xs: "100%", sm: 220 },
            minHeight: 52,
            borderRadius: "18px",
            backgroundColor: alpha("#ffffff", 0.06),
          }}
        >
          <MenuItem value="all">Barcha barberlar</MenuItem>
          {barbers.map((barber) => (
            <MenuItem key={barber} value={barber}>
              {barber}
            </MenuItem>
          ))}
        </Select>

        <Stack
          sx={{
            p: 0.5,
            borderRadius: "18px",
            backgroundColor: alpha("#ffffff", 0.05),
            border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
            gap: 0.75,
            width: { xs: "100%", xl: "auto" },
          }}
        >
          {filterButtons.map((item) => {
            const selected = statusFilter === item.value;

            return (
              <Box
                key={item.value}
                onClick={() => onStatusChange(item.value)}
                sx={{
                  px: 1.5,
                  minHeight: 42,
                  display: "grid",
                  placeItems: "center",
                  textAlign: "center",
                  borderRadius: "14px",
                  cursor: "pointer",
                  background: selected
                    ? "linear-gradient(135deg, rgba(139,92,246,0.94) 0%, rgba(34,211,238,0.78) 100%)"
                    : "transparent",
                  boxShadow: selected ? `0 10px 24px ${alpha("#8b5cf6", 0.22)}` : "none",
                  border: selected
                    ? `1px solid ${alpha("#67e8f9", 0.24)}`
                    : "1px solid transparent",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ color: selected ? "#fff" : "text.secondary" }}
                >
                  {item.label}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Stack>
    </SectionCard>
  );
}
