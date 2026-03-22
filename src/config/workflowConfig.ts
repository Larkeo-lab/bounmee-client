import { BezierEdge, MarkerType } from '@xyflow/react';
import {
    CustomNode,
    TriggerNode,
    ConditionNode,
    ActionNode,
    ToolNode,
    LargeContainerNode,
    GroupNode,
} from '@/pages/service-management/nodes';

export const nodeTypes = {
    custom: CustomNode,
    trigger: TriggerNode,
    condition: ConditionNode,
    action: ActionNode,
    tool: ToolNode,
    'large-container': LargeContainerNode,
    group: GroupNode,
    NODE_IF_ELSE: ConditionNode,
    NODE_PAYMENT: ActionNode,
    NODE_HTTP_REQUEST: ActionNode,
    NODE_RESPONSIBLE: ActionNode,
    NODE_NOTIFICATION: ActionNode,
};

export const edgeTypes = {
    default: BezierEdge,
    // custom: CustomEdge,
};

export const defaultEdgeOptions = {
    type: 'default' as const,
    animated: false,
    style: {
        strokeWidth: 2,
    },
    markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 17,
        height: 17,
    },
};

export const fitViewOptions = {
    padding: 3,
    maxZoom: 1.5,
};
