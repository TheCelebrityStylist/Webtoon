"use client";
import "@xyflow/react/dist/style.css";
import { memo, useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { Box, CircleHelp, GitBranch, MapPin, UserRound } from "lucide-react";
import type {
  StoryworldDataSource,
  StoryworldProjection,
  WorldNodeProjection,
} from "@/lib/storyworld/data-source";
import styles from "./styles/WorldWorkspace.module.css";

type Data = WorldNodeProjection;
const icon = (type: Data["type"]) =>
  type === "person"
    ? UserRound
    : type === "object"
      ? Box
      : type === "question"
        ? CircleHelp
        : type === "branch-difference"
          ? GitBranch
          : MapPin;
const WorldNode = memo(function WorldNode({ data }: NodeProps<Node<Data>>) {
  const Icon = icon(data.type);
  return (
    <article
      className={`${styles.node} ${styles[data.type] ?? ""}`}
      aria-label={`${data.type}: ${data.label}. ${data.detail}`}
    >
      <Handle type="target" position={Position.Left} />
      <Icon />
      <span>
        <small>{data.type.replace("-", " ")}</small>
        <strong>{data.label}</strong>
        <em>{data.detail}</em>
        <b>{data.meta}</b>
      </span>
      <Handle type="source" position={Position.Right} />
    </article>
  );
});
const nodeTypes = { world: WorldNode };
const groups = {
  Story: new Set(["chapter", "scene", "event"]),
  People: new Set(["person"]),
  Places: new Set(["place"]),
  Objects: new Set(["object"]),
  Questions: new Set(["question"]),
  Differences: new Set(["diagnostic", "branch-difference"]),
};

export function StoryMap({
  projectId,
  branchId = "main",
  sequence = 9,
  source,
  onOpen,
  onSelect,
}: {
  projectId: string;
  branchId?: string;
  sequence?: number;
  source: StoryworldDataSource;
  onOpen: (id: string) => void;
  onSelect?: (id: string) => void;
}) {
  const [projection, setProjection] = useState<StoryworldProjection>();
  const [error, setError] = useState("");
  const [layers, setLayers] = useState(new Set(Object.keys(groups)));
  const [selected, setSelected] = useState("");
  useEffect(() => {
    let active = true;
    setError("");
    void source
      .loadWorld({ projectId, branchId, sequence })
      .then((value) => {
        if (active) setProjection(value);
      })
      .catch(() => {
        if (active) setError("Story state is still being prepared.");
      });
    return () => {
      active = false;
    };
  }, [branchId, projectId, sequence, source]);
  const built = useMemo(() => {
    if (!projection) return { nodes: [] as Node<Data>[], edges: [] as Edge[] };
    return {
      nodes: projection.nodes.map((item) => ({
        id: item.id,
        type: "world",
        position: { x: item.x, y: item.y },
        data: item,
        style: { width: item.width, height: item.height },
      })),
      edges: projection.edges.map((item) => ({
        id: item.id,
        source: item.source,
        target: item.target,
        type: "smoothstep",
        label: item.label,
      })),
    };
  }, [projection]);
  const visible = new Set(
    Object.entries(groups)
      .filter(([key]) => layers.has(key))
      .flatMap(([, value]) => [...value]),
  );
  const nodeIds = new Set(
    built.nodes
      .filter((node) => visible.has(node.data.type))
      .map((node) => node.id),
  );
  const connected = selected
    ? new Set(
        built.edges
          .filter(
            (edge) => edge.source === selected || edge.target === selected,
          )
          .flatMap((edge) => [edge.source, edge.target]),
      )
    : new Set<string>();
  const nodes = built.nodes
    .filter((node) => nodeIds.has(node.id))
    .map((node) => ({
      ...node,
      className: selected && !connected.has(node.id) ? styles.dim : "",
    }));
  const edges = built.edges
    .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
    .map((edge) => ({
      ...edge,
      animated: Boolean(
        selected && (edge.source === selected || edge.target === selected),
      ),
    }));
  return (
    <main className={styles.workspace}>
      <aside>
        <small>WORLD LAYERS</small>
        <h1>Story observatory</h1>
        <p>See only what the selected story path establishes.</p>
        {Object.keys(groups).map((group) => (
          <label key={group}>
            <input
              type="checkbox"
              checked={layers.has(group)}
              onChange={() =>
                setLayers((current) => {
                  const next = new Set(current);
                  if (next.has(group)) next.delete(group);
                  else next.add(group);
                  return next;
                })
              }
            />
            <span>{group}</span>
          </label>
        ))}
      </aside>
      <section
        className={styles.canvas}
        aria-label="Storyworld projection"
        data-layout-ready={Boolean(projection)}
      >
        <header>
          <span>{branchId === "main" ? "MAIN" : "BRANCH"} · STORY POINT</span>
          <strong>{sequence}</strong>
          <small>
            {nodes.length} records · {edges.length} supported connections ·{" "}
            {projection?.compilerVersion ?? "preparing"}
          </small>
        </header>
        {error ? (
          <p className="canvas-loading">{error}</p>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.18 }}
            minZoom={0.2}
            maxZoom={1.8}
            onNodeClick={(_, node) => {
              setSelected(node.id);
              if (node.id.startsWith("entity:")) onSelect?.(node.id.slice(7));
            }}
            onNodeDoubleClick={(_, node) => {
              if (node.data.sourceSceneId) onOpen(node.data.sourceSceneId);
            }}
          >
            <Background color="#303844" gap={28} />
            <Controls showInteractive={false} />
          </ReactFlow>
        )}
      </section>
    </main>
  );
}
