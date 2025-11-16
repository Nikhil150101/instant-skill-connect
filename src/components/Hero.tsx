import { Button } from "@/components/ui/button";
import { Search, Video, Clock } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Instant Mentor" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/75" />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary/10 text-primary border border-primary/20">
            <Video className="w-4 h-4" />
            <span className="text-sm font-medium">Live Expert Help in Minutes</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Get Instant Help from
            <span className="bg-gradient-hero bg-clip-text text-transparent"> Expert Mentors</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Connect with verified experts for 15-60 minute video sessions. 
            Get help with coding, design, office tools, and more—right when you need it.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mb-10">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold">2 min</div>
                <div className="text-sm text-muted-foreground">Avg response time</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <span className="text-xl">⭐</span>
              </div>
              <div>
                <div className="text-2xl font-bold">4.9/5</div>
                <div className="text-sm text-muted-foreground">Average rating</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
              <div>
                <div className="text-2xl font-bold">10k+</div>
                <div className="text-sm text-muted-foreground">Active mentors</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="text-lg px-8 py-6 bg-gradient-hero hover:opacity-90 shadow-custom-lg">
              <Search className="w-5 h-5 mr-2" />
              Find a Mentor Now
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Become a Mentor
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
