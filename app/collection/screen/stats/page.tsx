import LogSuppressor from "@/components/LogSuppressor";
import DbOverview from "@/components/screen/stats/DbOverview";
import UnratedWatches from "@/components/screen/stats/UnratedWatches";
import Link from "next/link";
export const revalidate = 604800;

export const metadata = {
  title: "Screen | DB Stats",
  description: "Database overview, data coverage, and schema relationships.",
};

export default async function StatsPage() {
  return (
    <>
      <LogSuppressor />
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link
            href="/collection/screen"
            className="text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            ← Back to Screen
          </Link>
        </div>
        <DbOverview />
        <section className="border-t border-border/10 pt-8">
          <UnratedWatches />
        </section>
      </div>
    </>
  );
}
