import { useState } from "react";
import { useLinkClientCode, useLogout, getGetAuthUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function LinkCodePage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const link = useLinkClientCode();
  const logout = useLogout();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await link.mutateAsync({ data: { accessCode: code.toUpperCase().trim() } });
      await queryClient.invalidateQueries({ queryKey: getGetAuthUserQueryKey() });
    } catch (err: any) {
      setError(err?.data?.error ?? "Invalid access code");
    }
  };

  const handleLogout = async () => {
    await logout.mutateAsync({});
    await queryClient.invalidateQueries({ queryKey: getGetAuthUserQueryKey() });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-4 shadow-lg">
            <span className="text-primary-foreground font-bold text-2xl">PC</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Enter your code</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your practitioner gave you a 10-character access code</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Access code</Label>
                <Input
                  id="code"
                  placeholder="XXXXXXXXXX"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={10}
                  className="text-center font-mono text-lg tracking-widest uppercase"
                  required
                />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" className="w-full" disabled={link.isPending || code.length !== 10}>
                {link.isPending ? "Linking..." : "Connect to my plan"}
              </Button>
            </form>
            <button
              onClick={handleLogout}
              className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
