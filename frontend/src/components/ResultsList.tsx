import ResultCard from "./ResultCard";

const mockResults = [
  {
    title: "The Impact of Caffeine on Cognitive Function: A Systematic Review and Meta-Analysis",
    authors: "Smith J., Johnson A., Williams B.",
    year: 2023,
    abstract: "This systematic review examines the effects of caffeine consumption on various aspects of cognitive function including attention, memory, and executive function. Our meta-analysis of 47 studies reveals a significant positive effect on sustained attention and working memory.",
  },
  {
    title: "Dose-Response Relationship Between Caffeine Intake and Cognitive Performance in Adults",
    authors: "Chen L., Park S., Kim H.",
    year: 2023,
    abstract: "We investigated the dose-response relationship between caffeine intake and cognitive performance in a cohort of 2,500 adults. Results indicate that moderate caffeine consumption (200-400mg/day) is associated with optimal cognitive performance.",
  },
  {
    title: "Caffeine and Neuroplasticity: Mechanisms and Implications for Learning",
    authors: "Rodriguez M., Thompson K., Davis R.",
    year: 2022,
    abstract: "This paper reviews the molecular mechanisms through which caffeine affects neuroplasticity and discusses implications for learning and memory consolidation. Evidence suggests caffeine modulates adenosine receptors, leading to enhanced synaptic plasticity.",
  },
  {
    title: "Long-term Caffeine Consumption and Risk of Cognitive Decline: A 10-Year Longitudinal Study",
    authors: "Wang Y., Mueller F., Anderson P.",
    year: 2022,
    abstract: "Our 10-year longitudinal study of 8,000 participants examined the relationship between habitual caffeine consumption and cognitive decline. Moderate consumers showed 26% lower risk of cognitive decline compared to non-consumers.",
  },
  {
    title: "Comparative Effects of Coffee, Tea, and Energy Drinks on Cognitive Task Performance",
    authors: "Brown C., Taylor S., Lee J.",
    year: 2021,
    abstract: "This randomized controlled trial compared the cognitive effects of coffee, green tea, and energy drinks in 300 university students. Coffee consumption showed the most consistent improvement in reaction time and accuracy on cognitive tasks.",
  },
];

interface ResultsListProps {
  isLoading: boolean;
}

const ResultsList = ({ isLoading }: ResultsListProps) => {
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-3" />
            <div className="h-3 bg-muted rounded w-1/3 mb-3" />
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-5/6 mt-1" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 space-y-3 animate-fade-in">
      {mockResults.map((result, i) => (
        <ResultCard key={i} {...result} />
      ))}
    </div>
  );
};

export default ResultsList;
