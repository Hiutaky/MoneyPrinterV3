import path from "path";
import OpenAI from "openai";
import Elysia, { t } from "elysia";
import { AssemblyAI } from "assemblyai";
import { readableStreamToText } from "bun";
import Cloudflare from "../classes/cloudflare";
import {
    createImagePrompts,
    createScript,
    createScriptToSpeech,
    createTopic,
} from "../models/project.models";

const cld = new Cloudflare({ endpoint: process.env.CLOUDFLARE_ENDPOINT });
const assemblyAi = new AssemblyAI({ apiKey: process.env.ASSEMBLY_AI_KEY });
const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });

const profile = process.env.FIREFOX_PROFILE;

export type Metadata = {
    timestamp: number;
    argument: string;
    topic: string;
    script: string;
    language: string;
    sentences: number;
    images: number;
    imagesPath: string[];
    audio: boolean;
    str: boolean;
    video: boolean;
    publish: false | string;
    imagesPrompts: string[];
    title: string;
    description: string;
};

const defaultMetdata: Metadata = {
    argument: "",
    audio: false,
    images: 0,
    imagesPath: [],
    language: "",
    publish: false,
    script: "",
    sentences: 0,
    str: false,
    timestamp: 0,
    topic: "",
    video: false,
    imagesPrompts: [],
    title: "",
    description: "",
};

const readMetadata = async (videoId: string) => {
    const metadataPath = path.join(
        __dirname,
        "../..",
        "videos",
        videoId,
        "metadata.json"
    );
    if (await Bun.file(metadataPath).exists()) {
        return await Bun.file(metadataPath).json();
    } else return defaultMetdata;
};

const updateMetadata = async (videoId: string, metadata: Partial<Metadata>) => {
    let readMetadata: Partial<Metadata> = {};
    const metadataPath = path.join(
        __dirname,
        "../..",
        "videos",
        videoId,
        "metadata.json"
    );
    if (await Bun.file(metadataPath).exists()) {
        readMetadata = await Bun.file(metadataPath).json();
    } else {
        readMetadata = defaultMetdata;
        readMetadata.timestamp = new Date().getTime();
        await Bun.write(
            Bun.file(metadataPath),
            JSON.stringify(defaultMetdata, null, 2)
        );
    }
    Object.keys(metadata).map((key) => {
        if (key === "imagesPath") {
            readMetadata[key]?.push(
                // @ts-ignore
                metadata[key]?.at(0)
            );
        } else {
            // @ts-ignore
            readMetadata[key] = metadata[key];
        }
    });

    await Bun.write(
        Bun.file(metadataPath),
        JSON.stringify(readMetadata, null, 2)
    );
};

