// Shared frame for the PUBLIC auth pages (login / forgot / reset) — these
// must stay reachable while logged out, so there is no guard here.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* text-primary: navy in light, brand orange in dark — legible in both. */}
        <p className="mb-6 text-center text-h3 text-primary">TYS Global Logistics</p>
        {children}
      </div>
    </main>
  );
}
