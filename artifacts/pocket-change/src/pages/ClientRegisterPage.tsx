import { useState } from "react";
import { Link } from "wouter";
import { useRegister, getGetAuthUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PasswordInput } from "@/components/PasswordInput";

const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What was your childhood nickname?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?",
];

export default function ClientRegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const register = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      await register.mutateAsync({
        data: { email, name, password, role: "client", securityQuestion, securityAnswer },
      });
      await queryClient.invalidateQueries({ queryKey: getGetAuthUserQueryKey() });
    } catch (err: any) {
      setError(err?.data?.error ?? "Registration failed. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-background"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex items-center px-4 pt-4 pb-2">
        <Link href="/client/login">
          <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to sign in
          </button>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 pt-2">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-4 shadow-sm border border-primary/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Create client account</h1>
            <p className="text-muted-foreground text-sm mt-1">You'll need your access code from your therapist</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <PasswordInput id="confirm" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required />
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground font-medium mb-3">Security question — used for password recovery</p>
                  <div className="space-y-2">
                    <Label htmlFor="question">Question</Label>
                    <select
                      id="question"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      value={securityQuestion}
                      onChange={(e) => setSecurityQuestion(e.target.value)}
                    >
                      {SECURITY_QUESTIONS.map((q) => <option key={q}>{q}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2 mt-3">
                    <Label htmlFor="answer">Your answer</Label>
                    <Input id="answer" placeholder="Answer" value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} required />
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-lg">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={register.isPending}>
                  {register.isPending ? "Creating account..." : "Create client account"}
                </Button>
              </form>

              <div className="mt-5 pt-5 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/client/login">
                    <span className="text-primary font-medium hover:underline cursor-pointer">Sign in</span>
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
