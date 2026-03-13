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
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8">
        <section className="rounded-3xl border border-white/80 bg-gradient-to-r from-ink to-slate-700 px-6 py-8 text-white shadow-panel">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-teal-100">NaviDesk MVP</p>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200">{description}</p>
        </section>
        {children}
      </main>
    </>
  );
}
