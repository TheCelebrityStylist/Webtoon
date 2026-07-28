"use client";

import "@xyflow/react/dist/style.css";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Background, Controls, ReactFlow, type Edge, type Node, type NodeProps } from "@xyflow/react";
import { Box, CircleHelp, MapPin, UserRound } from "lucide-react";
import type { CanvasScene, StoryEntity } from "@/lib/story-canvas/types";

type WorldNodeData = {
  label: string;
  type: "scene" | "person" | "place" | "object" | "question" | "event" | "faction";
  detail: string;
  sourceSceneId?: string;
};

const icon = {
  scene: MapPin,
  person: UserRound,
  place: MapPin,
  object: Box,
  question: CircleHelp,
  event: MapPin,
  faction: UserRound,
};

const WorldNode = memo(function WorldNode({ data }: NodeProps<Node<WorldNodeData>>) {
  const Icon = icon[data.type];
  return <article className={`world-node world-node-${data.type}`} aria-label={`${data.type}: ${data.label}. ${data.detail}`}>
    <Icon aria-hidden="true"/><span><small>{data.type}</small><strong>{data.label}</strong><em>{data.detail}</em></span>
  </article>;
});

const nodeTypes = { world: WorldNode };
const layerTypes = {
  Story: new Set(["scene", "event"]),
  People: new Set(["person"]),
  Places: new Set(["place"]),
  Objects: new Set(["object"]),
  Questions: new Set(["question"]),
  Factions: new Set(["faction"]),
};

function buildGraph(scenes: CanvasScene[], entities: StoryEntity[]) {
  const nodes: Node<WorldNodeData>[] = [
    ...scenes.map((scene) => ({ id: `scene:${scene.id}`, type: "world", position: { x: 0, y: 0 }, data: { label: scene.title, type: "scene" as const, detail: `${scene.wordCount} words`, sourceSceneId: scene.id } })),
    ...entities.map((entity) => ({ id: `entity:${entity.id}`, type: "world", position: { x: 0, y: 0 }, data: { label: entity.name, type: entity.type, detail: entity.currentLocation ?? entity.currentHolder ?? entity.state ?? `${entity.appearances.length} appearances` } })),
  ];
  const sceneIds = new Set(scenes.map((scene) => scene.id));
  const edges: Edge[] = entities.flatMap((entity) => entity.appearances.filter((sceneId) => sceneIds.has(sceneId)).map((sceneId) => ({
    id: `appearance:${entity.id}:${sceneId}`,
    source: `entity:${entity.id}`,
    target: `scene:${sceneId}`,
    type: "smoothstep",
    label: "APPEARS IN",
    className: `world-edge world-edge-${entity.type}`,
  })));
  return { nodes, edges };
}

export function StoryMap({ scenes, entities, currentSceneId, onOpen }: { scenes: CanvasScene[]; entities: StoryEntity[]; currentSceneId: string; onOpen: (id: string) => void }) {
  const graph = useMemo(() => buildGraph(scenes, entities), [entities, scenes]);
  const [layout, setLayout] = useState(graph);
  const [layers, setLayers] = useState(() => new Set(Object.keys(layerTypes)));
  const worker = useRef<Worker>();
  useEffect(() => {
    worker.current = new Worker(new URL("../../workers/story-layout.worker.ts", import.meta.url));
    worker.current.onmessage = (event: MessageEvent<{ nodes: Node<WorldNodeData>[]; edges: Edge[] }>) => setLayout(event.data);
    return () => worker.current?.terminate();
  }, []);
  useEffect(() => worker.current?.postMessage(graph), [graph]);
  const visibleTypes = useMemo(() => new Set(Object.entries(layerTypes).filter(([layer]) => layers.has(layer)).flatMap(([, types]) => [...types])), [layers]);
  const nodes = layout.nodes.filter((node) => visibleTypes.has(node.data.type));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = layout.edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));
  return <main className="story-world">
    <aside className="world-layers"><small>WORLD LAYERS</small>{Object.keys(layerTypes).map((layer) => <label key={layer}><input type="checkbox" checked={layers.has(layer)} onChange={() => setLayers((current) => { const next = new Set(current); if (next.has(layer)) next.delete(layer); else next.add(layer); return next; })}/>{layer}</label>)}</aside>
    <section className="world-observatory" aria-label="Storyworld projection">
      <header><span>WORLD · STORY POINT</span><strong>{scenes.findIndex((scene) => scene.id === currentSceneId) + 1} / {scenes.length}</strong><small>{nodes.length} visible records · {edges.length} supported connections</small></header>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView minZoom={0.15} maxZoom={2} onlyRenderVisibleElements onNodeDoubleClick={(_, node) => { if (node.data.sourceSceneId) onOpen(node.data.sourceSceneId); }}>
        <Background color="#252a33" gap={28}/>
        <Controls showInteractive={false}/>
      </ReactFlow>
    </section>
  </main>;
}
