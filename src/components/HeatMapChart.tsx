import React from "react";

type LocationData = {
  name: string;
  value: number;
};

type Props = {
  data: LocationData[];
};

// Fungsi pewarnaan
const getColor = (value: number, maxValue: number) => {
  if (maxValue === 0) return "#4ADE80";
  const ratio = value / maxValue;
  if (ratio >= 0.66) return "#EF4444";
  if (ratio >= 0.33) return "#FACC15";
  return "#4ADE80";
};

// Grid responsif, optimal di width 1200px
const getGridCols = (length: number) => {
  if (length <= 4) return "grid-cols-2 md:grid-cols-4";
  if (length <= 6) return "grid-cols-2 md:grid-cols-3 lg:grid-cols-6";
  if (length <= 8) return "grid-cols-2 md:grid-cols-4 lg:grid-cols-6";
  if (length <= 10) return "grid-cols-2 md:grid-cols-5 lg:grid-cols-6";
  return "grid-cols-2 md:grid-cols-6 lg:grid-cols-8";
};

const HeatMapComponent: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0)
    return <p className="text-center text-gray-500">No data</p>;

  const max = Math.max(...data.map((d) => d.value));
  const gridCols = getGridCols(data.length);

  return (
    <div className="space-y-4 w-full max-w-[1200px] mx-auto">
      {/* Heatmap Grid */}
      <div className={`grid ${gridCols} gap-3`}>
        {data.map((loc, idx) => (
          <div
            key={idx}
            className="rounded-xl px-3 py-3 text-center shadow transition-all"
            style={{
              backgroundColor: getColor(loc.value, max),
              color: loc.value / max > 0.5 ? "white" : "black",
              minHeight: "70px",
              fontSize: "13px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              wordWrap: "break-word",
            }}
            title={loc.name}
          >
            <div className="truncate w-full text-xs font-medium">{loc.name}</div>
            <div className="text-xs font-semibold">{loc.value}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-700 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded" style={{ backgroundColor: "#4ADE80" }}></div>
          <span>Rendah</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded" style={{ backgroundColor: "#FACC15" }}></div>
          <span>Sedang</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded" style={{ backgroundColor: "#EF4444" }}></div>
          <span>Tinggi</span>
        </div>
      </div>
    </div>
  );
};

export default HeatMapComponent;
