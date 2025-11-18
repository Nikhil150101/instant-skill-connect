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

interface MentorProfile {
  is_verified: boolean;
  is_available: boolean;
  total_sessions: number;
  rating: number;
}

const MentorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user has the 'mentor' role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (!roles?.some(r => r.role === "mentor")) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to access this page"
        });
        navigate("/");
        return;
      }

      setUserId(session.user.id);
      fetchData(session.user.id);
    };

    checkAuth();
  }, [navigate, toast]);

  useEffect(() => {
    if (!userId) return;

    // Set up realtime subscription for sessions
    const channel = supabase
      .channel('mentor-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `mentor_id=eq.${userId}`
        },
        () => {
          fetchData(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchData = async (userId: string) => {
    try {
      const [profileRes, mentorRes, sessionsRes] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("user_id", userId).single(),
        supabase.from("mentors").select("is_verified, is_available, total_sessions, rating").eq("user_id", userId).single(),
        supabase.from("sessions").select("*").eq("mentor_id", userId).order("created_at", { ascending: false })
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (mentorRes.data) setMentorProfile(mentorRes.data);
      if (sessionsRes.data) setSessions(sessionsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionAction = async (sessionId: string, newStatus: string) => {
    const { error } = await supabase
      .from("sessions")
      .update({ status: newStatus })
      .eq("id", sessionId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update session status"
      });
    } else {
      toast({
        title: "Success",
        description: `Session ${newStatus}`
      });
      // Refresh sessions
      const { data: { session } } = await supabase.auth.getSession();
      if (session) fetchData(session.user.id);
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

  const totalEarnings = sessions
    .filter(s => s.status === "completed")
    .reduce((sum, s) => sum + parseFloat(s.price.toString()), 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome, {profile?.full_name || "Mentor"}!</h1>
          <p className="text-muted-foreground mt-2">Manage your mentorship sessions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={mentorProfile?.is_verified ? "default" : "secondary"}>
                {mentorProfile?.is_verified ? "Verified" : "Pending Verification"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{mentorProfile?.total_sessions || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{mentorProfile?.rating?.toFixed(1) || "N/A"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">${totalEarnings.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : sessions.filter(s => s.status === "pending").length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No pending requests</p>
                </CardContent>
              </Card>
            ) : (
              sessions
                .filter(s => s.status === "pending")
                .map(session => (
                  <Card key={session.id}>
                    <CardHeader>
                      <CardTitle>Session Request - {session.duration_minutes} minutes</CardTitle>
                      <CardDescription>${session.price}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                      <Button onClick={() => handleSessionAction(session.id, "scheduled")}>
                        Accept
                      </Button>
                      <Button variant="destructive" onClick={() => handleSessionAction(session.id, "cancelled")}>
                        Reject
                      </Button>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {sessions.filter(s => s.status === "scheduled").map(session => (
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
            ))}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {sessions.filter(s => s.status === "completed" || s.status === "cancelled").map(session => (
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
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MentorDashboard;
