"use client";

import { useState, useRef } from "react";
import { useSchemaStore } from "../../store/schemaStore";
import { Button } from "@/components/ui/button";
import { 
  Save, Undo, Redo, Download, Home, Edit2, Check, X, Layout, 
  Image as ImageIcon, ChevronDown, FileCode, FileJson, FileText, FileType,
  Maximize2, Sun, Moon, Monitor
} from "lucide-react";
import { useTheme } from "next-themes";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "../ui/dropdown-menu";
import { useReactFlow, getNodesBounds, getViewportForBounds } from "@xyflow/react";
import { toPng, toSvg } from "html-to-image";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function Toolbar() {
  const { theme, setTheme } = useTheme();
  const { getNodes, fitView } = useReactFlow();
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

  const downloadFile = (dataUrl: string, extension: string) => {
    const a = document.createElement('a');
    a.setAttribute('download', `${activeProject?.name || 'schema'}.${extension}`);
    a.setAttribute('href', dataUrl);
    a.click();
  };

  const handleExportImage = async (format: 'png' | 'svg') => {
    const nodes = getNodes();
    if (nodes.length === 0) {
      toast.error("No tables to export");
      return;
    }

    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewport) return;

    try {
      const nodesBounds = getNodesBounds(nodes);
      // Add padding
      const padding = 50;
      const width = nodesBounds.width + padding * 2;
      const height = nodesBounds.height + padding * 2;
      
      const transform = getViewportForBounds(nodesBounds, width, height, 0.5, 2, 0.1);

      const options = {
        backgroundColor: '#f8fafc',
        width: width,
        height: height,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
          fontFamily: 'sans-serif', // Explicitly set font family
        },
        fontEmbedCSS: '', // Bypass automatic font embedding which is causing the crash
        skipFonts: true, // Newer versions of html-to-image support this
      };

      if (format === 'png') {
        const dataUrl = await toPng(viewport, options);
        downloadFile(dataUrl, 'png');
      } else {
        const dataUrl = await toSvg(viewport, options);
        downloadFile(dataUrl, 'svg');
      }
      
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export image");
    }
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
    <div className="h-14 border-b border-border bg-background flex items-center justify-between px-4 z-10 relative shadow-sm">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")} title="Back to Home" className="text-muted-foreground hover:text-foreground">
          <Home className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-border" />
        
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
            <h1 className="font-semibold text-foreground group-hover:text-blue-500 transition-colors">{activeProject.name}</h1>
            <Edit2 className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
        
        <span className="text-[10px] text-muted-foreground font-bold bg-secondary px-2 py-0.5 rounded-full border border-border uppercase tracking-wider">
          {activeProject.engine}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={undo} disabled={!canUndo} className="text-muted-foreground hover:text-foreground">
          <Undo className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={redo} disabled={!canRedo} className="text-muted-foreground hover:text-foreground">
          <Redo className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => fitView()} title="Zoom to Fit (Ctrl+0)" className="text-muted-foreground hover:text-foreground">
          <Maximize2 className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button 
          variant={isAutoLayoutActive ? "default" : "outline"} 
          onClick={toggleAutoLayout} 
          className={`gap-2 transition-all ${
            isAutoLayoutActive 
              ? "bg-blue-600 hover:bg-blue-700 text-white border-transparent" 
              : "text-muted-foreground hover:text-foreground bg-background"
          }`}
        >
          <Layout className="w-4 h-4" />
          <span className="text-xs font-medium">
            {isAutoLayoutActive ? "Auto Layout: ON" : "Auto Layout: OFF"}
          </span>
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="text-muted-foreground hover:text-foreground">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
              <DropdownMenuRadioItem value="light" className="gap-2">
                <Sun className="w-4 h-4" /> Light
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark" className="gap-2">
                <Moon className="w-4 h-4" /> Dark
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system" className="gap-2">
                <Monitor className="w-4 h-4" /> System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 text-muted-foreground hover:text-foreground">
              <Download className="w-4 h-4" />
              <span className="text-xs font-medium">Export</span>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Data Export</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleExport} className="gap-2">
              <FileCode className="w-4 h-4 text-blue-500" />
              SQL Schema
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExport} className="gap-2">
              <FileJson className="w-4 h-4 text-orange-500" />
              JSON Model
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel>Image Export</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleExportImage('png')} className="gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-500" />
              PNG Image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExportImage('svg')} className="gap-2">
              <FileType className="w-4 h-4 text-purple-500" />
              SVG Image
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={handleSave} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <Save className="w-4 h-4" />
          Save
        </Button>
      </div>
    </div>
  );
}
