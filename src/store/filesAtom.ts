import { FileType } from "@/types/types";
import { create } from "zustand";

interface FileStore {
    files: FileType[];
    setFiles: (newFiles: FileType[]) => void;
    addFile: (file: FileType) => void;
    updateFile: (file: FileType) => void;
    clearFiles: () => void;
}

export const useFileStore = create<FileStore>((set) => ({
    files: [],
    setFiles: (newFiles: FileType[]) => set({ files: newFiles }),
    addFile: (file: FileType) => set((state) => ({
        files: [...state.files, file]
    })),
    updateFile: (file: FileType) => set((state) => {
        // Recursive function to update file in nested structure
        const updateFileRecursive = (files: FileType[]): FileType[] => {
            return files.map((f) => {
                // If this is the file we're looking for, update it
                if (f.id === file.id) {
                    return file;
                }
                // If this file has children, recursively check them
                if (f.children) {
                    return {
                        ...f,
                        children: updateFileRecursive(f.children)
                    };
                }
                // Otherwise, return the file unchanged
                return f;
            });
        };

        return {
            files: updateFileRecursive(state.files)
        };
    }),
    clearFiles: () => set({ files: [] }),
}));