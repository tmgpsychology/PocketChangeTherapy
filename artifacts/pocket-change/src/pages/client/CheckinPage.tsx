import { useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/components/AuthProvider";
import { useCreateCheckin, getGetGoalCheckinsQueryKey, getGetClientPortalQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

const BARRIER_TAGS = ["External", "Internal", "In your control", "Out of your control"];

export default function CheckinPage() {
  const [, params] = useRoute("/portal/goals/:goalId/checkin");
  const goalId = Number(params?.goalId ?? 0);
  const { user } = useAuth();
  const code = user?.accessCode ?? "";
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const createCheckin = useCreateCheckin();

  const [percentage, setPercentage] = useState(50);
  const [whatWorked, setWhatWorked] = useState("");
  const [whatGotInTheWay, setWhatGotInTheWay] = useState("");
  const [whatDifferently, setWhatDifferently] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCheckin.mutateAsync({
      code,
      goalId,
      data: {
        percentage,
        whatWorked: whatWorked || null,
        whatGotInTheWay: whatGotInTheWay || null,
        whatCouldYouDoDifferently: whatDifferently || null,
        barrierTags: selectedTags.length > 0 ? selectedTags.join(", ") : null,
      },
    });
    queryClient.invalidateQueries({ queryKey: getGetGoalCheckinsQueryKey(code, goalId) });
    queryClient.invalidateQueries({ queryKey: getGetClientPortalQueryKey(code) });
    setDone(true);
  };

  if (done) {
    return (
      <Layout>
        <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 6 9 17l-5-5" /></svg>
          </div>
          <h2 className="text-xl font-bold text-foreground">Check-in saved!</h2>
          <p className="text-muted-foreground text-sm">Great work reflecting on your progress.</p>
          <Button onClick={() => navigate("/portal")} className="mt-2">Back to goals</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 space-y-5">
        <div className="flex items-center gap-2">
          <Link href={`/portal/goals/${goalId}`}>
            <span className="text-primary text-sm cursor-pointer">Goal</span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">Check in</span>
        </div>

        <div>
          <h2 className="text-xl font-bold text-foreground">How are you doing?</h2>
          <p className="text-muted-foreground text-sm mt-1">Reflect on your progress with this goal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="text-center mb-5">
                <span className="text-5xl font-bold text-primary">{Math.round(percentage)}%</span>
                <p className="text-sm text-muted-foreground mt-1">Progress toward this goal</p>
              </div>
              <div className="px-2">
                <Slider
                  value={[percentage]}
                  onValueChange={([v]) => setPercentage(v)}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">What worked?</label>
                <textarea
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none min-h-20 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe what helped you make progress..."
                  value={whatWorked}
                  onChange={(e) => setWhatWorked(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">What got in the way?</label>
                <textarea
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none min-h-20 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe any obstacles or challenges..."
                  value={whatGotInTheWay}
                  onChange={(e) => setWhatGotInTheWay(e.target.value)}
                />
                {whatGotInTheWay && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">What kind of barrier was this?</p>
                    <div className="flex flex-wrap gap-2">
                      {BARRIER_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${selectedTags.includes(tag) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">What could you do differently?</label>
                <textarea
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none min-h-20 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="What might you try next time?"
                  value={whatDifferently}
                  onChange={(e) => setWhatDifferently(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={createCheckin.isPending}>
            {createCheckin.isPending ? "Saving..." : "Save check-in"}
          </Button>
        </form>
      </div>
    </Layout>
  );
}
