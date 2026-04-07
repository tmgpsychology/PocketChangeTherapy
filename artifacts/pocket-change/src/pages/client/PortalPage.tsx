import { useAuth } from "@/components/AuthProvider";
import { Layout } from "@/components/Layout";
import { useGetClientPortal, getGetClientPortalQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import type { Goal } from "@workspace/api-client-react/src/generated/api.schemas";

function GoalCard({ goal, code, depth = 0 }: { goal: Goal; code: string; depth?: number }) {
  const progress = goal.currentProgress ?? 0;
  const hasSubGoals = goal.subGoals && goal.subGoals.length > 0;

  return (
    <div style={{ marginLeft: depth * 12 }}>
      <Link href={`/portal/goals/${goal.id}`}>
        <div className="cursor-pointer group">
          <div className="bg-card border border-border rounded-xl px-4 py-3 mb-2 hover:shadow-md transition-all hover:border-primary/30">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{goal.title}</p>
                  {goal.type && (
                    <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded font-medium ${goal.type === "outcome" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                      {goal.type}
                    </span>
                  )}
                </div>
                {goal.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{goal.description}</p>}
              </div>
              <Link href={`/portal/goals/${goal.id}/checkin`}>
                <div
                  className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </div>
              </Link>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </Link>
      {hasSubGoals && (
        <div className="border-l-2 border-border/50 ml-4 pl-2 mb-2">
          {goal.subGoals!.map((sub) => (
            <GoalCard key={sub.id} goal={sub} code={code} depth={0} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PortalPage() {
  const { user } = useAuth();
  const code = user?.accessCode ?? "";
  const { data, isLoading } = useGetClientPortal(code, {
    query: { queryKey: getGetClientPortalQueryKey(code), enabled: !!code && code.length > 0 },
  });

  const clientCode = data?.client?.accessCode ?? code;

  return (
    <Layout>
      <div className="p-4 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-foreground">My Goals</h2>
          {data?.practitionerName && (
            <p className="text-sm text-muted-foreground mt-0.5">With {data.practitionerName}</p>
          )}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
          </div>
        )}

        {!isLoading && !code && (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground text-sm">Your account isn't linked to a client profile yet.</p>
            </CardContent>
          </Card>
        )}

        {data && data.goals.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground text-sm">No goals set yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Your practitioner will add your goals.</p>
            </CardContent>
          </Card>
        )}

        {data && data.goals.length > 0 && (
          <div>
            {data.goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} code={clientCode} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
