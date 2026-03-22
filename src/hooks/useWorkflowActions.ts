import { useCallback } from 'react';
import { useReactFlow, Node } from '@xyflow/react';
import { useWorkflowStore } from '../stores/workflowStore';
import { CustomNodeData } from '@/types/workflow';

const FLOW_KEY = 'example-flow';

const getNodeId = () => `randomnode_${+new Date()}`;

export const useWorkflowActions = (rfInstance: any, onSaveClick?: () => void, onRestoreClick?: () => void, onAddNodeClick?: () => void) => {
    const nodes = useWorkflowStore((state) => state.nodes);
    const setStoreNodes = useWorkflowStore((state) => state.setNodes);
    const setStoreEdges = useWorkflowStore((state) => state.setEdges);
    const { setViewport } = useReactFlow();

    const onSave = useCallback(() => {
        if (rfInstance) {
            const flow = rfInstance.toObject();
            localStorage.setItem(FLOW_KEY, JSON.stringify(flow));
        }
        onSaveClick?.();
    }, [rfInstance, onSaveClick]);

    const onRestore = useCallback(() => {
        const restoreFlow = async () => {
            const flow = JSON.parse(localStorage.getItem(FLOW_KEY) || '{}');

            if (flow) {
                const { x = 0, y = 0, zoom = 1 } = flow.viewport;
                setStoreNodes(flow.nodes || []);
                setStoreEdges(flow.edges || []);
                setViewport({ x, y, zoom });
            }
        };

        restoreFlow();
        onRestoreClick?.();
    }, [setStoreNodes, setStoreEdges, setViewport, onRestoreClick]);

    const onAdd = useCallback(() => {
        const newNode: Node<CustomNodeData> = {
            id: getNodeId(),
            type: 'custom',
            data: {
                label: 'New Node',
                icon: '✨',
                description: 'Configure me',
                type: 'action',
            },
            position: {
                x: Math.random() * 400,
                y: Math.random() * 400,
            },
        };
        setStoreNodes([...nodes, newNode]);
        onAddNodeClick?.();
    }, [nodes, setStoreNodes, onAddNodeClick]);

    return {
        onSave,
        onRestore,
        onAdd,
    };
};
