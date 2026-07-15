"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./MorrowHome.module.css";

const experiences = {
  Write:{title:"Chapter eight",body:"Lena turned the silver key over in her palm. It was colder than she remembered.",aside:"The earlier chapter and your character notes stay one click away."},
  Plan:{title:"The middle, made clearer",body:"Arrival → discovery → refusal → consequence",aside:"Move a scene. The rest of your outline stays intact."},
  Characters:{title:"Lena Ortiz",body:"Wants to restore what was lost. Hides why she recognizes the museum’s sealed wing.",aside:"Current state: determined, withholding, carrying the silver key."},
  Check:{title:"A detail to revisit",body:"Lena hands over the key here, but she still has it in Chapter 8.",aside:"Open both passages, choose a correction, or mark it intentional."},
  Revise:{title:"A revision you can act on",body:"Chapter 6 slows after the reveal. The explanation repeats what the reader already knows.",aside:"Three exact passages are ready to add to your revision plan."},
  Translate:{title:"Keep Lena sounding like Lena",body:"—No abras esa puerta todavía —dijo Lena.",aside:"Spanish dialogue punctuation, preferred terms, and her restrained voice are preserved."},
} as const;
type Experience = keyof typeof experiences;

const formats={
  Novel:["Chapters","Scenes","Prose","POV"],Screenplay:["Sluglines","Action","Dialogue","Scenes"],
  "TV series":["Episodes","Acts","A / B / C stories","Season arc"],Webtoon:["Episodes","Beats","Panels","Scroll rhythm"],
  Manga:["Chapters","Pages","Panels","Page turns"],Comic:["Issues","Pages","Panels","Lettering"],
  "Game narrative":["Quests","Choices","Dialogue","World states"],
} as const;
type Format = keyof typeof formats;

const languageExamples={
  English:["“Don’t open that door yet,” Lena said.","en-GB · double quotation marks · restrained tone"],
  Dutch:["‘Doe die deur nog niet open,’ zei Lena.","nl-NL · single quotation marks · informal address"],
  German:["„Öffne diese Tür noch nicht“, sagte Lena.","de-DE · German quotation marks · direct register"],
  Spanish:["—No abras esa puerta todavía —dijo Lena.","es-ES · dialogue dash · informal address"],
  Portuguese:["—Não abras essa porta ainda —disse Lena.","pt-PT · dialogue dash · second-person form"],
} as const;
type Language = keyof typeof languageExamples;

