import type { Metadata } from 'next';
import { Familjen_Grotesk } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { PostHogProvider } from '@/components/PostHogProvider';
import { SignOutButton } from '@/components/SignOutButton';
import { SITE_URL, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, SITE_LOCALE, DEFAULT_OG_IMAGE } from '@/lib/site';
import './globals.css';

const familjenGrotesk = Familjen_Grotesk({
  subsets: ['latin'],
  variable: '--font-familjen-grotesk',
});

// metadataBase lets per-page metadata use relative OG URLs and Next resolves
// them against the canonical origin. Title template adds "| Kvadratodling"
// only when a child page sets its own title (homepage uses default).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  keywords: [
    'pallkrage', 'kvadratodling', 'square foot gardening',
    'sällskapsplantering', 'odlingsschema', 'växtzoner sverige',
    'hobbyodling', 'köksträdgård', 'odla själv',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    locale: SITE_LOCALE,
    url: SITE_URL,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: {
    icon: '/assets/logo-grodden-32.svg',
    apple: '/assets/logo-grodden-32.svg',
  },
};

async function getUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  try {
    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();

  return (
    <html lang="sv" className={`${familjenGrotesk.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-surface-page text-text-default">
        <PostHogProvider>
          <header className="border-b border-border-default bg-surface-default">
            <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6 lg:px-8">
              <Link href="/" className="flex items-center" aria-label="Kvadratodling">
                {/* Wordmark already includes the logo glyph — show icon-only on mobile, wordmark on desktop */}
                <Image
                  src="/assets/logo-grodden-32.svg"
                  alt="Kvadratodling"
                  width={32}
                  height={32}
                  className="sm:hidden"
                />
                <Image
                  src="/assets/wordmark-grodden.svg"
                  alt="Kvadratodling"
                  width={144}
                  height={32}
                  className="hidden sm:block"
                />
              </Link>
              <nav className="flex flex-1 items-center gap-4 text-sm text-text-subtle">
                <Link href="/catalog" className="hover:text-brand-default">
                  Växtkatalog
                </Link>
                {user && (
                  <Link href="/gardens" className="hover:text-brand-default">
                    Mina odlingar
                  </Link>
                )}
              </nav>
              <div className="flex items-center gap-3">
                {user ? (
                  <>
                    <Link
                      href="/settings"
                      className="hidden text-sm text-text-muted hover:text-brand-default sm:block"
                      title="Inställningar"
                    >
                      {user.email}
                    </Link>
                    <SignOutButton />
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="rounded-md border border-brand-default px-3 py-1.5 text-sm font-medium text-brand-default hover:bg-brand-subtle"
                    >
                      Logga in
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="rounded-md bg-brand-default px-3 py-1.5 text-sm font-medium text-text-inverse hover:bg-brand-emphasis"
                    >
                      Skapa konto
                    </Link>
                  </>
                )}
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border-subtle bg-white">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-text-default">
                    <Image src="/assets/logo-grodden-32.svg" alt="" width={20} height={20} />
                    Kvadratodling
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-text-muted">
                    Planera din pallkrage kvadrat för kvadrat — för svenska klimatet.
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Guider</h3>
                  <ul className="mt-3 space-y-2 text-sm text-text-subtle">
                    <li><Link href="/pallkrage" className="hover:text-brand-default">Pallkrage</Link></li>
                    <li><Link href="/sallskapsplantering" className="hover:text-brand-default">Sällskapsplantering</Link></li>
                    <li><Link href="/odlingszoner" className="hover:text-brand-default">Odlingszoner</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Verktyg</h3>
                  <ul className="mt-3 space-y-2 text-sm text-text-subtle">
                    <li><Link href="/catalog" className="hover:text-brand-default">Växtkatalog</Link></li>
                    <li><Link href="/gardens/demo/schedule" className="hover:text-brand-default">Demo-schema</Link></li>
                    <li><Link href="/gardens/new" className="hover:text-brand-default">Skapa odling</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Konto</h3>
                  <ul className="mt-3 space-y-2 text-sm text-text-subtle">
                    {user ? (
                      <>
                        <li><Link href="/gardens" className="hover:text-brand-default">Mina odlingar</Link></li>
                        <li><Link href="/settings" className="hover:text-brand-default">Inställningar</Link></li>
                      </>
                    ) : (
                      <>
                        <li><Link href="/auth/login" className="hover:text-brand-default">Logga in</Link></li>
                        <li><Link href="/auth/signup" className="hover:text-brand-default">Skapa konto</Link></li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
              <div className="mt-8 border-t border-border-subtle pt-6 text-center text-xs text-text-muted">
                © {new Date().getFullYear()} Kvadratodling — planera din pallkrage kvadrat för kvadrat
              </div>
            </div>
          </footer>
        </PostHogProvider>
      </body>
    </html>
  );
}
