import { describe, expect, it } from "vitest";
import { fallbackWorldLayout, validWorldLayout, type LayoutNode } from "@/lib/storyworld/world-layout";
describe("Storyworld fallback layout",()=>{
  const nodes=Array.from({length:12},(_,index)=>({id:String(index),position:{x:0,y:0},data:{type:index<8?"scene":"person"}} as LayoutNode));
  it("places every node at a finite unique position",()=>{const result=fallbackWorldLayout(nodes);expect(new Set(result.map(x=>`${x.position.x}:${x.position.y}`)).size).toBe(result.length);expect(validWorldLayout(result,4)).toBe(true);});
  it("rejects a stacked graph",()=>expect(validWorldLayout(nodes,4)).toBe(false));
});
