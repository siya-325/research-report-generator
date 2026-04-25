import { useState } from "react";
import {
  BookOpen,
  SlidersHorizontal,
  Download,
  MoreHorizontal,
  Copy,
  FileText,
  FileDown,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface ReportActionBarProps {
  onToggleReferences: () => void;
  showReferences: boolean;
  summaryText: string;
  onDelete: () => void;
  onOpenFilter: () => void;
}

const ReportActionBar = ({
  onToggleReferences,
  showReferences,
  summaryText,
  onDelete,
  onOpenFilter,
}: ReportActionBarProps) => {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    toast.success("Copied to clipboard");
  };

  const handleExportPDF = () => toast.info("PDF export coming soon");
  const handleExportDOCX = () => toast.info("DOCX export coming soon");

  return (
    <>
      <div className="pt-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleReferences}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
              showReferences
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            References
          </button>

          <button
            onClick={onOpenFilter}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filter
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="w-3.5 h-3.5 mr-2" />
                Copy text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className="w-3.5 h-3.5 mr-2" />
                Download as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportDOCX}>
                <FileDown className="w-3.5 h-3.5 mr-2" />
                Download as DOCX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => setDeleteOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              Delete Query
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this query?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ReportActionBar;
