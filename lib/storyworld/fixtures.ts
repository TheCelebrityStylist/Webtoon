import type { BranchComparison, StoryBranch } from "./data-source";

export const demoMainBranch: StoryBranch = {
  id: "main", name: "Main", status: "ACTIVE", active: true,
  changedScenes: 0, openConsequences: 0, mergeState: "unmerged",
};

export const demoKeyBranch: StoryBranch = {
  id: "key-left-behind", name: "Key left behind", parentId: "main",
  forkSceneId: "scene-3", forkSceneTitle: "The conversation room",
  status: "ACTIVE", active: false, changedScenes: 1,
  openConsequences: 2, mergeState: "unmerged",
};

export const demoKeyComparison: BranchComparison = {
  branchId: demoKeyBranch.id,
  baseName: "Main",
  branchName: demoKeyBranch.name,
  changedSentence: "Lena leaves the Silver Key beside the portrait.",
  changes: [
    { id: "key-location", kind: "state", title: "Silver Key location changed", before: "Lena’s hand", after: "River", sceneTitle: "The conversation room", selected: true },
    { id: "tomas-knowledge", kind: "knowledge", title: "Tomas does not learn about the key", before: "Tomas knows Lena has it", after: "Tomas remains unaware", selected: true },
    { id: "archive-payoff", kind: "payoff", title: "The archive-door payoff is unresolved", before: "The door can be opened", after: "The key is missing", selected: true },
  ],
  consequences: [
    { id: "door", title: "The archive door can no longer open", detail: "Repair by returning the key before the flooded archive scene.", severity: "warning", resolved: false },
    { id: "tomas", title: "Tomas cannot act on knowledge he never received", detail: "Give Tomas another supported way to discover the key.", severity: "warning", resolved: false },
  ],
};
