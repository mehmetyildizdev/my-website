'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shadcn/ui/card';
import { Tooltip } from '@/components/shadcn/ui/tooltip';
const GENDER_COLORS: Record<string, string> = {
  Male: 'bg-sapphire',
  Female: 'bg-amethyst',
  'Non-binary': 'bg-emerald',
  Unknown: 'bg-obsidian',
};

const GENDER_TEXT_COLORS: Record<string, string> = {
  Male: 'text-sapphire',
  Female: 'text-amethyst',
  'Non-binary': 'text-emerald',
  Unknown: 'text-obsidian',
};

export default function PeopleGenderDiversity({ data }: { data: GenderData[] }) {
  // Group by department
  const departments = useMemo(() => {
    const map = new Map<string, GenderData[]>();
    data.forEach((d) => {
      if (!map.has(d.department)) map.set(d.department, []);
      map.get(d.department)!.push(d);
    });
    // Sort by total count
    return Array.from(map.entries())
      .map(([dept, items]) => ({
        department: dept,
        items,
        total: items.reduce((s, i) => s + i.count, 0),
      }))
      .sort((a, b) => b.total - a.total);
  }, [data]);

  if (departments.length === 0) return null;

  return (
    <Card className="bg-pearl/30 border-border/15 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight text-accent">
          Gender Representation
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Gender breakdown of cast and crew in your watched content, by department.
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {departments.map(({ department, items, total }) => (
            <div key={department}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-foreground/90">{department}</span>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {total} people
                </span>
              </div>
              {/* Stacked bar */}
              <div className="flex h-5 rounded-full overflow-hidden bg-border/10">
                {items.map((item) => {
                  const pct = (item.count / total) * 100;
                  const color = GENDER_COLORS[item.gender] || 'bg-border/30';
                  return (
                    <Tooltip
                      key={item.gender}
                      placement="top"
                      content={
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">{item.gender}</span>
                          <span className="text-muted-foreground">
                            {item.count} ({pct.toFixed(1)}%) · avg{' '}
                            {Number(item.avg_rating).toFixed(1)}
                          </span>
                        </div>
                      }
                    >
                      <div
                        className={`h-full ${color} transition-all hover:opacity-100`}
                        style={{ width: `${pct}%`, opacity: 0.75 }}
                      />
                    </Tooltip>
                  );
                })}
              </div>
              {/* Labels */}
              <div className="flex gap-3 mt-1">
                {items.map((item) => {
                  const pct = ((item.count / total) * 100).toFixed(0);
                  const textColor = GENDER_TEXT_COLORS[item.gender] || 'text-muted-foreground';
                  return (
                    <span key={item.gender} className={`text-[10px] ${textColor} tabular-nums`}>
                      {item.gender} {pct}%
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
