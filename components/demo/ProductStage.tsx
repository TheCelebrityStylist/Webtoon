import type { HTMLAttributes, ReactNode } from "react";
import styles from "./ProductStage.module.css";

function cx(...values: Array<string | false | undefined>) { return values.filter(Boolean).join(" "); }

export function ProductStage({ children, tone = "ivory", split = false, className, ...props }: HTMLAttributes<HTMLElement> & { children: ReactNode; tone?: "ivory" | "green" | "aubergine"; split?: boolean }) {
  return <section className={cx(styles.stage, styles[tone], split && styles.split, className)} {...props}>{children}</section>;
}
export function DemoWindow({ children, label, status = "Live demo" }: { children: ReactNode; label: string; status?: string }) { return <div className={styles.window}><header className={styles.chrome}><i/><i/><i/><span>{label}</span><b>{status}</b></header>{children}</div>; }
export function DemoToolbar({ children }: { children: ReactNode }) { return <div className={styles.toolbar}>{children}</div>; }
export function DemoSidebar({ children, label }: { children: ReactNode; label: string }) { return <aside className={styles.sidebar} aria-label={label}>{children}</aside>; }
export function DemoCanvas({ children, label }: { children: ReactNode; label: string }) { return <div className={styles.canvas} role="region" aria-label={label}>{children}</div>; }
export function DemoCard({ children, selected, className, ...props }: HTMLAttributes<HTMLElement> & { children: ReactNode; selected?: boolean }) { return <article className={cx(styles.card, selected && styles.selected, className)} data-selected={selected || undefined} {...props}>{children}</article>; }
export function DemoTabs({ children, label }: { children: ReactNode; label: string }) { return <div className={styles.tabs} role="tablist" aria-label={label}>{children}</div>; }
export function DemoStepper({ children, label }: { children: ReactNode; label: string }) { return <nav className={styles.stepper} aria-label={label}>{children}</nav>; }
export function DemoToast({ children }: { children: ReactNode }) { return <div className={styles.toast} role="status" aria-live="polite">{children}</div>; }
export function DemoTooltip({ children }: { children: ReactNode }) { return <span className={styles.tooltip} role="tooltip">{children}</span>; }
export function DemoInspector({ children, label }: { children: ReactNode; label: string }) { return <aside className={styles.inspector} aria-label={label}>{children}</aside>; }
export function DemoAnnotation({ children }: { children: ReactNode }) { return <span className={styles.annotation}>{children}</span>; }
export function DemoEmptyState({ title, children }: { title: string; children: ReactNode }) { return <div className={styles.empty}><strong>{title}</strong><p>{children}</p></div>; }
export function DemoSuccessState({ title, children }: { title: string; children: ReactNode }) { return <div className={styles.success} role="status"><span>✓</span><strong>{title}</strong><p>{children}</p></div>; }
