import { demoKeyBranch, demoKeyComparison, demoMainBranch } from "./fixtures";

export type StoryBranch = { id: string; name: string; parentId?: string; forkSceneId?: string; forkSceneTitle?: string; status: "ACTIVE"|"MERGED"|"ARCHIVED"; active: boolean; changedScenes: number; openConsequences: number; mergeState: "unmerged"|"merged" };
export type BranchCollection = { branches: StoryBranch[]; activeBranchId: string; version: number; stale?: boolean };
export type StoryChange = { id: string; kind: "scene"|"state"|"knowledge"|"payoff"; title: string; before: string; after: string; sceneId?: string; sceneTitle?: string; selected: boolean };
export type StoryConsequence = { id: string; title: string; detail: string; severity: "information"|"warning"; sceneId?: string; sceneTitle?: string; resolved: boolean };
export type BranchComparison = { branchId: string; baseName: string; branchName: string; changedSentence: string; changes: StoryChange[]; consequences: StoryConsequence[] };
export type StoryworldProjection = { nodes: unknown[]; edges: unknown[]; storyPoint: number };
export type CompileResult = { branchId: string; consequences: StoryConsequence[]; calculatedAt: string };
export type MergeResult = { mergeId: string; resultingVersion: number; message: string };
export type RevertResult = { resultingVersion: number; message: string };
export type EntityState = { entityId: string; facts: Array<{ label: string; value: string; evidence: string; sceneId: string }> };
export type StoryTimeProjection = { branchId: string; sequence: number; label: string; entityStates: EntityState[] };
export type LoadWorldInput = { projectId: string; branchId?: string; sequence?: number };
export type CreateBranchInput = { projectId: string; name: string; sceneId: string; sceneTitle?: string; evidence?: string; blockId?: string; startOffset?: number; endOffset?: number; snapshotSequence?: number; forkManuscriptSequence?: number };
export type MergeBranchInput = { projectId: string; branchId: string; changeIds: string[]; expectedVersion: number };
export type RevertMergeInput = { projectId: string; mergeId: string; expectedVersion: number };
export type EntityStateInput = { projectId: string; branchId: string; entityId: string; sequence?: number };
export type StoryTimeInput = { projectId: string; branchId: string; sequence: number };

export interface StoryworldDataSource {
  loadWorld(input: LoadWorldInput): Promise<StoryworldProjection>;
  loadBranches(projectId: string): Promise<BranchCollection>;
  loadBranch(branchId: string): Promise<StoryBranch>;
  createBranch(input: CreateBranchInput): Promise<StoryBranch>;
  compareBranch(branchId: string): Promise<BranchComparison>;
  compileBranch(branchId: string): Promise<CompileResult>;
  mergeBranch(input: MergeBranchInput): Promise<MergeResult>;
  revertMerge(input: RevertMergeInput): Promise<RevertResult>;
  loadEntityState(input: EntityStateInput): Promise<EntityState>;
  loadStoryTime(input: StoryTimeInput): Promise<StoryTimeProjection>;
}

export class StoryworldDataError extends Error {
  constructor(message: string, readonly code: "offline"|"unauthorized"|"unavailable"|"conflict", readonly retryable = true) { super(message); }
}
type Store = { version: number; activeBranchId: string; branches: StoryBranch[]; comparisons: Record<string, BranchComparison>; lastMerge?: { id: string; branchId: string } };
const key = (id: string) => `morrow:storyworld:${id}:v1`;
const seed = (): Store => ({ version: 1, activeBranchId: "main", branches: [demoMainBranch, demoKeyBranch], comparisons: { [demoKeyBranch.id]: demoKeyComparison } });
const read = (id: string): Store => { if (typeof window === "undefined") return seed(); try { const raw = localStorage.getItem(key(id)); return raw ? { ...seed(), ...JSON.parse(raw) as Store } : seed(); } catch { return seed(); } };
const write = (id: string, value: Store) => { if (typeof window !== "undefined") localStorage.setItem(key(id), JSON.stringify(value)); };

export class DemoStoryworldDataSource implements StoryworldDataSource {
  constructor(private projectId: string) {}
  async loadWorld() { return { nodes: [], edges: [], storyPoint: 1 }; }
  async loadBranches() { const s=read(this.projectId); return { branches:s.branches,activeBranchId:s.activeBranchId,version:s.version }; }
  async loadBranch(id:string) { const item=read(this.projectId).branches.find(x=>x.id===id); if(!item) throw new StoryworldDataError("That story path no longer exists.","unavailable",false); return item; }
  async createBranch(input:CreateBranchInput) { const s=read(this.projectId); const branch:StoryBranch={id:`demo-${crypto.randomUUID()}`,name:input.name||"Untitled path",parentId:s.activeBranchId,forkSceneId:input.sceneId,forkSceneTitle:input.sceneTitle,status:"ACTIVE",active:true,changedScenes:0,openConsequences:0,mergeState:"unmerged"}; s.branches=s.branches.map(x=>({...x,active:false})).concat(branch);s.activeBranchId=branch.id;s.version++;s.comparisons[branch.id]={branchId:branch.id,baseName:"Main",branchName:branch.name,changedSentence:input.evidence||"No manuscript changes yet.",changes:[],consequences:[]};write(this.projectId,s);return branch; }
  async compareBranch(id:string) { return read(this.projectId).comparisons[id] ?? {branchId:id,baseName:"Main",branchName:(await this.loadBranch(id)).name,changedSentence:"No manuscript changes yet.",changes:[],consequences:[]}; }
  async compileBranch(id:string) { return {branchId:id,consequences:(await this.compareBranch(id)).consequences,calculatedAt:new Date().toISOString()}; }
  async mergeBranch(input:MergeBranchInput) { const s=read(this.projectId);if(s.version!==input.expectedVersion)throw new StoryworldDataError("This story changed in another view.","conflict");const id=`merge-${crypto.randomUUID()}`;s.version++;s.lastMerge={id,branchId:input.branchId};s.branches=s.branches.map(x=>x.id===input.branchId?{...x,status:"MERGED",mergeState:"merged"}:x);write(this.projectId,s);return{mergeId:id,resultingVersion:s.version,message:"The selected story changes were merged. You can undo this safely."};}
  async revertMerge(input:RevertMergeInput) { const s=read(this.projectId);if(s.version!==input.expectedVersion||s.lastMerge?.id!==input.mergeId)throw new StoryworldDataError("The story changed after this merge.","conflict");s.version++;s.branches=s.branches.map(x=>x.id===s.lastMerge?.branchId?{...x,status:"ACTIVE",mergeState:"unmerged"}:x);delete s.lastMerge;write(this.projectId,s);return{resultingVersion:s.version,message:"Merge undone. The alternate path is still available."};}
  async loadEntityState(input:EntityStateInput){return{entityId:input.entityId,facts:[]};}
  async loadStoryTime(input:StoryTimeInput){return{branchId:input.branchId,sequence:input.sequence,label:`Story point ${input.sequence}`,entityStates:[]};}
}

