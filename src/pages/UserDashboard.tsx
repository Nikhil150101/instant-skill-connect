import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Header from "@/components/Header";

interface Session {
  id: string;
  scheduled_at: string | null;
  status: string;
  duration_minutes: number;
  price: number;
  rating: number | null;
  review: string | null;
  mentor_id: string;
}

interface Mentor {
  id: string;
  user_id: string;
  expertise: string[];
  years_experience: number;
  hourly_rate: number;
  is_available: boolean;
  rating: number;
  total_sessions: number;
  bio: string | null;
  profiles?: {
    full_name: string;
  };
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [userId, setUserId] = useState<string>("");

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

      setUserId(session.user.id);
      fetchData(session.user.id);
    };

    checkAuth();
  }, [navigate, toast]);

  useEffect(() => {
    if (!userId) return;

    // Set up realtime subscription for sessions
    const sessionsChannel = supabase
      .channel('user-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `learner_id=eq.${userId}`
        },
        () => {
          fetchData(userId);
        }
      )
      .subscribe();

    // Set up realtime subscription for mentors
    const mentorsChannel = supabase
      .channel('available-mentors')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mentors'
        },
        () => {
          fetchMentors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(mentorsChannel);
    };
  }, [userId]);

  const fetchData = async (userId: string) => {
    try {
      const [profileRes, sessionsRes] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("user_id", userId).single(),
        supabase.from("sessions").select("*").eq("learner_id", userId).order("created_at", { ascending: false })
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (sessionsRes.data) setSessions(sessionsRes.data);
      
      await fetchMentors();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentors = async () => {
    const { data: mentorsData } = await supabase
      .from("mentors")
      .select("*")
      .eq("is_verified", true)
      .order("rating", { ascending: false });
    
    if (mentorsData) {
      const userIds = mentorsData.map(m => m.user_id);
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);
      
      const mentorsWithProfiles = mentorsData.map(mentor => ({
        ...mentor,
        profiles: profilesData?.find(p => p.user_id === mentor.user_id)
      }));
      
      setMentors(mentorsWithProfiles);
    }
  };

  const handleBookSession = async (mentorId: string, hourlyRate: number) => {
    const { error } = await supabase.from("sessions").insert({
      mentor_id: mentorId,
      learner_id: userId,
      duration_minutes: 60,
      price: hourlyRate,
      status: "pending"
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to book session"
      });
    } else {
      toast({
        title: "Success",
        description: "Session booked! Waiting for mentor approval"
      });
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

        <Tabs defaultValue="mentors" className="space-y-6">
          <TabsList>
            <TabsTrigger value="mentors">Find Mentors</TabsTrigger>
            <TabsTrigger value="active">Active Sessions</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="mentors" className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Loading mentors...</p>
            ) : mentors.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No mentors available</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mentors.map(mentor => (
                  <Card key={mentor.id}>
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {mentor.profiles?.full_name?.charAt(0) || "M"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle>{mentor.profiles?.full_name || "Mentor"}</CardTitle>
                          <CardDescription>
                            {mentor.years_experience} years experience
                          </CardDescription>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {mentor.expertise.map(skill => (
                              <Badge key={skill} variant="secondary">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {mentor.bio && (
                        <p className="text-sm text-muted-foreground mb-4">{mentor.bio}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-lg font-bold">${mentor.hourly_rate}/hr</p>
                          <p className="text-sm text-muted-foreground">
                            ⭐ {mentor.rating?.toFixed(1) || "New"} ({mentor.total_sessions} sessions)
                          </p>
                        </div>
                        <Button 
                          onClick={() => handleBookSession(mentor.user_id, mentor.hourly_rate)}
                          disabled={!mentor.is_available}
                        >
                          {mentor.is_available ? "Book Session" : "Unavailable"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

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
