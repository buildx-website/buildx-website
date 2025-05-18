import { Step, StepType } from "@/types/types";

let stepId = 1;

function getStep(action: string): Step | null {
    const actionTypeMatch = action.match(/<boltAction[^>]*type="([^"]+)"/);
    const diffMatch = action.match(/<diff[^>]*>/);
    if (diffMatch) {
        const lines = diffMatch[0].trim().split("\n");
        const diff = lines[0].trim();
        const pathMatch = diff.match(/path="([^"]+)"/);
        const path = pathMatch ? pathMatch[1] : null;
        const diffContent = action.substring(lines[0].length + 1, action.indexOf("</diff>"));
        
        return ({
            id: stepId++,
            title: `Update ${path || 'file'}`,
            description: `Update ${path || 'file'}`,
            type: StepType.EditFile,
            status: 'pending',
            code: diffContent.trim(),
            path: path ? path : undefined
        });
    }

    if (actionTypeMatch) {
        const actionType = actionTypeMatch ? actionTypeMatch[1] : null;
        const filePathMatch = action.match(/<boltAction[^>]*filePath="([^"]+)"/);
        const filePath = filePathMatch ? filePathMatch[1] : null;
        const contentMatch = action.match(/<boltAction[^>]*>([\s\S]*?)<\/boltAction>/);
        const content = contentMatch ? contentMatch[1] : "";

        if (actionType === 'file') {
            return ({
                id: stepId++,
                title: `Create ${filePath || 'file'}`,
                description: '',
                type: StepType.CreateFile,
                status: 'pending',
                code: content.trim(),
                path: filePath ? filePath : undefined
            });
        } else if (actionType === 'shell') {
            return ({
                id: stepId++,
                title: 'Run command',
                description: '',
                type: StepType.RunScript,
                status: 'pending',
                code: content.trim()
            });
        }
    }
    return null;
}

export class ArtifactParser {
    private content: string;
    private contentBeforeArtifact: string;
    private contentAfterArtifact: string;
    private currentAction: string;
    private currentActionContent: string;
    private actions: string[];
    private artifactTitle: string;
    private artifactId: string;
    private diffContent: string;
    constructor() {
        this.content = '';
        this.contentBeforeArtifact = '';
        this.contentAfterArtifact = '';
        this.currentAction = '';
        this.currentActionContent = '';
        this.actions = [];
        this.artifactTitle = '';
        this.artifactId = '';
        this.diffContent = '';
    }

    addChunk(chunk: string) {
        this.content += chunk;

        if (!this.artifactId) {
            const idMatch = this.content.match(/<boltArtifact[^>]*id="([^"]+)"/);
            if (idMatch) this.artifactId = idMatch[1];
        }
        if (!this.artifactTitle) {
            const titleMatch = this.content.match(/<boltArtifact[^>]*title="([^"]+)"/);
            if (titleMatch) this.artifactTitle = titleMatch[1];
        }
        const startIdx = this.content.indexOf("<boltArtifact");

        if (startIdx === -1) {
            this.contentBeforeArtifact += chunk;
        } else {
            const before = this.content.substring(0, startIdx);
            this.contentBeforeArtifact = before;
        }

        const endIdx = this.content.indexOf("</boltArtifact>");

        if (endIdx !== -1 && startIdx !== -1 && endIdx > startIdx) {
            const after = this.content.substring(endIdx + "</boltArtifact>".length);
            this.contentAfterArtifact = after;
            this.currentAction = "";
        }

        let currentContent = this.content;
        while (true) {
            const actionStartIdx = currentContent.indexOf("<boltAction");
            const actionEndIdx = currentContent.indexOf("</boltAction>");
            const diffStartIdx = currentContent.indexOf("<bolt_file_modifications>");
            const diffEndIdx = currentContent.indexOf("</bolt_file_modifications>");

            if (diffStartIdx !== -1 && diffEndIdx !== -1 && diffEndIdx > diffStartIdx) {
                const diffContent = currentContent.substring(diffStartIdx, diffEndIdx + "</bolt_file_modifications>".length);
                this.actions.push(diffContent);
                currentContent = currentContent.substring(diffEndIdx + "</bolt_file_modifications>".length);
                continue;
            }

            if (actionStartIdx !== -1 && actionEndIdx !== -1) {
                const actionChunk = currentContent.substring(actionStartIdx, actionEndIdx + "</boltAction>".length);
                this.actions.push(actionChunk);
                currentContent = currentContent.substring(actionEndIdx + "</boltAction>".length);
                continue;
            }

            break;
        }

        this.content = "";
    }

    getStep() {
        if (this.actions.length === 0) return;
        const action = this.actions.shift();
        if (!action) return;
        const step = getStep(action);
        if (step) {
            return step;
        }
        return null;
    }

    getActions(): string[] {
        return this.actions;
    }

    getCurrentActionContent(): string {
        return this.currentActionContent;
    }

    getCurrentActionTitle(): string {
        return this.currentAction
    }

    getContent(): string {
        return this.content;
    }

    getContentBeforeArtifact(): string {
        return this.contentBeforeArtifact;
    }

    getContentAfterArtifact(): string {
        return this.contentAfterArtifact;
    }
}
