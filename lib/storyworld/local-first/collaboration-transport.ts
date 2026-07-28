export type SceneSyncRequest = {
  sceneId: string;
  branchId?: string;
  stateVector: Uint8Array;
  updates: Array<{ mutationId: string; bytes: Uint8Array }>;
};

export type SceneSyncResponse = {
  snapshotSequence: number;
  stateVector: Uint8Array;
  update: Uint8Array;
  acceptedMutationIds: string[];
};

export interface CollaborationTransport {
  sync(request: SceneSyncRequest, signal?: AbortSignal): Promise<SceneSyncResponse>;
  checkpoint(input: { sceneId: string; branchId?: string; sequence: number }, signal?: AbortSignal): Promise<{ checkpointId: string; sequence: number }>;
}

const encode = (value: Uint8Array) => Buffer.from(value).toString("base64");
const decode = (value: string) => new Uint8Array(Buffer.from(value, "base64"));

export class HttpCollaborationTransport implements CollaborationTransport {
  constructor(private readonly projectId: string) {}

  async sync(request: SceneSyncRequest, signal?: AbortSignal): Promise<SceneSyncResponse> {
    const response = await fetch(`/api/projects/${this.projectId}/scenes/${request.sceneId}/yjs/sync`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        branchId: request.branchId,
        stateVector: encode(request.stateVector),
        updates: request.updates.map((update) => ({ mutationId: update.mutationId, bytes: encode(update.bytes) })),
      }),
      signal,
    });
    if (!response.ok) throw Object.assign(new Error("Scene synchronization failed"), { status: response.status });
    const result = await response.json() as { snapshotSequence: number; stateVector: string; update: string; acceptedMutationIds: string[] };
    return { ...result, stateVector: decode(result.stateVector), update: decode(result.update) };
  }

  async checkpoint(input: { sceneId: string; branchId?: string; sequence: number }, signal?: AbortSignal) {
    const response = await fetch(`/api/projects/${this.projectId}/scenes/${input.sceneId}/checkpoint`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
      signal,
    });
    if (!response.ok) throw Object.assign(new Error("Checkpoint creation failed"), { status: response.status });
    return response.json() as Promise<{ checkpointId: string; sequence: number }>;
  }
}
