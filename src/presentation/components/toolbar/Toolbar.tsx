"use client";

import { useState, useRef } from "react";
import { useSchemaStore } from "../../store/schemaStore";
import { Button } from "@/components/ui/button";
import { Save, Undo, Redo, Download, Home, Edit2, Check, X, Layout } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function Toolbar() {
  const { 
    activeProject, 
    saveCurrentProject, 
    renameProject, 
    exportProject,
    undo,
    redo,
    past,
    future,
    isAutoLayoutActive,
    toggleAutoLayout
  } = useSchemaStore();
  
  const canUndo = past.length > 0;
  const canRedo = future.length > 0;
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(activeProject?.name || "");
  const inputRef = useRef<HTMLInputElement>(null);

  if (!activeProject) return null;

  const handleSave = async () => {
    await saveCurrentProject(true);
  };

  const handleExport = async () => {
    await exportProject();
    toast.success("Export successful!", { autoClose: 2500 });
  };

  const startEditing = () => {
    setEditedName(activeProject.name);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedName(activeProject.name);
  };

  const saveRename = async () => {
    if (!editedName.trim() || editedName === activeProject.name) {
      return cancelEditing();
    }
    await renameProject(activeProject.id, editedName.trim());
    setIsEditing(false);
    toast.success("Project renamed");
  };

  return (
    <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 z-10 relative shadow-sm">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")} title="Back to Home" className="text-slate-500 hover:text-slate-800">
          <Home className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-slate-200" />
        
        {isEditing ? (
          <div className="flex items-center gap-1 animate-in fade-in zoom-in-95 duration-100">
            <Input
              ref={inputRef}
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="h-8 w-48 text-sm font-semibold"
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveRename();
                if (e.key === 'Escape') cancelEditing();
              }}
            />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={saveRename}>
              <Check className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={cancelEditing}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group cursor-pointer" onClick={startEditing}>
            <h1 className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{activeProject.name}</h1>
            <Edit2 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
        
        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
          {activeProject.engine}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={undo} disabled={!canUndo}>
          <Undo className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={redo} disabled={!canRedo}>
          <Redo className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-slate-200 mx-1" />
        <Button 
          variant={isAutoLayoutActive ? "default" : "secondary"} 
          onClick={toggleAutoLayout} 
          className={`gap-2 transition-all ${
            isAutoLayoutActive 
              ? "bg-blue-600 hover:bg-blue-700 text-white" 
              : "text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-200"
          }`}
        >
          <Layout className="w-4 h-4" />
          {isAutoLayoutActive ? "Auto Layout: ON" : "Auto Layout: OFF"}
        </Button>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
        <Button onClick={handleSave} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Save className="w-4 h-4" />
          Save
        </Button>
      </div>
    </div>
  );
}
