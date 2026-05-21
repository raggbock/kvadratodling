import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import { PostHogProvider } from '@/components/PostHogProvider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Kvadratodling — Square-foot garden planner',
  description: 'Plan your square-foot garden, browse plants, and get companion-planting hints.',
};

// Clerk is loaded dynamically so staging works before Clerk keys are configured.
const clerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

type FC<P = Record<string, never>> = (props: P) => React.ReactNode;

async function getClerkComponents() {
  if (!clerkConfigured) {
    return {
      ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
      SignInButton: () => null as React.ReactNode,
      Show: () => null as React.ReactNode,
      UserButton: () => null as React.ReactNode,
    };
  }
  const clerk = await import('@clerk/nextjs');
  return {
    ClerkProvider: clerk.ClerkProvider as FC<{ children: React.ReactNode }>,
    SignInButton: clerk.SignInButton as FC<{ mode?: string; children?: React.ReactNode }>,
    Show: clerk.Show as FC<{ when: string; children?: React.ReactNode }>,
    UserButton: clerk.UserButton as FC,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { ClerkProvider, SignInButton, Show, UserButton } = await getClerkComponents();

  return (
    <ClerkProvider>
      <html lang="sv" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        <body className="flex min-h-full flex-col bg-gray-50">
          <PostHogProvider>
            <header className="border-b border-gray-200 bg-white">
              <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2 font-bold text-green-700">
                  <span className="text-xl">🌱</span>
                  <span>Kvadratodling</span>
                </Link>
                <nav className="flex flex-1 items-center gap-4 text-sm text-gray-600">
                  <Link href="/catalog" className="hover:text-green-700">
                    Plant catalog
                  </Link>
                  <Show when="signed-in">
                    <Link href="/gardens" className="hover:text-green-700">
                      My gardens
                    </Link>
                  </Show>
                </nav>
                <div className="flex items-center gap-3">
                  <Show when="signed-out">
                    <SignInButton mode="modal">
                      <button className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">
                        Sign in
                      </button>
                    </SignInButton>
                  </Show>
                  <Show when="signed-in">
                    <UserButton />
                  </Show>
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
              Kvadratodling — square-foot garden planner
            </footer>
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
