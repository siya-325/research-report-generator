import { useState } from "react";
import { X, ExternalLink, Bookmark, Link2, Quote } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface Paper {
  title: string;
  authors: string;
  year: number;
  abstract: string;
}

interface ReferencesPanelProps {
  papers: Paper[];
  onClose: () => void;
  onSavePaper?: (paper: Paper) => void;
  onAttachPapers?: (papers: Paper[]) => void;
  savedPaperTitles?: string[];
}

const ReferencesPanel = ({ papers, onClose, onSavePaper, onAttachPapers, savedPaperTitles = [] }: ReferencesPanelProps) => {
  const [checkedPapers, setCheckedPapers] = useState<Set<number>>(new Set());

  const toggleCheck = (index: number) => {
    setCheckedPapers((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const handleSave = (paper: Paper) => {
    onSavePaper?.(paper);
    toast.success("Paper saved to Library");
  };

  const handleCopyLink = (paper: Paper) => {
    const link = `https://doi.org/${paper.title.replace(/\s+/g, "-").toLowerCase()}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied");
  };

  return (
    <div className="h-full flex flex-col border-l border-border bg-background">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">References</h3>
          <span className="text-xs text-muted-foreground">/ Results</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {papers.map((paper, i) => {
          const isSaved = savedPaperTitles.includes(paper.title);
          return (
            <div
              key={i}
              className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors space-y-3"
            >
              {/* Number + Title */}
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-semibold text-foreground shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <h4 className="text-sm font-semibold text-foreground leading-snug flex-1 underline decoration-primary/40 underline-offset-2">
                  {paper.title}
                </h4>
              </div>

              {/* Key Takeaway */}
              <div className="pl-9">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase mr-1.5">
                    Key Takeaway
                  </span>
                  ·&nbsp;&nbsp;{paper.abstract}
                </p>
              </div>

              {/* Meta + Actions */}
              <div className="pl-9 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Checkbox
                      checked={checkedPapers.has(i)}
                      onCheckedChange={() => toggleCheck(i)}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-foreground">{paper.year}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">{paper.authors}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleSave(paper)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isSaved
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    title="Save to Library"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
                  </button>
                  <button
                    onClick={() => handleCopyLink(paper)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title="Copy link"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReferencesPanel;
