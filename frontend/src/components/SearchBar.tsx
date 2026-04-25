import { SlidersHorizontal, ArrowRight } from "lucide-react";

interface SearchBarProps {
  query: string;
  onChange: (q: string) => void;
  onSubmit: () => void;
  onOpenFilter: () => void;
  isFixed?: boolean;
}

const SearchBar = ({ query, onChange, onSubmit, onOpenFilter, isFixed = false }: SearchBarProps) => {
  if (isFixed) {
    return (
      <div className="absolute bottom-5 left-0 right-0 mx-auto w-full max-w-[1100px] px-4 sm:px-6 z-30 animate-fade-in">
          <div className="flex items-center bg-card border border-border rounded-2xl px-4 py-3 gap-2 focus-within:border-primary/50 transition-colors shadow-xl">
            <input
              type="text"
              value={query}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              placeholder="Ask a follow-up..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
            />
            <button
              onClick={onOpenFilter}
              className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={onSubmit}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              aria-label="Search"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center bg-card border border-border rounded-2xl px-4 py-3 gap-2 focus-within:border-primary/50 transition-colors shadow-lg shadow-background/50">
        <input
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          placeholder="Ask the research..."
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
        />
        <button
          onClick={onOpenFilter}
          className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
        <button
          onClick={onSubmit}
          className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          aria-label="Search"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
