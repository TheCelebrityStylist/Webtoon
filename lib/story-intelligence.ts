export type Severity="LOW"|"MEDIUM"|"HIGH";
export type Evidence={recordId:string;sceneId:string;position:number;label:string};
export type ContinuityFinding={rule:string;category:"CHRONOLOGY"|"KNOWLEDGE"|"LOCATION"|"OWNERSHIP"|"LIFE_STATE"|"PROMISE"|"TRANSLATION"|"STATE";severity:Severity;source:Evidence;conflict?:Evidence;explanation:string;suggestedActions:string[];affectedRecordIds:string[]};
export type StoryEvent={id:string;sceneId:string;position:number;kind:"KNOWLEDGE"|"LOCATION"|"OWNERSHIP"|"DEATH"|"PROMISE_SETUP"|"PROMISE_PAYOFF"|"TRANSLATION"|"STATE";entityId:string;value:string;subjectId?:string;referenceId?:string;label:string};

const evidence=(event:StoryEvent):Evidence=>({recordId:event.id,sceneId:event.sceneId,position:event.position,label:event.label});
const finding=(rule:ContinuityFinding["rule"],category:ContinuityFinding["category"],severity:Severity,source:StoryEvent,conflict:StoryEvent|undefined,explanation:string,actions:string[]):ContinuityFinding=>({rule,category,severity,source:evidence(source),conflict:conflict?evidence(conflict):undefined,explanation,suggestedActions:actions,affectedRecordIds:[source.id,...(conflict?[conflict.id]:[])]});

export function analyzeDeterministicContinuity(events:StoryEvent[]):ContinuityFinding[]{
  const ordered=[...events].sort((a,b)=>a.position-b.position||a.id.localeCompare(b.id));const findings:ContinuityFinding[]=[];
  const knowledge=new Map<string,StoryEvent>();const locations=new Map<string,StoryEvent>();const owners=new Map<string,StoryEvent>();const deaths=new Map<string,StoryEvent>();const promises=new Map<string,StoryEvent>();const states=new Map<string,StoryEvent>();
  for(const event of ordered){
    if(event.kind==="KNOWLEDGE"){
      const key=`${event.subjectId}:${event.entityId}`;const learned=knowledge.get(key);
      if(event.value==="USES"&&!learned)findings.push(finding("knowledge-before-discovery","KNOWLEDGE","HIGH",event,undefined,`${event.label} uses knowledge that has no earlier discovery record.`,["Add or move the discovery","Revise the line","Mark intentional with a reason"]));
      if(event.value==="LEARNS")knowledge.set(key,event);
    }
    if(event.kind==="LOCATION"){
      const previous=locations.get(event.entityId);if(previous&&previous.position===event.position&&previous.value!==event.value)findings.push(finding("conflicting-location","LOCATION","HIGH",event,previous,`${event.entityId} is recorded in two places at the same story position.`,["Choose the canonical location","Adjust chronology","Split the event"]));locations.set(event.entityId,event);
    }
    if(event.kind==="OWNERSHIP"){
      const previous=owners.get(event.entityId);if(event.value==="USES"&&event.subjectId!==previous?.subjectId)findings.push(finding("conflicting-object-ownership","OWNERSHIP","HIGH",event,previous,`${event.subjectId??"A character"} uses ${event.entityId}, but the latest holder is ${previous?.subjectId??"unknown"}.`,["Record a transfer","Change the holder","Mark an off-page transfer intentionally"]));if(event.value==="HOLDS")owners.set(event.entityId,event);
    }
    if(event.kind==="DEATH")deaths.set(event.entityId,event);
    if(event.kind==="STATE"&&deaths.has(event.entityId)&&event.position>deaths.get(event.entityId)!.position)findings.push(finding("appearance-after-death","LIFE_STATE","HIGH",event,deaths.get(event.entityId),`${event.entityId} changes state after a recorded death.`,["Confirm a flashback","Change the timeline position","Revise the appearance"]));
    if(event.kind==="PROMISE_SETUP")promises.set(event.entityId,event);
    if(event.kind==="PROMISE_PAYOFF"&&!promises.has(event.entityId))findings.push(finding("payoff-before-setup","PROMISE","HIGH",event,undefined,`${event.label} pays off a promise that has no earlier setup.`,["Add a setup","Move the payoff","Link the correct promise"]));
    if(event.kind==="TRANSLATION"&&event.value==="MISSING")findings.push(finding("missing-translation-segment","TRANSLATION","MEDIUM",event,undefined,`${event.label} has no target-language segment.`,["Translate the segment","Exclude it with a reason"]));
    if(event.kind==="STATE"){
      const previous=states.get(event.entityId);if(previous&&event.referenceId&&event.referenceId!==previous.id)findings.push(finding("invalid-state-transition","STATE","HIGH",event,previous,`${event.label} was based on a stale state record.`,["Reload the latest state","Reapply the change","Create an alternate branch"]));states.set(event.entityId,event);
    }
  }
  return findings;
}
