"use client";

import { useEffect, use } from "react";
import { useSchemaStore } from "@/presentation/store/schemaStore";
import SchemaCanvas from "@/presentation/components/canvas/SchemaCanvas";
import Toolbar from "@/presentation/components/toolbar/Toolbar";
import Sidebar from "@/presentation/components/panels/Sidebar";
import PropertiesPanel from "@/presentation/components/panels/PropertiesPanel";

import { useKeyboardShortcuts } from "@/presentation/hooks/useKeyboardShortcuts";

export default function ProjectEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { loadProject, activeProject, isLoading, saveCurrentProject } = useSchemaStore();

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Initial load
  useEffect(() => {
    loadProject(id);
  }, [id, loadProject]);

  // Auto-save: persist to localStorage 1s after any project change
  useEffect(() => {
    if (!activeProject) return;
    const timer = setTimeout(() => {
      saveCurrentProject();
    }, 1000);
    return () => clearTimeout(timer);
  }, [activeProject, saveCurrentProject]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500">Loading project...</div>;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden font-sans">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 relative h-full w-full">
          {activeProject && <SchemaCanvas />}
        </main>
        <PropertiesPanel />
      </div>
    </div>
  );
}
