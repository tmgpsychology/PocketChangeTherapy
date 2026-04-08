import { Link } from "wouter";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-background p-6"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="w-20 h-20 rounded-3xl bg-primary mx-auto flex items-center justify-center mb-5 shadow-lg">
          <span className="text-primary-foreground font-bold text-3xl tracking-tight">PC</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-1">PocketChange</h1>
        <p className="text-muted-foreground text-sm mb-12 text-center">
          A private space for therapeutic growth
        </p>

        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">
          How are you using the app?
        </p>

        <div className="flex flex-col gap-4 w-full">
          <Link href="/therapist/login">
            <button className="group w-full relative overflow-hidden rounded-2xl bg-primary text-primary-foreground px-6 py-5 text-left shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">I'm a Therapist</p>
                  <p className="text-sm text-primary-foreground/70 mt-0.5">Manage clients and track progress</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-70 group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </div>
            </button>
          </Link>

          <Link href="/client/login">
            <button className="group w-full relative overflow-hidden rounded-2xl bg-card border-2 border-primary/20 text-foreground px-6 py-5 text-left shadow-sm hover:shadow-md hover:border-primary/40 transition-all active:scale-[0.98]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">I'm a Client</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Check in on my goals</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-primary/50 group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </div>
            </button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-10 text-center">
          By continuing, you agree to keep your health information private and secure.
        </p>
      </div>
    </div>
  );
}
