import LogSuppressor from '@/components/LogSuppressor';
import DbOverview from '@/components/screen/stats/DbOverview';
import UnratedWatches from '@/components/screen/stats/UnratedWatches';
import { createScreenMetadata, SCREEN_SEO_CONFIG } from '@/lib/screen/seo';
export const revalidate = 604800; // 7 days — on-demand refreshed via app sync triggers

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
