
import { parseXml } from "./steps";
import { Message, Step } from "@/types/types";

export function extractAndParseStepsFromMessages(messages: Message[]): Step[] {
    let allSteps: Step[] = [];
    let stepCounter = 0;

    messages.forEach(message => {
        // Extract message content as string
        let fullText = "";
        message.content.forEach(content => {
            if (content.type === "text") {
                fullText += content.text;
            }
        });


        console.log("Full text from message:", fullText);

        // Parse XML from the message content
        const newSteps = parseXml(fullText);

        // Add IDs to steps
        const stepsWithIds = newSteps.map(step => {
            return { ...step, id: stepCounter++ };
        });

        allSteps = [...allSteps, ...stepsWithIds];

    });

    return allSteps;
}