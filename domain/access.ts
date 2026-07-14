export type Role = "OWNER" | "WRITER" | "EDITOR" | "ARTIST" | "LETTERER" | "TRANSLATOR" | "PRODUCER" | "VIEWER";
export const canEditProject = (role: Role) => ["OWNER", "WRITER", "EDITOR"].includes(role);
export const canDeleteProject = (role: Role) => role === "OWNER";
export const belongsToWorkspace = (membershipWorkspaceId: string | null, resourceWorkspaceId: string) => membershipWorkspaceId === resourceWorkspaceId;
export const belongsToProject = (recordProjectId: string, requestedProjectId: string) => recordProjectId === requestedProjectId;

