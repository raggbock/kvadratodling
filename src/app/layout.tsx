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
  title: 'Kvadratodling — Square-foot garden planner',
  description: 'Plan your square-foot garden, browse plants, and get companion-planting hints.',
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
              <Link href="/" className="flex items-center gap-2">
                <Image src="/assets/logo-grodden-32.svg" alt="Kvadratodling" width={28} height={28} />
                <Image src="/assets/wordmark-grodden.svg" alt="Kvadratodling" width={110} height={18} className="hidden sm:block" />
              </Link>
              <nav className="flex flex-1 items-center gap-4 text-sm text-text-subtle">
                <Link href="/catalog" className="hover:text-brand-default">
                  Plant catalog
                </Link>
                {user && (
                  <Link href="/gardens" className="hover:text-brand-default">
                    My gardens
                  </Link>
                )}
              </nav>
              <div className="flex items-center gap-3">
                {user ? (
                  <>
                    <span className="hidden text-sm text-text-muted sm:block">{user.email}</span>
                    <SignOutButton />
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="rounded-md border border-brand-default px-3 py-1.5 text-sm font-medium text-brand-default hover:bg-brand-subtle"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="rounded-md bg-brand-default px-3 py-1.5 text-sm font-medium text-text-inverse hover:bg-brand-emphasis"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border-subtle py-6 text-center text-xs text-text-muted">
            Kvadratodling — square-foot garden planner
          </footer>
        </PostHogProvider>
      </body>
    </html>
  );
}
