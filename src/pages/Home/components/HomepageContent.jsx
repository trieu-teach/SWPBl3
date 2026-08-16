import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { navItems } from "../data/homepage-data.js";
import Header from "../../../components/Header/Header.jsx";
import usePublicPlans from "../hooks/usePublicPlans.js";
import FaqSection from "./FaqSection.jsx";
import FeaturesSection from "./FeaturesSection.jsx";
import HomeFooter from "./HomeFooter.jsx";
import HeroSection from "./HeroSection.jsx";
import PricingSection from "./PricingSection.jsx";
import ProofSection from "./ProofSection.jsx";
import UseCasesSection from "./UseCasesSection.jsx";
import WorkflowSection from "./WorkflowSection.jsx";
import "../Homepage.css";

export default function HomepageContent() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  const pricing = usePublicPlans();

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 24);
      const scrollPosition = window.scrollY + 140;
      const currentSection = navItems.find((item) => {
        const element = document.getElementById(item.id);
        return (
          element &&
          scrollPosition >= element.offsetTop &&
          scrollPosition < element.offsetTop + element.offsetHeight
        );
      });
      setActiveSection(currentSection?.id || "");
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const goToLogin = () => navigate("/login");

  return (
    <Box className="homepage">
      <Header scrolled={scrolled} activeSection={activeSection} />
      <HeroSection onLogin={goToLogin} />
      <WorkflowSection />
      <UseCasesSection />
      <FeaturesSection />
      <ProofSection onLogin={goToLogin} />
      <PricingSection
        plans={pricing.plans}
        loading={pricing.loading}
        error={pricing.error}
        onRetry={pricing.loadPlans}
        onLogin={goToLogin}
      />
      <FaqSection openFaq={openFaq} setOpenFaq={setOpenFaq} />
      <HomeFooter />
    </Box>
  );
}
