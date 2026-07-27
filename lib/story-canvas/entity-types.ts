import type { EntityType } from "./types";

export type CanonEntityType = "CHARACTER" | "PLACE" | "OBJECT" | "EVENT" | "FACTION" | "QUESTION";

export function toCanonEntityType(type: EntityType | CanonEntityType): CanonEntityType {
  if (type === "person") return "CHARACTER";
  if (type === "place") return "PLACE";
  if (type === "object") return "OBJECT";
  if (type === "event") return "EVENT";
  if (type === "faction") return "FACTION";
  if (type === "question") return "QUESTION";
  return type;
}