export const projectRoutes = new Elysia({
    prefix: "project",
})
    .get("/:id", async ({ params: { id } }) => {
        return await readMetadata(id);
    })
    .get("/:id/images/:image", async ({ params: { id, image } }) => {
        const imagePath = path.join(__dirname, "../..", "videos", id, image);
        try {
            const imagefile = await Bun.file(imagePath).arrayBuffer();
            if (imagefile) {
                return new Response(imagefile, {
                    headers: {
                        "Content-Type": "image/png",
                    },
                });
            } else {
                return new Response("Immagine non trovata", { status: 404 });
            }
        } catch (error) {
            console.error("Errore nel recupero dell'immagine:", error);
            return new Response("Errore del server", { status: 500 });
        }
    })
    .get("/:id/audio", async ({ params: { id } }) => {
        const audioPath = path.join(
            __dirname,
            "../..",
            "videos",
            id,
            "tts.wav"
        );
        try {
            const audiofile = await Bun.file(audioPath).arrayBuffer();
            if (audiofile) {
                return new Response(audiofile, {
                    headers: {
                        "Content-Type": "audio/wav",
                    },
                });
            } else {
                return new Response("Audio non trovato", { status: 404 });
            }
        } catch (error) {
            console.error("Errore nel recupero dell'audio:", error);
            return new Response("Errore del server", { status: 500 });
        }
    })
    .get("/:id/video/", async ({ params: { id } }) => {
        const videoPath = path.join(
            __dirname,
            "../..",
            "videos",
            id,
            "combined.mp4"
        );
        try {
            const videofile = await Bun.file(videoPath).arrayBuffer();
            if (videofile) {
                return new Response(videofile, {
                    headers: {
                        "Content-Type": "video/mpeg",
                    },
                });
            } else {
                return new Response("Audio non trovato", { status: 404 });
            }
        } catch (error) {
            console.error("Errore nel recupero dell'audio:", error);
            return new Response("Errore del server", { status: 500 });
        }
    })

    .get("/:id/metadata", async ({ params: { id } }) => {
        const metadata = await readMetadata(id);

        const title = await cld.generateResponse(`
            Please generate a YouTube Video Title for the following topic, including 2 hashtags : ${metadata.topic}. Only return the title, nothing else. LIMIT the max 99 characters.
        `);
        const description = await cld.generateResponse(`
            Please generate a YouTube Video Description for the following script: ${metadata.script}. Only return the description, nothing else.
        `);

        await updateMetadata(id, {
            title: title,
            description: description,
        });

        return {
            title,
            description,
        };
    })

    .get("/:id/publish", async ({ params: { id } }) => {
        const metadata = await readMetadata(id);
        try {
            const args = [
                "python3",
                "publish.py",
                `--profile=${profile}`,
                `--id=${id}`,
                `--title="${metadata?.title}"`,
                `--description="${metadata?.description}"`,
            ];
            console.log(args.join(" "));
            const { stdout } = Bun.spawn(args, { cwd: "./python" });
            await readableStreamToText(stdout);
            await updateMetadata(id, {
                publish: "true",
            });
            return true;
        } catch (e) {
            return false;
            console.error(e);
        }
    })

    // POST

    .post("/create/:id", async ({ params: { id } }) => {
        const audioPath = path.join(
            __dirname,
            "../..",
            "videos",
            id,
            "tts.wav"
        );
        const transcript = await assemblyAi.transcripts.transcribe({
            audio: audioPath,
        });
        const subtitles = await assemblyAi.transcripts.subtitles(
            transcript.id,
            "srt"
        );
        const subPath = path.join(__dirname, "../..", "videos", id, `sub.srt`);
        await Bun.write(subPath, subtitles);
        const { stdout, stderr } = Bun.spawnSync(
            ["python3", "combine_video.py", `--id=${id}`],
            {
                cwd: "./python",
            }
        );
        await updateMetadata(id, {
            video: true,
        });
        return true;
    })

    .post(
        "/create/:id/topic",
        async ({ params: { id }, body: { argument, prompt } }) => {
            const topic = await cld.generateResponse(
                prompt.replaceAll("%ARGUMENT%", argument)
            );
            await updateMetadata(id, {
                argument: argument,
                topic: topic,
            });
            return topic;
        },
        {
            body: createTopic,
        }
    )

    .post(
        "/create/:id/script",
        async ({
            params: { id },
            body: { prompt, topic, language, sentences },
        }) => {
            const script = await cld.generateResponse(
                prompt
                    .replaceAll("%TOPIC%", topic)
                    .replaceAll("%LANGUAGE%", language)
                    .replaceAll("%SENTENCES%", sentences)
            );
            await updateMetadata(id, {
                script: script,
                language: language,
                sentences: Number(sentences),
            });
            return script;
        },
        {
            body: createScript,
        }
    )

    .post(
        "/create/:id/imagePrompts",
        async ({ params: { id }, body: { images, script, topic, prompt } }) => {
            const imagePrompts = await cld.generateResponse(
                prompt
                    .replaceAll("%TOPIC%", topic)
                    .replaceAll("%SCRIPT%", script)
                    .replaceAll("%IMAGES%", images),
                true
            );
            await updateMetadata(id, {
                imagesPrompts: imagePrompts as string[],
            });
            return imagePrompts;
        },
        {
            body: createImagePrompts,
        }
    )

    .post(
        "/create/:id/image",
        async ({ params: { id }, body: { prompt, videoId } }) => {
            const image = await cld.generateImage(prompt, videoId);
            await updateMetadata(id, {
                // @ts-ignore
                imagesPath: [image],
            });

            return image;
        },
        {
            body: t.Object({
                prompt: t.String(),
                videoId: t.String(),
            }),
        }
    )

    .post(
        "/create/:id/sts",
        async ({ params: { id }, body: { script } }) => {
            script = script.replaceAll("[^\w\s.?!]", "");

            const speech = await openai.audio.speech.create({
                model: "tts-1",
                voice: "ash",
                input: script,
            });

            const buffer = await speech.arrayBuffer();

            Bun.write(
                path.join(__dirname, "../..", "videos", id, "tts.wav"),
                buffer
            );

            await updateMetadata(id, {
                audio: true,
            });

            return "tts.wav";
        },
        {
            body: createScriptToSpeech,
        }
    );
