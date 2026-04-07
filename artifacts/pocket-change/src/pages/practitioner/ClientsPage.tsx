import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useListClients, useCreateClient, getListClientsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";

export default function ClientsPage() {
  const { data: clients, isLoading } = useListClients({ query: { queryKey: getListClientsQueryKey() } });
  const queryClient = useQueryClient();
  const createClient = useCreateClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await createClient.mutateAsync({ data: { name, email: email || null, notes: notes || null } });
      queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
      setName("");
      setEmail("");
      setNotes("");
      setShowForm(false);
    } catch (err: any) {
      setError(err?.data?.error ?? "Failed to create client");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <Layout>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Clients</h2>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add client"}
          </Button>
        </div>

        {showForm && (
          <Card className="border-primary/30">
            <CardContent className="pt-4">
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cname">Name</Label>
                  <Input id="cname" placeholder="Client name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cemail">Email (optional)</Label>
                  <Input id="cemail" type="email" placeholder="client@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cnotes">Notes (optional)</Label>
                  <Input id="cnotes" placeholder="Session notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Button type="submit" className="w-full" disabled={createClient.isPending}>
                  {createClient.isPending ? "Creating..." : "Create client"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
          </div>
        )}

        {clients && clients.length === 0 && (
          <Card>
            <CardContent className="pt-10 pb-10 text-center">
              <p className="text-muted-foreground text-sm">No clients yet. Add your first one above.</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {clients?.map((client) => (
            <Card key={client.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <Link href={`/clients/${client.accessCode}`}>
                      <p className="font-medium text-foreground hover:text-primary cursor-pointer text-sm">{client.name}</p>
                    </Link>
                    {client.email && <p className="text-xs text-muted-foreground">{client.email}</p>}
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => copyCode(client.accessCode)}
                        className="flex items-center gap-1 font-mono text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {client.accessCode}
                        {copiedCode === client.accessCode ? (
                          <span className="text-primary ml-1">Copied!</span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <Link href={`/clients/${client.accessCode}`}>
                    <span className="text-xs text-primary cursor-pointer ml-3">View</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
