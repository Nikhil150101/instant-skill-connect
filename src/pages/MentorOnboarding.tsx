import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const MentorOnboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [expertiseInput, setExpertiseInput] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [languagesInput, setLanguagesInput] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
      }
    });
  }, [navigate]);

  const addExpertise = () => {
    if (expertiseInput.trim() && !expertise.includes(expertiseInput.trim())) {
      setExpertise([...expertise, expertiseInput.trim()]);
      setExpertiseInput("");
    }
  };

  const removeExpertise = (item: string) => {
    setExpertise(expertise.filter(e => e !== item));
  };

  const addLanguage = () => {
    if (languagesInput.trim() && !languages.includes(languagesInput.trim())) {
      setLanguages([...languages, languagesInput.trim()]);
      setLanguagesInput("");
    }
  };

  const removeLanguage = (item: string) => {
    setLanguages(languages.filter(l => l !== item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated"
      });
      return;
    }

    if (expertise.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please add at least one area of expertise"
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("mentors").insert({
      user_id: userId,
      bio,
      years_experience: parseInt(yearsExperience),
      hourly_rate: parseFloat(hourlyRate),
      expertise,
      languages: languages.length > 0 ? languages : null,
      is_verified: false,
      is_available: true
    });

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Failed to complete profile",
        description: error.message
      });
    } else {
      toast({
        title: "Success!",
        description: "Your mentor profile has been created. It will be reviewed by our team."
      });
      navigate("/mentor-dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Complete Your Mentor Profile</CardTitle>
          <CardDescription>
            Tell us about your expertise and experience to help learners find you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself and your mentoring style..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  placeholder="5"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate">Hourly Rate ($)</Label>
                <Input
                  id="rate"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="50.00"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expertise">Areas of Expertise</Label>
              <div className="flex gap-2">
                <Input
                  id="expertise"
                  placeholder="e.g., JavaScript, React, Node.js"
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                />
                <Button type="button" onClick={addExpertise} variant="secondary">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {expertise.map((item) => (
                  <Badge key={item} variant="secondary" className="gap-1">
                    {item}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeExpertise(item)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="languages">Languages (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="languages"
                  placeholder="e.g., English, Spanish"
                  value={languagesInput}
                  onChange={(e) => setLanguagesInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                />
                <Button type="button" onClick={addLanguage} variant="secondary">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {languages.map((item) => (
                  <Badge key={item} variant="outline" className="gap-1">
                    {item}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeLanguage(item)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating profile..." : "Complete Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MentorOnboarding;
