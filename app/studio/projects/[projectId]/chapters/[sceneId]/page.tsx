import { ProductionStoryCanvas } from "@/components/story-canvas/ProductionStoryCanvas";
export default async function ScenePage({ params }: { params: Promise<{ projectId: string; sceneId: string }> }) { const { projectId, sceneId } = await params; return <ProductionStoryCanvas projectId={projectId} sceneId={sceneId}/>; }