export function MorrowHome(){
  const[showNote,setShowNote]=useState(false);const[continuityAction,setContinuityAction]=useState<"open"|"revised"|"intentional"|"alternatives">("open");const[mode,setMode]=useState<Experience>("Write");
  const[format,setFormat]=useState<Format>("Novel");const[language,setLanguage]=useState<Language>("English");
  const[googleStep,setGoogleStep]=useState(0);const[revisionAdded,setRevisionAdded]=useState(false);const[memoryQuestion,setMemoryQuestion]=useState("key");
  const[premise,setPremise]=useState("A museum curator discovers that every restored painting changes one memory from her past.");
  const project=useMemo(()=>({hero:"Mara Vale",conflict:"Restore the final portrait—or keep her last true memory",secret:"The first painting was restored by her mother",scenes:["The changed photograph","The locked conservation room","A visitor who remembers differently"]}),[]);
  return <main className={styles.home}>
    <section className={styles.hero}>
      <div className={styles.heroCopy}><p className={styles.overline}>For stories worth remembering</p><h1>Your whole story.<br/><em>Always in reach.</em></h1><p>Write freely. Morrow remembers the details, the promises, and the people—so you can stay with the story.</p><div className={styles.actions}><Link href="/sign-up">Start writing free</Link><a href="#experience">Try the live demo</a></div></div>
      <div className={styles.heroArt}><Image src="/images/morrow-story-world.png" fill priority sizes="(max-width: 900px) 100vw, 60vw" alt="An illustrated manuscript on a writer's desk with a silver key and a story world emerging from its pages"/><div className={styles.editorFloat}><span>Chapter 8 · The conservation room · Saved</span><p>{continuityAction==="revised"?<>She <mark>meant to hand him</mark> the silver key and watched the door close between them.</>:<>She handed him <button aria-expanded={showNote} onClick={()=>setShowNote(true)}>the silver key</button> and watched the door close between them.</>}</p>{showNote&&<aside><b>{continuityAction==="intentional"?"Marked intentional":"A detail to revisit"}</b><p>{continuityAction==="alternatives"?"Alternative: Lena intended to transfer the key, or Tomas returned it off-page.":"Chapter 5 says Lena kept the key after Tomas left."}</p><div><button onClick={()=>{setContinuityAction("revised");setShowNote(false)}}>Revise sentence</button><button onClick={()=>setContinuityAction("intentional")}>Mark intentional</button><button onClick={()=>setContinuityAction("alternatives")}>Explore alternatives</button></div></aside>}</div></div>
    </section>

    <section className={styles.relief}><p>Every writer knows the feeling.</p><div className={styles.reliefTrack}>{["Wait—who has the key?","Why would she do that?","Where did I write that note?","Did I already reveal this?","Why does the middle feel slow?","Does this still sound like him in Spanish?"].map((item,i)=><blockquote key={item} data-tone={i%3}>{item}</blockquote>)}</div><h2>Keep writing.<br/>The details can keep up.</h2></section>

    <section className={styles.experience} id="experience"><header><p className={styles.overline}>One calm place for the whole story</p><h2>Powerful when you need it.<br/><em>Quiet when you don’t.</em></h2></header><div className={styles.modeTabs} role="tablist" aria-label="Explore the writing workspace">{Object.keys(experiences).map(item=><button role="tab" aria-selected={mode===item} onClick={()=>setMode(item as Experience)} key={item}>{item}</button>)}</div><div className={styles.workspace}><nav><b>The Museum of Lost Hours</b>{["Chapter 6 · The first change","Chapter 7 · After closing","Chapter 8 · The conservation room","Chapter 9 · The visitor"].map((item,i)=><span data-active={i===2} key={item}>{item}</span>)}</nav><article><small>{mode.toUpperCase()}</small><h3>{experiences[mode].title}</h3><p>{experiences[mode].body}</p></article><aside><span>Here when you need it</span><p>{experiences[mode].aside}</p><button>Open →</button></aside></div></section>

    <section className={styles.oneHome}><div><p className={styles.overline}>One story. One home.</p><h2>Stop rebuilding context every time you write.</h2><p>Your draft, notes, characters, timeline, translations, and revision plan stay together without getting in your way.</p></div><div className={styles.paperStack}>{["Manuscript_FINAL_v7.docx","Character notes","Timeline sheet","Revision list","Translations","Loose ideas"].map((item,i)=><span style={{"--i":i} as React.CSSProperties} key={item}>{item}</span>)}<strong>One story in Morrow</strong></div></section>

    <section className={styles.formats}><header><p className={styles.overline}>Made for the shape of your story</p><h2>The workspace changes with the way you write.</h2></header><div className={styles.formatTabs}>{Object.keys(formats).map(item=><button aria-pressed={format===item} onClick={()=>setFormat(item as Format)} key={item}>{item}</button>)}</div><div className={styles.formatCanvas}><div><small>{format}</small><h3>{format==="Novel"?"The Museum of Lost Hours":format==="Screenplay"?"INT. CONSERVATION ROOM — NIGHT":format==="Game narrative"?"The curator’s choice":"Episode 8 · The silver key"}</h3><p>{format==="Screenplay"?"LENA places the key beside the unfinished portrait.":format==="Webtoon"?"A long pause. The key catches the gallery light. Scroll to reveal the changed face.":"Lena had restored hundreds of faces. This was the first one that remembered her."}</p></div><ol>{formats[format].map((item,i)=><li key={item}><b>{String(i+1).padStart(2,"0")}</b>{item}</li>)}</ol></div></section>

    <section className={styles.memory}><div><p className={styles.overline}>Intelligence without interruption</p><h2>Your story remembers the rest.</h2><p>Ask about the current scene. Morrow answers from the moments you actually wrote.</p><div className={styles.memoryQuestions}><button aria-pressed={memoryQuestion==="key"} onClick={()=>setMemoryQuestion("key")}>Does Lena still have the key?</button><button aria-pressed={memoryQuestion==="knows"} onClick={()=>setMemoryQuestion("knows")}>What does Tomas know?</button><button aria-pressed={memoryQuestion==="promise"} onClick={()=>setMemoryQuestion("promise")}>Which promise is unresolved?</button></div></div><div className={styles.memoryScene}>{memoryQuestion==="key"?<><span>RECEIVED · CHAPTER 3</span><p>Lena finds the key inside the blue frame.</p><i/><span>LATEST APPEARANCE · CHAPTER 8</span><p>The key is in Lena’s hand. No confirmed transfer is recorded.</p><aside><b>Possible contradiction</b>“I gave it to Tomas” conflicts with the latest known ownership.</aside></>:memoryQuestion==="knows"?<><span>LEARNED · CHAPTER 4</span><p>Tomas sees the photograph before and after it changes.</p><i/><span>DOES NOT KNOW</span><p>Lena has already lost a memory of her mother.</p><aside><b>Dialogue check</b>He can question the photograph, but cannot name the personal cost yet.</aside></>:<><span>SETUP · CHAPTER 3</span><p>Lena promises Mara they will open the sealed gallery together.</p><i/><span>DEPENDENT SCENES</span><p>Chapters 8, 10, and 11 still rely on that promise.</p><aside><b>Payoff still open</b>No scene currently resolves or deliberately breaks the promise.</aside></>}</div></section>

    <section className={styles.languages}><header><p className={styles.overline}>Write beyond one language</p><h2>Keep the voice.<br/>Not just the words.</h2></header><div className={styles.languageTabs}>{Object.keys(languageExamples).map(item=><button aria-pressed={language===item} onClick={()=>setLanguage(item as Language)} key={item}>{item}</button>)}</div><blockquote>{languageExamples[language][0]}</blockquote><p>{languageExamples[language][1]}</p><div className={styles.voiceTags}><span>Lena · restrained</span><span>silver key · approved term</span><span>informal address</span></div></section>

    <section className={styles.google}><div><p className={styles.overline}>Bring the work you already have</p><h2>Google Docs and Sheets, without starting over.</h2><p>Bring in a manuscript, characters, or a timeline. Preview everything before it joins your project.</p></div><div className={styles.googleFlow}>{["Connect","Preview","Confirm","Continue writing"].map((step,i)=><button key={step} aria-current={googleStep===i?"step":undefined} onClick={()=>setGoogleStep(i)}><b>{i+1}</b>{step}</button>)}<article><span>{googleStep===0?"Choose Google Docs or Sheets":googleStep===1?"8 chapters · 19 scenes · 7 characters":googleStep===2?"Everything looks ready": "Chapter 8 is open in your workspace"}</span><p>{googleStep===0?"Your Google account stays optional.":googleStep===1?"Nothing changes until you say so.":googleStep===2?"Confirm the chapters and character names.":"Your original file remains where it was."}</p></article></div></section>

    <section className={styles.revision}><header><p className={styles.overline}>Revision that leads somewhere</p><h2>From “something feels off”<br/>to a plan you can follow.</h2></header><div className={styles.manuscript}><small>CHAPTER 6 · THE FIRST CHANGE</small><p>The gallery had always been quiet after closing. Lena walked past the northern rooms, remembering again that the portrait had changed, that the portrait had changed in a way no restoration should—</p><mark>Repeated explanation</mark></div><aside><span>PACING · CHAPTER 6</span><h3>The story pauses after the reveal.</h3><p>This paragraph repeats what the previous scene already showed. Cutting it brings Lena’s reaction forward.</p><button onClick={()=>setRevisionAdded(true)}>{revisionAdded?"✓ Added to revision plan":"Add to revision plan"}</button><button>Compare alternatives</button></aside></section>

    <section className={styles.trust}><h2>Your story stays yours.</h2><div>{["Private by default","AI never overwrites your work","Export whenever you want","Google access is optional","No training without your permission"].map(item=><p key={item}>✓ {item}</p>)}</div><Link href="/privacy">How Morrow protects your work →</Link></section>

    <section className={styles.premise}><div><p className={styles.overline}>Start with an idea</p><h2>See your story begin to take shape.</h2><label>Your premise<textarea value={premise} maxLength={180} onChange={event=>setPremise(event.target.value)}/></label></div><div className={styles.projectPreview}><span>NEW STORY</span><h3>{premise||"Your next story"}</h3><dl><div><dt>Protagonist</dt><dd>{project.hero}</dd></div><div><dt>Central conflict</dt><dd>{project.conflict}</dd></div><div><dt>Possible secret</dt><dd>{project.secret}</dd></div></dl><ol>{project.scenes.map(scene=><li key={scene}>{scene}</li>)}</ol><p>One question: What does Mara lose if she refuses to finish the portrait?</p><Link href="/sign-up">Create this story free →</Link></div></section>
  </main>
}
