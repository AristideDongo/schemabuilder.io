"use client";

import { useState } from "react";
import { X, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DbEngine } from "@/domain/value-objects/DbEngine";
import { DB_OPTIONS } from "@/presentation/lib/databaseOptions";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, engine: DbEngine) => Promise<void>;
  isLoading: boolean;
  initialProjectName: string;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onCreate,
  isLoading,
  initialProjectName,
}: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState(initialProjectName);
  const [selectedEngine, setSelectedEngine] = useState<DbEngine | null>(null);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (selectedEngine && projectName.trim()) {
      onCreate(projectName.trim(), selectedEngine);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-slate-800 mb-1">New Project</h2>
        <p className="text-sm text-slate-500 mb-6">
          Choose a database engine to get the right column types and SQL syntax.
        </p>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Project Name
          </label>
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="My Schema"
            className="h-10"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
        </div>

        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Database Engine
          </label>
          <div className="grid grid-cols-2 gap-2">
            {DB_OPTIONS.map(({ engine, label, color, description }) => (
              <button
                key={engine}
                onClick={() => setSelectedEngine(engine)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                  selectedEngine === engine
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center shrink-0`}
                >
                  <Database className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-slate-800">
                    {label}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!selectedEngine || !projectName.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </div>
    </div>
  );
}