async function request<T>(url:string,init?:RequestInit):Promise<T>{if(typeof navigator!=="undefined"&&!navigator.onLine)throw new StoryworldDataError("You are offline. Your manuscript is safe.","offline");let response:Response;try{response=await fetch(url,{...init,headers:{"content-type":"application/json",...(init?.headers||{})}});}catch{throw new StoryworldDataError("Branch history is temporarily unavailable.","unavailable");}const body=await response.json().catch(()=>({}));if(!response.ok)throw new StoryworldDataError(response.status===401?"Sign in again to view branch history.":"Branch history is temporarily unavailable.",response.status===401?"unauthorized":response.status===409?"conflict":"unavailable",response.status!==401);return body as T;}
type ApiBranch={id:string;name:string;parentId?:string;forkSceneId?:string;status:"ACTIVE"|"MERGED"|"ARCHIVED";active:boolean;_count:{sceneOverrides:number;diagnostics:number}};
const human=(x:ApiBranch):StoryBranch=>({id:x.id,name:x.name,parentId:x.parentId,forkSceneId:x.forkSceneId,status:x.status,active:x.active,changedScenes:x._count.sceneOverrides,openConsequences:x._count.diagnostics,mergeState:x.status==="MERGED"?"merged":"unmerged"});
export class ProductionStoryworldDataSource implements StoryworldDataSource {
  constructor(private projectId:string){}
  loadWorld(input:LoadWorldInput){return request<StoryworldProjection>(`/api/projects/${input.projectId}/storyworld/branches/${input.branchId||"main"}/projection${input.sequence===undefined?"":`?sequence=${input.sequence}`}`);}
  async loadBranches(){const r=await request<{branches:ApiBranch[];universeVersion:number}>(`/api/projects/${this.projectId}/storyworld/branches`);const branches=r.branches.map(human);return{branches,activeBranchId:branches.find(x=>x.active)?.id||branches[0]?.id||"",version:r.universeVersion};}
  async loadBranch(id:string){const item=(await this.loadBranches()).branches.find(x=>x.id===id);if(!item)throw new StoryworldDataError("That story path no longer exists.","unavailable",false);return item;}
  async createBranch(input:CreateBranchInput){const r=await request<{branch:ApiBranch}>(`/api/projects/${this.projectId}/storyworld/branches`,{method:"POST",body:JSON.stringify(input)});return human(r.branch);}
  async compareBranch(id:string){const r=await request<{sceneChanges:Array<{sceneId:string;baseSequence:number;branchSequence:number}>}>(`/api/projects/${this.projectId}/storyworld/branches/${id}/compare`);const branch=await this.loadBranch(id);return{branchId:id,baseName:"Main",branchName:branch.name,changedSentence:"Open the changed scene to inspect the exact prose.",changes:r.sceneChanges.map(x=>({id:x.sceneId,kind:"scene" as const,title:"Scene manuscript changed",before:`Main story point ${x.baseSequence}`,after:`Branch story point ${x.branchSequence}`,sceneId:x.sceneId,selected:true})),consequences:[]};}
  compileBranch(id:string){return request<CompileResult>(`/api/projects/${this.projectId}/storyworld/branches/${id}/compile`,{method:"POST"});}
  async mergeBranch(input:MergeBranchInput){const r=await request<{mergeCommitId:string;resultingVersion:number}>(`/api/projects/${this.projectId}/storyworld/branches/${input.branchId}/merge`,{method:"POST",body:JSON.stringify({expectedUniverseVersion:input.expectedVersion,selectedChanges:{sceneIds:input.changeIds,eventIds:[]}})});return{mergeId:r.mergeCommitId,resultingVersion:r.resultingVersion,message:"The selected story changes were merged. You can undo this safely."};}
  async revertMerge(input:RevertMergeInput){const r=await request<{resultingVersion:number}>(`/api/projects/${this.projectId}/storyworld/commits/${input.mergeId}/revert`,{method:"POST",body:JSON.stringify({expectedUniverseVersion:input.expectedVersion})});return{resultingVersion:r.resultingVersion,message:"Merge undone. The alternate path is still available."};}
  loadEntityState(input:EntityStateInput){return request<EntityState>(`/api/projects/${input.projectId}/storyworld/branches/${input.branchId}/entities/${input.entityId}`);}
  loadStoryTime(input:StoryTimeInput){return request<StoryTimeProjection>(`/api/projects/${input.projectId}/storyworld/branches/${input.branchId}/projection?sequence=${input.sequence}`);}
}
