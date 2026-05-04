// Doughnut chart component for workout volume distribution.
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function VolumeDoughnut({
  data,
  height = 250
}) {
  if (!data || data.length === 0) {
    return _jsx("div", {
      className: "flex items-center justify-center text-text-muted text-sm border-2 border-dashed border-divider rounded-2xl",
      style: {
        height
      },
      children: "No volume data"
    });
  }
  return _jsxs("div", {
    style: {
      height,
      minHeight: height
    },
    className: "w-full relative",
    children: [_jsx(ResponsiveContainer, {
      width: "100%",
      height: "100%",
      children: _jsxs(PieChart, {
        children: [_jsx(Pie, {
          data: data,
          cx: "50%",
          cy: "50%",
          innerRadius: "60%",
          outerRadius: "80%",
          paddingAngle: 2,
          dataKey: "value",
          stroke: "none",
          children: data.map((entry, index) => _jsx(Cell, {
            fill: entry.color
          }, `cell-${index}`))
        }), _jsx(RechartsTooltip, {
          contentStyle: {
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          },
          // Tooltip formatter returns localized kilogram values.
          formatter: value => [`${Number(value || 0).toLocaleString()} kg`, 'Volume']
        })]
      })
    }), _jsxs("div", {
      className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none",
      children: [_jsx("p", {
        className: "text-2xl font-black text-text-primary tracking-tighter",
        // Center value is category count, not total volume.
        children: data.length
      }), _jsx("p", {
        className: "text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none",
        children: "Muscles"
      })]
    })]
  });
}

