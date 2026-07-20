import type { Metadata } from "next";
import { DemoProvider } from "@/components/studio-demo/DemoProvider";
import { StudioShell } from "@/components/studio-demo/StudioShell";
import "./studio-demo.css";
export const metadata:Metadata={title:"Demo studio · Morrow",robots:{index:false,follow:false}};
export default function DemoLayout({children}:{children:React.ReactNode}){return <DemoProvider><StudioShell>{children}</StudioShell></DemoProvider>}
