import { Code, Palette, MonitorPlay, Database, Package, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";

const categories = [
  {
    icon: Code,
    title: "Programming",
    description: "Debug code, learn frameworks, get architecture advice",
    mentorCount: 2500,
    color: "primary"
  },
  {
    icon: Palette,
    title: "Design",
    description: "UI/UX feedback, Adobe tools, Figma help",
    mentorCount: 1800,
    color: "secondary"
  },
  {
    icon: MonitorPlay,
    title: "Office Tools",
    description: "Excel, PowerPoint, Word, Google Workspace",
    mentorCount: 1200,
    color: "accent"
  },
  {
    icon: Database,
    title: "Data & Analytics",
    description: "SQL, data visualization, business intelligence",
    mentorCount: 950,
    color: "primary"
  },
  {
    icon: Package,
    title: "DevOps",
    description: "CI/CD, cloud platforms, containerization",
    mentorCount: 800,
    color: "secondary"
  },
  {
    icon: Globe,
    title: "System Setup",
    description: "OS installation, software configuration, troubleshooting",
    mentorCount: 600,
    color: "accent"
  }
];

const Categories = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Popular Categories
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse expert help across dozens of skills and technologies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card 
                key={category.title}
                className="p-6 hover:shadow-custom-card transition-all duration-300 cursor-pointer group border-2 hover:border-primary/20"
              >
                <div className={`w-12 h-12 rounded-xl bg-${category.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 text-${category.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                <p className="text-muted-foreground mb-4">{category.description}</p>
                <div className="text-sm font-medium text-primary">
                  {category.mentorCount.toLocaleString()} mentors available
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
