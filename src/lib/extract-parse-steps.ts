
import { ArtifactParser } from "./artifactParser";
import { Message, Step } from "@/types/types";

export function extractAndParseStepsFromMessages(messages: Message[]): Step[] {
    let allSteps: Step[] = [];
    let stepCounter = 0;

    messages.forEach(message => {
        let fullText = "";
        message.content.forEach(content => {
            if (content.type === "text") {
                fullText += content.text;
            }
        });

        const artifactParser = new ArtifactParser();
        const newSteps: Step[] = [];
        artifactParser.addChunk(fullText);

        
        while (artifactParser.getActions().length > 0) {
            const step = artifactParser.getStep();
            if (!step) continue;
            newSteps.push(step)
        }

        const stepsWithIds = newSteps.map(step => {
            return { ...step, id: stepCounter++ };
        });

        allSteps = [...allSteps, ...stepsWithIds];

    });

    return allSteps;
}