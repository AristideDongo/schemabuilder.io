import { useCallback, useRef, useState, useEffect } from 'react';
import { useSchemaStore } from '../store/schemaStore';
import { ProjectMapper } from '../../application/mappers/ProjectMapper';

const MAX_HISTORY = 50;

export function useUndoRedo() {
  const activeProject = useSchemaStore((state) => state.activeProject);
  const setProject = useSchemaStore((state) => state.setProject);
  
  const historyRef = useRef<string[]>([]);
  const currentIndexRef = useRef(-1);
  const isUndoRedoActionRef = useRef(false);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateFlags = useCallback(() => {
    setCanUndo(currentIndexRef.current > 0);
    setCanRedo(currentIndexRef.current < historyRef.current.length - 1);
  }, []);

  useEffect(() => {
    if (!activeProject) return;
    
    // Skip saving history if this render was caused by an undo/redo action
    if (isUndoRedoActionRef.current) {
      isUndoRedoActionRef.current = false;
      return;
    }

    const serialized = JSON.stringify(activeProject);
    const history = historyRef.current;
    
    if (currentIndexRef.current >= 0 && history[currentIndexRef.current] === serialized) {
      return;
    }

    // Truncate future if we are branching
    if (currentIndexRef.current < history.length - 1) {
      historyRef.current = history.slice(0, currentIndexRef.current + 1);
    }

    historyRef.current.push(serialized);
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    } else {
      currentIndexRef.current++;
    }

    updateFlags();
  }, [activeProject, updateFlags]);

  const undo = useCallback(() => {
    if (currentIndexRef.current > 0) {
      currentIndexRef.current--;
      const prevState = JSON.parse(historyRef.current[currentIndexRef.current]);
      
      isUndoRedoActionRef.current = true;
      setProject(ProjectMapper.toDomain(prevState));
      updateFlags();
    }
  }, [setProject, updateFlags]);

  const redo = useCallback(() => {
    if (currentIndexRef.current < historyRef.current.length - 1) {
      currentIndexRef.current++;
      const nextState = JSON.parse(historyRef.current[currentIndexRef.current]);
      
      isUndoRedoActionRef.current = true;
      setProject(ProjectMapper.toDomain(nextState));
      updateFlags();
    }
  }, [setProject, updateFlags]);

  return { undo, redo, canUndo, canRedo };
}
