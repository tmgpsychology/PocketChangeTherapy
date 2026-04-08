import { Link } from "wouter";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col bg-background"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex justify-end px-5 pt-4">
        <Link href="/therapist/login">
          <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            Therapist login
          </span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-primary mx-auto flex items-center justify-center mb-5 shadow-lg">
            <span className="text-primary-foreground font-bold text-3xl tracking-tight">PC</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-1">PocketChange</h1>
          <p className="text-muted-foreground text-sm mb-12 text-center">
            A private space for therapeutic growth
          </p>

          <div className="flex flex-col gap-3 w-full">
            <Link href="/client/login">
              <button className="w-full rounded-2xl bg-primary text-primary-foreground px-6 py-4 text-base font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
                Login
              </button>
            </Link>
            <Link href="/client/register">
              <button className="w-full rounded-2xl border border-border text-foreground px-6 py-4 text-base font-medium hover:bg-muted/50 transition-all active:scale-[0.98]">
                Create account
              </button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-10 text-center">
            By continuing, you agree to keep your health information private and secure.
          </p>
        </div>
      </div>
    </div>
  );
}
