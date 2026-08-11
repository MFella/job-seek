const DASHBOARD_URL =
  import.meta.env.VITE_DASHBOARD_URL ?? 'http://localhost:4200';

export function DashboardPage() {
  return (
    <section className="flex h-[calc(100vh-8rem)] flex-col">
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Filtering dashboard, served by job-seek-dashboard (Angular) and embedded
        here via iframe.
      </p>
      <iframe
        title="job-seek-dashboard"
        src={DASHBOARD_URL}
        className="mt-4 flex-1 rounded-lg border border-slate-200 bg-white"
      />
    </section>
  );
}
