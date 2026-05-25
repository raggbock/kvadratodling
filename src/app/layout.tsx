import type { Metadata } from 'next';
import { Familjen_Grotesk } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { PostHogProvider } from '@/components/PostHogProvider';
import { SignOutButton } from '@/components/SignOutButton';
import './globals.css';

const familjenGrotesk = Familjen_Grotesk({
  subsets: ['latin'],
  variable: '--font-familjen-grotesk',
});

export const metadata: Metadata = {
  title: 'Kvadratodling — Planera din pallkrage',
  description: 'Planera din pallkrage kvadrat för kvadrat. 25 växter, sällskapsplantering och odlingsschema som följer din sista frost.',
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
          <footer className="border-t border-border-subtle py-6 text-center text-xs text-text-muted">
            Kvadratodling — planera din pallkrage kvadrat för kvadrat
          </footer>
        </PostHogProvider>
      </body>
    </html>
  );
}
