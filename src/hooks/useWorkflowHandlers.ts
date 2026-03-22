import { useCallback } from 'react';
import { Node, Edge, addEdge } from '@xyflow/react';
import { useWorkflowStore } from '../stores/workflowStore';
import { CustomNodeData } from '@/types/workflow';

const getNodeId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useWorkflowHandlers = () => {
    const nodes = useWorkflowStore((state) => state.nodes);
    const edges = useWorkflowStore((state) => state.edges);
    const setStoreNodes = useWorkflowStore((state) => state.setNodes);
    const setStoreEdges = useWorkflowStore((state) => state.setEdges);

    const onNodesChange = useCallback(
        (changes: any) => {
            setStoreNodes(
                changes.reduce((nds: Node<CustomNodeData>[], change: any) => {
                    if (change.type === 'position' && change.dragging) {
                        return nds.map((node) => {
                            if (node.id === change.id) {
                                // Preserve parent-child relationship properties
                                return {
                                    ...node,
                                    position: change.position,
                                    parentId: node.parentId,
                                    extent: node.extent,
                                    expandParent: node.expandParent,
                                };
                            }
                            return node;
                        });
                    }
                    if (change.type === 'remove') {
                        // Prevent deletion of start_node or trigger type nodes
                        const checkNode = nodes.find(n => n.id === change.id);
                        if (checkNode && (checkNode.id === 'start_node' || checkNode.type === 'trigger')) {
                            console.warn('🚫 Blocked deletion of Start Node');
                            return nds;
                        }
                        return nds.filter((node) => node.id !== change.id);
                    }
                    if (change.type === 'select') {
                        return nds.map((node) =>
                            node.id === change.id
                                ? { ...node, selected: change.selected }
                                : node
                        );
                    }
                    if (change.type === 'dimensions') {
                        return nds.map((node) => {
                            if (node.id === change.id) {
                                return {
                                    ...node,
                                    measured: change.dimensions,
                                    width: change.dimensions?.width,
                                    height: change.dimensions?.height,
                                };
                            }
                            return node;
                        });
                    }
                    return nds;
                }, nodes)
            );
        },
        [nodes, setStoreNodes]
    );

    const onEdgesChange = useCallback(
        (changes: any) => {
            setStoreEdges(
                changes.reduce((eds: Edge[], change: any) => {
                    if (change.type === 'remove') {
                        return eds.filter((edge) => edge.id !== change.id);
                    }
                    if (change.type === 'select') {
                        return eds.map((edge) =>
                            edge.id === change.id
                                ? { ...edge, selected: change.selected }
                                : edge
                        );
                    }
                    return eds;
                }, edges)
            );
        },
        [edges, setStoreEdges]
    );

    const onConnect = useCallback(
        (params: any) => {
            const newEdges = addEdge(params, edges);
            setStoreEdges(newEdges);
        },
        [edges, setStoreEdges]
    );

    const handleSaveSettings = useCallback(
        (nodeId: string, newData: CustomNodeData) => {
            setStoreNodes(
                nodes.map((node) => {
                    if (node.id === nodeId) {
                        return { ...node, data: newData };
                    }
                    return node;
                })
            );
        },
        [nodes, setStoreNodes]
    );

    const handleAddConnectedNode = useCallback(
        (sourceNodeId: string) => {
            const sourceNode = nodes.find((n) => n.id === sourceNodeId);
            if (!sourceNode) return;

            const newNodeId = getNodeId();
            const newNode: Node<CustomNodeData> = {
                id: newNodeId,
                type: 'action',
                data: {
                    label: 'New Action',
                    icon: '⚡',
                    description: 'Configure me',
                    type: 'action',
                    method: 'NODE_CUSTOM',
                },
                position: {
                    x: sourceNode.position.x + 250,
                    y: sourceNode.position.y,
                },
            };

            const newEdge: Edge = {
                id: `edge_${sourceNodeId}_${newNodeId}`,
                source: sourceNodeId,
                target: newNodeId,
                type: 'default',
            };

            setStoreNodes([...nodes, newNode]);
            setStoreEdges([...edges, newEdge]);
        },
        [nodes, edges, setStoreNodes, setStoreEdges]
    );

    const handleApplyGroupColor = useCallback(
        (nodeIds: string[], color: string, groupName: string) => {
            const updatedNodes = nodes.map(node => {
                if (nodeIds.includes(node.id)) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            groupColor: color,
                            groupName: groupName,
                        },
                        selected: false,
                    };
                }
                return {
                    ...node,
                    selected: false,
                };
            });

            setStoreNodes(updatedNodes);
        },
        [nodes, setStoreNodes]
    );

    const handleRemoveGroupColor = useCallback(
        (nodeIds: string[]) => {
            const updatedNodes = nodes.map(node => {
                if (nodeIds.includes(node.id)) {
                    const { groupColor, groupName, ...restData } = node.data;
                    return {
                        ...node,
                        data: restData,
                        selected: false,
                    };
                }
                return {
                    ...node,
                    selected: false,
                };
            });

            setStoreNodes(updatedNodes);
        },
        [nodes, setStoreNodes]
    );

    return {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        handleSaveSettings,
        handleAddConnectedNode,
        handleApplyGroupColor,
        handleRemoveGroupColor,
    };
};
