"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, GitBranch, RotateCcw, ShieldCheck } from "lucide-react";
import { DemoStoryworldDataSource, ProductionStoryworldDataSource, type BranchCollection, type BranchComparison, type StoryworldDataSource } from "@/lib/storyworld/data-source";
import styles from "./styles/BranchWorkspace.module.css";

export function StoryBranches({ projectId, currentSceneId, onOpenScene, source, onContinueWriting }: { projectId:string;currentSceneId:string;onOpenScene:(id:string)=>void;source?:StoryworldDataSource;onContinueWriting?:()=>void }) {
  const data = useMemo(() => source ?? (projectId === "museum-of-lost-hours" ? new DemoStoryworldDataSource(projectId) : new ProductionStoryworldDataSource(projectId)), [projectId, source]);
  const [collection,setCollection]=useState<BranchCollection>();
  const [selected,setSelected]=useState("main");
  const [comparison,setComparison]=useState<BranchComparison>();
  const [status,setStatus]=useState<"loading"|"ready"|"working"|"error">("loading");
  const [notice,setNotice]=useState("");
  const [mergeId,setMergeId]=useState("");
  const load=useCallback(async()=>{setStatus("loading");try{const result=await data.loadBranches(projectId);setCollection(result);setSelected(value=>result.branches.some(x=>x.id===value)?value:result.activeBranchId);setStatus("ready");}catch{setStatus("error");}},[data,projectId]);
  useEffect(()=>{void load();},[load]);
  useEffect(()=>{if(!collection)return;const branch=collection.branches.find(x=>x.id===selected);if(!branch?.parentId){setComparison(undefined);return;}let active=true;void data.compareBranch(selected).then(value=>{if(active)setComparison(value);}).catch(()=>setStatus("error"));return()=>{active=false};},[collection,data,selected]);
  if(status==="loading"&&!collection)return <main className={styles.loading} data-testid="branches-workspace"><i/><i/><i/><p>Opening your story paths…</p></main>;
  if(status==="error"&&!collection)return <main className={styles.error} data-testid="branches-workspace"><ShieldCheck/><h1>Your manuscript is safe.</h1><p>Branch history is temporarily unavailable.</p><div><button onClick={()=>void load()}>Retry</button><button onClick={onContinueWriting}>Continue writing</button></div></main>;
  const branch=collection?.branches.find(x=>x.id===selected);
  const changes=comparison?.changes.filter(x=>x.selected)??[];
  const merge=async()=>{if(!collection||!branch)return;setStatus("working");try{const result=await data.mergeBranch({projectId,branchId:branch.id,changeIds:changes.map(x=>x.id),expectedVersion:collection.version});setMergeId(result.mergeId);setCollection({...collection,version:result.resultingVersion});setNotice(result.message);}catch(error){setNotice(error instanceof Error?error.message:"The changes could not be merged.");}setStatus("ready");};
  const undo=async()=>{if(!collection||!mergeId)return;setStatus("working");const result=await data.revertMerge({projectId,mergeId,expectedVersion:collection.version});setCollection({...collection,version:result.resultingVersion});setMergeId("");setNotice(result.message);setStatus("ready");};
  return <main className={styles.workspace} data-testid="branches-workspace">
    <aside className={styles.tree}><small>STORY PATHS</small><h1>Branches</h1><p>Explore changes without risking Main.</p>{collection?.branches.map(item=><button key={item.id} aria-pressed={selected===item.id} onClick={()=>setSelected(item.id)}><GitBranch/><span><strong>{item.name}</strong><small>{item.parentId?`${item.changedScenes} changed scene`:"Source manuscript"}</small></span>{item.openConsequences>0&&<b>{item.openConsequences}</b>}</button>)}<button className={styles.create}>＋ Create a branch</button></aside>
    <section className={styles.detail}><header><small>SELECTED PATH</small><h2>{branch?.name}</h2><p>{branch?.parentId?`Forked from ${branch.forkSceneTitle??"The conversation room"}`:"The dependable source story."}</p></header><div className={styles.metrics}><span>Changed<strong>{branch?.changedScenes??0} scenes</strong></span><span>Verified effects<strong>{comparison?.changes.length??0}</strong></span><span>Open repair tasks<strong>{comparison?.consequences.length??0}</strong></span></div><button className={styles.open} onClick={()=>onOpenScene(currentSceneId)}>Open branch manuscript <ArrowRight/></button>{comparison?<div className={styles.compare} aria-label="Main and branch comparison"><header><span>MAIN</span><span>{branch?.name.toUpperCase()}</span></header><blockquote>{comparison.changedSentence}</blockquote>{comparison.changes.map(change=><article key={change.id}><h3>{change.title}</h3><p><del>{change.before}</del><ArrowRight/><ins>{change.after}</ins></p></article>)}</div>:<div className={styles.empty}><ShieldCheck/><h3>Main is unchanged</h3><p>Create or select a branch to compare another path with the source manuscript.</p></div>}</section>
    <aside className={styles.impact}><small>STORY CONSEQUENCES</small><h2>{comparison?"What this changes":"Main is dependable"}</h2>{comparison?.consequences.map(item=><article key={item.id}><strong>{item.title}</strong><p>{item.detail}</p></article>)}{comparison&&<button onClick={()=>void merge()} disabled={status==="working"}>Preview and merge {changes.length} changes</button>}{mergeId&&<button onClick={()=>void undo()}><RotateCcw/> Undo merge</button>}{notice&&<p role="status">{notice}</p>}{!comparison&&<p>Consequences appear here only when supported by manuscript evidence.</p>}</aside>
  </main>;
}
