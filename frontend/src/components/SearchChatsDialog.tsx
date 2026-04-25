import { useState } from "react";
import { X, MessageCircle, SquarePen } from "lucide-react";

interface SearchChatsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectChat: (query: string) => void;
  historyItems: string[];
}

const SearchChatsDialog = ({ isOpen, onClose, onNewChat, onSelectChat, historyItems }: SearchChatsDialogProps) => {
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const filtered = search.trim()
    ? historyItems.filter((item) => item.toLowerCase().includes(search.toLowerCase()))
    : historyItems;

  // Group into "Previous 7 Days" and "Previous 30 Days" (mock grouping)
  const recentItems = filtered.slice(0, 3);
  const olderItems = filtered.slice(3);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-background/70 z-[60]" onClick={onClose} />

      {/* Dialog */}
      <div className="fixed inset-0 z-[61] flex items-start justify-center pt-[15vh] px-4">
        <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
          {/* Search input */}
          <div className="flex items-center border-b border-border px-4 py-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
              autoFocus
            />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[50vh] overflow-y-auto p-2">
            {/* New chat */}
            <button
              onClick={() => { onNewChat(); onClose(); }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-foreground hover:bg-accent rounded-xl transition-colors"
            >
              <SquarePen className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">New chat</span>
            </button>

            {/* Recent group */}
            {recentItems.length > 0 && (
              <div className="mt-2">
                <p className="px-4 py-2 text-xs text-muted-foreground font-medium">Previous 7 Days</p>
                {recentItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => { onSelectChat(item); onClose(); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-foreground hover:bg-accent rounded-xl transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{item}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Older group */}
            {olderItems.length > 0 && (
              <div className="mt-2">
                <p className="px-4 py-2 text-xs text-muted-foreground font-medium">Previous 30 Days</p>
                {olderItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => { onSelectChat(item); onClose(); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-foreground hover:bg-accent rounded-xl transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{item}</span>
                  </button>
                ))}
              </div>
            )}

            {filtered.length === 0 && search.trim() && (
              <p className="text-sm text-muted-foreground text-center py-8">No chats found</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchChatsDialog;
