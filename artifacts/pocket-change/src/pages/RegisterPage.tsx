import { useState } from "react";
import { Link } from "wouter";
import { useRegister, getGetAuthUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"practitioner" | "client">("client");
  const [securityQuestion, setSecurityQuestion] = useState("What was the name of your first pet?");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const register = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register.mutateAsync({ data: { email, name, password, role, securityQuestion, securityAnswer } });
      await queryClient.invalidateQueries({ queryKey: getGetAuthUserQueryKey() });
    } catch (err: any) {
      setError(err?.data?.error ?? "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-3 shadow-lg">
            <span className="text-primary-foreground font-bold text-xl">PC</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create account</h1>
          <p className="text-muted-foreground mt-1 text-sm">Join PocketChange today</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                {(["client", "practitioner"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${role === r ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
                  >
                    {r === "client" ? "Client" : "Practitioner"}
                  </button>
                ))}
              </div>

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
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              <div className="border-t pt-4 mt-2">
                <p className="text-xs text-muted-foreground mb-3">Security question (for password recovery)</p>
                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <select
                    id="question"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                  >
                    <option>What was the name of your first pet?</option>
                    <option>What city were you born in?</option>
                    <option>What was your childhood nickname?</option>
                    <option>What is your mother's maiden name?</option>
                  </select>
                </div>
                <div className="space-y-2 mt-2">
                  <Label htmlFor="answer">Answer</Label>
                  <Input id="answer" placeholder="Your answer" value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} />
                </div>
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" className="w-full" disabled={register.isPending}>
                {register.isPending ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login">
                <span className="text-primary hover:underline cursor-pointer">Sign in</span>
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
