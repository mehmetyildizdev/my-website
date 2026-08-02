import LogSuppressor from '@/components/LogSuppressor';
import DbOverview from '@/components/screen/stats/DbOverview';
import UnratedWatches from '@/components/screen/stats/UnratedWatches';
import { createScreenMetadata, SCREEN_SEO_CONFIG } from '@/lib/screen/seo';
export const revalidate = 86400; // 24h — refreshed by nightly GitHub Action

export const metadata = createScreenMetadata(SCREEN_SEO_CONFIG.stats);

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
