import { useState } from "react";
import { Plus, Search, Clock, LogIn, UserPlus, X, PanelLeft, PanelLeftClose, Library } from "lucide-react";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import ProfileMenu from "./ProfileMenu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isSignedIn: boolean;
  onNewThread: () => void;
  onSelectHistory: (query: string) => void;
  onNavigate: (page: string) => void;
  onSignOut: () => void;
  onSignInClick: () => void;
  onSignUpClick: () => void;
  onSearchChats: () => void;
}

const historyItems = [
  "Effects of caffeine on cognitive performance",
  "Climate change impact on agriculture",
  "Machine learning in healthcare diagnosis",
  "Benefits of meditation on anxiety",
  "Quantum computing applications",
  "Gut microbiome and mental health",
  "Renewable energy efficiency trends",
];

export const SIDEBAR_EXPANDED = 260;
export const SIDEBAR_COLLAPSED = 60;
/** Collapsed state: shows logo, on hover switches to expand icon */
const CollapsedLogoToggle = ({ onToggle, onNavigate }: { onToggle: () => void; onNavigate: (page: string) => void }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="flex items-center justify-center w-full">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={hovered ? onToggle : () => onNavigate("home")}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors hover:bg-accent"
          >
            {hovered ? (
              <PanelLeft className="w-4 h-4 text-muted-foreground" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">R</span>
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>{hovered ? "Open sidebar" : "Home"}</TooltipContent>
      </Tooltip>
    </div>
  );
};

const AppSidebar = ({
  isOpen, onToggle, isSignedIn, onNewThread, onSelectHistory,
  onNavigate, onSignOut, onSignInClick, onSignUpClick, onSearchChats,
}: AppSidebarProps) => {
  const isDesktop = useIsDesktop();

  // DESKTOP: collapsible rail — never fully hidden
  if (isDesktop) {
    return (
      <div
        className="shrink-0 transition-[width] duration-200 ease-out"
        style={{ width: isOpen ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED }}
      >
        <aside
          className="fixed top-0 left-0 h-full z-30 flex flex-col bg-sidebar border-r border-sidebar-border transition-[width] duration-200 ease-out overflow-hidden"
          style={{ width: isOpen ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 h-14 shrink-0">
            {isOpen ? (
              <>
                <button onClick={() => onNavigate("home")} className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <span className="text-primary-foreground text-xs font-bold">R</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                    Research
                  </span>
                </button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={onToggle}
                      className="p-1.5 rounded-md hover:bg-accent active:scale-95 transition-all text-muted-foreground hover:text-foreground"
                    >
                      <PanelLeftClose className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>Close sidebar</TooltipContent>
                </Tooltip>
              </>
            ) : (
              <CollapsedLogoToggle onToggle={onToggle} onNavigate={onNavigate} />
            )}
          </div>

          {/* New Chat */}
          <div className="px-2 mb-1 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onNewThread}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg border border-border hover:bg-accent active:scale-[0.97] transition-all text-secondary-foreground justify-center"
                  title="New Chat"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  {isOpen && (
                    <>
                      <span className="flex-1 text-left whitespace-nowrap">New Chat</span>
                      <kbd className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
                    </>
                  )}
                </button>
              </TooltipTrigger>
              {!isOpen && (
                <TooltipContent side="right" sideOffset={8}>New Chat</TooltipContent>
              )}
            </Tooltip>
          </div>

          {/* Search */}
          <div className="px-2 mt-1 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
              <button
                  onClick={onSearchChats}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-accent active:scale-[0.97] transition-all text-secondary-foreground justify-center"
                  title="Search Chats"
                >
                  <Search className="w-4 h-4 shrink-0" />
                  {isOpen && <span className="flex-1 text-left whitespace-nowrap">Search Chats</span>}
                </button>
              </TooltipTrigger>
              {!isOpen && (
                <TooltipContent side="right" sideOffset={8}>Search Chats</TooltipContent>
              )}
            </Tooltip>
          </div>

          {/* My Library */}
          <div className="px-2 mt-1 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onNavigate("library")}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-accent active:scale-[0.97] transition-all text-secondary-foreground justify-center"
                  title="My Library"
                >
                  <Library className="w-4 h-4 shrink-0" />
                  {isOpen && <span className="flex-1 text-left whitespace-nowrap">My Library</span>}
                </button>
              </TooltipTrigger>
              {!isOpen && (
                <TooltipContent side="right" sideOffset={8}>My Library</TooltipContent>
              )}
            </Tooltip>
          </div>

          {/* History */}
          {isSignedIn && (
            <div className="flex-1 overflow-y-auto scrollbar-thin mt-4 px-2 min-h-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 px-3 mb-2 cursor-default">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    {isOpen && (
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                        History
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                {!isOpen && (
                  <TooltipContent side="right" sideOffset={8}>History</TooltipContent>
                )}
              </Tooltip>
              {isOpen &&
                historyItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => onSelectHistory(item)}
                    className="w-full text-left px-3 py-1.5 text-sm text-secondary-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors truncate"
                  >
                    {item}
                  </button>
                ))}
            </div>
          )}

          {!isSignedIn && <div className="flex-1" />}

          {/* Bottom */}
          <div className="p-2 border-t border-sidebar-border shrink-0">
            {isSignedIn ? (
              isOpen ? (
                <ProfileMenu
                  userName="Alex Researcher"
                  userEmail="alex@research.com"
                  onSignOut={onSignOut}
                  onNavigate={onNavigate}
                />
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={onToggle}
                      className="flex items-center justify-center w-full p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0">
                        A
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>Alex Researcher</TooltipContent>
                </Tooltip>
              )
            ) : (
              isOpen ? (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={onSignInClick}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors text-secondary-foreground justify-center"
                  >
                    <LogIn className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">Sign in</span>
                  </button>
                  <button
                    onClick={onSignUpClick}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity justify-center"
                  >
                    <UserPlus className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">Sign up</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={onSignInClick}
                        className="flex items-center justify-center w-full px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors text-secondary-foreground"
                      >
                        <LogIn className="w-4 h-4 shrink-0" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>Sign in</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={onSignUpClick}
                        className="flex items-center justify-center w-full px-3 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                      >
                        <UserPlus className="w-4 h-4 shrink-0" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>Sign up</TooltipContent>
                  </Tooltip>
                </div>
              )
            )}
          </div>
        </aside>
      </div>
    );
  }

  // MOBILE/TABLET: overlay drawer
  return (
    <>
      {/* Toggle button (visible when sidebar closed) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-[11px] left-3 z-40 p-2 rounded-lg hover:bg-accent active:scale-95 transition-all"
          aria-label="Open sidebar"
        >
          <PanelLeft className="w-5 h-5 text-muted-foreground" />
        </button>
      )}

      {/* Overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/70 z-40 animate-fade-in"
          onClick={onToggle}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-200 ease-out w-[280px] max-w-[85vw] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 h-14">
          <button onClick={() => { onNavigate("home"); onToggle(); }} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">R</span>
            </div>
            <span className="text-sm font-semibold text-foreground">Research</span>
          </button>
          <button onClick={onToggle} className="p-1.5 rounded-md hover:bg-accent active:scale-95 transition-all">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* New Chat */}
        <div className="px-3 mb-1">
          <button
            onClick={() => { onNewThread(); onToggle(); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg border border-border hover:bg-accent transition-colors text-secondary-foreground"
          >
            <Plus className="w-4 h-4" />
            <span className="flex-1 text-left">New Chat</span>
            <kbd className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>
        </div>

        {/* Search */}
        <div className="px-3 mt-1">
          <button
            onClick={() => { onSearchChats(); onToggle(); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors text-secondary-foreground"
          >
            <Search className="w-4 h-4" />
            Search Chats
          </button>
        </div>

        {/* My Library */}
        <div className="px-3 mt-1">
          <button
            onClick={() => { onNavigate("library"); onToggle(); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors text-secondary-foreground"
          >
            <Library className="w-4 h-4" />
            My Library
          </button>
        </div>

        {/* History */}
        {isSignedIn && (
          <div className="flex-1 overflow-y-auto scrollbar-thin mt-4 px-3">
            <div className="flex items-center gap-2 px-3 mb-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">History</span>
            </div>
            {historyItems.map((item, i) => (
              <button
                key={i}
                onClick={() => { onSelectHistory(item); onToggle(); }}
                className="w-full text-left px-3 py-1.5 text-sm text-secondary-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors truncate"
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {!isSignedIn && <div className="flex-1" />}

        {/* Bottom */}
        <div className="p-3 border-t border-sidebar-border">
          {isSignedIn ? (
            <ProfileMenu
              userName="Alex Researcher"
              userEmail="alex@research.com"
              onSignOut={onSignOut}
              onNavigate={(page) => { onNavigate(page); onToggle(); }}
            />
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { onSignInClick(); onToggle(); }}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors text-secondary-foreground"
              >
                <LogIn className="w-4 h-4" />
                Sign in
              </button>
              <button
                onClick={() => { onSignUpClick(); onToggle(); }}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <UserPlus className="w-4 h-4" />
                Sign up
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
