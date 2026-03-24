"use client";

import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  NodeTypes,
  EdgeTypes,
  ColorMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";
import { useSchemaStore } from "../../store/schemaStore";
import TableNode from "./TableNode";
import RelationEdge from "./RelationEdge";
import { CreateRelationUseCase } from "../../../application/use-cases/relation/CreateRelationUseCase";
import { DeleteTableUseCase } from "../../../application/use-cases/table/DeleteTableUseCase";
import { DeleteRelationUseCase } from "../../../application/use-cases/relation/DeleteRelationUseCase";
import { toast } from "react-toastify";

const nodeTypes: NodeTypes = {
  table: TableNode,
};

const edgeTypes: EdgeTypes = {
  relation: RelationEdge,
};

export default function SchemaCanvas() {
  const { resolvedTheme } = useTheme();
  const {
    activeProject,
    updateActiveProject,
    setSelectedElement,
    selectedElement,
    isAutoLayoutActive,
    autoLayout,
  } = useSchemaStore();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Auto-layout trigger on structure change (primitive deps only to avoid infinite loop)
  useEffect(() => {
    if (isAutoLayoutActive && activeProject) {
      autoLayout();
    }
  }, [
    activeProject?.tables.length,
    activeProject?.relations.length,
    isAutoLayoutActive,
    autoLayout,
  ]);

  // Sync state from Zustand to React Flow Local State
  useEffect(() => {
    if (activeProject) {
      const newNodes: Node[] = activeProject.tables.map((table) => ({
        id: table.id,
        type: "table",
        position: { x: table.x, y: table.y },
        data: {
          label: table.name,
          columns: table.columns,
          id: table.id,
          isSelected:
            selectedElement?.type === "table" &&
            selectedElement?.tableId === table.id,
        },
      }));
      setNodes(newNodes);

      const newEdges: Edge[] = activeProject.relations.map((rel) => {
        const isSelected =
          selectedElement?.type === "relation" &&
          selectedElement?.relationId === rel.id;
        return {
          id: rel.id,
          type: "relation",
          source: rel.sourceTableId,
          target: rel.targetTableId,
          sourceHandle: `src-${rel.sourceTableId}`,
          targetHandle: `tgt-${rel.targetTableId}`,
          data: { type: rel.type, isSelected },
          animated: isSelected,
          style: {
            stroke: isSelected
              ? "#3b82f6"
              : resolvedTheme === "dark"
                ? "#475569"
                : "#cbd5e1",
            strokeWidth: isSelected ? 3 : 2,
            transition: "stroke 0.2s, stroke-width 0.2s",
          },
          markerStart: rel.type === "ManyToMany" ? "url(#many)" : "url(#one)",
          markerEnd:
            rel.type === "OneToMany" || rel.type === "ManyToMany"
              ? "url(#many)"
              : "url(#one)",
        };
      });
      setEdges(newEdges);
    }
  }, [activeProject, selectedElement, setNodes, setEdges, resolvedTheme]);

  // Handle Drag & Drop to save position
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (!node) return;
      updateActiveProject((draft) => {
        const table = draft.tables.find((t) => t.id === node.id);
        if (table) {
          table.updatePosition(node.position.x, node.position.y);
        }
      });
    },
    [updateActiveProject],
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setSelectedElement({ type: "relation", relationId: edge.id });
    },
    [setSelectedElement],
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedElement({ type: "table", tableId: node.id });
    },
    [setSelectedElement],
  );

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      const { source, target } = params;
      if (!source || !target) return;

      updateActiveProject((draft) => {
        try {
          new CreateRelationUseCase().execute(draft, source, target);
        } catch (e) {
          console.warn("Relation error:", e);
        }
      });
    },
    [updateActiveProject],
  );

  const onNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      updateActiveProject((project) => {
        deletedNodes.forEach((node) => {
          new DeleteTableUseCase().execute(project, node.id);
        });
      });
      setSelectedElement(null);
      toast.error(`${deletedNodes.length} Table(s) deleted`);
    },
    [updateActiveProject, setSelectedElement],
  );

  const onEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      updateActiveProject((project) => {
        deletedEdges.forEach((edge) => {
          new DeleteRelationUseCase().execute(project, edge.id);
        });
      });
      if (selectedElement?.type === "relation") {
        setSelectedElement(null);
      }
      toast.warn(`${deletedEdges.length} Relation(s) deleted`);
    },
    [updateActiveProject, selectedElement, setSelectedElement],
  );

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 text-slate-500">
        No active project loaded
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onConnect={onConnect}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        deleteKeyCode={["Backspace", "Delete"]}
        fitView
        colorMode={(resolvedTheme as ColorMode) || "light"}
      >
        <svg
          style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0 }}
        >
          <defs>
            {/* Many Marker (Crow's Foot) */}
            <marker
              id="many"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path
                d="M 0 0 L 10 5 L 0 10"
                fill="none"
                className="stroke-muted-foreground"
                strokeWidth="1.5"
              />
              <path
                d="M 0 5 L 10 5"
                fill="none"
                className="stroke-muted-foreground"
                strokeWidth="1.5"
              />
            </marker>
            {/* One Marker */}
            <marker
              id="one"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path
                d="M 8 0 L 8 10"
                fill="none"
                className="stroke-muted-foreground"
                strokeWidth="1.5"
              />
            </marker>
          </defs>
        </svg>
        <Background gap={16} size={1} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
