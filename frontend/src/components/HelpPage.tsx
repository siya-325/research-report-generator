import { HelpCircle, MessageSquare, BookOpen } from "lucide-react";

const HelpPage = () => (
  <div className="max-w-2xl mx-auto py-16 px-4 animate-fade-in">
    <h1 className="text-2xl font-semibold text-foreground mb-2">Help Center</h1>
    <p className="text-sm text-muted-foreground mb-8">Find answers to common questions and get support.</p>

    <div className="space-y-4">
      {[
        { icon: HelpCircle, title: "Getting Started", desc: "Learn how to use the research assistant effectively." },
        { icon: MessageSquare, title: "Search Tips", desc: "Get the most out of your research queries with advanced search techniques." },
        { icon: BookOpen, title: "Understanding Results", desc: "How to interpret research findings and paper summaries." },
      ].map(({ icon: Icon, title, desc }) => (
        <div key={title} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer">
          <div className="flex items-start gap-3">
            <Icon className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default HelpPage;
