import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import { alpha, Grid, Stack, Typography } from "@mui/material";
import { PageHeader } from "../components/common/PageHeader";
import { BookingsChartCard } from "../components/dashboard/BookingsChartCard";
import { PerformanceCard } from "../components/dashboard/PerformanceCard";
import { RecentBookingsCard } from "../components/dashboard/RecentBookingsCard";
import { StatsOverview } from "../components/dashboard/StatsOverview";
import { BarberBookingSummary, BookingItem, DiscountItem, PerformanceItem, StatMetric } from "../types";
import { formatUzbekReadableDate } from "../utils/date";

interface DashboardPageProps {
  metrics: StatMetric[]; 
  chartItems: BarberBookingSummary[];
  performanceItems: PerformanceItem[];
  recentItems: BookingItem[];
  discounts: DiscountItem[];
}

export function DashboardPage({
  metrics,
  chartItems,
  performanceItems,
  recentItems,
  discounts,
}: DashboardPageProps) {
  const activeDiscounts = discounts.filter((item) => item.isActive);

  return (
    <Stack spacing={1.7}>
      <PageHeader
        title="Bosh sahifa"
        subtitle="Bugungi ishlar qisqacha"
        meta={formatUzbekReadableDate(new Date())}
        icon={<DashboardRoundedIcon sx={{ fontSize: "1.2rem" }} />}
        eyebrow="Admin paneli"
      />

      <StatsOverview items={metrics} />

      {activeDiscounts.length ? (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            px: 1.35,
            py: 1.15,
            borderRadius: "20px",
            border: `1px solid ${alpha("#34d399", 0.16)}`,
            backgroundColor: alpha("#34d399", 0.08),
            backdropFilter: "blur(14px)",
          }}
        >
          <LocalOfferRoundedIcon sx={{ color: "#86efac" }} />
          <Typography variant="body2" sx={{ color: "#bbf7d0", fontWeight: 700 }}>
            Hozir {activeDiscounts.length} ta faol skidka bor.
          </Typography>
        </Stack>
      ) : null}

      <Grid container spacing={1.7}>
        <Grid item xs={12} lg={7}>
          <BookingsChartCard items={chartItems} />
        </Grid>
        <Grid item xs={12} lg={5}>
          <PerformanceCard items={performanceItems} />
        </Grid>
      </Grid>

      <RecentBookingsCard items={recentItems} />
    </Stack>
  );
}
