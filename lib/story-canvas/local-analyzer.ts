import type { CanvasScene, StoryAnalyzer, StoryEntity, StoryObservation } from "./types";

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const entityPattern = (entity: StoryEntity) => [entity.name, ...entity.aliases].sort((a, b) => b.length - a.length).map(escape).join("|");
const id = (sceneId: string, paragraphId: string, subject: string, predicate: string, value: string) => `${sceneId}:${paragraphId}:${subject}:${predicate}:${value}`.toLowerCase().replace(/\s+/g, "-");

function evidence(text: string, quote: string) {
  const start = text.toLowerCase().indexOf(quote.toLowerCase());
  return { quote: text.slice(start, start + quote.length), start, end: start + quote.length };
}

export class LocalDemoStoryAnalyzer implements StoryAnalyzer {
  analyze({ scene, paragraphId, text, entities }: { scene: CanvasScene; paragraphId: string; text: string; entities: StoryEntity[] }): StoryObservation[] {
    const proposals: StoryObservation[] = [];
    const people = entities.filter((entity) => entity.type === "person");
    const places = entities.filter((entity) => entity.type === "place");
    const objects = entities.filter((entity) => entity.type === "object");
    const push = (subject: StoryEntity, predicate: StoryObservation["predicate"], value: string, quote: string, kind: StoryObservation["kind"], title: string) => {
      const range = evidence(text, quote);
      if (range.start < 0) return;
      proposals.push({ id: id(scene.id, paragraphId, subject.id, predicate, value), subjectId: subject.id, predicate, value, sceneId: scene.id, paragraphId, ...range, status: "proposed", kind, title });
    };

    const mentions = [...people, ...places, ...objects].flatMap((entity) => {
      const match = new RegExp(`\\b(${entityPattern(entity)})\\b`, "i").exec(text);
      return match ? [{ entity, match, start: match.index, end: match.index + match[0].length }] : [];
    }).sort((a, b) => (b.end - b.start) - (a.end - a.start));
    const accepted: typeof mentions = [];
    for (const mention of mentions) if (!accepted.some((item) => mention.start >= item.start && mention.end <= item.end)) accepted.push(mention);
    for (const { entity, match } of accepted.sort((a, b) => a.start - b.start)) push(entity, "exists", entity.name, match[0], entity.type, `${entity.type === "person" ? "Person" : entity.type === "place" ? "Place" : "Object"} detected`);
    for (const person of people) {
      for (const place of places) {
        const match = new RegExp(`(?:^|[.!?]\\s+)(${entityPattern(person)})\\s+(?:entered|enters)\\s+(${entityPattern(place)})\\b`, "i").exec(text);
        if (match && !/\b(carrying|carried|picked up)\b/i.test(text)) push(person, "entered", place.name, match[0], "state", `${person.name.split(" ")[0]} enters ${place.name}`);
      }
      for (const object of objects) {
        const carried = new RegExp(`(?:^|[.!?]\\s+)(${entityPattern(person)})\\b[^.!?]{0,45}\\b(?:carrying|carried|picked up)\\s+(?:the\\s+)?(${entityPattern(object)})\\b`, "i").exec(text);
        if (carried) push(object, "holder", person.name, carried[0], "state", `${person.name.split(" ")[0]} carries the ${object.name.toLowerCase()}`);
        for (const place of places) {
          const threw = new RegExp(`(?:^|[.!?]\\s+)(${entityPattern(person)})\\s+threw\\s+(?:the\\s+)?(${entityPattern(object)})\\s+into\\s+(?:the\\s+)?(${entityPattern(place)})\\b`, "i").exec(text);
          if (threw) push(object, "location", place.name, threw[0], "state", `${object.name} is located in the ${place.name.toLowerCase()}`);
        }
      }
    }
    return proposals.filter((proposal, index) => proposals.findIndex((candidate) => candidate.id === proposal.id) === index);
  }
}

export function changedParagraphs(previous: string, current: string) {
  const before = previous.split(/\n\s*\n/);
  return current.split(/\n\s*\n/).map((text, index) => ({ id: `paragraph-${index}`, text })).filter((paragraph, index) => paragraph.text.trim().split(/\s+/).length >= 3 && paragraph.text.trim() !== (before[index] ?? "").trim());
}
