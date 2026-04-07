import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin, getGetAuthUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const login = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login.mutateAsync({ data: { email, password } });
      await queryClient.invalidateQueries({ queryKey: getGetAuthUserQueryKey() });
    } catch (err: any) {
      setError(err?.data?.error ?? "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-4 shadow-lg">
            <span className="text-primary-foreground font-bold text-2xl">PC</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">PocketChange</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your therapy companion</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" className="w-full" disabled={login.isPending}>
                {login.isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <div className="mt-4 flex flex-col gap-2 text-center text-sm">
              <Link href="/forgot-password">
                <span className="text-primary hover:underline cursor-pointer">Forgot password?</span>
              </Link>
              <span className="text-muted-foreground">
                New here?{" "}
                <Link href="/register">
                  <span className="text-primary hover:underline cursor-pointer">Create account</span>
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
