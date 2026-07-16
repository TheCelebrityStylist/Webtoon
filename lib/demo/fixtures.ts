import type { DemoState } from "./types";

export function createSeededDemoState():DemoState{return {
  version:1,sessionId:`demo-${Date.now()}`,projectTitle:"The Museum of Lost Hours",currentSceneId:"conversation-room",keyOwner:"Lena Ortiz",writingGoal:750,reviewFilter:"All",timelineMode:"story",
  scenes:[
    {id:"arrival",title:"Before opening",chapter:"Chapter 8",content:"<p>Lena arrived before the museum opened. Every clock in the west hall had stopped at 09:10.</p>",goal:"Establish the impossible stillness.",characters:["Lena Ortiz"],location:"West hall",notes:[],order:0},
    {id:"conversation-room",title:"The conversation room",chapter:"Chapter 8",content:"<p>Lena turned the silver key over in her palm. It was colder than she remembered.</p><p>“I meant to give this to Tomas,” she said, closing her hand around the key.</p>",goal:"Confront the changed memory.",characters:["Lena Ortiz","Tomas Reed"],location:"Conservation room",notes:["Hold the silence after Tomas answers."],order:1},
    {id:"portrait",title:"The restored portrait",chapter:"Chapter 9",content:"<p>The portrait’s smile was not the one in Lena’s notes.</p>",goal:"Reveal that the restoration changed more than paint.",characters:["Lena Ortiz"],location:"Portrait gallery",notes:[],order:2},
  ],
  characters:[
    {id:"lena",name:"Lena Ortiz",role:"Conservator and reluctant witness",goal:"Prove the portrait changes memory",fear:"Her own memories were restored too",secret:"She saw the portrait move before the clocks stopped",emotion:"Guarded",location:"Conservation room",facts:["Tomas remembers the earlier photograph"],beliefs:["The key opens only the archive"],relationships:["Tomas Reed · wary trust"],objects:["Silver key"],scenes:["arrival","conversation-room","portrait"],history:["Entered the conservation room · Chapter 8"]},
    {id:"tomas",name:"Tomas Reed",role:"Museum archivist",goal:"Keep the archive sealed",fear:"Lena will remember their first meeting",secret:"He catalogued a second silver key",emotion:"Watchful",location:"Conservation room",facts:["The west hall clocks stopped at 09:10"],beliefs:[],relationships:["Lena Ortiz · wary trust"],objects:[],scenes:["conversation-room"],history:[]},
  ],
  issues:[{id:"silver-key",title:"Possible contradiction: silver key",status:"open",reminder:false}],
  findings:[
    {id:"continuity-key",category:"Continuity",sceneId:"conversation-room",passage:"I meant to give this to Tomas",explanation:"The latest confirmed owner is still Lena, while this sentence implies a transfer.",importance:"High · object continuity",status:"open"},
    {id:"pacing-hall",category:"Pacing",sceneId:"arrival",passage:"Every clock in the west hall had stopped",explanation:"The reveal arrives before the reader has settled into Lena’s objective.",importance:"Medium · opening rhythm",status:"open"},
    {id:"dialogue-meant",category:"Dialogue",sceneId:"conversation-room",passage:"I meant to give this to Tomas",explanation:"The phrase “I meant to” appears three times in this chapter.",importance:"Low · dialogue texture",status:"open"},
  ],
  events:[
    {id:"learn-key",title:"Lena learns the key opens the archive",sceneId:"arrival",type:"knowledge",order:0},
    {id:"key-kept",title:"Lena keeps the silver key",sceneId:"conversation-room",type:"object",order:1},
    {id:"portrait-change",title:"The portrait reveals a changed memory",sceneId:"portrait",type:"reveal",order:2},
  ],
  activity:["Lena entered the conservation room","Scene goal updated for Chapter 8","Continuity review found 3 decisions"],
}}
