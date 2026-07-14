import { test,expect } from "@playwright/test";
test("private writing entry points resolve without reader routes",async({request})=>{for(const path of ["/","/about","/sign-in","/sign-up"]){const response=await request.get(path);expect(response.ok()).toBe(true)}expect((await request.get("/discover")).status()).toBe(404)});
