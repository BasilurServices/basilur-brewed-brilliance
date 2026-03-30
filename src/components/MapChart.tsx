import React, { useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { useTheme } from "next-themes";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface LocationStats {
  country: string;
  count: number;
  cities: string[];
  coordinates: [number, number]; // [longitude, latitude]
}

// Simple mapping of country names/codes to approximate coordinates
// In a real app, this would come from a geocoding service or a more robust DB
const countryCoordinates: Record<string, [number, number]> = {
  "Sri Lanka": [80.7718, 7.8731],
  "United States": [-95.7129, 37.0902],
  "United Kingdom": [-3.4360, 55.3781],
  "India": [78.9629, 20.5937],
  "United Arab Emirates": [53.8478, 23.4241],
  "Australia": [133.7751, -25.2744],
  "Germany": [10.4515, 51.1657],
  "France": [2.2137, 46.2276],
  "Japan": [138.2529, 36.2048],
  "Singapore": [103.8198, 1.3521],
};

const MapChart = ({ data }: { data: LocationStats[] }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const maxValue = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data]);
  
  const sizeScale = useMemo(() => 
    scaleLinear()
      .domain([0, maxValue])
      .range([4, 20]),
    [maxValue]
  );

  return (
    <div className="w-full h-[400px] bg-slate-900/40 rounded-3xl border border-white/10 overflow-hidden relative group">
      <div className="absolute top-6 left-6 z-10">
        <h3 className="text-white font-bold text-lg tracking-tight">Global Distribution</h3>
        <p className="text-slate-500 text-xs tracking-widest uppercase mt-1">Feedback by Region</p>
      </div>

      <ComposableMap
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 147,
        }}
        className="w-full h-full"
      >
        <ZoomableGroup zoom={1} maxZoom={3}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isDark ? "#1e293b" : "#f1f5f9"}
                  stroke={isDark ? "#334155" : "#cbd5e1"}
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: isDark ? "#334155" : "#e2e8f0", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {data.map(({ country, count, coordinates, cities }) => (
            <Marker key={country} coordinates={coordinates}>
              <circle
                r={sizeScale(count)}
                fill="rgba(251, 191, 36, 0.4)"
                stroke="#fbbf24"
                strokeWidth={2}
                className="transition-all duration-300 cursor-pointer hover:fill-amber-400/60"
              />
              <title>{`${country}: ${count} reviews (${cities.join(", ")})`}</title>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Legend */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-400/40 border border-amber-400" />
            <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Review Activity</span>
         </div>
      </div>
    </div>
  );
};

export default MapChart;
