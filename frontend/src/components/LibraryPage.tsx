import { useState } from "react";
import { Search, Download, ChevronDown, X, MoreHorizontal, FileText, MessageCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export interface SavedPaper {
  id: string;
  title: string;
  authors: string;
  journal?: string;
  year: number;
  doi?: string;
}

export interface SavedThread {
  id: string;
  title: string;
  preview: string;
}

interface LibraryPageProps {
  papers: SavedPaper[];
  threads: SavedThread[];
  onRemovePaper: (id: string) => void;
  onRemoveThread: (id: string) => void;
  onSelectThread: (title: string) => void;
}

const LibraryPage = ({ papers, threads, onRemovePaper, onRemoveThread, onSelectThread }: LibraryPageProps) => {
  const [activeTab, setActiveTab] = useState<"papers" | "threads">("papers");
  const [search, setSearch] = useState("");
  const [selectedPapers, setSelectedPapers] = useState<Set<string>>(new Set());
  const [selectedThreads, setSelectedThreads] = useState<Set<string>>(new Set());

  const filteredPapers = papers.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.authors.toLowerCase().includes(search.toLowerCase())
  );
  const filteredThreads = threads.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.preview.toLowerCase().includes(search.toLowerCase())
  );

  const togglePaper = (id: string) => {
    setSelectedPapers((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleThread = (id: string) => {
    setSelectedThreads((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAllPapers = () => {
    if (selectedPapers.size === filteredPapers.length) {
      setSelectedPapers(new Set());
    } else {
      setSelectedPapers(new Set(filteredPapers.map((p) => p.id)));
    }
  };

  const toggleAllThreads = () => {
    if (selectedThreads.size === filteredThreads.length) {
      setSelectedThreads(new Set());
    } else {
      setSelectedThreads(new Set(filteredThreads.map((t) => t.id)));
    }
  };

  const selectedCount = activeTab === "papers" ? selectedPapers.size : selectedThreads.size;

  const clearSelection = () => {
    if (activeTab === "papers") setSelectedPapers(new Set());
    else setSelectedThreads(new Set());
  };

  const handleRemoveSelected = () => {
    if (activeTab === "papers") {
      selectedPapers.forEach((id) => onRemovePaper(id));
      setSelectedPapers(new Set());
    } else {
      selectedThreads.forEach((id) => onRemoveThread(id));
      setSelectedThreads(new Set());
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh)] relative">
      <div className="max-w-[1100px] w-full mx-auto px-4 sm:px-6 py-6">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-foreground mb-6">My Library</h1>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-border mb-4">
          <button
            onClick={() => { setActiveTab("papers"); setSearch(""); }}
            className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "papers"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4" />
            Papers ({papers.length})
          </button>
          <button
            onClick={() => { setActiveTab("threads"); setSearch(""); }}
            className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "threads"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Threads ({threads.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeTab} in My Library`}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Papers tab */}
        {activeTab === "papers" && (
          <div className="border border-border rounded-lg overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[40px_1fr_180px_180px_80px_80px] items-center px-4 py-3 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground">
              <div className="flex items-center justify-center">
                <Checkbox
                  checked={filteredPapers.length > 0 && selectedPapers.size === filteredPapers.length}
                  onCheckedChange={toggleAllPapers}
                />
              </div>
              <span>Title</span>
              <span className="hidden md:block">Authors</span>
              <span className="hidden lg:block">Journal</span>
              <span className="hidden sm:block">Year</span>
              <span className="hidden sm:block">DOI</span>
            </div>

            {filteredPapers.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                {papers.length === 0
                  ? "No saved papers yet. Save papers from your research threads to see them here."
                  : "No papers match your search."}
              </div>
            ) : (
              filteredPapers.map((paper) => (
                <div
                  key={paper.id}
                  className={`grid grid-cols-[40px_1fr_180px_180px_80px_80px] items-center px-4 py-3 border-b border-border last:border-b-0 text-sm transition-colors ${
                    selectedPapers.has(paper.id) ? "bg-accent/50" : "hover:bg-accent/30"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={selectedPapers.has(paper.id)}
                      onCheckedChange={() => togglePaper(paper.id)}
                    />
                  </div>
                  <span className="text-foreground font-medium truncate pr-4">{paper.title}</span>
                  <span className="text-muted-foreground truncate hidden md:block">{paper.authors}</span>
                  <span className="text-muted-foreground truncate hidden lg:block">{paper.journal || "—"}</span>
                  <span className="text-muted-foreground hidden sm:block">{paper.year}</span>
                  <span className="text-muted-foreground hidden sm:block">{paper.doi || "—"}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Threads tab */}
        {activeTab === "threads" && (
          <div className="border border-border rounded-lg overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[40px_1fr_1fr] items-center px-4 py-3 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground">
              <div className="flex items-center justify-center">
                <Checkbox
                  checked={filteredThreads.length > 0 && selectedThreads.size === filteredThreads.length}
                  onCheckedChange={toggleAllThreads}
                />
              </div>
              <span>Title</span>
              <span className="hidden sm:block">Preview</span>
            </div>

            {filteredThreads.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                {threads.length === 0
                  ? "No saved threads yet. Save research threads to see them here."
                  : "No threads match your search."}
              </div>
            ) : (
              filteredThreads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => onSelectThread(thread.title)}
                  className={`grid grid-cols-[40px_1fr_1fr] items-center px-4 py-3 border-b border-border last:border-b-0 text-sm w-full text-left transition-colors ${
                    selectedThreads.has(thread.id) ? "bg-accent/50" : "hover:bg-accent/30"
                  }`}
                >
                  <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedThreads.has(thread.id)}
                      onCheckedChange={() => toggleThread(thread.id)}
                    />
                  </div>
                  <span className="text-foreground font-medium truncate pr-4">{thread.title}</span>
                  <span className="text-muted-foreground truncate hidden sm:block">{thread.preview}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Selection bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-card border border-border rounded-xl px-5 py-3 shadow-lg animate-fade-in">
          <span className="text-sm text-foreground font-medium">{selectedCount} selected</span>
          <button
            onClick={handleRemoveSelected}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            title="Remove selected"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={clearSelection}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
