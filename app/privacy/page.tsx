import Link from 'next/link';
import { Metadata } from 'next';
import { Button } from '@/components/shadcn/ui/button';
import { Separator } from '@/components/shadcn/ui/separator';
import { MoveLeft, ShieldCheck, Eye, Database, Cookie, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Mehmet Yildiz',
  description: 'Privacy Policy for mehmetyildiz.dev personal website and portfolio.',
  alternates: { canonical: '/privacy' },
};

function PolicySection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      </div>
      <div className="text-muted-foreground leading-relaxed space-y-3 pl-11">{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <section className="bg-diamond relative overflow-hidden min-h-screen">
      {/* Subtle top gradient */}
      <div className="absolute top-0 left-0 w-full h-36 bg-linear-to-b from-diamond via-obsidian/10 to-transparent pointer-events-none" />

      <div className="mx-auto flex max-w-4xl flex-col gap-12 px-6 py-24 sm:px-12 lg:px-16 relative z-10">
        <Button variant="glass" size="sm" asChild className="w-fit rounded-full">
          <Link href="/" className="group inline-flex items-center gap-1">
            <MoveLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Home
          </Link>
        </Button>

        <header className="flex flex-col gap-4 text-left">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary drop-shadow-sm">Legal</p>
          <h1 className="text-4xl font-black tracking-tight text-gold md:text-5xl text-shadow-lg">Privacy Policy</h1>
          <p className="text-lg text-foreground/80 font-medium text-shadow-sm">Last Updated: May 14, 2026</p>
        </header>

        <Separator className="bg-border/20" />

        <div className="flex flex-col gap-12">
          <PolicySection title="Introduction" icon={<ShieldCheck className="w-5 h-5" />}>
            <p>
              Welcome to my personal portfolio website (mehmetyildiz.dev). I value your privacy and aim to be transparent about how data is
              handled. This website is a personal showcase of my work and a bunch of yapping.
            </p>
          </PolicySection>

          <PolicySection title="Information Collection" icon={<Eye className="w-5 h-5" />}>
            <p>
              I use <strong>Google Analytics</strong> to understand how visitors interact with my site. This service collects data such as:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Pages visited and duration of stay</li>
              <li>Device type and browser information</li>
              <li>General geographic location (City/Country level)</li>
              <li>Referral sources (how you found the site)</li>
            </ul>
            <p>
              This information is processed in a way that does not personally identify anyone. I do not make any attempt to find out the
              identities of those visiting my website.
            </p>
          </PolicySection>

          <PolicySection title="Cookies" icon={<Cookie className="w-5 h-5" />}>
            <p>
              This site uses cookies—small text files placed on your machine—to help the site provide a better user experience. In general,
              cookies are used to retain user preferences and provide anonymized tracking data to third-party applications like Google
              Analytics.
            </p>
            <p>
              You may prefer to disable cookies on this site and on others. The most effective way to do this is to disable cookies in your
              browser.
            </p>
          </PolicySection>

          <PolicySection title="Data Usage" icon={<Database className="w-5 h-5" />}>
            <p>The data collected via analytics is used solely for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Improving the website's performance and user interface</li>
              <li>Identifying which blog topics are most interesting to readers</li>
              <li>Monitoring the site's technical health</li>
            </ul>
            <p>I do not sell, trade, or otherwise transfer your information to outside parties.</p>
          </PolicySection>

          <PolicySection title="External Links" icon={<Lock className="w-5 h-5" />}>
            <p>
              My portfolio contains links to other websites (GitHub, Microsoft Store, social media, etc.). Please note that I have no
              control over these external sites and am not responsible for their privacy practices. I encourage you to read the privacy
              statements of any other site that collects personally identifiable information.
            </p>
          </PolicySection>

          <PolicySection title="Contact" icon={<ShieldCheck className="w-5 h-5" />}>
            <p>
              If you have any questions regarding this privacy policy, you can reach out to me via the social links provided on the
              homepage.
            </p>
          </PolicySection>
        </div>

        <Separator className="bg-border/20" />

        <footer className="text-center text-sm text-muted-foreground italic">Built with care using Next.js and Tailwind CSS.</footer>
      </div>
    </section>
  );
}
