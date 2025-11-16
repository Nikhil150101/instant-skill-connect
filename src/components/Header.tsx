import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
            <Video className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold">Instant Mentor</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            Find Mentors
          </a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            Categories
          </a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            How It Works
          </a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            Become a Mentor
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button variant="ghost" onClick={handleSignOut} className="hidden md:inline-flex">
                Sign Out
              </Button>
              <Button className="bg-gradient-hero">
                Dashboard
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/auth")} className="hidden md:inline-flex">
                Sign In
              </Button>
              <Button onClick={() => navigate("/auth")} className="bg-gradient-hero">
                Get Started
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
