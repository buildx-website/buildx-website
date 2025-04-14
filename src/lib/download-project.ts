import { FileType } from "@/types/types";
import JSZip from "jszip";
import { saveAs } from 'file-saver';

export const handleDownload = async (files: FileType[], projectId: string) => {
    const zip = new JSZip();

    const addFilesToZip = (files: FileType[], currentPath: string = '') => {
        files.forEach(file => {
            const filePath = `${currentPath}${file.name}`;
            if (file.type === 'file') {
                zip.file(filePath, file.content || '');
            } else if (file.type === 'directory' && file.children) {
                addFilesToZip(file.children, `${filePath}/`);
            }
        });
    };

    addFilesToZip(files);

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `project-${projectId}.zip`);
};