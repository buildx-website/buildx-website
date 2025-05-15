import { useState } from 'react';
import { DiffContent, Step, StepType } from '@/types/types';
import { execCmd, fetchFileContent, saveOrCreateFileContent } from '@/lib/worker-config';
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

  return {
    currentStep,
    handleStep
  };
}

const handleEditFileStep = async (containerId: string, step: Step): Promise<void> => {
  try {
    if (!step.path || !step.code) return;
    const stepContent = JSON.parse(step.code);
    console.log("stepContent", stepContent);
    let context = stepContent.filter((diff: DiffContent) => diff.type === 'context').map((diff: DiffContent) => diff.line);
    context = context.map((line: string) => line.replace(/@@/g, '').trim());
    context = context[0].split(' ');
    console.log("context", context);

    const rm = context[0]
    const add = context[1]

    const rmStart = rm.split(',')[0].replace('-', '')
    const rmEnd = rm.split(',')[1].replace('-', '')

    const addStart = add.split(',')[0].replace('+', '')
    const addEnd = add.split(',')[1].replace('+', '')

    const fileContent = await fetchFileContent(containerId, step.path);
    const fileContentArray = (fileContent.fileContent).split('\n');

    console.log("fileContentArray", fileContentArray);

    const rmStartIndex = parseInt(rmStart);
    const rmEndIndex = parseInt(rmEnd);
    const addStartIndex = parseInt(addStart);
    const addEndIndex = parseInt(addEnd);
    console.log("rmStartIndex", rmStartIndex);
    console.log("rmEndIndex", rmEndIndex);
    console.log("addStartIndex", addStartIndex);
    console.log("addEndIndex", addEndIndex);

    fileContentArray.splice(rmStartIndex - 1, rmEndIndex - rmStartIndex + 1);
    console.log("fileContentArray after removing lines", fileContentArray);

    const newLines = stepContent.filter((diff: DiffContent) => diff.type === 'add').map((diff: DiffContent) => diff.line);
    console.log("newLines", newLines);
    fileContentArray.splice(addStartIndex - 1, 0, ...newLines);

    console.log("modified fileContentArray", fileContentArray);

    const finalFileContent = fileContentArray.join('\n');
    console.log("finalFileContent", finalFileContent);

    const dir = step.path.split('/').slice(0, -1).join('/');
    console.log("dir", dir);
    console.log("step.path", step.path);

    await saveOrCreateFileContent(containerId, "/app", step.path, finalFileContent);
  } catch (error) {
    console.error('Error in handleEditFileStep:', error);
    throw error;
  }
}


