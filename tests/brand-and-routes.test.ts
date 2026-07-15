import { describe, expect, it } from "vitest";
import { brand, site } from "@/lib/site";
import { marketingBySlug, marketingPages, pricingConfig } from "@/lib/marketing";
import { articles, articleWordCount } from "@/lib/blog";

describe("centralized brand and public product architecture",()=>{
  it("uses one working brand configuration with an explicit legal caveat",()=>{
    expect(site.name).toBe(brand.name);
    expect(brand.name).toBe("Morrow");
    expect(brand.legalStatus.toLowerCase()).toContain("unverified");
  });
  it("covers core product, intelligence, format, integration, language, and trust routes",()=>{
    const expected=["product","story-graph","characters","relationships","worldbuilding","timeline","continuity","revision","translation","formats","novel-writing","screenwriting","tv-writing","webtoon-writing","manga-writing","game-writing","google-docs","google-sheets","google-drive","google-calendar","languages/english","languages/dutch","languages/german","languages/spanish","languages/portuguese","pricing","security","privacy"];
    for(const slug of expected)expect(marketingBySlug.has(slug),slug).toBe(true);
  });
  it("gives every configured page product proof, internal routes, and a composition kind",()=>{
    for(const page of marketingPages){expect(page.proof.length).toBeGreaterThanOrEqual(3);expect(page.interaction.output.length).toBeGreaterThan(20);expect(page.links.length).toBeGreaterThanOrEqual(3);expect(page.kind).toBeTruthy()}
  });
  it("keeps public pricing centralized with three clear plans",()=>{
    expect(pricingConfig.plans).toHaveLength(3);
    expect(pricingConfig.plans.every(plan=>plan.monthly.EUR>0)).toBe(true);
    expect(JSON.stringify(pricingConfig)).not.toMatch(/commercial approval|configured later/i);
  });
  it("replaces thin seed posts with a substantial search-intent pillar guide",()=>{
    expect(articles).toHaveLength(1);
    expect(articleWordCount(articles[0])).toBeGreaterThanOrEqual(2500);
    expect(articles[0].searchIntent.length).toBeGreaterThan(40);
    expect(articles[0].resource).toBeTruthy();
  });
});
