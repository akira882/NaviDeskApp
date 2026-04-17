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
      <main className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:gap-6 sm:py-7 lg:gap-8 lg:py-8">
        <section className="rounded-xl border border-line-subtle bg-hero-gradient px-5 py-6 sm:px-8 sm:py-8">
          <p className="mb-2 text-xs font-medium text-text-muted">社内ナレッジポータル</p>
          <h1 className="text-2xl font-bold text-text-primary sm:text-3xl lg:text-4xl">{title}</h1>
          <div className="mt-3 flex items-start gap-3 sm:mt-4">
            <div className="mt-1.5 w-0.5 shrink-0 self-stretch bg-gradient-to-b from-accent-teal/50 to-transparent rounded-full" />
            <p className="text-sm leading-7 text-text-secondary">{description}</p>
          </div>
        </section>
        {children}
      </main>
    </>
  );
}
