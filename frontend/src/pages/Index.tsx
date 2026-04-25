import { useState, useEffect, useRef, useCallback } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { papersAPI, isAuthenticated, clearAuthTokens } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

import AppSidebar, { SIDEBAR_EXPANDED, SIDEBAR_COLLAPSED } from "@/components/AppSidebar";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import ChatMessages from "@/components/ChatMessages";
import ThreadHeader from "@/components/ThreadHeader";
import ReferencesPanel from "@/components/ReferencesPanel";
import AuthPage from "@/components/AuthPage";
import HelpPage from "@/components/HelpPage";
import SettingsPage from "@/components/SettingsPage";
import AboutPage from "@/components/AboutPage";
import SearchChatsDialog from "@/components/SearchChatsDialog";
import LibraryPage, { SavedPaper, SavedThread } from "@/components/LibraryPage";
import { useIsDesktop } from "@/hooks/use-is-desktop";

export interface ChatMessage {
  type: "user" | "ai";
  content: string;
  results?: {
    title: string;
    authors: string;
    year: number;
    abstract: string;
  }[];
}

const mockResponses = [
  [
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
      abstract: "This paper reviews the molecular mechanisms through which caffeine affects neuroplasticity and discusses implications for learning and memory consolidation.",
    },
  ],
  [
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
      abstract: "This randomized controlled trial compared the cognitive effects of coffee, green tea, and energy drinks in 300 university students.",
    },
  ],
];

