"use client";

import Link from "next/link";
import { useState } from "react";
import { pricingConfig } from "@/lib/marketing";
import styles from "./ProductExperiences.module.css";

type MajorSlug =
  | "product"
  | "writing"
  | "planning"
  | "characters"
  | "revision"
  | "formats"
  | "languages"
  | "google"
  | "pricing";
export const majorExperienceSlugs = new Set<MajorSlug>([
  "product",
  "writing",
  "planning",
  "characters",
  "revision",
  "formats",
  "languages",
  "google",
  "pricing",
]);

const scenes = [
  "The changed photograph",
  "After closing",
  "The visitor arrives",
  "The conservation room",
];
const formatData = {
  Novel: {
    tree: ["Part II", "Chapter 8", "Scene · Conservation room"],
    tools: ["POV · Lena", "Purpose · reveal the cost", "1,284 / 1,600 words"],
    body: "Lena turned the silver key over in her palm. It was colder than she remembered.",
  },
  Screenplay: {
    tree: ["ACT II", "INT. MUSEUM — NIGHT", "SCENE 28"],
    tools: ["Page 47 of 108", "Night interior", "Revision blue"],
    body: "LENA places the silver key beside the unfinished portrait.\n\nLENA\nIt remembers me.",
  },
  TV: {
    tree: ["Season 1", "Episode 5 · Negative Space", "Act Three · A story"],
    tools: [
      "Teaser + 5 acts",
      "Lena arc · denial → doubt",
      "B story crosses at 31:00",
    ],
    body: "ACT THREE — Lena discovers that Tomas has been cataloguing the altered memories.",
  },
  Webtoon: {
    tree: ["Episode 12", "Beat 06 · The key", "Panels 31–38"],
    tools: [
      "Vertical gap · 640 px",
      "Dialogue · 22 words",
      "Reveal after scroll",
    ],
    body: "PANEL 34 — Close on the key.\n\nSFX: tik\n\nLong scroll gap\n\nPANEL 35 — The portrait opens its eyes.",
  },
  Manga: {
    tree: ["Chapter 9", "Page 18 · right-to-left", "Panels 1–5"],
    tools: ["Page turn reveal", "Double spread next", "Dialogue density · low"],
    body: "PANEL 5 — Lena sees her mother’s signature beneath the restored paint. Turn page →",
  },
  Comic: {
    tree: ["Issue #2", "Page 14", "Panel 4"],
    tools: ["Caption · Lena", "2 balloons", "Production note attached"],
    body: "CAPTION: Restoration is another word for choosing what survives.\n\nLENA: Lock the west gallery.",
  },
  "Game narrative": {
    tree: ["Quest · Lost Hours", "Node · Return the key", "Choice 03"],
    tools: [
      "Requires trust ≥ 4",
      "Sets key_owner=tomas",
      "Unlocks memory_branch_b",
    ],
    body: "[Give Tomas the key]\nHe can open the gallery, but Lena loses control of the evidence.",
  },
} as const;
type FormatName = keyof typeof formatData;

function Shell({
  eyebrow,
  title,
  copy,
  children,
  tone = "paper",
}: {
  eyebrow: string;
  title: string;
  copy: string;
  children: React.ReactNode;
  tone?: string;
}) {
  return (
    <main className={`${styles.page} ${styles[tone]}`}>
      <header className={styles.intro}>
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        <span>{copy}</span>
      </header>
      {children}
      <footer className={styles.continue}>
        <div>
          <small>YOUR STORY, STILL YOURS</small>
          <h2>Start with one scene.</h2>
        </div>
        <Link href="/sign-up">Start writing free</Link>
      </footer>
    </main>
  );
}

