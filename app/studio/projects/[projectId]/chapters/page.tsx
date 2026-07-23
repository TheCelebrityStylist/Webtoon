import { ProductionStoryCanvas } from "@/components/story-canvas/ProductionStoryCanvas";
export default async function ChaptersPage({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; return <ProductionStoryCanvas projectId={projectId}/>; }
