import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useListClients, useCreateClient, getListClientsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import type { Client } from "@workspace/api-client-react/src/generated/api.schemas";

function CodeModal({ client, onClose }: { client: Client; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(client.accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-card rounded-2xl shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-foreground">Invite code for {client.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Share this code with your client so they can link their account to yours.
          </p>
        </div>

        <div className="bg-muted rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest font-medium">Access code</p>
          <p className="font-mono text-3xl font-bold tracking-widest text-foreground letter-spacing-wide">
            {client.accessCode}
          </p>
        </div>

        <Button className="w-full" onClick={copy} variant={copied ? "outline" : "default"}>
          {copied ? (
            <span className="flex items-center gap-2 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              Copied to clipboard
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
              Copy code
            </span>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Your client enters this code after creating their account on PocketChange.
        </p>

        <button onClick={onClose} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-1">
          Done
        </button>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const { data: clients, isLoading } = useListClients({ query: { queryKey: getListClientsQueryKey() } });
  const queryClient = useQueryClient();
  const createClient = useCreateClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [codeModalClient, setCodeModalClient] = useState<Client | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const newClient = await createClient.mutateAsync({ data: { name, email: email || null, notes: notes || null } });
      queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
      setName("");
      setEmail("");
      setNotes("");
      setShowForm(false);
      setCodeModalClient(newClient as Client);
    } catch (err: any) {
      setError(err?.data?.error ?? "Failed to create client");
    }
  };

  return (
    <Layout>
      {codeModalClient && (
        <CodeModal client={codeModalClient} onClose={() => setCodeModalClient(null)} />
      )}

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Clients</h2>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add client"}
          </Button>
        </div>

        {showForm && (
          <Card className="border-primary/30">
            <CardContent className="pt-4">
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cname">Client name</Label>
                  <Input id="cname" placeholder="e.g. Alex Johnson" value={name} onChange={(e) => setName(e.target.value)} required />
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
                  {createClient.isPending ? "Creating..." : "Create client & generate code"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
          </div>
        )}

        {clients && clients.length === 0 && !showForm && (
          <Card>
            <CardContent className="pt-10 pb-10 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" />
                </svg>
              </div>
              <p className="text-sm font-medium text-foreground">No clients yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add a client to generate their invite code.</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {clients?.map((client) => (
            <Card key={client.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <Link href={`/clients/${client.accessCode}`}>
                      <p className="font-medium text-foreground hover:text-primary cursor-pointer text-sm">{client.name}</p>
                    </Link>
                    {client.email && <p className="text-xs text-muted-foreground">{client.email}</p>}
                  </div>
                  <button
                    onClick={() => setCodeModalClient(client)}
                    className="flex items-center gap-1.5 text-xs text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 rounded-lg px-2.5 py-1.5 transition-colors shrink-0 font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Invite code
                  </button>
                  <Link href={`/clients/${client.accessCode}`}>
                    <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">View →</span>
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
