import { SiteHeader } from "@/components/site-header";

export function AppShell({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 lg:gap-8 lg:py-8">
        <section className="rounded-2xl border border-white/80 bg-gradient-to-r from-ink to-slate-700 px-4 py-5 text-white shadow-panel sm:rounded-3xl sm:px-6 sm:py-8">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.2em] text-teal-100 sm:mb-2 sm:text-sm">NaviDeskApp Enterprise</p>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-200 sm:mt-3 sm:text-sm sm:leading-6">{description}</p>
        </section>
        {children}
      </main>
    </>
  );
}
