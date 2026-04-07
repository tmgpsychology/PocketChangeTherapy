import { Layout } from "@/components/Layout";
import { useGetDashboard, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useAuth } from "@/components/AuthProvider";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="flex-1">
      <CardContent className="pt-4 pb-3">
        <p className="text-2xl font-bold text-primary">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useGetDashboard({ query: { queryKey: getGetDashboardQueryKey() } });

  return (
    <Layout>
      <div className="p-4 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-foreground">Good to see you</h2>
          <p className="text-muted-foreground text-sm">{user?.name}</p>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
          </div>
        )}

        {data && (
          <>
            <div className="flex gap-3">
              <StatCard label="Total clients" value={data.totalClients} />
              <StatCard label="Active this week" value={data.activeClients} />
              <StatCard label="Check-ins" value={data.totalCheckins} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Your clients</h3>
                <Link href="/clients">
                  <span className="text-sm text-primary">See all</span>
                </Link>
              </div>
              {data.clients.length === 0 ? (
                <Card>
                  <CardContent className="pt-8 pb-8 text-center">
                    <p className="text-muted-foreground text-sm">No clients yet.</p>
                    <Link href="/clients">
                      <span className="text-primary text-sm mt-1 block hover:underline cursor-pointer">Add your first client</span>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {data.clients.slice(0, 5).map((client) => (
                    <Link key={client.id} href={`/clients/${client.accessCode}`}>
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="py-3 px-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground text-sm">{client.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {client.goalCount ?? 0} goals
                                {client.lastCheckin ? ` · Last check-in ${formatDate(client.lastCheckin)}` : ""}
                              </p>
                            </div>
                            {client.averageProgress != null && (
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${client.averageProgress}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">{Math.round(client.averageProgress)}%</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {data.recentActivity.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">Recent activity</h3>
                <div className="space-y-2">
                  {data.recentActivity.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-card border border-border">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary text-xs font-bold">{Math.round(item.percentage)}%</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.clientName}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.goalTitle}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{formatDate(item.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
