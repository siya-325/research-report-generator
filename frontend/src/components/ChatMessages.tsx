import { useEffect, useRef } from "react";
import LiteratureReport from "./LiteratureReport";
import type { ChatMessage } from "@/pages/Index";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onDeleteMessage: (index: number) => void;
  onOpenFilter: () => void;
  onToggleReferences: () => void;
  showReferences: boolean;
}

const ChatMessages = ({ messages, isLoading, onDeleteMessage, onOpenFilter, onToggleReferences, showReferences }: ChatMessagesProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 pt-6 pb-4 space-y-8">
      {messages.map((msg, i) => (
        <div key={i} className="animate-fade-in">
          {msg.type === "user" ? (
            <div className="flex justify-start">
              <h3 className="text-base font-medium text-foreground">
                {msg.content}
              </h3>
            </div>
          ) : (
            <div className="flex justify-start">
              <div className="max-w-full w-full">
                <LiteratureReport
                  content={msg.content}
                  papers={msg.results || []}
                  onDelete={() => onDeleteMessage(i)}
                  onOpenFilter={onOpenFilter}
                  onToggleReferences={onToggleReferences}
                  showReferences={showReferences}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="animate-fade-in space-y-3">
          <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
          <div className="h-3 bg-muted rounded w-full animate-pulse" />
          <div className="h-3 bg-muted rounded w-5/6 animate-pulse" />
          <div className="h-3 bg-muted rounded w-full animate-pulse" />
          <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;
