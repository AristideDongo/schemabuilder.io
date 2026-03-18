"use client";

import { useEffect } from "react";
import { useSchemaStore } from "../store/schemaStore";

export const useKeyboardShortcuts = () => {
  const {
    undo,
    redo,
    saveCurrentProject,
    exportProject,
    selectedElement,
    updateActiveProject,
    setSelectedElement,
    activeProject,
    deleteSelectedElement
  } = useSchemaStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Ctrl+Z
      if (cmdOrCtrl && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (
        (cmdOrCtrl && e.key.toLowerCase() === "y") ||
        (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        redo();
      }

      // Save: Ctrl+S
      if (cmdOrCtrl && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveCurrentProject();
      }

      // Export: Ctrl+E
      if (cmdOrCtrl && e.key.toLowerCase() === "e") {
        e.preventDefault();
        exportProject();
      }

      // Delete: Delete or Backspace
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedElement) {
          e.preventDefault();
          deleteSelectedElement();
        }
      }

      // New Table: 'n'
      if (e.key.toLowerCase() === "n" && !cmdOrCtrl && !e.altKey) {
        e.preventDefault();
        const name = `table_${(activeProject?.tables.length || 0) + 1}`;
        const x = 100 + Math.random() * 50;
        const y = 100 + Math.random() * 50;
        useSchemaStore.getState().addTable(name, x, y);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, saveCurrentProject, exportProject, selectedElement, activeProject, deleteSelectedElement]);
};
