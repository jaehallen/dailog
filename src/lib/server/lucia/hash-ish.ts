//blog: https://lord.technology/2024/02/21/hashing-passwords-on-cloudflare-workers.html
export class AppPass {
    private format: "pkcs8" | "raw" | "spki";
    private algorithm: string;
    private usages: KeyUsage[];
    private salt: Uint8Array;
    private iterations: number;

    constructor(salt?: Uint8Array, options: {
        format?: "pkcs8" | "raw" | "spki",
        algorithm?: string,
        usages?: KeyUsage[],
        iterations?: number
    } = {}) {
        this.salt = salt || crypto.getRandomValues(new Uint8Array(16))
        this.format = options.format || "raw";
        this.algorithm = options.algorithm || "PBKDF2";
        this.usages = options.usages || ["deriveBits", "deriveKey"];
        this.iterations = options.iterations || 100000;
    }

    public async hash(password: string, salt?: Uint8Array): Promise<string> {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            this.format,
            encoder.encode(password),
            { name: this.algorithm },
            false,
            this.usages
        );
        const key = await crypto.subtle.deriveKey(
            {
                name: this.algorithm,
                salt: salt || this.salt,
                iterations: this.iterations,
                hash: "SHA-256",
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
        const exportedKey = (await crypto.subtle.exportKey(
            this.format,
            key
        )) as ArrayBuffer;
        const hashBuffer = new Uint8Array(exportedKey);
        const hashArray = Array.from(hashBuffer);
        const hashHex = hashArray
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        const saltHex = Array.from(this.salt)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        return `${saltHex}:${hashHex}`;
    }

    public async verify(
        storedHash: string,
        passwordAttempt: string
    ): Promise<boolean> {
        const [saltHex, originalHash] = storedHash.split(":");
        const matchResult = saltHex.match(/.{1,2}/g);
        if (!matchResult) {
            throw new Error("Invalid salt format");
        }
        const salt = new Uint8Array(matchResult.map((byte) => parseInt(byte, 16)));
        const attemptHashWithSalt = await this.hash(passwordAttempt, salt);
        const [, attemptHash] = attemptHashWithSalt.split(":");
        return attemptHash === originalHash;
    }
}