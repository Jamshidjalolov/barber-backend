import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import { Grid } from "@mui/material";
import { StatMetric } from "../../types";
import { StatCard } from "./StatCard";

const statIcons = [
  CalendarMonthRoundedIcon,
  ContentCutRoundedIcon,
  CheckCircleOutlineRoundedIcon,
  ScheduleRoundedIcon,
];

interface StatsOverviewProps {
  items: StatMetric[];
}

export function StatsOverview({ items }: StatsOverviewProps) {
  return (
    <Grid container spacing={1.35}>
      {items.map((item, index) => (
        <Grid item xs={12} sm={6} lg={3} key={item.title}>
          <StatCard item={item} icon={statIcons[index]} />
        </Grid>
      ))}
    </Grid>
  );
}
