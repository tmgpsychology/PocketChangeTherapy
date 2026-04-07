import { useRoute, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/components/AuthProvider";
import { useGetGoalCheckins, getGetGoalCheckinsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function GoalDetailPage() {
  const [, params] = useRoute("/portal/goals/:goalId");
  const goalId = Number(params?.goalId ?? 0);
  const { user } = useAuth();
  const code = user?.accessCode ?? "";

  const { data: checkins, isLoading } = useGetGoalCheckins(code, goalId, {
    query: { queryKey: getGetGoalCheckinsQueryKey(code, goalId), enabled: !!code && !!goalId },
  });

  return (
    <Layout>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Link href="/portal">
            <span className="text-primary text-sm cursor-pointer">Goals</span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">Goal detail</span>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Check-in History</h2>
          <Link href={`/portal/goals/${goalId}/checkin`}>
            <Button size="sm">Check in</Button>
          </Link>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
          </div>
        )}

        {checkins && checkins.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground text-sm">No check-ins yet.</p>
              <Link href={`/portal/goals/${goalId}/checkin`}>
                <span className="text-primary text-sm mt-1 block cursor-pointer hover:underline">Make your first check-in</span>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {checkins?.slice().reverse().map((checkin) => (
            <Card key={checkin.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground">{formatDate(checkin.createdAt)}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${checkin.percentage}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-primary">{Math.round(checkin.percentage)}%</span>
                  </div>
                </div>
                {checkin.whatWorked && (
                  <div className="mb-2">
                    <p className="text-xs text-muted-foreground font-medium">What worked</p>
                    <p className="text-sm text-foreground mt-0.5">{checkin.whatWorked}</p>
                  </div>
                )}
                {checkin.whatGotInTheWay && (
                  <div className="mb-2">
                    <p className="text-xs text-muted-foreground font-medium">What got in the way</p>
                    <p className="text-sm text-foreground mt-0.5">{checkin.whatGotInTheWay}</p>
                    {checkin.barrierTags && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {checkin.barrierTags.split(",").filter(Boolean).map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{tag.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {checkin.whatCouldYouDoDifferently && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">What could you do differently</p>
                    <p className="text-sm text-foreground mt-0.5">{checkin.whatCouldYouDoDifferently}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
