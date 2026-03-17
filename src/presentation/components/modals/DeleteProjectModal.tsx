"use client";

import { X, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteProjectModalProps {
  isOpen: boolean;
  projectName: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function DeleteProjectModal({
  isOpen,
  projectName,
  onClose,
  onConfirm,
  isLoading,
}: DeleteProjectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-2">Delete Project?</h2>
        <p className="text-sm text-slate-500 mb-6">
          <span className="font-semibold text-slate-700">&quot;{projectName}&quot;</span>{" "}
          will be permanently deleted. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
