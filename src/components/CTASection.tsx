import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20">
      <div className="container px-4">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-hero p-12 md:p-16 text-center">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/20 text-white">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Start Learning Today</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Expert Help?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Join thousands of learners getting instant help from verified experts. 
              Your first session is just a few clicks away.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6">
                Find Your Mentor
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                Learn More
              </Button>
            </div>

            <div className="mt-10 flex items-center justify-center gap-8 text-white">
              <div>
                <div className="text-3xl font-bold">50k+</div>
                <div className="text-sm text-white/80">Sessions Completed</div>
              </div>
              <div className="w-px h-12 bg-white/30" />
              <div>
                <div className="text-3xl font-bold">98%</div>
                <div className="text-sm text-white/80">Satisfaction Rate</div>
              </div>
              <div className="w-px h-12 bg-white/30" />
              <div>
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm text-white/80">Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
