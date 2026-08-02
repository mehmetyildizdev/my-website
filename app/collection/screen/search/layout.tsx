import { createScreenMetadata, SCREEN_SEO_CONFIG } from '@/lib/screen/seo';

export const metadata = createScreenMetadata(SCREEN_SEO_CONFIG.search);

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