const Index = () => {
  const isDesktop = useIsDesktop();
  const { toast } = useToast();
  const [isSignedIn, setIsSignedIn] = useState(() => isAuthenticated());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [referencesOpen, setReferencesOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [searchChatsOpen, setSearchChatsOpen] = useState(false);
  const [savedPapers, setSavedPapers] = useState<SavedPaper[]>([]);
  const [savedThreads, setSavedThreads] = useState<SavedThread[]>([]);
  const responseIndex = useRef(0);

  const handleSaveThread = useCallback(() => {
    // Save current thread's papers and thread info to library
    const currentPapers = messages
      .filter((m) => m.type === "ai" && m.results)
      .flatMap((m) => m.results || []);
    
    const threadTitle = messages.find((m) => m.type === "user")?.content || "Research Thread";
    const threadPreview = messages.find((m) => m.type === "ai")?.content || "";

    // Add papers that aren't already saved
    const newPapers: SavedPaper[] = currentPapers
      .filter((p) => !savedPapers.some((sp) => sp.title === p.title))
      .map((p) => ({
        id: crypto.randomUUID(),
        title: p.title,
        authors: p.authors,
        year: p.year,
        journal: p.abstract.slice(0, 30) + "...",
      }));

    if (newPapers.length > 0) {
      setSavedPapers((prev) => [...prev, ...newPapers]);
    }

    // Add thread if not already saved
    if (!savedThreads.some((t) => t.title === threadTitle)) {
      setSavedThreads((prev) => [
        ...prev,
        { id: crypto.randomUUID(), title: threadTitle, preview: threadPreview },
      ]);
    }
  }, [messages, savedPapers, savedThreads]);

  const handleUnsaveThread = useCallback(() => {
    const threadTitle = messages.find((m) => m.type === "user")?.content || "Research Thread";
    setSavedThreads((prev) => prev.filter((t) => t.title !== threadTitle));
  }, [messages]);

  const handleSaveSinglePaper = useCallback((paper: { title: string; authors: string; year: number; abstract: string }) => {
    if (savedPapers.some((sp) => sp.title === paper.title)) return;
    setSavedPapers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: paper.title, authors: paper.authors, year: paper.year },
    ]);
  }, [savedPapers]);

  const toggleReferences = () => setReferencesOpen((prev) => !prev);

  // Get all papers from messages for the references panel
  const allPapers = messages
    .filter((m) => m.type === "ai" && m.results)
    .flatMap((m) => m.results || []);

  const hasSearched = messages.length > 0;

  useEffect(() => {
    if (!isDesktop) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isDesktop]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handleNewThread();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    if (!isSignedIn) {
      setShowAuth(true);
      return;
    }
  
    const userMsg: ChatMessage = { type: "user", content: query.trim() };
    setMessages((prev) => [...prev, userMsg]);
    const searchQuery = query.trim();
    setQuery("");
    setIsLoading(true);
    setCurrentPage("home");
  
    try {
      // Call real API
      const response = await papersAPI.search({
        query: searchQuery,
        max_results: 15,
        sources: [], // Empty = all sources
      });
  
      // Transform backend papers to frontend format
      const results = response.papers.map(paper => ({
        title: paper.title,
        authors: paper.authors,
        year: paper.published_date ? new Date(paper.published_date).getFullYear() : 0,
        abstract: paper.abstract,
      }));
  
      const aiMsg: ChatMessage = {
        type: "ai",
        content: `Found ${response.total_found} relevant papers across ${Object.keys(response.breakdown).filter(k => response.breakdown[k as keyof typeof response.breakdown] > 0).length} sources. Showing ${results.length} papers.`,
        results,
      };
      
      setMessages((prev) => [...prev, aiMsg]);
      
      toast({
        title: "Success",
        description: `Found ${response.total_found} papers!`,
      });
    } catch (error: any) {
      console.error('Search error:', error);
      
      const errorMsg: ChatMessage = {
        type: "ai",
        content: `Sorry, there was an error searching for papers: ${error.response?.data?.message || error.message}`,
        results: [],
      };
      
      setMessages((prev) => [...prev, errorMsg]);
      
      toast({
        title: "Error",
        description: "Failed to search papers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewThread = () => {
    setQuery("");
    setMessages([]);
    setCurrentPage("home");
  };

  const handleDeleteMessage = (index: number) => {
    setMessages((prev) => {
      const copy = [...prev];
      // Remove the AI message and its preceding user message
      if (index > 0 && copy[index - 1]?.type === "user") {
        copy.splice(index - 1, 2);
      } else {
        copy.splice(index, 1);
      }
      return copy;
    });
  };

  const handleSelectHistory = (q: string) => {
    setQuery(q);
    setCurrentPage("home");
    if (isSignedIn) {
      const userMsg: ChatMessage = { type: "user", content: q };
      setMessages([userMsg]);
      setIsLoading(true);
      setTimeout(() => {
        const results = mockResponses[0];
        const aiMsg: ChatMessage = {
          type: "ai",
          content: `Found ${results.length} relevant papers for your query.`,
          results,
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsLoading(false);
      }, 1500);
    }
  };

  const handleSignIn = (user: any) => {
    setIsSignedIn(true);
    setShowAuth(false);
    setCurrentPage("home");
    
    toast({
      title: "Welcome back!",
      description: `Signed in as ${user.name || user.email}`,
    });
  };

  const handleSignOut = () => {
    clearAuthTokens();
    setIsSignedIn(false);
    setMessages([]);
    setQuery("");
    setCurrentPage("home");
    
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
  };

  if (showAuth && !isSignedIn) {
    return <AuthPage onSignIn={handleSignIn} initialMode={authMode} />;
  }

  const mainMarginLeft = isDesktop
    ? sidebarOpen ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED
    : 0;

  const renderContent = () => {
    switch (currentPage) {
      case "help": return <HelpPage />;
      case "settings": return <SettingsPage />;
      case "about": return <AboutPage />;
      case "library":
        return (
          <LibraryPage
            papers={savedPapers}
            threads={savedThreads}
            onRemovePaper={(id) => setSavedPapers((prev) => prev.filter((p) => p.id !== id))}
            onRemoveThread={(id) => setSavedThreads((prev) => prev.filter((t) => t.id !== id))}
            onSelectThread={(title) => { handleSelectHistory(title); }}
          />
        );
      default:
        return (
          <div className="flex flex-col h-[calc(100vh)] relative">
            {/* Thread header */}
            {hasSearched && (
              <ThreadHeader
                title={messages.find((m) => m.type === "user")?.content || "Research Thread"}
                onToggleReferences={toggleReferences}
                showReferences={referencesOpen}
                onSave={handleSaveThread}
                onUnsave={handleUnsaveThread}
                isSaved={savedThreads.some((t) => t.title === (messages.find((m) => m.type === "user")?.content || "Research Thread"))}
              />
            )}

            {/* Main area with optional references split */}
            {referencesOpen && hasSearched ? (
              <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
                <ResizablePanel defaultSize={50} minSize={20} maxSize={50}>
                  <div className={`h-full overflow-y-auto ${hasSearched ? 'pb-36' : ''}`}>
                    <ChatMessages
                      messages={messages}
                      isLoading={isLoading}
                      onDeleteMessage={handleDeleteMessage}
                      onOpenFilter={() => setFilterOpen(true)}
                      onToggleReferences={toggleReferences}
                      showReferences={referencesOpen}
                    />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50} minSize={50} className="hidden sm:block">
                  <ReferencesPanel
                    papers={allPapers}
                    onClose={() => setReferencesOpen(false)}
                    onSavePaper={handleSaveSinglePaper}
                    savedPaperTitles={savedPapers.map((p) => p.title)}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            ) : (
              <div className={`flex-1 overflow-y-auto ${hasSearched ? 'pb-36' : ''}`}>
                {!hasSearched ? (
                  <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
                    <div className="text-center mb-8 animate-fade-in">
                      <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2 tracking-tight">
                        Research starts here
                      </h1>
                      {!isSignedIn && (
                        <p className="text-sm text-muted-foreground mt-3">
                          Search millions of research papers with AI
                        </p>
                      )}
                    </div>

                    <SearchBar
                      query={query}
                      onChange={setQuery}
                      onSubmit={handleSearch}
                      onOpenFilter={() => setFilterOpen(true)}
                      isFixed={false}
                    />

                    {!isSignedIn && null}
                  </div>
                ) : (
                  <ChatMessages
                    messages={messages}
                    isLoading={isLoading}
                    onDeleteMessage={handleDeleteMessage}
                    onOpenFilter={() => setFilterOpen(true)}
                    onToggleReferences={toggleReferences}
                    showReferences={referencesOpen}
                  />
                )}
              </div>
            )}

            {/* Fixed bottom search bar in chat mode */}
            {hasSearched && (
              <SearchBar
                query={query}
                onChange={setQuery}
                onSubmit={handleSearch}
                onOpenFilter={() => setFilterOpen(true)}
                isFixed={true}
              />
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isSignedIn={isSignedIn}
        onNewThread={handleNewThread}
        onSelectHistory={handleSelectHistory}
        onNavigate={setCurrentPage}
        onSignOut={handleSignOut}
        onSignInClick={() => { setAuthMode("signin"); setShowAuth(true); }}
        onSignUpClick={() => { setAuthMode("signup"); setShowAuth(true); }}
        onSearchChats={() => setSearchChatsOpen(true)}
      />

      <main
        className="transition-all duration-200 ease-out relative"
        style={{ marginLeft: mainMarginLeft }}
      >
        {renderContent()}
      </main>

      <FilterPanel isOpen={filterOpen} onClose={() => setFilterOpen(false)} />

      <SearchChatsDialog
        isOpen={searchChatsOpen}
        onClose={() => setSearchChatsOpen(false)}
        onNewChat={handleNewThread}
        onSelectChat={handleSelectHistory}
        historyItems={[
          "Effects of caffeine on cognitive performance",
          "Climate change impact on agriculture",
          "Machine learning in healthcare diagnosis",
          "Benefits of meditation on anxiety",
          "Quantum computing applications",
          "Gut microbiome and mental health",
          "Renewable energy efficiency trends",
        ]}
      />

      {/* Mobile references overlay */}
      {referencesOpen && hasSearched && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setReferencesOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[85vw] max-w-[380px] animate-slide-in-right">
            <ReferencesPanel
              papers={allPapers}
              onClose={() => setReferencesOpen(false)}
              onSavePaper={handleSaveSinglePaper}
              savedPaperTitles={savedPapers.map((p) => p.title)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
