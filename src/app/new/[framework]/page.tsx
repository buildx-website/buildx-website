"use client"

import Loading from "@/app/loading";
import { useUser } from "@/hooks/useUser";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function NewProject() {
    const router = useRouter();
    const { isLoggedIn } = useUser();
    const params = useParams();
    const framework = params.framework as string;
    console.log("Framework: ", framework);

    useEffect(() => {
        if (!isLoggedIn) {
            router.push("/");
        } else if (framework !== "react" && framework !== "nextjs" && framework !== "manim") {
            router.push("/");
        } else {
            handleCreateProject();
        }
    }, [isLoggedIn, router, framework]);

    
    async function handleCreateProject() {
        const createProject = await fetch("/api/main/create-project", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt: `This is a ${framework.charAt(0).toUpperCase() + framework.slice(1)} project`, framework: framework,
            }),
        });
        
        const project = await createProject.json();
        console.log("CREATEDProject: ", project);
        if (createProject.status != 200) {
            return toast.error(project.error);
        }
        if (framework == 'manim') {
            router.push(`/video-editor/${project.id}`);
        } else {
            router.push(`/editor/${project.id}`);
        }
    }

    
    return (
       <Loading />
    )

}