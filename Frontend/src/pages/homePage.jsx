import { HeroSection } from "./HomeSections/HeroSection";
import { WhyChooseUs } from "./HomeSections/WhyChooseUs";
import { HiringPartners } from "./HomeSections/HiringPartners";
import { PlacementCTA } from "./HomeSections/PlacementCTA";


import "./home.css";

export function Home() {
  return (
    <>
      <HeroSection />
      <WhyChooseUs />
      <HiringPartners />
      <PlacementCTA />
    </>
  );
}
