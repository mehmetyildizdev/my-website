'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Treemap, ResponsiveContainer } from 'recharts';
import { TooltipContent } from '@/components/shadcn/ui/tooltip';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { getGenreColor } from '@/components/screen/slugs/genre/genreThemes';
type CustomContentProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  index?: number;
  total_count?: number;
  movie_count?: number;
  show_count?: number;
  value?: number;
  depth?: number;
};

function TreemapCell(props: CustomContentProps & { payload?: any }) {
  const { x = 0, y = 0, width = 0, height = 0, name, index = 0, total_count, payload, depth } = props;

  const [hovered, setHovered] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (depth === 0) return null;

  const handleMouseMove = (e: React.MouseEvent) => {
    const tooltipWidth = 160;
    const tooltipHeight = 110;
    let x = e.clientX + 12;
    let y = e.clientY + 12;

    if (x + tooltipWidth > window.innerWidth) {
      x = Math.max(0, e.clientX - tooltipWidth - 12);
    }
    if (y + tooltipHeight > window.innerHeight) {
      y = Math.max(0, e.clientY - tooltipHeight - 12);
    }

    setCoords({ x, y });
  };

  const genreName = name || payload?.name;
  const color = genreName ? getGenreColor(genreName) : 'var(--obsidian)';
  const fontSize = width > 120 ? 14 : width > 80 ? 12 : 11;
  const showLabel = width > 48 && height > 28;
  const shouldShowCount = width > 70 && height > 50;
  const cellPadding = 2.5;

  const movieCount = props.movie_count ?? payload?.movie_count ?? 0;
  const showCount = props.show_count ?? payload?.show_count ?? 0;
  const totalCount = props.total_count ?? payload?.total_count ?? props.value ?? total_count ?? 0;

  return (
    <>
      <g
        className="cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Opaque solid rect with low-opacity fill + custom stroke, bypassing linearGradient stop-color bugs */}
        <rect
          x={x + cellPadding / 2}
          y={y + cellPadding / 2}
          width={Math.max(0, width - cellPadding)}
          height={Math.max(0, height - cellPadding)}
          fill={color}
          fillOpacity={0.33}
          stroke={color}
          strokeOpacity={0.33}
          strokeWidth={1.5}
          rx={0}
          ry={0}
        />

        {showLabel && (
          <text
            x={x + width / 2}
            y={y + height / 2 - (shouldShowCount ? 8 : 0)}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--platinum)"
            fontSize={fontSize}
            fontWeight={600}
            style={{ fontFamily: 'var(--font-poppins)', letterSpacing: '0.01em' }}
            className="pointer-events-none"
          >
            {genreName}
          </text>
        )}
        {shouldShowCount && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 12}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--quicksilver)"
            fontSize={11}
            fontWeight={500}
            style={{ fontFamily: 'var(--font-mono)' }}
            className="pointer-events-none"
          >
            {totalCount}
          </text>
        )}
      </g>
      {mounted &&
        hovered &&
        createPortal(
          <div
            className="fixed z-9999 pointer-events-none"
            style={{
              left: `${coords.x}px`,
              top: `${coords.y}px`,
              transitionProperty: 'none',
              transitionDuration: '0s',
              transitionDelay: '0s',
              transitionTimingFunction: 'linear',
            }}
          >
            <TooltipContent className="whitespace-nowrap min-w-35">
              <p className="font-semibold text-sm text-gold" style={{ fontFamily: 'var(--font-poppins)' }}>
                {genreName}
              </p>
              <div className="mt-1.5 space-y-0.5">
                <div className="flex justify-between gap-4 text-[11px]">
                  <span className="text-quicksilver">Movies</span>
                  <span className="text-sapphire font-medium tabular-nums">{movieCount}</span>
                </div>
                <div className="flex justify-between gap-4 text-[11px]">
                  <span className="text-quicksilver">Shows</span>
                  <span className="text-amethyst font-medium tabular-nums">{showCount}</span>
                </div>
                <div className="flex justify-between gap-4 text-[11px] pt-1 mt-1 border-t border-border/20">
                  <span className="text-quicksilver">Total</span>
                  <span className="text-platinum font-semibold tabular-nums">{totalCount}</span>
                </div>
              </div>
            </TooltipContent>
          </div>,
          document.body,
        )}
    </>
  );
}

export default function GenreTreemap({ data }: { data: GenreData[] }) {
  // Parse string fields from PostgreSQL driver into numbers
  const parsedData = data.map((d) => ({
    ...d,
    movie_count: Number(d.movie_count),
    show_count: Number(d.show_count),
    total_count: Number(d.total_count),
  }));

  // Filter out zero-count genres to ensure clean rendering and accurate distribution
  const filteredData = parsedData.filter((d) => d.total_count > 0);

  return (
    <Card className="bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight text-accent">Genre Distribution</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Treemap of genres across watched movies and shows. Size represents total count.
        </p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="w-full p-1.5" style={{ minHeight: 500 }}>
          <ResponsiveContainer width="100%" height={500}>
            <Treemap data={filteredData} dataKey="total_count" aspectRatio={4 / 3} content={<TreemapCell />} isAnimationActive={false} />
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
