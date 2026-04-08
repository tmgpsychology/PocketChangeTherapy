import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/LandingPage";
import TherapistLoginPage from "@/pages/TherapistLoginPage";
import TherapistRegisterPage from "@/pages/TherapistRegisterPage";
import ClientLoginPage from "@/pages/ClientLoginPage";
import ClientRegisterPage from "@/pages/ClientRegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import LinkCodePage from "@/pages/LinkCodePage";
import DashboardPage from "@/pages/practitioner/DashboardPage";
import ClientsPage from "@/pages/practitioner/ClientsPage";
import ClientDetailPage from "@/pages/practitioner/ClientDetailPage";
import PractitionerSettingsPage from "@/pages/practitioner/SettingsPage";
import PortalPage from "@/pages/client/PortalPage";
import GoalDetailPage from "@/pages/client/GoalDetailPage";
import CheckinPage from "@/pages/client/CheckinPage";
import RemindersPage from "@/pages/client/RemindersPage";
import ClientSettingsPage from "@/pages/client/SettingsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30 * 1000,
    },
  },
});

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Loading PocketChange...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/therapist/login" component={TherapistLoginPage} />
        <Route path="/therapist/register" component={TherapistRegisterPage} />
        <Route path="/client/login" component={ClientLoginPage} />
        <Route path="/client/register" component={ClientRegisterPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        {/* Legacy redirects */}
        <Route path="/login">
          <Redirect to="/" />
        </Route>
        <Route path="/register">
          <Redirect to="/" />
        </Route>
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    );
  }

  if (user.role === "client" && !user.linkedClientId) {
    return (
      <Switch>
        <Route path="/link-code" component={LinkCodePage} />
        <Route>
          <Redirect to="/link-code" />
        </Route>
      </Switch>
    );
  }

  if (user.role === "practitioner") {
    return (
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/clients" component={ClientsPage} />
        <Route path="/clients/:code" component={ClientDetailPage} />
        <Route path="/settings" component={PractitionerSettingsPage} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={PortalPage} />
      <Route path="/portal" component={PortalPage} />
      <Route path="/portal/goals/:goalId" component={GoalDetailPage} />
      <Route path="/portal/goals/:goalId/checkin" component={CheckinPage} />
      <Route path="/reminders" component={RemindersPage} />
      <Route path="/settings" component={ClientSettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRoutes />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
