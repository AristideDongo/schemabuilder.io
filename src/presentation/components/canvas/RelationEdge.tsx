import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath } from "@xyflow/react";
import { RelationType } from "../../../domain/value-objects/RelationType";

export default function RelationEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  markerStart,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const getLabelText = (type: string) => {
    switch (type) {
      case RelationType.OneToOne: return "1:1";
      case RelationType.OneToMany: return "1:N";
      case RelationType.ManyToOne: return "N:1";
      case RelationType.ManyToMany: return "N:N";
      default: return "";
    }
  };

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        markerStart={markerStart}
        style={style} 
      />
      {data?.type && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border shadow-sm ${
              data.isSelected 
                ? "bg-blue-500 text-white border-blue-600" 
                : "bg-white text-slate-500 border-slate-200"
            }`}>
              {getLabelText(data.type as string)}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
