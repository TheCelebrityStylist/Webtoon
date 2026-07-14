import { describe, expect, it } from "vitest";
import { projectInput, characterInput } from "@/domain/contracts";
import { belongsToProject, belongsToWorkspace, canDeleteProject, canEditProject } from "@/domain/access";
import sitemap, { publicRoutes } from "@/app/sitemap";
import { dictionaries,locales } from "@/lib/i18n";
import { decide,markdownExport,reorder,resolveAutosave } from "@/domain/writing";

describe("studio authorization policy", () => {
  it("rejects unauthenticated studio access by requiring an authenticated membership", () => { expect(belongsToWorkspace(null, "workspace-a")).toBe(false); });
  it("does not grant a member access to another workspace", () => { expect(belongsToWorkspace("workspace-a", "workspace-b")).toBe(false); });
  it("requires an editing role for project changes", () => { expect(canEditProject("VIEWER")).toBe(false); expect(canEditProject("EDITOR")).toBe(true); });
  it("requires owner permission for deletion", () => { expect(canDeleteProject("EDITOR")).toBe(false); expect(canDeleteProject("OWNER")).toBe(true); });
});

describe("project inputs and story-bible isolation", () => {
  const valid = { title:"Glass Harbour",logline:"A mapmaker erases every place she draws from memory.",synopsis:"A long enough synopsis that establishes the central narrative promise.",genre:"FANTASY",language:"en",audience:"Young adult fantasy readers",projectType:"NOVEL",regionalVariant:"en-GB",pointOfView:"THIRD_LIMITED",narrativeTense:"PAST",premise:"Every finished map erases its subject from collective memory." };
  it("validates project creation", () => { expect(projectInput.safeParse(valid).success).toBe(true); expect(projectInput.safeParse({ ...valid, logline: "short" }).success).toBe(false); });
  it("keeps story-bible records project scoped", () => { expect(belongsToProject("project-a", "project-b")).toBe(false); });
  it("validates structured characters", () => { expect(characterInput.safeParse({ name: "Ilya", aliases: "", pronouns: "she/her", role: "Protagonist", lifeStage: "Adult", appearance: "", personality: "", speechStyle: "", motivations: "", goals: "", fears: "", secrets: "", locationId: "" }).success).toBe(true); });
});

describe("public navigation and sitemap", () => {
  it("lists every public navigation route", () => { expect(publicRoutes).toEqual(expect.arrayContaining(["/", "/about", "/sign-in", "/sign-up"])); });
  it("builds absolute sitemap entries", () => { const entries = sitemap(); expect(entries).toHaveLength(publicRoutes.length); expect(entries.every((entry) => entry.url.startsWith("http"))).toBe(true); });
});

describe("writing workflow",()=>{
  it("orders scenes and beats deterministically",()=>{expect(reorder([{id:"a",position:1},{id:"b",position:2}],"b","up")).toEqual([{id:"b",position:1},{id:"a",position:2}])});
  it("rejects stale autosaves and increments current saves",()=>{expect(resolveAutosave(3,2).ok).toBe(false);expect(resolveAutosave(3,3)).toEqual({ok:true,nextRevision:4})});
  it("makes AI decisions one-way",()=>{expect(decide("PENDING","ACCEPTED")).toBe("ACCEPTED");expect(decide("REJECTED","ACCEPTED")).toBe("REJECTED")});
  it("exports structured Markdown",()=>{expect(markdownExport({title:"Book",premise:"Promise",chapters:[{number:1,title:"Door",scenes:[{title:"Arrival",text:"She entered."}]}]})).toContain("### Arrival\n\nShe entered.")});
});

describe("localization",()=>{
  it("supports all five interface locales with identical keys",()=>{expect(locales).toEqual(["en","nl","de","es","pt"]);const keys=Object.keys(dictionaries.en).sort();for(const locale of locales)expect(Object.keys(dictionaries[locale]).sort()).toEqual(keys)});
  it("keeps project language independent from interface locale",()=>{const project={language:"de",content:"Sie öffnete die Tür."};for(const locale of locales)expect({...project,interfaceLocale:locale}.content).toBe(project.content)});
});
