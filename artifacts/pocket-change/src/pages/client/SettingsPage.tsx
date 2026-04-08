import { Layout } from "@/components/Layout";
import { useAuth } from "@/components/AuthProvider";
import { useLogout, getGetAuthUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ClientSettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const logout = useLogout();

  const handleLogout = async () => {
    await logout.mutateAsync({});
    queryClient.setQueryData(getGetAuthUserQueryKey(), null);
  };

  return (
    <Layout>
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold text-foreground">Settings</h2>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">Client</span>
            </div>
            {user?.accessCode && (
              <div>
                <p className="text-xs text-muted-foreground">Access code</p>
                <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">{user.accessCode}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleLogout}
          disabled={logout.isPending}
        >
          {logout.isPending ? "Signing out..." : "Sign out"}
        </Button>
      </div>
    </Layout>
  );
}
