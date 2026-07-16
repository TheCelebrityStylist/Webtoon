import { z } from "zod";

export const manuscriptDraftSchema=z.object({
 schemaVersion:z.literal(1),key:z.string(),projectId:z.string(),sceneId:z.string(),baseRevision:z.number().int().nonnegative(),
 document:z.record(z.unknown()),text:z.string(),updatedAt:z.string(),syncState:z.enum(["pending","syncing","conflict","failed"]),attempts:z.number().int().nonnegative(),
});
export type ManuscriptDraft=z.infer<typeof manuscriptDraftSchema>;
export type LocalVersion={id:string;key:string;label:string;document:Record<string,unknown>;text:string;createdAt:string;baseRevision:number};
const DB="morrow-writing-v1",DRAFTS="drafts",VERSIONS="versions";
export const draftKey=(projectId:string,sceneId:string)=>`${projectId}:${sceneId}`;

function openDatabase(){return new Promise<IDBDatabase>((resolve,reject)=>{if(typeof indexedDB==="undefined")return reject(new Error("IndexedDB unavailable"));const request=indexedDB.open(DB,1);request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(DRAFTS))db.createObjectStore(DRAFTS,{keyPath:"key"});if(!db.objectStoreNames.contains(VERSIONS))db.createObjectStore(VERSIONS,{keyPath:"id"}).createIndex("key","key")};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error??new Error("IndexedDB failed"))})}
async function transact<T>(store:string,mode:IDBTransactionMode,action:(objectStore:IDBObjectStore,resolve:(value:T)=>void,reject:(reason?:unknown)=>void)=>void){const db=await openDatabase();return new Promise<T>((resolve,reject)=>{const transaction=db.transaction(store,mode);action(transaction.objectStore(store),resolve,reject);transaction.onerror=()=>reject(transaction.error);transaction.oncomplete=()=>db.close()})}
export async function putDraft(draft:ManuscriptDraft){manuscriptDraftSchema.parse(draft);await transact<void>(DRAFTS,"readwrite",(store,resolve,reject)=>{const request=store.put(draft);request.onsuccess=()=>resolve();request.onerror=()=>reject(request.error)})}
export async function getDraft(projectId:string,sceneId:string){return transact<ManuscriptDraft|null>(DRAFTS,"readonly",(store,resolve,reject)=>{const request=store.get(draftKey(projectId,sceneId));request.onsuccess=()=>{const parsed=manuscriptDraftSchema.safeParse(request.result);resolve(parsed.success?parsed.data:null)};request.onerror=()=>reject(request.error)})}
export async function deleteDraft(projectId:string,sceneId:string){await transact<void>(DRAFTS,"readwrite",(store,resolve,reject)=>{const request=store.delete(draftKey(projectId,sceneId));request.onsuccess=()=>resolve();request.onerror=()=>reject(request.error)})}
export async function putLocalVersion(version:LocalVersion){await transact<void>(VERSIONS,"readwrite",(store,resolve,reject)=>{const request=store.put(version);request.onsuccess=()=>resolve();request.onerror=()=>reject(request.error)})}
export async function listLocalVersions(projectId:string,sceneId:string){const key=draftKey(projectId,sceneId);return transact<LocalVersion[]>(VERSIONS,"readonly",(store,resolve,reject)=>{const request=store.index("key").getAll(key);request.onsuccess=()=>resolve((request.result as LocalVersion[]).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));request.onerror=()=>reject(request.error)})}
export function chooseRecoveryDraft(serverRevision:number,draft:ManuscriptDraft|null){if(!draft)return null;if(draft.baseRevision>serverRevision)return null;return draft.text.trim()?draft:null}
export function retryDelay(attempt:number){return Math.min(30_000,750*2**Math.max(0,attempt))}
export function createDraft(projectId:string,sceneId:string,baseRevision:number,document:Record<string,unknown>,text:string):ManuscriptDraft{return{schemaVersion:1,key:draftKey(projectId,sceneId),projectId,sceneId,baseRevision,document,text,updatedAt:new Date().toISOString(),syncState:"pending",attempts:0}}
