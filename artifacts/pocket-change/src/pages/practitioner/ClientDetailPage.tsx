import { useState } from "react";
import { useRoute, Link } from "wouter";
import { Layout } from "@/components/Layout";
import {
  useGetClient,
  useGetClientGoals,
  useCreateGoal,
  useUpdateClient,
  useDeleteClient,
  getGetClientQueryKey,
  getGetClientGoalsQueryKey,
  getListClientsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Goal } from "@workspace/api-client-react/src/generated/api.schemas";

function GoalNode({ goal, depth = 0 }: { goal: Goal; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
        {goal.subGoals && goal.subGoals.length > 0 && (
          <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground w-4">
            {expanded ? "▾" : "▸"}
          </button>
        )}
        {(!goal.subGoals || goal.subGoals.length === 0) && <div className="w-4" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{goal.title}</p>
          {goal.type && (
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${goal.type === "outcome" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
              {goal.type}
            </span>
          )}
        </div>
        {goal.currentProgress != null && (
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${goal.currentProgress}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{Math.round(goal.currentProgress)}%</span>
          </div>
        )}
      </div>
      {expanded && goal.subGoals?.map((sub) => (
        <GoalNode key={sub.id} goal={sub} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function ClientDetailPage() {
  const [, params] = useRoute("/clients/:code");
  const code = params?.code ?? "";
  const queryClient = useQueryClient();

  const { data: client, isLoading } = useGetClient(code, { query: { queryKey: getGetClientQueryKey(code), enabled: !!code } });
  const { data: goals } = useGetClientGoals(code, { query: { queryKey: getGetClientGoalsQueryKey(code), enabled: !!code } });
  const createGoal = useCreateGoal();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalType, setGoalType] = useState<"process" | "outcome">("outcome");
  const [goalDesc, setGoalDesc] = useState("");
  const [editNotes, setEditNotes] = useState(false);
  const [notes, setNotes] = useState("");

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    await createGoal.mutateAsync({ code, data: { title: goalTitle, type: goalType, description: goalDesc || null } });
    queryClient.invalidateQueries({ queryKey: getGetClientGoalsQueryKey(code) });
    setGoalTitle("");
    setGoalDesc("");
    setShowGoalForm(false);
  };

  const handleUpdateNotes = async () => {
    await updateClient.mutateAsync({ code, data: { notes } });
    queryClient.invalidateQueries({ queryKey: getGetClientQueryKey(code) });
    setEditNotes(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-4 space-y-3">
          <div className="h-8 bg-muted rounded animate-pulse w-1/2" />
          <div className="h-40 bg-muted rounded-xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Link href="/clients">
            <span className="text-primary text-sm cursor-pointer">Clients</span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground">{client?.name}</span>
        </div>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">{client?.name}</h2>
                {client?.email && <p className="text-sm text-muted-foreground">{client.email}</p>}
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{client?.accessCode}</span>
                </div>
              </div>
            </div>
            {!editNotes ? (
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-medium">Notes</p>
                  <button onClick={() => { setNotes(client?.notes ?? ""); setEditNotes(true); }} className="text-xs text-primary">Edit</button>
                </div>
                <p className="text-sm text-foreground mt-1">{client?.notes || <span className="text-muted-foreground italic">No notes yet</span>}</p>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none min-h-20"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Session notes..."
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleUpdateNotes} disabled={updateClient.isPending}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditNotes(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Goals</h3>
            <Button size="sm" variant="outline" onClick={() => setShowGoalForm(!showGoalForm)}>
              {showGoalForm ? "Cancel" : "Add goal"}
            </Button>
          </div>

          {showGoalForm && (
            <Card className="mb-3 border-primary/30">
              <CardContent className="pt-4">
                <form onSubmit={handleCreateGoal} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Goal title</Label>
                    <Input placeholder="e.g. Manage anxiety in social settings" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <div className="flex gap-2">
                      {(["outcome", "process"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setGoalType(t)}
                          className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${goalType === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
                        >
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description (optional)</Label>
                    <Input placeholder="What does success look like?" value={goalDesc} onChange={(e) => setGoalDesc(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full" disabled={createGoal.isPending}>
                    {createGoal.isPending ? "Adding..." : "Add goal"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {goals && goals.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground text-sm">No goals yet. Add the first one above.</p>
              </CardContent>
            </Card>
          )}

          {goals && goals.length > 0 && (
            <Card>
              <CardContent className="py-3">
                {goals.map((goal) => (
                  <GoalNode key={goal.id} goal={goal} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
