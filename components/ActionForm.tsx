"use client";
import { useActionState } from "react";
import type { FormState } from "@/app/actions/auth";
import { SubmitButton } from "./SubmitButton";
export function ActionForm({ action, children, submitLabel }: { action: (state: FormState, data: FormData) => Promise<FormState>; children: React.ReactNode; submitLabel: string }) {
  const [state, formAction] = useActionState(action, {});
  return <form action={formAction} className="form-stack">{state.error && <p className="form-error" role="alert">{state.error}</p>}{state.success && <p className="form-success" role="status">{state.success}</p>}{children}<SubmitButton>{submitLabel}</SubmitButton></form>;
}
export function Field({ name, label, defaultValue = "", textarea = false, type = "text", required = false }: { name: string; label: string; defaultValue?: string; textarea?: boolean; type?: string; required?: boolean }) {
  return <label><span>{label}</span>{textarea ? <textarea name={name} defaultValue={defaultValue} required={required} /> : <input name={name} defaultValue={defaultValue} type={type} required={required} />}</label>;
}
