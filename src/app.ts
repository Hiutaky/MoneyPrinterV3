import Elysia from "elysia";
import { cors } from "@elysiajs/cors";
import { projectRoutes } from "./routes/project";
import index from "../frontend/index.html"


export const App = new Elysia({
    serve: {
        static: {
            "/frontend": index 
        },
        development: true
    }
}).use(cors()).use(projectRoutes);
export type App = typeof App;
