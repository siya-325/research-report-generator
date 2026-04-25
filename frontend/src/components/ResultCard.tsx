interface ResultCardProps {
  title: string;
  authors: string;
  year: number;
  abstract: string;
}

const ResultCard = ({ title, authors, year, abstract }: ResultCardProps) => {
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer group">
      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-relaxed">
        {title}
      </h3>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-muted-foreground">{authors}</span>
        <span className="text-xs text-muted-foreground">·</span>
        <span className="text-xs text-muted-foreground">{year}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-3">
        {abstract}
      </p>
    </div>
  );
};

export default ResultCard;
