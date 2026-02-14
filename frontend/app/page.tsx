import Link from "next/link";
import { ArrowRight, Calendar, MessageSquare, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950 font-sans">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-zinc-200 bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">EventMaster</span>
          </div>
          <nav>
            <Link
              href="/login"
              className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all active:scale-95"
            >
              Log in
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-16">
        <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8 flex justify-center">
              <span className="relative rounded-full px-3 py-1 text-sm leading-6 text-zinc-600 ring-1 ring-zinc-200 hover:ring-zinc-300 dark:text-zinc-400 dark:ring-zinc-800">
                AI-Powered Support integrated.{" "}
                <Link href="/login" className="font-semibold text-indigo-600 dark:text-indigo-400">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Read more <span aria-hidden="true">&rarr;</span>
                </Link>
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
              Event Management, <span className="text-indigo-600 dark:text-indigo-400">Simplified</span>.
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              The ultimate platform for security-first event planning. Integrated with Gemini AI help desk, auditing, and multi-role administration.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:bg-indigo-500 transition-all hover:translate-y-[-2px] active:scale-95"
              >
                Get Started <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="#features" className="text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-50">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-zinc-50 dark:bg-zinc-900/50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl bg-white dark:bg-zinc-900 p-8 shadow-sm border border-zinc-100 dark:border-zinc-800">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/30">
                  <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">AI Help Desk</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                  Instant support via Google Gemini. Get answers to your event questions in seconds.
                </p>
              </div>

              <div className="rounded-2xl bg-white dark:bg-zinc-900 p-8 shadow-sm border border-zinc-100 dark:border-zinc-800">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950/30">
                  <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Secure by Design</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                  JWT auth, RBAC, and detailed audit logs ensure your data stays protected and accountable.
                </p>
              </div>

              <div className="rounded-2xl bg-white dark:bg-zinc-900 p-8 shadow-sm border border-zinc-100 dark:border-zinc-800">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/30">
                  <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Easy Planning</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                  Create, update, and manage your events with an intuitive, responsive interface.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 text-center">
          <p className="text-xs leading-5 text-zinc-500">
            &copy; 2026 EventMaster. Designed for performance and security.
          </p>
        </div>
      </footer>
    </div>
  );
}
