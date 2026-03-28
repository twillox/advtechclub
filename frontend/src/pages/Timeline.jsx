export default function Timeline() {
  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary-container px-6 pt-24 pb-24 max-w-md mx-auto">
      <div className="mb-10">
        <span className="text-[10px] uppercase tracking-[0.1em] font-medium text-outline">
          Activity
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-on-surface">
          Timeline
        </h1>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-[0px_12px_32px_rgba(45,52,53,0.04)] p-6">
        <p className="text-sm text-on-surface-variant">
          Coming next: event registrations, attendance, and XP history.
        </p>
      </div>
    </div>
  );
}

