'use client';

import * as React from 'react';
import { cn } from '@/lib/shadcn/utils';

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>');
  return ctx;
}

function Tabs({
  value,
  onValueChange,
  defaultValue,
  className,
  children,
  ...props
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
} & Omit<React.ComponentProps<'div'>, 'defaultValue'>) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = React.useCallback(
    (newValue: string) => {
      if (!isControlled) setInternalValue(newValue);
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange],
  );

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleChange }}>
      <div data-slot="tabs" className={cn('flex flex-col', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="tabs-list"
      role="tablist"
      className={cn('inline-flex gap-1 p-1 rounded-lg bg-pearl/20 border border-border/10 w-fit', className)}
      {...props}
    />
  );
}

function TabsTrigger({ value, className, ...props }: { value: string } & React.ComponentProps<'button'>) {
  const { value: selectedValue, onValueChange } = useTabs();
  const isActive = selectedValue === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
      onClick={() => onValueChange(value)}
      className={cn(
        'px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer',
        isActive ? 'bg-accent text-background shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-pearl/30',
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ value, className, ...props }: { value: string } & React.ComponentProps<'div'>) {
  const { value: selectedValue } = useTabs();
  if (selectedValue !== value) return null;

  return <div role="tabpanel" data-slot="tabs-content" className={cn('mt-2', className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
