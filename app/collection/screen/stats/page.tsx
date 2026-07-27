import LogSuppressor from '@/components/LogSuppressor';
import DbOverview from '@/components/screen/stats/DbOverview';
import UnratedWatches from '@/components/screen/stats/UnratedWatches';
export const revalidate = 86400; // 24h — refreshed by nightly GitHub Action

export const metadata = {
  title: 'Screen | DB Stats',
  description: 'Database overview, data coverage, and schema relationships.',
};

export default async function StatsPage() {
  return (
    <>
      <LogSuppressor />
      <div className="space-y-8">
        <DbOverview />
        <section className="border-t border-border/10 pt-8">
          <UnratedWatches />
        </section>
      </div>
    </>
  );
}