function Writing() {
  const [scene, setScene] = useState(1);
  const [focus, setFocus] = useState(false);
  const [panel, setPanel] = useState<"context" | "versions" | "suggestion">(
    "context",
  );
  const [accepted, setAccepted] = useState(false);
  return (
    <Shell
      eyebrow="WRITING"
      title="Stay with the words."
      copy="A manuscript editor with the right context one click away—not another dashboard competing for attention."
      tone="writing"
    >
      <section className={`${styles.editor} ${focus ? styles.focus : ""}`}>
        <header>
          <b>The Museum of Lost Hours</b>
          <span>Saved just now</span>
          <button onClick={() => setFocus(!focus)}>
            {focus ? "Leave focus" : "Focus mode"}
          </button>
        </header>
        <nav>
          {scenes.map((item, i) => (
            <button
              aria-current={scene === i ? "page" : undefined}
              onClick={() => setScene(i)}
              key={item}
            >
              <small>0{i + 5}</small>
              {item}
            </button>
          ))}
        </nav>
        <article>
          <div className={styles.toolbar}>
            <button>H1</button>
            <button>¶</button>
            <button>“ ”</button>
            <span>⌘ K · commands</span>
          </div>
          <small>CHAPTER 8 · SCENE {scene + 1} · LENA POV</small>
          <h2>{scenes[scene]}</h2>
          <p>
            Lena turned the silver key over in her palm. It was colder than she
            remembered.
          </p>
          <p>
            “I gave this to Tomas,” she said, though the weight of it insisted
            otherwise.
          </p>
          {accepted && (
            <p className={styles.revised}>
              “I meant to give this to Tomas,” she said, closing her hand around
              the key.
            </p>
          )}
          <footer>
            <span>{accepted ? 65 : 52} words</span>
            <span>Scene goal · confront the changed memory</span>
          </footer>
        </article>
        <aside>
          <div role="tablist">
            {(["context", "versions", "suggestion"] as const).map((item) => (
              <button
                role="tab"
                aria-selected={panel === item}
                onClick={() => setPanel(item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
          {panel === "context" && (
            <div>
              <h3>Lena Ortiz</h3>
              <p>Determined · withholding</p>
              <dl>
                <dt>Knows</dt>
                <dd>The portrait changes memories</dd>
                <dt>Doesn’t know</dt>
                <dd>Why Tomas recognizes the key</dd>
              </dl>
            </div>
          )}
          {panel === "versions" && (
            <ol>
              <li>
                <b>v18</b> Today, 14:32
              </li>
              <li>
                <b>v17</b> Today, 12:08
              </li>
              <li>
                <b>v16</b> Yesterday
              </li>
            </ol>
          )}
          {panel === "suggestion" && (
            <div>
              <h3>Continuity</h3>
              <p>
                In Chapter 5, Lena planned to give Tomas the key but kept it
                after he left.
              </p>
              <button onClick={() => setAccepted(true)}>
                {accepted ? "Applied" : "Revise this line"}
              </button>
              <button>Mark intentional</button>
            </div>
          )}
        </aside>
      </section>
    </Shell>
  );
}

function Planning() {
  const [order, setOrder] = useState(scenes);
  const [branch, setBranch] = useState(false);
  function move(index: number, delta: number) {
    const next = [...order];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  }
  return (
    <Shell
      eyebrow="PLANNING"
      title="Shape the story without flattening it."
      copy="Scenes remain movable, meaningful, and connected to the arcs they change."
      tone="planning"
    >
      <section className={styles.outline}>
        <header>
          <div>
            <button aria-pressed={!branch} onClick={() => setBranch(false)}>
              Main outline
            </button>
            <button aria-pressed={branch} onClick={() => setBranch(true)}>
              Alternate branch
            </button>
          </div>
          <span>Season view · 4 unresolved questions</span>
        </header>
        <aside>
          <b>ARC TRACKS</b>
          <span>Lena · control → trust</span>
          <span>Tomas · secrecy → confession</span>
          <span>The key · found → transferred</span>
        </aside>
        <div>
          {(branch ? [...order].reverse() : order).map((item, index) => (
            <article key={item}>
              <div>
                <small>
                  SCENE {index + 5} ·{" "}
                  {index === 2 ? "TURNING POINT" : "RISING ACTION"}
                </small>
                <h3>{item}</h3>
                <p>
                  {index === 0
                    ? "Establish the changed evidence"
                    : index === 1
                      ? "Make concealment costly"
                      : index === 2
                        ? "Force Lena to choose who to trust"
                        : "Carry the choice into the reveal"}
                </p>
                <span>{index % 2 ? "Lena · Tomas" : "Lena · Mara"}</span>
              </div>
              <nav>
                <button
                  aria-label={`Move ${item} up`}
                  onClick={() => move(index, -1)}
                >
                  ↑
                </button>
                <button
                  aria-label={`Move ${item} down`}
                  onClick={() => move(index, 1)}
                >
                  ↓
                </button>
              </nav>
            </article>
          ))}
        </div>
        <footer>
          <strong>Question carried forward</strong>
          <p>What did Lena’s mother restore before she disappeared?</p>
        </footer>
      </section>
    </Shell>
  );
}

function Characters() {
  const [field, setField] = useState<
    "state" | "knowledge" | "relationships" | "voice"
  >("state");
  return (
    <Shell
      eyebrow="CHARACTERS"
      title="Know who they are now."
      copy="A character is not a form you fill once. Morrow follows what changes from scene to scene."
      tone="characters"
    >
      <section className={styles.character}>
        <aside>
          <div className={styles.portrait}>LO</div>
          <h2>Lena Ortiz</h2>
          <p>Conservator · protagonist</p>
          {(["state", "knowledge", "relationships", "voice"] as const).map(
            (item) => (
              <button
                aria-current={field === item ? "page" : undefined}
                onClick={() => setField(item)}
                key={item}
              >
                {item}
              </button>
            ),
          )}
        </aside>
        <article>
          <header>
            <span>CHAPTER 8 · AFTER THE VISITOR</span>
            <b>Current location · conservation room</b>
          </header>
          {field === "state" && (
            <div className={styles.statGrid}>
              <label>
                Goal<strong>Prove the portrait is changing memories</strong>
              </label>
              <label>
                Fear<strong>That the original memory was the lie</strong>
              </label>
              <label>
                Secret<strong>She recognizes her mother’s signature</strong>
              </label>
              <label>
                Emotional state<strong>Controlled panic</strong>
              </label>
            </div>
          )}
          {field === "knowledge" && (
            <div className={styles.knowledge}>
              <p>✓ The photograph changed after restoration</p>
              <p>✓ Tomas remembers the earlier version</p>
              <p>○ The key opens the sealed gallery</p>
              <p>○ Mara restored the first portrait</p>
              <aside>
                Potential contradiction: Lena names the sealed gallery before
                learning its location.
              </aside>
            </div>
          )}
          {field === "relationships" && (
            <div className={styles.relationship}>
              <b>Lena</b>
              <i />
              <b>Tomas</b>
              <span>Trust ↓ · dependence ↑</span>
              <blockquote>“You remember the photograph too.”</blockquote>
            </div>
          )}
          {field === "voice" && (
            <div>
              <blockquote>
                “Restoration doesn’t recover the truth. It chooses which damage
                gets to remain.”
              </blockquote>
              <p>
                Measured sentences · technical metaphors · avoids direct
                confession
              </p>
            </div>
          )}
          <footer>
            <small>ARC PROGRESS</small>
            <progress value="62" max="100" />
            62% · control is becoming isolation
          </footer>
        </article>
      </section>
    </Shell>
  );
}

function Revision() {
  const [filter, setFilter] = useState("All");
  const [status, setStatus] = useState<Record<string, string>>({});
  const findings = [
    {
      id: "pace",
      kind: "Pacing",
      severity: "High",
      title: "The reveal stops for explanation",
      scene: "Chapter 6 · scene 3",
    },
    {
      id: "key",
      kind: "Continuity",
      severity: "High",
      title: "The key has two owners",
      scene: "Chapters 5 and 8",
    },
    {
      id: "voice",
      kind: "Dialogue",
      severity: "Medium",
      title: "Tomas states what Lena already knows",
      scene: "Chapter 9 · scene 1",
    },
  ];
  return (
    <Shell
      eyebrow="REVISION"
      title="Turn feedback into forward motion."
      copy="Exact passages, practical choices, and a plan that gets shorter as you work."
      tone="revision"
    >
      <section className={styles.review}>
        <header>
          {["All", "Pacing", "Continuity", "Dialogue"].map((x) => (
            <button
              aria-pressed={filter === x}
              onClick={() => setFilter(x)}
              key={x}
            >
              {x}
            </button>
          ))}
          <span>{Object.keys(status).length} of 3 decided</span>
        </header>
        <div>
          {findings
            .filter((x) => filter === "All" || x.kind === filter)
            .map((item) => (
              <article key={item.id} data-status={status[item.id]}>
                <aside>
                  <small>
                    {item.kind} · {item.severity}
                  </small>
                  <h3>{item.title}</h3>
                  <p>{item.scene}</p>
                </aside>
                <div>
                  <del>
                    The portrait had changed. Lena knew it had changed because
                    the face was not the face she remembered.
                  </del>
                  <ins>
                    Lena touched the unfamiliar smile and felt a childhood leave
                    her.
                  </ins>
                </div>
                <footer>
                  <button
                    onClick={() =>
                      setStatus({ ...status, [item.id]: "planned" })
                    }
                  >
                    Add to plan
                  </button>
                  <button
                    onClick={() =>
                      setStatus({ ...status, [item.id]: "intentional" })
                    }
                  >
                    Mark intentional
                  </button>
                  <button
                    onClick={() =>
                      setStatus({ ...status, [item.id]: "dismissed" })
                    }
                  >
                    Dismiss
                  </button>
                  {status[item.id] && <b>✓ {status[item.id]}</b>}
                </footer>
              </article>
            ))}
        </div>
      </section>
    </Shell>
  );
}

function Formats() {
  const [format, setFormat] = useState<FormatName>("Novel");
  const data = formatData[format];
  return (
    <Shell
      eyebrow="FORMATS"
      title="The tool should understand the form."
      copy="Switch formats and the navigator, editor, metadata, preview, terminology, and available tools change together."
      tone="formats"
    >
      <section className={styles.formats}>
        <nav>
          {(Object.keys(formatData) as FormatName[]).map((item) => (
            <button
              aria-pressed={format === item}
              onClick={() => setFormat(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className={styles.formatWorkspace} data-format={format}>
          <aside>
            {data.tree.map((item, i) => (
              <span key={item} data-active={i === data.tree.length - 1}>
                {item}
              </span>
            ))}
          </aside>
          <article>
            <header>
              <b>{format.toUpperCase()}</b>
              <span>{data.tools[0]}</span>
            </header>
            <pre>{data.body}</pre>
            <footer>
              {data.tools.slice(1).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </footer>
          </article>
          <section>
            <b>PREVIEW</b>
            <div>
              {format === "Webtoon" ? (
                <>
                  <i />
                  <i />
                  <i />
                </>
              ) : format === "Manga" || format === "Comic" ? (
                <>
                  <i />
                  <i />
                  <i />
                  <i />
                </>
              ) : format === "Game narrative" ? (
                <>
                  <button>Give him the key</button>
                  <button>Keep it hidden</button>
                </>
              ) : (
                <p>{data.body.split("\n")[0]}</p>
              )}
            </div>
          </section>
        </div>
      </section>
    </Shell>
  );
}

function Languages() {
  const [language, setLanguage] = useState("Spanish");
  const [action, setAction] = useState("Preserve voice");
  const [accepted, setAccepted] = useState(false);
  const text: Record<string, string> = {
    English: "“Don’t open that door yet,” Lena said.",
    Dutch: "‘Doe die deur nog niet open,’ zei Lena.",
    German: "„Öffne diese Tür noch nicht“, sagte Lena.",
    Spanish: "—No abras esa puerta todavía —dijo Lena.",
    Portuguese: "—Não abras essa porta ainda —disse Lena.",
  };
  return (
    <Shell
      eyebrow="LANGUAGES"
      title="Keep the voice. Change the language."
      copy="Editorial comparison that respects punctuation, register, glossary decisions, and character history."
      tone="languages"
    >
      <section className={styles.translation}>
        <header>
          <div>
            {Object.keys(text).map((item) => (
              <button
                aria-pressed={language === item}
                onClick={() => {
                  setLanguage(item);
                  setAccepted(false);
                }}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            <option>Preserve voice</option>
            <option>Make dialogue natural</option>
            <option>Reduce exposition</option>
            <option>Increase tension</option>
            <option>Simplify</option>
            <option>Make more literary</option>
          </select>
        </header>
        <div>
          <article>
            <small>ORIGINAL · EN-GB</small>
            <p>“Don’t open that door yet,” Lena said.</p>
          </article>
          <article>
            <small>
              {accepted ? "ACCEPTED" : "SUGGESTION"} · {language.toUpperCase()}
            </small>
            <p>{text[language]}</p>
          </article>
        </div>
        <aside>
          <h3>{action}</h3>
          <p>
            {language === "Spanish"
              ? "The dialogue dash replaces quotation marks, and informal address matches Lena and Tomas’s established relationship."
              : "Punctuation and register follow the selected project variant."}
          </p>
          <dl>
            <dt>Glossary</dt>
            <dd>sealed gallery · galería sellada</dd>
            <dt>Voice</dt>
            <dd>Lena · restrained, precise</dd>
          </dl>
          <button onClick={() => setAccepted(true)}>
            {accepted ? "Accepted ✓" : "Accept"}
          </button>
          <button>Reject</button>
        </aside>
      </section>
    </Shell>
  );
}

function Google() {
  const [task, setTask] = useState("Docs import");
  const [step, setStep] = useState(0);
  const tasks = [
    "Docs import",
    "Sheets characters",
    "Outline export",
    "Calendar deadline",
    "Drive folder",
  ];
  const steps = ["Choose", "Preview", "Resolve", "Confirm", "Result"];
  return (
    <Shell
      eyebrow="GOOGLE WORKSPACE"
      title="Bring the work. Keep control."
      copy="Every connection is optional, every change is previewed, and every import ends with a report."
      tone="google"
    >
      <section className={styles.google}>
        <aside>
          {tasks.map((item) => (
            <button
              aria-current={task === item ? "page" : undefined}
              onClick={() => {
                setTask(item);
                setStep(0);
              }}
              key={item}
            >
              {item}
            </button>
          ))}
        </aside>
        <article>
          <header>
            <b>{task}</b>
            <span>Original files stay where they are</span>
          </header>
          <nav>
            {steps.map((item, i) => (
              <button
                aria-current={step === i ? "step" : undefined}
                onClick={() => setStep(i)}
                key={item}
              >
                <i>{i + 1}</i>
                {item}
              </button>
            ))}
          </nav>
          <div>
            {step === 0 && (
              <>
                <h3>Choose a seeded example</h3>
                <button className={styles.source}>
                  ▤ The Museum of Lost Hours
                </button>
                <button className={styles.source}>▦ Character bible</button>
              </>
            )}
            {step === 1 && (
              <>
                <h3>Preview detected structure</h3>
                <dl>
                  <dt>Chapters</dt>
                  <dd>8</dd>
                  <dt>Scenes</dt>
                  <dd>19</dd>
                  <dt>Characters</dt>
                  <dd>7</dd>
                  <dt>Notes</dt>
                  <dd>12</dd>
                </dl>
              </>
            )}
            {step === 2 && (
              <>
                <h3>Two details need you</h3>
                <p>“Mara V.” may match Mara Vale. Chapter 4 has no heading.</p>
                <label>
                  Duplicate handling
                  <select>
                    <option>Review each match</option>
                    <option>Keep both</option>
                    <option>Skip duplicates</option>
                  </select>
                </label>
              </>
            )}
            {step === 3 && (
              <>
                <h3>Ready when you are</h3>
                <p>
                  8 chapters and 19 scenes will be created. Your source file
                  will not be changed.
                </p>
              </>
            )}
            {step === 4 && (
              <>
                <h3>Import report</h3>
                <p>
                  ✓ 8 chapters created · 19 scenes created · 1 row skipped · 0
                  errors
                </p>
              </>
            )}
            <footer>
              <button disabled={step === 0} onClick={() => setStep(step - 1)}>
                Back
              </button>
              <button onClick={() => setStep(Math.min(4, step + 1))}>
                {step === 4 ? "Open project" : "Continue"}
              </button>
            </footer>
          </div>
        </article>
      </section>
    </Shell>
  );
}

function Product() {
  const [item, setItem] = useState("Objects");
  const records: Record<string, [string, string, string]> = {
    People: [
      "Lena Ortiz",
      "Knows the portrait changes memories",
      "Appears in 14 scenes",
    ],
    Places: [
      "Sealed gallery",
      "First named in Chapter 2",
      "3 scenes depend on access",
    ],
    Objects: [
      "Silver key",
      "Lena → planned transfer → Lena",
      "Current line may contradict Chapter 5",
    ],
    Secrets: [
      "Mara’s restoration",
      "Known by Tomas, not Lena",
      "Payoff planned for Chapter 11",
    ],
    Promises: [
      "Open the west gallery",
      "Set up in Chapter 3",
      "Unresolved · 4 dependent scenes",
    ],
    Timeline: [
      "14 October",
      "Portrait arrives at 09:10",
      "Lena cannot reach archive by 09:18",
    ],
    "Reader knowledge": [
      "The portrait changes memories",
      "Reader learns in Chapter 2",
      "Lena confirms it in Chapter 4",
    ],
  };
  return (
    <Shell
      eyebrow="PRODUCT"
      title="Write freely. The story stays connected."
      copy="The manuscript remains central while people, places, objects, promises, time, and reader knowledge remain traceable."
      tone="product"
    >
      <section className={styles.memory}>
        <nav>
          {Object.keys(records).map((x) => (
            <button
              aria-pressed={item === x}
              onClick={() => setItem(x)}
              key={x}
            >
              {x}
            </button>
          ))}
        </nav>
        <div>
          <aside>
            <small>SELECTED RECORD</small>
            <h2>{records[item][0]}</h2>
            <p>{records[item][1]}</p>
            <strong>{records[item][2]}</strong>
          </aside>
          <article>
            <span>FIRST APPEARED</span>
            <p>Chapter 2 · The delivery</p>
            <i />
            <span>LATEST CHANGE</span>
            <p>Chapter 8 · Conservation room</p>
            <i />
            <span>IF THIS CHANGES</span>
            <p>Review scenes 8, 11, and 14</p>
          </article>
        </div>
      </section>
    </Shell>
  );
}

function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [currency, setCurrency] =
    useState<keyof typeof pricingConfig.currencies>("EUR");
  const [projects, setProjects] = useState(2);
  const [team, setTeam] = useState(false);
  const [translate, setTranslate] = useState(false);
  const [review, setReview] = useState(2);
  const recommendation = team
    ? "Studio"
    : translate || projects > 3 || review > 2
      ? "Professional"
      : "Writer";
  return (
    <Shell
      eyebrow="PRICING"
      title="Choose for the work you do now."
      copy="See the limits, estimate your use, and change plans later without losing access to your writing."
      tone="pricing"
    >
      <section className={styles.chooser}>
        <header>
          <h2>Find the right fit</h2>
          <div>
            <button
              aria-pressed={billing === "monthly"}
              onClick={() => setBilling("monthly")}
            >
              Monthly
            </button>
            <button
              aria-pressed={billing === "annual"}
              onClick={() => setBilling("annual")}
            >
              Annual · save 20%
            </button>
            <select
              aria-label="Currency"
              value={currency}
              onChange={(e) =>
                setCurrency(
                  e.target.value as keyof typeof pricingConfig.currencies,
                )
              }
            >
              {Object.keys(pricingConfig.currencies).map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
        </header>
        <div className={styles.questions}>
          <label>
            Active projects{" "}
            <input
              type="range"
              min="1"
              max="12"
              value={projects}
              onChange={(e) => setProjects(Number(e.target.value))}
            />
            <b>{projects}</b>
          </label>
          <label>
            AI review passes each month{" "}
            <input
              type="range"
              min="0"
              max="8"
              value={review}
              onChange={(e) => setReview(Number(e.target.value))}
            />
            <b>{review}</b>
          </label>
          <label>
            <input
              type="checkbox"
              checked={translate}
              onChange={(e) => setTranslate(e.target.checked)}
            />{" "}
            I translate my work
          </label>
          <label>
            <input
              type="checkbox"
              checked={team}
              onChange={(e) => setTeam(e.target.checked)}
            />{" "}
            I work with a team
          </label>
          <output>
            Recommended for you <strong>{recommendation}</strong>
          </output>
        </div>
        <div className={styles.plans}>
          {pricingConfig.plans.map((plan) => {
            const price = plan.monthly[currency];
            const shown =
              billing === "annual" ? Math.round(price * 0.8) : price;
            return (
              <article
                data-recommended={plan.name === recommendation}
                key={plan.id}
              >
                <small>
                  {plan.name === recommendation
                    ? "YOUR MATCH"
                    : plan.name.toUpperCase()}
                </small>
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
                <strong>
                  {pricingConfig.currencies[currency]}
                  {shown}
                  <span>/month</span>
                </strong>
                <ul>
                  {plan.features.map((x) => (
                    <li key={x}>✓ {x}</li>
                  ))}
                </ul>
                <Link href="/sign-up">Choose {plan.name}</Link>
              </article>
            );
          })}
        </div>
        <details>
          <summary>Compare limits and capabilities</summary>
          <table>
            <thead>
              <tr>
                <th>Capability</th>
                <th>Writer</th>
                <th>Professional</th>
                <th>Studio</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Active projects</th>
                <td>2</td>
                <td>10</td>
                <td>Unlimited</td>
              </tr>
              <tr>
                <th>Languages</th>
                <td>1</td>
                <td>5 + variants</td>
                <td>5 + variants</td>
              </tr>
              <tr>
                <th>Google import/export</th>
                <td>Docs</td>
                <td>Docs + Sheets</td>
                <td>Docs + Sheets</td>
              </tr>
              <tr>
                <th>Private collaborators</th>
                <td>—</td>
                <td>1 editor</td>
                <td>10 seats</td>
              </tr>
              <tr>
                <th>Revision review</th>
                <td>Essential</td>
                <td>Deep</td>
                <td>Shared workflow</td>
              </tr>
            </tbody>
          </table>
        </details>
      </section>
    </Shell>
  );
}

export function ProductExperience({ slug }: { slug: string }) {
  switch (slug) {
    case "product":
      return <Product />;
    case "writing":
      return <Writing />;
    case "planning":
      return <Planning />;
    case "characters":
      return <Characters />;
    case "revision":
      return <Revision />;
    case "formats":
      return <Formats />;
    case "languages":
      return <Languages />;
    case "google":
      return <Google />;
    case "pricing":
      return <Pricing />;
    default:
      return null;
  }
}
