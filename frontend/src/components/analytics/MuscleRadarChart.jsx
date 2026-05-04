// Radar chart component for muscle-focus analytics.
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const MAJOR_MUSCLES = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];
// Normalizes backend muscle-volume records into radar-friendly chart points.
export default function MuscleRadarChart({
  data,
  height = 300
}) {
  if (!data || data.length === 0) {
    return _jsx("div", {
      className: "flex items-center justify-center text-text-muted text-sm border-2 border-dashed border-divider rounded-2xl",
      style: {
        height
      },
      children: "Not enough data"
    });
  }

  // Build baseline points so major muscle axes always render.
  const chartData = MAJOR_MUSCLES.map(muscle => {
    // Initializes baseline radar categories from `MAJOR_MUSCLES`.
    const existing = data.find(d => d.muscle.toLowerCase() === muscle.toLowerCase());
    return {
      muscle,
      volume: existing ? existing.volume : 0
    };
  });

  data.forEach(d => {
    // Preserve additional categories from backend instead of dropping them silently.
    if (!MAJOR_MUSCLES.some(m => m.toLowerCase() === d.muscle.toLowerCase())) {
      chartData.push(d);
    }
  });
  return _jsx("div", {
    style: {
      height,
      minHeight: height
    },
    className: "w-full",
    children: _jsx(ResponsiveContainer, {
      width: "100%",
      height: "100%",
      children: _jsxs(RadarChart, {
        cx: "50%",
        cy: "50%",
        outerRadius: "70%",
        data: chartData,
        children: [_jsx(PolarGrid, {
          stroke: "var(--border-divider)",
          strokeOpacity: 0.5
        }), _jsx(PolarAngleAxis, {
          dataKey: "muscle",
          tick: {
            fill: 'var(--text-secondary)',
            fontSize: 10,
            fontWeight: 600
          }
        }), _jsx(PolarRadiusAxis, {
          angle: 30,
          domain: [0, 'auto'],
          tick: false,
          axisLine: false,
          stroke: "var(--border-divider)",
          strokeOpacity: 0.2
        }), _jsx(Radar, {
          name: "Volume Focus",
          dataKey: "volume",
          stroke: "var(--accent-orange)",
          strokeWidth: 2,
          fill: "var(--accent-orange)",
          fillOpacity: 0.3
        }), _jsx(RechartsTooltip, {
          contentStyle: {
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            color: 'var(--text-primary)'
          },
          itemStyle: {
            color: 'var(--text-primary)'
          },
          formatter: value => [`${Number(value || 0).toLocaleString()} kg`, 'Volume']
        })]
      })
    })
  });
}
