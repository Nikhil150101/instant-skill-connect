import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";

interface Session {
  id: string;
  scheduled_at: string | null;
  status: string;
  duration_minutes: number;
  price: number;
  rating: number | null;
  review: string | null;
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user has the 'user' role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (!roles?.some(r => r.role === "user")) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to access this page"
        });
        navigate("/");
        return;
      }

      fetchData(session.user.id);
    };

    checkAuth();
  }, [navigate, toast]);

  const fetchData = async (userId: string) => {
    try {
      const [profileRes, sessionsRes] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("user_id", userId).single(),
        supabase.from("sessions").select("*").eq("learner_id", userId).order("created_at", { ascending: false })
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (sessionsRes.data) setSessions(sessionsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-accent";
      case "pending": return "bg-secondary";
      case "cancelled": return "bg-destructive";
      default: return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome, {profile?.full_name || "User"}!</h1>
          <p className="text-muted-foreground mt-2">Manage your mentorship sessions</p>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active Sessions</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : sessions.filter(s => s.status === "pending" || s.status === "scheduled").length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No active sessions</p>
                  <Button className="w-full mt-4" onClick={() => navigate("/")}>
                    Find a Mentor
                  </Button>
                </CardContent>
              </Card>
            ) : (
              sessions
                .filter(s => s.status === "pending" || s.status === "scheduled")
                .map(session => (
                  <Card key={session.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Session - {session.duration_minutes} minutes</CardTitle>
                          <CardDescription>
                            {session.scheduled_at
                              ? new Date(session.scheduled_at).toLocaleString()
                              : "Not scheduled yet"}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground font-semibold">${session.price}</p>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : sessions.filter(s => s.status === "completed" || s.status === "cancelled").length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No session history</p>
                </CardContent>
              </Card>
            ) : (
              sessions
                .filter(s => s.status === "completed" || s.status === "cancelled")
                .map(session => (
                  <Card key={session.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Session - {session.duration_minutes} minutes</CardTitle>
                          <CardDescription>
                            {session.scheduled_at
                              ? new Date(session.scheduled_at).toLocaleString()
                              : "N/A"}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground font-semibold mb-2">${session.price}</p>
                      {session.rating && (
                        <p className="text-sm text-muted-foreground">
                          Rating: {session.rating}/5 stars
                        </p>
                      )}
                      {session.review && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Review: {session.review}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
