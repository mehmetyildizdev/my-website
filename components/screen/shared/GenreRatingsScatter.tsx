'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
  Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { TooltipContent } from '@/components/shadcn/ui/tooltip';
import { getGenreColor } from '@/components/screen/slugs/genre/genreThemes';

export default function GenreRatingsScatter({ data }: { data: GenreRating[] }) {
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [lockedIdx, setLockedIdx] = useState<number | null>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [lockedCoords, setLockedCoords] = useState<{ x: number; y: number } | null>(null);
  const [lockedSvgCoords, setLockedSvgCoords] = useState<{ cx: number; cy: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getAdjustedCoords = (clientX: number, clientY: number) => {
    const tooltipWidth = 180;
    const tooltipHeight = 130;
    let x = clientX + 12;
    let y = clientY + 12;

    if (x + tooltipWidth > window.innerWidth) {
      x = Math.max(0, clientX - tooltipWidth - 12);
    }
    if (y + tooltipHeight > window.innerHeight) {
      y = Math.max(0, clientY - tooltipHeight - 12);
    }
    return { x, y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (lockedIdx === null) {
      setCoords(getAdjustedCoords(e.clientX, e.clientY));
    }
  };

  const points: GenreScatterPoint[] = data.map((d) => ({
    name: d.name,
    total_count: d.total_count,
    avg_rating: Number(d.avg_rating),
    avg_movie_rating: d.avg_movie_rating != null ? Number(d.avg_movie_rating) : null,
    avg_show_rating: d.avg_show_rating != null ? Number(d.avg_show_rating) : null,
    movie_count: d.movie_count,
    show_count: d.show_count,
  }));

  const ratings = points.map((p) => p.avg_rating);
  const minR = Math.min(...ratings);
  const maxR = Math.max(...ratings);
  const yMin = Math.max(0, Math.floor(minR - 0.5));
  const yMax = Math.min(10, Math.ceil(maxR + 0.5));
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;

  const counts = points.map((p) => p.total_count);
  const xMax = Math.max(...counts);

  const activeIdx = lockedIdx !== null ? lockedIdx : hoveredIdx;
  const hoveredData = activeIdx !== null ? points[activeIdx] : null;
  const tooltipCoords = lockedCoords || coords;

  const handleDismissLock = () => {
    setLockedIdx(null);
    setLockedCoords(null);
    setLockedSvgCoords(null);
    setHoveredIdx(null);
  };

  const handleScatterClick = (props: any, index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const { cx, cy } = props;
    if (cx !== undefined && cy !== undefined && index !== undefined) {
      if (lockedIdx === index) {
        handleDismissLock();
      } else {
        setLockedIdx(index);
        setLockedCoords(getAdjustedCoords(event.clientX, event.clientY));
        setLockedSvgCoords({ cx, cy });
        setHoveredIdx(index);
      }
    }
  };

  return (
    <Card
      className="bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md"
      onClick={handleDismissLock}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight text-accent">
          Genre Affinity Scatter
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          {isMobile
            ? 'X = avg rating, Y = items watched. Bubble size scales with count. Click a bubble to lock tooltip.'
            : 'X = items watched, Y = avg rating. Bubble size scales with count. Click a bubble to lock tooltip.'}
        </p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="w-full" style={{ minHeight: 500 }} onMouseMove={handleMouseMove}>
          <style
            dangerouslySetInnerHTML={{
              __html: `
            .recharts-wrapper :focus {
              outline: none !important;
            }
            .recharts-wrapper path,
            .recharts-wrapper circle,
            .recharts-wrapper sector {
              -webkit-tap-highlight-color: transparent;
              outline: none !important;
            }
          `,
            }}
          />
          <ResponsiveContainer width="100%" height={500}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: isMobile ? 0 : 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--silver)" strokeOpacity={0.1} />
              <XAxis
                type="number"
                dataKey={isMobile ? 'avg_rating' : 'total_count'}
                name={isMobile ? 'Rating' : 'Watched'}
                domain={isMobile ? [yMin, yMax] : [0, 'auto']}
                tick={{ fill: 'var(--quicksilver)', fontSize: 11 }}
                stroke="var(--silver)"
                strokeOpacity={0.3}
                label={{
                  value: isMobile ? 'Avg Rating' : 'Rated Watches',
                  position: 'bottom',
                  fill: 'var(--quicksilver)',
                  fontSize: 11,
                }}
              />
              <YAxis
                type="number"
                dataKey={isMobile ? 'total_count' : 'avg_rating'}
                name={isMobile ? 'Watched' : 'Rating'}
                domain={isMobile ? [0, 'auto'] : [yMin, yMax]}
                tick={{ fill: 'var(--quicksilver)', fontSize: 11 }}
                stroke="var(--silver)"
                strokeOpacity={0.3}
                width={isMobile ? 30 : 60}
                label={
                  isMobile
                    ? undefined
                    : {
                        value: 'Avg Rating',
                        angle: -90,
                        position: 'left',
                        fill: 'var(--quicksilver)',
                        fontSize: 11,
                      }
                }
              />
              <ZAxis type="number" dataKey="total_count" range={[80, 1200]} />
              <ReferenceLine
                x={isMobile ? avg : undefined}
                y={isMobile ? undefined : avg}
                stroke="var(--gold)"
                strokeDasharray="4 4"
                strokeOpacity={0.6}
                label={{
                  value: `Mean ${avg.toFixed(2)}`,
                  fill: 'var(--gold)',
                  fontSize: 10,
                  position: isMobile ? 'top' : 'right',
                }}
              />
              <RechartsTooltip
                cursor={{ stroke: 'var(--silver)', strokeWidth: 1, strokeDasharray: '1 1' }}
                content={() => null}
              />
              {lockedSvgCoords && (
                <g pointerEvents="none">
                  <line
                    x1={lockedSvgCoords.cx}
                    y1={0}
                    x2={lockedSvgCoords.cx}
                    y2="100%"
                    stroke="var(--silver)"
                    strokeWidth={1}
                    strokeOpacity={0.5}
                    strokeDasharray="1 1"
                  />
                  <line
                    x1={0}
                    y1={lockedSvgCoords.cy}
                    x2="100%"
                    y2={lockedSvgCoords.cy}
                    stroke="var(--silver)"
                    strokeWidth={1}
                    strokeOpacity={0.5}
                    strokeDasharray="1 1"
                  />
                </g>
              )}
              <Scatter
                data={points}
                fillOpacity={0.65}
                strokeOpacity={0.9}
                isAnimationActive={false}
                onClick={handleScatterClick}
              >
                {points.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={getGenreColor(entry.name)}
                    stroke={getGenreColor(entry.name)}
                    className="cursor-pointer"
                    onMouseEnter={() => {
                      if (lockedIdx === null) setHoveredIdx(idx);
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => {
                      if (lockedIdx === null) setHoveredIdx(null);
                    }}
                  />
                ))}
                {!isMobile && (
                  <LabelList
                    dataKey="name"
                    position="top"
                    fill="var(--platinum)"
                    fontSize={10}
                    offset={8}
                    style={{ fontFamily: 'var(--font-poppins)' }}
                  />
                )}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      {mounted &&
        hoveredData &&
        createPortal(
          <div
            className="fixed z-9999 pointer-events-none"
            style={{
              left: `${tooltipCoords.x}px`,
              top: `${tooltipCoords.y}px`,
              transitionProperty: 'none',
              transitionDuration: '0s',
              transitionDelay: '0s',
              transitionTimingFunction: 'linear',
            }}
          >
            <TooltipContent className="whitespace-nowrap min-w-[160px]">
              <p
                className="font-semibold text-sm text-gold"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                {hoveredData.name}
              </p>
              <div className="mt-1.5 space-y-0.5">
                <div className="flex justify-between gap-4 text-[11px]">
                  <span className="text-quicksilver">Avg Rating</span>
                  <span className="text-platinum font-semibold tabular-nums">
                    {hoveredData.avg_rating.toFixed(2)}
                  </span>
                </div>
                {hoveredData.avg_movie_rating != null && (
                  <div className="flex justify-between gap-4 text-[11px]">
                    <span className="text-quicksilver">Movies ({hoveredData.movie_count})</span>
                    <span className="text-sapphire tabular-nums">
                      {hoveredData.avg_movie_rating.toFixed(2)}
                    </span>
                  </div>
                )}
                {hoveredData.avg_show_rating != null && (
                  <div className="flex justify-between gap-4 text-[11px]">
                    <span className="text-quicksilver">Shows ({hoveredData.show_count})</span>
                    <span className="text-amethyst tabular-nums">
                      {hoveredData.avg_show_rating.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-4 text-[11px] pt-1 mt-1 border-t border-border/20">
                  <span className="text-quicksilver">Total rated</span>
                  <span className="text-platinum tabular-nums">{hoveredData.total_count}</span>
                </div>
              </div>
            </TooltipContent>
          </div>,
          document.body
        )}
    </Card>
  );
}
