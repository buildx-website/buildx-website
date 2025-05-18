import { useState } from 'react';
import {  Step, StepType } from '@/types/types';
import { execCmd, fetchFileContent, saveOrCreateFileContent } from '@/lib/worker-config';
import { toast } from 'sonner';
import * as Diff from 'diff';

export function useStepHandler(containerId: string, reloadFileTree: () => Promise<void>) {
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  const handleStep = async (step: Step): Promise<string | undefined> => {
    if (!step || step.status !== "pending") return;

    setCurrentStep(step.path || step.code || null);

    try {
      if (step.type === StepType.CreateFile) {
        await handleFileStep(step);
      } else if (step.type === StepType.RunScript) {
        return await handleScriptStep(step);
      } else if (step.type === StepType.EditFile) {
        await handleEditFileStep(containerId, step);
      }

      await reloadFileTree();
    } catch (error) {
      console.error(`Error handling step:`, error);
      toast.error(`Failed to execute step: ${step.path || step.code}`);
      throw error;
    } finally {
      setCurrentStep(null);
    }
  };

  const handleFileStep = async (step: Step): Promise<void> => {
    if (!step.path || !step.code) return;

    const split = step.path.split("/");
    const fileName = split[split.length - 1];
    const filePath = split.length > 1
      ? split.slice(0, split.length - 1).join("/") + "/"
      : "/app";

    const response = await saveOrCreateFileContent(
      containerId,
      filePath,
      fileName,
      step.code
    );

    if (response.success) {
      toast.success(`Created file: ${fileName}`);
    } else {
      throw new Error(`Failed to create file: ${fileName}`);
    }
  };

  const handleScriptStep = async (step: Step): Promise<string | undefined> => {
    if (!step.code) return;

    if (step.code === "npm run dev" || step.code === "npm start") {
      return step.code;
    }

    const response = await execCmd(containerId, step.code, "/app");
    if (!response.success) {
      throw new Error(`Command failed: ${step.code}`);
    }

    toast.success(`Executed: ${step.code}`);
    return undefined;
  };

  const handleEditFileStep = async (containerId: string, step: Step): Promise<void> => {
    try {
      if (!step.path || !step.code) return;
      
      const normalizedDiff = step.code.replace(/\r\n/g, '\n');
      const patch = Diff.parsePatch(normalizedDiff);
      
      if (!patch || patch.length === 0) {
        throw new Error('Invalid patch format');
      }
  
      const fileContent = await fetchFileContent(containerId, step.path);
      
      const result = Diff.applyPatch(fileContent.fileContent, patch[0], {
        compareLine: (lineNumber, line, operation, patchContent) => {
          const normalizedLine = line.trim();
          const normalizedPatchLine = patchContent.trim();
          return normalizedLine === normalizedPatchLine;
        }
      });
      
      if (result === false) {
        throw new Error('Failed to apply patch - content mismatch');
      }
      await saveOrCreateFileContent(containerId, "/app", step.path, result);
      toast.success(`Edited file: ${step.path}`);
      
    } catch (error) {
      console.error('Error in handleEditFileStep:', error);
      toast.error(`Failed to edit file: ${step.path}`);
      throw error;
    }
  }
  
  return {
    currentStep,
    handleStep
  };
}




