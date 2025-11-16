import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Video } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const mentors = [
  {
    name: "Sarah Chen",
    title: "Full-Stack Developer",
    skills: ["React", "Node.js", "TypeScript"],
    rating: 4.9,
    sessions: 342,
    rate: 45,
    available: true
  },
  {
    name: "Michael Rodriguez",
    title: "UX/UI Designer",
    skills: ["Figma", "Adobe XD", "Prototyping"],
    rating: 5.0,
    sessions: 289,
    rate: 40,
    available: true
  },
  {
    name: "Priya Sharma",
    title: "Data Analyst",
    skills: ["SQL", "Excel", "Power BI"],
    rating: 4.8,
    sessions: 456,
    rate: 38,
    available: false
  },
  {
    name: "James Wilson",
    title: "DevOps Engineer",
    skills: ["AWS", "Docker", "Kubernetes"],
    rating: 4.9,
    sessions: 198,
    rate: 50,
    available: true
  }
];

const FeaturedMentors = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Featured Mentors
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with top-rated experts ready to help you right now
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mentors.map((mentor) => (
            <Card key={mentor.name} className="p-6 hover:shadow-custom-card transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg font-semibold bg-gradient-hero text-white">
                    {mentor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {mentor.available && (
                  <Badge className="bg-accent text-accent-foreground">
                    <span className="w-2 h-2 rounded-full bg-white mr-1.5" />
                    Online
                  </Badge>
                )}
              </div>

              <h3 className="text-lg font-semibold mb-1">{mentor.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{mentor.title}</p>

              <div className="flex items-center gap-1 mb-4">
                <Star className="w-4 h-4 fill-secondary text-secondary" />
                <span className="font-semibold">{mentor.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({mentor.sessions} sessions)
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {mentor.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <div className="text-2xl font-bold">${mentor.rate}</div>
                  <div className="text-xs text-muted-foreground">per hour</div>
                </div>
                <Button size="sm" className="bg-gradient-hero">
                  <Video className="w-4 h-4 mr-1.5" />
                  Book
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button size="lg" variant="outline">
            View All Mentors
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedMentors;
