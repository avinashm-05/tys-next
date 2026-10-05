// Shared frame for the PUBLIC auth pages (login / forgot / reset) — these
// must stay reachable while logged out, so there is no guard here.
// Attio-style (2026-10-05): quiet off-white page, logo, one narrow column.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#fafbfc] px-4 py-12 dark:bg-background">
      <div className="w-full max-w-[380px]">
        {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset, same as the site header */}
        <img
          src="/frontend/logo/TYS_GLOBAL_LOGISTICS_Blue.png"
          alt="TYS Global Logistics"
          width={480}
          height={177}
          className="mx-auto mb-10 h-10 w-auto select-none dark:hidden"
          draggable={false}
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- dark-mode variant */}
        <img
          src="/frontend/logo/TYS_GLOBAL_LOGISTICS_White.png"
          alt=""
          width={480}
          height={177}
          className="mx-auto mb-10 hidden h-10 w-auto select-none dark:block"
          draggable={false}
        />
        {children}
      </div>
    </main>
  );
}
