"use client";
import { createContext,useCallback,useContext,useEffect,useMemo,useRef,useState,type ReactNode } from "react";
import { createSeededDemoState } from "@/lib/demo/fixtures";
import { clearDemoState,readDemoState,writeDemoState } from "@/lib/demo/persistence";
import type { DemoState } from "@/lib/demo/types";

type SaveStatus="Saved"|"Saving"|"Offline"|"Conflict"|"Save failed"|"Restored";
type DemoContextValue={state:DemoState;status:SaveStatus;hydrated:boolean;notice:string;canUndo:boolean;mutate:(label:string,recipe:(state:DemoState)=>DemoState)=>void;undo:()=>void;reset:()=>void;clear:()=>void;setNotice:(value:string)=>void};
const DemoContext=createContext<DemoContextValue|null>(null);
export function DemoProvider({children}:{children:ReactNode}){
 const [state,setState]=useState<DemoState>(()=>createSeededDemoState());const [status,setStatus]=useState<SaveStatus>("Saved");const [hydrated,setHydrated]=useState(false);const [notice,setNotice]=useState("");const history=useRef<DemoState[]>([]);const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{setState(readDemoState(localStorage));setHydrated(true)},[]);
 const persist=useCallback((next:DemoState)=>{setStatus(navigator.onLine?"Saving":"Offline");if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>{try{writeDemoState(localStorage,next);setStatus(navigator.onLine?"Saved":"Offline")}catch{setStatus("Save failed")}},450)},[]);
 const mutate=useCallback((label:string,recipe:(current:DemoState)=>DemoState)=>{setState(current=>{history.current=[...history.current.slice(-19),current];const next=recipe(structuredClone(current));persist(next);return next});setNotice(label)},[persist]);
 const undo=useCallback(()=>{const previous=history.current.pop();if(!previous){setNotice("Nothing to undo.");return}setState(previous);persist(previous);setNotice("Last change undone.")},[persist]);
 const reset=useCallback(()=>{const next=createSeededDemoState();history.current=[];setState(next);writeDemoState(localStorage,next);setStatus("Restored");setNotice("Seeded demo restored.")},[]);
 const clear=useCallback(()=>{clearDemoState(localStorage);reset()},[reset]);
 const value=useMemo(()=>({state,status,hydrated,notice,canUndo:history.current.length>0,mutate,undo,reset,clear,setNotice}),[state,status,hydrated,notice,mutate,undo,reset,clear]);
 return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}
export function useDemo(){const value=useContext(DemoContext);if(!value)throw new Error("useDemo must be used inside DemoProvider");return value}
