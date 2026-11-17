import DesignSection from "@/components/readme/design-section";
import DiscoverySection from "@/components/readme/discovery-section";
import EvaluationSection from "@/components/readme/evaluation-section";
import EvolutionSection from "@/components/readme/evolution-section";
import IterationOneSection from "@/components/readme/iteration-one-section";
import IterationTwoSection from "@/components/readme/iteration-two-section";
import OverviewSection from "@/components/readme/overview-section";
import SummarySection from "@/components/readme/summary-section";
import { PageHeader } from "@/components/section";

export default function ReadmePage() {
  return (
    <main className="flex-1">
      <PageHeader
        title="Readme"
        subtitle="A plain explanation of how I discovered, designed, built and reviewed this portfolio."
      />
      <OverviewSection />
      <DiscoverySection />
      <DesignSection />
      <IterationOneSection />
      <IterationTwoSection />
      <EvolutionSection />
      <EvaluationSection />
      <SummarySection />
    </main>
  );
}
