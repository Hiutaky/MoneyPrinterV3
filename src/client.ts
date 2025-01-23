import { treaty } from "@elysiajs/eden";
import type { App } from "./app";

export const API = treaty<App>("localhost:3000");
