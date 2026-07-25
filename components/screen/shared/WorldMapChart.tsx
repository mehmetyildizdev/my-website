'use client';

import { useState, useMemo, useEffect, useRef, memo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { TooltipContent } from '@/components/shadcn/ui/tooltip';
import * as topojson from 'topojson-client';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { getAvgRatingColorVar, NUM_TO_ALPHA2 } from '@/lib/screen/utils/format';
const MAP_WIDTH = 900;
const MAP_HEIGHT = 500;

// ─── Isolated tooltip that tracks mouse via ref + rAF (no parent re-renders) ──
function MapTooltip({ data, visible }: { data: CountryData | null; visible: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const coordsRef = useRef({ x: 0, y: 0 });

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;

    const tooltipWidth = el.offsetWidth || 160;
    const tooltipHeight = el.offsetHeight || 90;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = clientX + 14;
    let top = clientY - 10;

    // Boundary check for right edge
    if (left + tooltipWidth > viewportWidth - 12) {
      left = clientX - tooltipWidth - 14;
    }
    // Boundary check for left edge
    if (left < 12) {
      left = 12;
    }

    // Boundary check for bottom edge
    if (top + tooltipHeight > viewportHeight - 12) {
      top = clientY - tooltipHeight - 10;
    }
    // Boundary check for top edge
    if (top < 12) {
      top = 12;
    }

    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      coordsRef.current = { x: e.clientX, y: e.clientY };
      if (visible) {
        updatePosition(e.clientX, e.clientY);
      }
    };

    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        coordsRef.current = { x: touch.clientX, y: touch.clientY };
        if (visible) {
          updatePosition(touch.clientX, touch.clientY);
        }
      }
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('touchstart', onTouch, { passive: true });
    document.addEventListener('touchmove', onTouch, { passive: true });

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchstart', onTouch);
      document.removeEventListener('touchmove', onTouch);
    };
  }, [visible, updatePosition]);

  useEffect(() => {
    if (visible) {
      // Delay slightly to allow element to render and obtain true offsetWidth/offsetHeight
      const rafId = requestAnimationFrame(() => {
        updatePosition(coordsRef.current.x, coordsRef.current.y);
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [visible, updatePosition]);

  if (!visible) return null;

  if (data) {
    return createPortal(
      <div
        ref={ref}
        className="fixed z-9999 pointer-events-none"
        style={{ left: -9999, top: -9999 }}
      >
        <TooltipContent className="whitespace-nowrap min-w-37.5">
          <p
            className="font-semibold text-sm text-gold"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            {data.country_name}
          </p>
          <div className="mt-1.5 space-y-0.5">
            <div className="flex justify-between gap-4 text-[11px]">
              <span className="text-quicksilver">Avg Rating</span>
              <span className="text-platinum font-semibold tabular-nums">
                {Number(data.avg_rating).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between gap-4 text-[11px]">
              <span className="text-quicksilver">Movies</span>
              <span className="text-sapphire tabular-nums">{data.movie_count}</span>
            </div>
            <div className="flex justify-between gap-4 text-[11px]">
              <span className="text-quicksilver">Shows</span>
              <span className="text-amethyst tabular-nums">{data.show_count}</span>
            </div>
          </div>
        </TooltipContent>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div ref={ref} className="fixed z-9999 pointer-events-none" style={{ left: -9999, top: -9999 }}>
      <TooltipContent className="whitespace-nowrap">
        <p className="text-xs text-muted-foreground italic">No rated content</p>
      </TooltipContent>
    </div>,
    document.body
  );
}

// ─── Memoized country path to prevent re-renders on hover of other countries ──
const CountryPath = memo(function CountryPath({
  d,
  fill,
  fillOpacity,
  isHovered,
  onEnter,
  onLeave,
}: {
  d: string;
  fill: string;
  fillOpacity: number;
  isHovered: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <path
      d={d}
      fill={fill}
      fillOpacity={fillOpacity}
      stroke="var(--diamond)"
      strokeWidth={isHovered ? 1.5 : 0.4}
      strokeOpacity={isHovered ? 1 : 0.5}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    />
  );
});

export default function WorldMapChart({ data }: { data: CountryData[] }) {
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Build lookup by alpha-2 code
  const countryMap = useMemo(() => {
    const map = new Map<string, CountryData>();
    data.forEach((d) => map.set(d.country_code, d));
    return map;
  }, [data]);

  // Load world atlas
  useEffect(() => {
    import('world-atlas/countries-110m.json').then((topology) => {
      const topo = topology.default as unknown as Topology<{
        countries: GeometryCollection;
      }>;
      const geo = topojson.feature(topo, topo.objects.countries);
      setFeatures((geo as any).features as GeoFeature[]);
    });
  }, []);

  // D3 projection + path generator
  const projection = useMemo(() => {
    return geoNaturalEarth1()
      .scale(160)
      .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]);
  }, []);

  const pathGenerator = useMemo(() => {
    return geoPath().projection(projection);
  }, [projection]);

  // Pre-compute SVG paths
  const paths = useMemo(() => {
    return features.map((feature, idx) => ({
      idx,
      id: feature.id,
      alpha2: NUM_TO_ALPHA2[feature.id] || '',
      d: pathGenerator(feature as any) || '',
    }));
  }, [features, pathGenerator]);

  const hoveredData = hoveredCountry ? (countryMap.get(hoveredCountry) ?? null) : null;

  const handleEnter = useCallback((alpha2: string) => {
    if (alpha2) setHoveredCountry(alpha2);
  }, []);

  const handleLeave = useCallback(() => {
    setHoveredCountry(null);
  }, []);

  return (
    <Card className="bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight text-accent">
          Production Countries
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          World map colored by average rating of watched titles from each country.
        </p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="w-full relative overflow-hidden rounded-lg border border-border/10 bg-obsidian/30">
          <svg
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            className="w-full h-auto block"
            preserveAspectRatio="xMidYMid meet"
          >
            {paths.map((item) => {
              const countryData = countryMap.get(item.alpha2);
              const isHovered = hoveredCountry === item.alpha2 && item.alpha2 !== '';

              let fill = 'var(--obsidian)';
              let fillOpacity = 0.5;

              if (countryData) {
                fill = getAvgRatingColorVar(Number(countryData.avg_rating));
                fillOpacity = isHovered ? 1 : 0.75;
              } else if (isHovered) {
                fillOpacity = 0.7;
              }

              return (
                <CountryPath
                  key={`country-${item.id}-${item.idx}`}
                  d={item.d}
                  fill={fill}
                  fillOpacity={fillOpacity}
                  isHovered={isHovered}
                  onEnter={() => handleEnter(item.alpha2)}
                  onLeave={handleLeave}
                />
              );
            })}
          </svg>
        </div>

        {/* Isolated tooltip — tracks mouse via document listener + rAF, no parent re-renders */}
        {mounted && (
          <MapTooltip
            data={hoveredData}
            visible={hoveredCountry !== null && hoveredCountry !== ''}
          />
        )}

        {/* Legend */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/10 text-[10px] text-muted-foreground flex-wrap">
          <span>Rating tiers:</span>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-amethyst opacity-80" /> ≥7.0
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-sapphire opacity-80" /> 6.5–7.0
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-emerald opacity-80" /> 6.0–6.5
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-topaz opacity-80" /> 5.5–6.0
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-ruby opacity-80" /> &lt;5.5
          </div>
          <span className="ml-auto">Gray = no data</span>
        </div>
      </CardContent>
    </Card>
  );
}
