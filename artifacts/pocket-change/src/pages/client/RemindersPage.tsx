import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import {
  useGetSmsReminder,
  useSaveSmsReminder,
  useDeleteSmsReminder,
  getGetSmsReminderQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
];

export default function RemindersPage() {
  const queryClient = useQueryClient();
  const { data: reminder, isLoading } = useGetSmsReminder({ query: { queryKey: getGetSmsReminderQueryKey() } });
  const save = useSaveSmsReminder();
  const del = useDeleteSmsReminder();

  const [phone, setPhone] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [time, setTime] = useState("09:00");
  const [timezone, setTimezone] = useState("America/New_York");
  const [messageTemplate, setMessageTemplate] = useState("Hi! Time to check in on your goals. How are you doing today?");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (reminder) {
      setPhone(reminder.phone);
      setSelectedDays(reminder.days.split(",").filter(Boolean));
      setTime(reminder.time);
      setTimezone(reminder.timezone);
      setMessageTemplate(reminder.messageTemplate);
    }
  }, [reminder]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await save.mutateAsync({
      data: {
        phone,
        days: selectedDays.join(","),
        time,
        timezone,
        messageTemplate,
      },
    });
    queryClient.invalidateQueries({ queryKey: getGetSmsReminderQueryKey() });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDelete = async () => {
    await del.mutateAsync({});
    queryClient.invalidateQueries({ queryKey: getGetSmsReminderQueryKey() });
    setPhone("");
    setSelectedDays([]);
  };

  return (
    <Layout>
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold text-foreground">SMS Reminders</h2>
        <p className="text-sm text-muted-foreground">Get text reminders to check in on your goals.</p>

        {isLoading && <div className="h-40 bg-muted rounded-xl animate-pulse" />}

        <form onSubmit={handleSave} className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Phone number</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="tel"
                placeholder="+1 555 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Reminder days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-1.5 flex-wrap">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-all ${selectedDays.includes(day) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Time and timezone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tz">Timezone</Label>
                <select
                  id="tz"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Message template</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none min-h-24 focus:outline-none focus:ring-2 focus:ring-primary"
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                placeholder="Your reminder message..."
                required
              />
            </CardContent>
          </Card>

          {saved && (
            <div className="bg-primary/10 text-primary text-sm px-4 py-3 rounded-lg font-medium">
              Reminder settings saved!
            </div>
          )}

          <Button type="submit" className="w-full" disabled={save.isPending}>
            {save.isPending ? "Saving..." : "Save reminder settings"}
          </Button>

          {reminder && (
            <Button
              type="button"
              variant="outline"
              className="w-full text-destructive border-destructive/30"
              onClick={handleDelete}
              disabled={del.isPending}
            >
              {del.isPending ? "Removing..." : "Remove reminders"}
            </Button>
          )}
        </form>
      </div>
    </Layout>
  );
}
