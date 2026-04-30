import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import { alpha, Box, Button, Chip, Stack, Typography } from "@mui/material";
import { DiscountItem } from "../../types";
import { formatUzbekReadableIsoDate } from "../../utils/date";

interface CustomerDiscountBoardProps {
  items: DiscountItem[];
  onChooseBarber: (barberId: string) => void;
}

export function CustomerDiscountBoard({
  items,
  onChooseBarber,
}: CustomerDiscountBoardProps) {
  if (!items.length) {
    return null;
  }

  return (
    <Box
      sx={{
        p: { xs: 1.4, md: 1.65 },
        borderRadius: "26px",
        background:
          "linear-gradient(135deg, rgba(255,250,243,1) 0%, rgba(249,243,230,0.94) 100%)",
        border: `1px solid ${alpha("#d5a546", 0.18)}`,
        boxShadow: "0 18px 40px rgba(17,17,17,0.05)",
      }}
    >
      <Stack spacing={1.3}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Box>
            <Typography variant="h6">Faol skidkalar</Typography>
            <Typography variant="body2" color="text.secondary">
              Barberlar qo&apos;ygan hozirgi chegirmalar shu yerda ko&apos;rinadi.
            </Typography>
          </Box>

          <Chip
            icon={<LocalOfferRoundedIcon sx={{ fontSize: "1rem !important" }} />}
            label={`${items.length} ta taklif`}
            sx={{
              height: 34,
              borderRadius: "999px",
              backgroundColor: alpha("#d5a546", 0.12),
              color: "#8f6617",
              "& .MuiChip-label": { px: 1.1, fontWeight: 700 },
            }}
          />
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
            gap: 1,
          }}
        >
          {items.slice(0, 4).map((item) => (
            <Box
              key={item.id}
              sx={{
                p: 1.15,
                borderRadius: "20px",
                backgroundColor: "#fff",
                border: `1px solid ${alpha("#111111", 0.05)}`,
              }}
            >
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="center">
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1">{item.barberName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.title}
                    </Typography>
                  </Box>

                  <Chip
                    size="small"
                    label={`${item.percent}% skidka`}
                    sx={{
                      height: 28,
                      borderRadius: "999px",
                      backgroundColor: alpha("#3aa66f", 0.12),
                      color: "#217d4a",
                      "& .MuiChip-label": { px: 1.05, fontWeight: 800 },
                    }}
                  />
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  {formatUzbekReadableIsoDate(item.date)} | {item.startTime} - {item.endTime}
                </Typography>

                {item.description ? (
                  <Typography variant="body2" sx={{ color: "#5b5448" }}>
                    {item.description}
                  </Typography>
                ) : null}

                <Button
                  variant="outlined"
                  endIcon={<ArrowOutwardRoundedIcon />}
                  onClick={() => onChooseBarber(item.barberId)}
                  sx={{
                    alignSelf: "flex-start",
                    minHeight: 38,
                    borderRadius: "14px",
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Shu barberni tanlash
                </Button>
              </Stack>
            </Box>
          ))}
        </Box>
      </Stack>
    </Box>
  );
}
