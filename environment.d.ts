declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production";
            OPEN_AI_KEY: string;
            CLOUDFLARE_ENDPOINT: string;
            ASSEMBLY_AI_KEY: string;
            FIREFOX_PROFILE: string;
        }
    }
}
export {};
