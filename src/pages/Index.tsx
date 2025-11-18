import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import HowItWorks from "@/components/HowItWorks";
import FeaturedMentors from "@/components/FeaturedMentors";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);

        if (roles && roles.length > 0) {
          const role = roles[0].role;
          if (role === "admin") {
            navigate("/admin-dashboard");
          } else if (role === "mentor") {
            navigate("/mentor-dashboard");
          } else {
            navigate("/user-dashboard");
          }
          return;
        }
      }
      setChecking(false);
    };

    checkAuthAndRedirect();
  }, [navigate]);

  if (checking) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Categories />
      <HowItWorks />
      <FeaturedMentors />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
