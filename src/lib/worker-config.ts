export const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "http://localhost:8080";
console.log("WORKER_URL", WORKER_URL);

export async function startNewContainer(image: string, command: string, ports: string[]) {
    const response = await fetch(`${WORKER_URL}/start`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            image: image,
            command: command,
            ports: ports,
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

export async function execCmd(containerId: string, command: string, workdir: string) {
    try {
        const response = await fetch(`${WORKER_URL}/exec`, {
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
            throw new Error(`Execution failed: ${errorData.error || response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error in execCmd:", error);
        return {
            sucess: false,
            error: error instanceof Error ? error.message : String(error),
        }
    }
}

export async function tunnelConnection(containerId: string, port: number) {
    try {
        const response = await fetch(`${WORKER_URL}/tunnel`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'omit',
            body: JSON.stringify({containerId, port}),
        })
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Tunnel connection failed: ${errorData.error || response.statusText}`);
        }
        const data = await response.json();
        console.log("tunnelConnection", data);
        return data;
    } catch (error) {
        console.error("Error in tunnelConnection:", error);
        return {
            url: null,
            error: error instanceof Error ? error.message : String(error),
        }
    }
}