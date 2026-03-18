import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RenameProjectModalProps {
  isOpen: boolean;
  projectName: string;
  onClose: () => void;
  onConfirm: (newName: string) => void;
  isLoading: boolean;
}

export function RenameProjectModal({
  isOpen,
  projectName,
  onClose,
  onConfirm,
  isLoading,
}: RenameProjectModalProps) {
  const [name, setName] = useState(projectName);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm p-6 relative border border-border">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-foreground mb-4">Rename Project</h2>
        <div className="mb-6">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            New Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project Name"
            className="h-10 bg-background"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) {
                onConfirm(name.trim());
              }
            }}
          />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(name.trim())}
            disabled={isLoading || !name.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            {isLoading ? "Saving..." : "Rename"}
          </Button>
        </div>
      </div>
    </div>
  );
}
