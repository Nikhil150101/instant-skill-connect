import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MentorData {
  id: string;
  user_id: string;
  profile: { full_name: string };
  expertise: string[];
  years_experience: number;
  hourly_rate: number;
  is_verified: boolean;
  total_sessions: number;
  rating: number;
}

interface UserData {
  id: string;
  user_id: string;
  full_name: string;
  sessionCount: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState<MentorData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user has the 'admin' role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (!roles?.some(r => r.role === "admin")) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to access this page"
        });
        navigate("/");
        return;
      }

      fetchData();
    };

    checkAuth();
  }, [navigate, toast]);

  const fetchData = async () => {
    try {
      // Fetch mentors with their profiles
      const { data: mentorsData } = await supabase
        .from("mentors")
        .select(`
          *,
          profile:profiles!mentors_user_id_fkey(full_name)
        `);

      if (mentorsData) {
        setMentors(mentorsData as any);
      }

      // Fetch users with session counts
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, user_id, full_name");

      if (profilesData) {
        const usersWithSessions = await Promise.all(
          profilesData.map(async (profile) => {
            const { count } = await supabase
              .from("sessions")
              .select("*", { count: "exact", head: true })
              .eq("learner_id", profile.user_id);

            return {
              ...profile,
              sessionCount: count || 0
            };
          })
        );

        setUsers(usersWithSessions);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMentorVerification = async (mentorId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("mentors")
      .update({ is_verified: !currentStatus })
      .eq("id", mentorId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update mentor status"
      });
    } else {
      toast({
        title: "Success",
        description: "Mentor status updated"
      });
      fetchData();
    }
  };

  const calculateMentorIncome = (mentor: MentorData) => {
    return (mentor.total_sessions || 0) * parseFloat(mentor.hourly_rate.toString());
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage users and mentors</p>
        </div>

        <Tabs defaultValue="mentors" className="space-y-6">
          <TabsList>
            <TabsTrigger value="mentors">Mentors</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="mentors" className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>All Mentors</CardTitle>
                  <CardDescription>View and manage mentor profiles</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Expertise</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Sessions</TableHead>
                        <TableHead>Income</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mentors.map((mentor) => (
                        <TableRow key={mentor.id}>
                          <TableCell className="font-medium">
                            {mentor.profile?.full_name || "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {mentor.expertise.slice(0, 2).map((exp) => (
                                <Badge key={exp} variant="secondary" className="text-xs">
                                  {exp}
                                </Badge>
                              ))}
                              {mentor.expertise.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{mentor.expertise.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{mentor.years_experience} yrs</TableCell>
                          <TableCell>${mentor.hourly_rate}/hr</TableCell>
                          <TableCell>{mentor.total_sessions || 0}</TableCell>
                          <TableCell>${calculateMentorIncome(mentor).toFixed(2)}</TableCell>
                          <TableCell>{mentor.rating?.toFixed(1) || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant={mentor.is_verified ? "default" : "secondary"}>
                              {mentor.is_verified ? "Verified" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleMentorVerification(mentor.id, mentor.is_verified)}
                            >
                              {mentor.is_verified ? "Revoke" : "Verify"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>View user activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Total Sessions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.full_name}</TableCell>
                          <TableCell>{user.sessionCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
