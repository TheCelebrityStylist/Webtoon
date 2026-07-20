"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { quickCreate } from "@/app/actions/create";

type SearchItem = { id: string; label: string; detail: string; href: string; type: string };
const areas = [["⌂","Home","overview"],["✎","Write","chapters"],["◇","Plan","plan"],["◎","Characters","characters"],["⌖","Places","places"],["◈","World","world"],["↝","Timeline","timeline"],["✓","Review","review"],["⌕","Search","search"]] as const;
const creates = [["scene","Scene","Start a new piece of prose"],["chapter","Chapter","Add structure"],["character","Character","Only a name is required"],["place","Place","Create without leaving your flow"],["event","Timeline event","Place something in story time"],["object","Object","Track ownership and location"],["thread","Plot thread","Connect scenes across the story"]] as const;

export function StudioWorkspaceChrome({projectId,projectTitle,children,items}:{projectId:string;projectTitle:string;children:React.ReactNode;items:SearchItem[]}) {
  const pathname=usePathname(),router=useRouter();
  const [createOpen,setCreateOpen]=useState(false),[paletteOpen,setPaletteOpen]=useState(false),[kind,setKind]=useState<(typeof creates)[number][0]>("scene"),[query,setQuery]=useState("");
  const dialog=useRef<HTMLDialogElement>(null),palette=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const onKey=(event:KeyboardEvent)=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){event.preventDefault();setPaletteOpen(true)}if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="n"){event.preventDefault();setCreateOpen(true)}};addEventListener("keydown",onKey);return()=>removeEventListener("keydown",onKey)},[]);
  useEffect(()=>{if(createOpen)dialog.current?.showModal();else dialog.current?.close()},[createOpen]);
  useEffect(()=>{if(paletteOpen)palette.current?.showModal();else palette.current?.close()},[paletteOpen]);
  const results=useMemo(()=>items.filter(item=>`${item.label} ${item.detail} ${item.type}`.toLowerCase().includes(query.toLowerCase())).slice(0,12),[items,query]);
  const base=`/studio/projects/${projectId}`;
  return <div className="workspace-shell">
    <aside className="workspace-rail"><Link className="workspace-mark" href="/studio/projects" aria-label="All projects">m</Link><nav aria-label="Project areas">{areas.map(([icon,label,slug])=><Link key={slug} href={`${base}/${slug}`} aria-current={pathname.includes(`/${slug}`)?"page":undefined} title={label}><i aria-hidden>{icon}</i><span>{label}</span></Link>)}</nav><button className="rail-create" onClick={()=>setCreateOpen(true)} aria-label="Create something new">＋<span>Create</span></button></aside>
    <section className="workspace-frame"><header className="workspace-topbar"><div><Link href="/studio/projects">Projects</Link><span>›</span><strong>{projectTitle}</strong></div><div><button onClick={()=>setPaletteOpen(true)}>⌘ K <span>Search or run a command</span></button><span className="save-cloud">Saved locally and to cloud</span></div></header>{children}</section>
    <dialog ref={dialog} className="create-dialog" onClose={()=>setCreateOpen(false)}><header><div><small>GLOBAL CREATE</small><h2>Create in {projectTitle}</h2></div><button onClick={()=>setCreateOpen(false)} aria-label="Close create dialog">×</button></header><div className="create-grid"><nav aria-label="What to create">{creates.map(([value,label,description])=><button key={value} aria-pressed={kind===value} onClick={()=>setKind(value)}><b>{label}</b><span>{description}</span></button>)}</nav><form action={quickCreate}><input type="hidden" name="projectId" value={projectId}/><input type="hidden" name="kind" value={kind}/><p className="eyebrow">{creates.find(item=>item[0]===kind)?.[1]}</p><label><span>Name</span><input name="name" autoFocus required maxLength={160} placeholder={`Name this ${kind}`}/></label><label><span>{kind==="character"?"Role":kind==="place"?"Short description":kind==="object"?"Object type":"Optional note"}</span><textarea name="detail" placeholder="You can add everything else later."/></label><footer><button type="button" onClick={()=>setCreateOpen(false)}>Cancel</button><button className="button" type="submit">Create {kind}</button></footer></form></div></dialog>
    <dialog ref={palette} className="command-dialog" onClose={()=>setPaletteOpen(false)}><header><input aria-label="Search commands and story" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Go to a scene, character, place…" autoFocus/><kbd>ESC</kbd></header><section><button onClick={()=>{setPaletteOpen(false);setCreateOpen(true)}}><i>＋</i><span><b>Create something</b><small>Scene, character, place, event…</small></span><kbd>⌘N</kbd></button>{results.map(item=><button key={`${item.type}-${item.id}`} onClick={()=>{setPaletteOpen(false);router.push(item.href)}}><i>{item.type.slice(0,1)}</i><span><b>{item.label}</b><small>{item.type} · {item.detail}</small></span></button>)}</section></dialog>
  </div>
}
