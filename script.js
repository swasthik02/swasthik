// Convert password into an encryption key

async function createKey(password, salt) {

    const encoder = new TextEncoder();

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 600000,
            hash: "SHA-256"
        },
        keyMaterial,
        {
            name: "AES-GCM",
            length: 256
        },
        false,
        ["encrypt", "decrypt"]
    );

}


// Encrypt File

async function encryptFile() {

    try {

        const file = document.getElementById("fileInput").files[0];

        const password = document.getElementById("password").value;

        const result = document.getElementById("result");

        if (!file || !password) {
            result.textContent = "Please select a file and enter a password.";
            return;
        }

        if (!crypto.subtle) {
            result.textContent = "Web Crypto requires HTTPS or localhost.";
            return;
        }

        result.textContent = "Encrypting file...";

        const data = await file.arrayBuffer();

        const salt = crypto.getRandomValues(new Uint8Array(16));

        const iv = crypto.getRandomValues(new Uint8Array(12));

        const key = await createKey(password, salt);

        const encrypted = await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            data
        );

        // Store file metadata with encrypted data

        const metadata = {
            name: file.name,
            type: file.type || "application/octet-stream"
        };

        const metadataBytes = new TextEncoder().encode(
            JSON.stringify(metadata)
        );

        const header = new Uint8Array(4 + 16 + 12 + metadataBytes.length);

        header.set([70, 71, 85, 49], 0);

        header.set(salt, 4);

        header.set(iv, 20);

        header.set(metadataBytes, 32);

        const output = new Blob(
            [header, encrypted],
            { type: "application/octet-stream" }
        );

        downloadFile(output, file.name + ".fg");

        result.textContent = "File encrypted successfully!";

    } catch (error) {

        document.getElementById("result").textContent =
            "Encryption failed. Please try again.";

    }

}


// Decrypt File

async function decryptFile() {

    try {

        const file = document.getElementById("fileInput").files[0];

        const password = document.getElementById("password").value;

        const result = document.getElementById("result");

        if (!file || !password) {
            result.textContent = "Please select an encrypted file and enter its password.";
            return;
        }

        result.textContent = "Decrypting file...";

        const data = new Uint8Array(await file.arrayBuffer());

        if (
            data.length < 49 ||
            data[0] !== 70 ||
            data[1] !== 71 ||
            data[2] !== 85 ||
            data[3] !== 49
        ) {
            throw new Error("Invalid file format");
        }

        const salt = data.slice(4, 20);

        const iv = data.slice(20, 32);

        const metadataLength = new DataView(
            data.buffer,
            data.byteOffset,
            data.byteLength
        ).getUint32(32, false);

        const metadataEnd = 36 + metadataLength;

        if (metadataEnd >= data.length) {
            throw new Error("Invalid metadata");
        }

        const metadata = JSON.parse(
            new TextDecoder().decode(data.slice(36, metadataEnd))
        );

        const encryptedData = data.slice(metadataEnd);

        const key = await createKey(password, salt);

        const decrypted = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            encryptedData
        );

        const output = new Blob(
            [decrypted],
            { type: metadata.type }
        );

        downloadFile(output, metadata.name);

        result.textContent = "File decrypted successfully!";

    } catch (error) {

        document.getElementById("result").textContent =
            "Decryption failed. Check your password and encrypted file.";

    }

}


// Download File

function downloadFile(blob, filename) {

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

}