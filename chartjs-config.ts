// chartjs-config.ts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  TimeScale,
  Title,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,     // for area (fill)
  Tooltip,
  Legend,
  Title,
  TimeScale   // optional if you use time-based labels
);

// optionally set global defaults (chart-level overrides are still possible)
ChartJS.defaults.font.family = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue'";
