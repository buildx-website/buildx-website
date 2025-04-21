export const WORKER_URL = 'http://localhost:8080/api';

export async function startNewContainer(image: string, command: string) {
    const response = await fetch(`${WORKER_URL}/start`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            image: image,
            command: command,
        })
    });
    const data = await response.json();
    return data;
}

export async function getFileTree(containerId: string, path: string) {
    if (!containerId) return;
    const response = await fetch(`${WORKER_URL}/file/structure/?containerId=${containerId}&path=${path}`, {
        method: 'GET',
        headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });
    const data = await response.json();

    return data;
}

export async function fetchFileContent(containerId: string, filePath: string) {
    const response = await fetch(`${WORKER_URL}/file/?containerId=${containerId}&path=${filePath}`, {
        method: "GET",
        headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch file content")
    }
    const data = await response.json()
    return data;
}

export async function saveOrCreateFileContent(containerId: string, workingDir: string, fileName: string, content: string) {
    const response = await fetch(`${WORKER_URL}/file/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
            containerId,
            files: [
                {
                    name: fileName,
                    content,
                },
            ],
            workdir: workingDir,
        }),
    });
    if (!response.ok) {
        throw new Error("Failed to save or create file content")
    }
    const data = await response.json()
    return data;
}

export async function streamExac(containerId: string, command: string, workdir: string) {
    try {
        const response = await fetch(`${WORKER_URL}/exec/stream`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
                containerId,
                command,
                workdir,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Stream failed: ${errorData.error || response.statusText}`);
        }

        if (!response.body) {
            throw new Error("Response body is null");
        }
        return response.body;
    } catch (error) {
        console.error("Error in streamExac:", error);
        throw error;
    }
}