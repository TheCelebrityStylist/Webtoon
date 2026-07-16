import { demoStateSchema, type DemoState } from "./types";
import { createSeededDemoState } from "./fixtures";
export const DEMO_STORAGE_KEY="morrow.demo.v1";
export function readDemoState(storage:Pick<Storage,"getItem">):DemoState{try{const raw=storage.getItem(DEMO_STORAGE_KEY);if(!raw)return createSeededDemoState();return demoStateSchema.parse(JSON.parse(raw));}catch{return createSeededDemoState()}}
export function writeDemoState(storage:Pick<Storage,"setItem">,state:DemoState){storage.setItem(DEMO_STORAGE_KEY,JSON.stringify(state))}
export function clearDemoState(storage:Pick<Storage,"removeItem">){storage.removeItem(DEMO_STORAGE_KEY)}
