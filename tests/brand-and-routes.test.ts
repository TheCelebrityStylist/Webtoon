import { describe, expect, it } from "vitest";
import { brand, site } from "@/lib/site";
import { marketingBySlug, marketingPages, pricingConfig } from "@/lib/marketing";

describe("centralized brand and public product architecture",()=>{
  it("uses one working brand configuration with an explicit legal caveat",()=>{
    expect(site.name).toBe(brand.name);
    expect(brand.name).toBe("Asterism");
    expect(brand.legalStatus.toLowerCase()).toContain("unverified");
  });
  it("covers core product, intelligence, format, integration, language, and trust routes",()=>{
    const expected=["product","story-graph","characters","relationships","worldbuilding","timeline","continuity","revision","translation","formats","novel-writing","screenwriting","tv-writing","webtoon-writing","manga-writing","game-writing","google-docs","google-sheets","google-drive","google-calendar","languages/english","languages/dutch","languages/german","languages/spanish","languages/portuguese","pricing","security","privacy"];
    for(const slug of expected)expect(marketingBySlug.has(slug),slug).toBe(true);
  });
  it("gives every configured page product proof, internal routes, and a composition kind",()=>{
    for(const page of marketingPages){expect(page.proof.length).toBeGreaterThanOrEqual(3);expect(page.interaction.output.length).toBeGreaterThan(20);expect(page.links.length).toBeGreaterThanOrEqual(3);expect(page.kind).toBeTruthy()}
  });
  it("keeps public pricing in founding-access mode without invented prices",()=>{
    expect(pricingConfig.mode).toBe("founding-access");
    expect(pricingConfig.plans).toHaveLength(3);
    expect(JSON.stringify(pricingConfig)).not.toMatch(/[€$£]\d|commercial approval/i);
  });
});
