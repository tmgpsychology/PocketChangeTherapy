import { useState } from "react";
import { Link } from "wouter";
import { useVerifySecurityQuestion, useResetPassword } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Step = "email" | "answer" | "reset" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  const verify = useVerifySecurityQuestion();
  const resetPw = useResetPassword();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = await verify.mutateAsync({ data: { email, answer } });
      setResetToken(result.resetToken);
      setQuestion(result.question);
      setStep("reset");
    } catch (err: any) {
      setError(err?.data?.error ?? "Incorrect answer");
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await resetPw.mutateAsync({ data: { resetToken, newPassword } });
      setStep("done");
    } catch (err: any) {
      setError(err?.data?.error ?? "Reset failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Reset password</h1>
          <p className="text-muted-foreground mt-1 text-sm">We'll verify your identity first</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {step === "email" && (
              <form onSubmit={(e) => { e.preventDefault(); setStep("answer"); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full">Continue</Button>
              </form>
            )}
            {step === "answer" && (
              <form onSubmit={handleVerify} className="space-y-4">
                <p className="text-sm text-muted-foreground">Answer your security question for <strong>{email}</strong></p>
                <div className="space-y-2">
                  <Label>Security answer</Label>
                  <Input placeholder="Your answer" value={answer} onChange={(e) => setAnswer(e.target.value)} required />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Button type="submit" className="w-full" disabled={verify.isPending}>
                  {verify.isPending ? "Verifying..." : "Verify"}
                </Button>
              </form>
            )}
            {step === "reset" && (
              <form onSubmit={handleReset} className="space-y-4">
                <p className="text-sm text-muted-foreground">Identity verified. Set a new password.</p>
                <div className="space-y-2">
                  <Label htmlFor="newpw">New password</Label>
                  <Input id="newpw" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Button type="submit" className="w-full" disabled={resetPw.isPending}>
                  {resetPw.isPending ? "Resetting..." : "Reset password"}
                </Button>
              </form>
            )}
            {step === "done" && (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 6 9 17l-5-5" /></svg>
                </div>
                <p className="text-foreground font-medium">Password reset!</p>
                <Link href="/login">
                  <Button className="w-full">Sign in now</Button>
                </Link>
              </div>
            )}
            {step !== "done" && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                <Link href="/login">
                  <span className="text-primary hover:underline cursor-pointer">Back to sign in</span>
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
