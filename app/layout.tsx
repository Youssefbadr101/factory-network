import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Factory Network',
  description: 'An open, searchable directory of manufacturing factories and suppliers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f8f8f7] text-zinc-900 antialiased">
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="font-serif text-xl italic tracking-tight text-zinc-900">
              Factory Network
            </Link>
            <a
              href="https://github.com/Youssefbadr101/factory-network"
              className="text-sm text-zinc-500 hover:text-zinc-900"
              title="Open source — fork this to run your own directory"
            >
              Open source
            </a>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        <footer className="mx-auto max-w-6xl px-6 py-10 text-xs text-zinc-400">
          Factory Network is open source (MIT) — anyone can read this directory, and it's free to fork and run your own.
        </footer>
      </body>
    </html>
  );
}
