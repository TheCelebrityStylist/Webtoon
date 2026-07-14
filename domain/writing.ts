export function nextPosition(positions:number[]){return positions.length?Math.max(...positions)+1:1}
export function reorder<T extends{id:string;position:number}>(items:T[],id:string,direction:"up"|"down"){const sorted=[...items].sort((a,b)=>a.position-b.position);const index=sorted.findIndex(x=>x.id===id);const target=index+(direction==="up"?-1:1);if(index<0||target<0||target>=sorted.length)return sorted;[sorted[index],sorted[target]]=[sorted[target],sorted[index]];return sorted.map((x,i)=>({...x,position:i+1}))}
export type Decision="PENDING"|"ACCEPTED"|"REJECTED";
export const decide=(current:Decision,next:Exclude<Decision,"PENDING">):Decision=>current==="PENDING"?next:current;
export function resolveAutosave(serverRevision:number,clientRevision:number){return serverRevision===clientRevision?{ok:true,nextRevision:serverRevision+1}:{ok:false,serverRevision}}
export function markdownExport(project:{title:string;premise:string;chapters:{number:number;title:string;scenes:{title:string;text:string}[]}[]}){return [`# ${project.title}`,`> ${project.premise}`,...project.chapters.flatMap(c=>[`## ${c.number}. ${c.title}`,...c.scenes.flatMap(s=>[`### ${s.title}`,s.text])])].join("\n\n")}
