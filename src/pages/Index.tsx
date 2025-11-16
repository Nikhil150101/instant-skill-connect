import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import HowItWorks from "@/components/HowItWorks";
import FeaturedMentors from "@/components/FeaturedMentors";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
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
