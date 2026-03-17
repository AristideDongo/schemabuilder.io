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
  EdgeTypes
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useSchemaStore } from "../../store/schemaStore";
import TableNode from "./TableNode";
import RelationEdge from "./RelationEdge";
import { CreateRelationUseCase } from "../../../application/use-cases/relation/CreateRelationUseCase";

const nodeTypes: NodeTypes = {
  table: TableNode,
};

const edgeTypes: EdgeTypes = {
  relation: RelationEdge,
};

export default function SchemaCanvas() {
  const { activeProject, updateActiveProject, setSelectedElement, selectedElement } = useSchemaStore();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Sync state from Zustand to React Flow Local State
  useEffect(() => {
    if (activeProject) {
      const newNodes: Node[] = activeProject.tables.map(table => ({
        id: table.id,
        type: "table",
        position: { x: table.x, y: table.y },
        data: { label: table.name, columns: table.columns, id: table.id, isSelected: selectedElement?.tableId === table.id },
      }));
      setNodes(newNodes);

      const newEdges: Edge[] = activeProject.relations.map(rel => ({
        id: rel.id,
        type: "relation",
        source: rel.sourceTableId,
        target: rel.targetTableId,
        sourceHandle: `src-${rel.sourceTableId}`,
        targetHandle: `tgt-${rel.targetTableId}`,
      }));
      setEdges(newEdges);
    }
  }, [activeProject, selectedElement?.tableId, setNodes, setEdges]);

  // Handle Drag & Drop to save position
  const onNodeDragStop = useCallback((_event: React.MouseEvent, node: Node) => {
    if (!node) return;
    updateActiveProject((draft) => {
      const table = draft.tables.find(t => t.id === node.id);
      if (table) {
        table.updatePosition(node.position.x, node.position.y);
      }
    });
  }, [updateActiveProject]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedElement({ type: 'table', tableId: node.id });
  }, [setSelectedElement]);

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
    [updateActiveProject]
  );

  if (!activeProject) {
    return <div className="flex items-center justify-center h-full bg-slate-50 text-slate-500">No active project loaded</div>;
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
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background gap={16} size={1} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
