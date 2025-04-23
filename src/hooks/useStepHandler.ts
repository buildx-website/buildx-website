import { useState } from 'react';
import { Step, StepType } from '@/types/types';
import { execCmd, saveOrCreateFileContent } from '@/lib/worker-config';
import { toast } from 'sonner';

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

  return {
    currentStep,
    handleStep
  };
}