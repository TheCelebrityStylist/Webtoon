import { CommercialProjectWizard } from "@/components/CommercialProjectWizard"; import { createCommercialProject } from "@/app/actions/projects";
export default function NewProjectPage() { return <main className="commercial-onboarding"><CommercialProjectWizard action={createCommercialProject}/></main>; }
