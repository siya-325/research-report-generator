import { useState } from "react";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { useIsDesktop } from "@/hooks/use-is-desktop";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilterPanel = ({ isOpen, onClose }: FilterPanelProps) => {
  const isDesktop = useIsDesktop();
  const [yearFilter, setYearFilter] = useState("any");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [journalRank, setJournalRank] = useState("any");
  const [citations, setCitations] = useState("");
  const [excludePreprints, setExcludePreprints] = useState(false);
  const [askPaper, setAskPaper] = useState(false);
  const [openAccess, setOpenAccess] = useState(false);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [countriesOpen, setCountriesOpen] = useState(false);

  if (!isOpen) return null;

  const filterContent = (
    <>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Filters</h2>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto scrollbar-thin flex-1">
        {/* Publish Year */}
        <Section title="Publish year">
          <div className="flex flex-wrap gap-2">
            {["any", "2yr", "5yr", "10yr"].map((v) => (
              <button
                key={v}
                onClick={() => setYearFilter(v)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  yearFilter === v
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {v === "any" ? "Any" : v === "2yr" ? "Past 2 yrs" : v === "5yr" ? "Past 5 yrs" : "Past 10 yrs"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <input
              type="text"
              placeholder="Min year"
              value={minYear}
              onChange={(e) => setMinYear(e.target.value)}
              className="flex-1 bg-muted border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
            />
            <span className="text-muted-foreground text-xs">–</span>
            <input
              type="text"
              placeholder="Max year"
              value={maxYear}
              onChange={(e) => setMaxYear(e.target.value)}
              className="flex-1 bg-muted border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
            />
          </div>
        </Section>

        {/* Journal Rank */}
        <Section title="Journal rank">
          <select
            value={journalRank}
            onChange={(e) => setJournalRank(e.target.value)}
            className="w-full bg-muted border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary/50"
          >
            <option value="any">Any</option>
            <option value="q1">Q1</option>
            <option value="q2">Q2</option>
            <option value="q3">Q3</option>
            <option value="q4">Q4</option>
          </select>
        </Section>

        {/* Citations */}
        <Section title="Citations">
          <input
            type="text"
            placeholder="At least..."
            value={citations}
            onChange={(e) => setCitations(e.target.value)}
            className="w-full bg-muted border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
          />
        </Section>

        {/* Toggles */}
        <Section title="General">
          <Toggle label="Exclude Preprints" checked={excludePreprints} onChange={setExcludePreprints} />
          <Toggle label="Ask Paper" checked={askPaper} onChange={setAskPaper} badge="Beta" />
          <Toggle label="Open access" checked={openAccess} onChange={setOpenAccess} />
        </Section>

        {/* Collapsible sections */}
        <CollapsibleSection title="Methodology" open={methodologyOpen} onToggle={() => setMethodologyOpen(!methodologyOpen)}>
          <p className="text-xs text-muted-foreground">Select methodology filters...</p>
        </CollapsibleSection>

        <CollapsibleSection title="Fields of study" open={fieldsOpen} onToggle={() => setFieldsOpen(!fieldsOpen)}>
          <p className="text-xs text-muted-foreground">Select fields of study...</p>
        </CollapsibleSection>

        <CollapsibleSection title="Countries" open={countriesOpen} onToggle={() => setCountriesOpen(!countriesOpen)}>
          <p className="text-xs text-muted-foreground">Select countries...</p>
        </CollapsibleSection>
      </div>
    </>
  );

  // MOBILE/TABLET: centered modal
  if (!isDesktop) {
    return (
      <>
        <div className="fixed inset-0 bg-background/70 z-40 animate-fade-in-fast" onClick={onClose} />
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 pb-6 px-4">
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[calc(100vh-48px)] flex flex-col animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {filterContent}
          </div>
        </div>
      </>
    );
  }

  // DESKTOP: right-side sliding panel
  return (
    <>
      <div className="fixed inset-0 bg-background/70 z-40 animate-fade-in-fast" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-80 bg-card border-l border-border z-50 animate-slide-in-right overflow-y-auto scrollbar-thin flex flex-col">
        {filterContent}
      </div>
    </>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{title}</h3>
    {children}
  </div>
);

const Toggle = ({ label, checked, onChange, badge }: { label: string; checked: boolean; onChange: (v: boolean) => void; badge?: string }) => (
  <button
    onClick={() => onChange(!checked)}
    className="flex items-center justify-between w-full py-2 text-sm text-secondary-foreground"
  >
    <span className="flex items-center gap-2">
      {label}
      {badge && (
        <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">{badge}</span>
      )}
    </span>
    <div className={`w-9 h-5 rounded-full transition-colors relative ${checked ? "bg-primary" : "bg-muted"}`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${checked ? "left-[18px]" : "left-0.5"}`} />
    </div>
  </button>
);

const CollapsibleSection = ({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) => (
  <div>
    <button onClick={onToggle} className="flex items-center justify-between w-full py-2">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
      {open ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
    </button>
    {open && <div className="pb-2">{children}</div>}
  </div>
);

export default FilterPanel;
