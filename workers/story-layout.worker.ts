/// <reference lib="webworker" />
import ELK from "elkjs/lib/elk.bundled.js";
import type { Edge, Node } from "@xyflow/react";

const elk = new ELK();

self.onmessage = async (event: MessageEvent<{ nodes: Node[]; edges: Edge[] }>) => {
  const { nodes, edges } = event.data;
  const result = await elk.layout({
    id: "storyworld",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.spacing.nodeNode": "48",
      "elk.layered.spacing.nodeNodeBetweenLayers": "110",
    },
    children: nodes.map((node) => ({ id: node.id, width: 230, height: 92 })),
    edges: edges.map((edge) => ({ id: edge.id, sources: [edge.source], targets: [edge.target] })),
  });
  const positions = new Map((result.children ?? []).map((node) => [node.id, { x: node.x ?? 0, y: node.y ?? 0 }]));
  self.postMessage({ nodes: nodes.map((node) => ({ ...node, position: positions.get(node.id) ?? node.position })), edges });
};

export {};
