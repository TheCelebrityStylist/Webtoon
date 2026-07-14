import { ProjectForm } from "@/components/ProjectForm"; import { createProject } from "@/app/actions/projects";
export default function NewProjectPage() { return <main className="studio-content narrow"><p className="eyebrow">NEW PROJECT</p><h1>Define the narrative promise.</h1><p className="lead">These details anchor every later story decision.</p><ProjectForm action={createProject}/></main>; }
