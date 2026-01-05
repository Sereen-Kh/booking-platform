import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedServices } from "@/components/FeaturedServices";
import { HowItWorks } from "@/components/HowItWorks";
import { Categories } from "@/components/Categories";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturedServices />
        <HowItWorks />
        <Categories />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
