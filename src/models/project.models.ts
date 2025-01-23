import { t, type Static } from "elysia";

export const createVideo = t.Object({
    argument: t.String(),
    language: t.String(),
    images: t.Number(),
    sentences: t.Number(),
    prompts: t.Object({
        topic: t.String(),
        script: t.String(),
        image: t.String(),
    }),
});

export const createTopic = t.Object({
    argument: t.String(),
    prompt: t.String(),
});

export const createScript = t.Object({
    prompt: t.String(),
    topic: t.String(),
    language: t.String(),
    sentences: t.String(),
});

export const createImagePrompts = t.Object({
    topic: t.String(),
    script: t.String(),
    images: t.String(),
    prompt: t.String(),
});

export const createScriptToSpeech = t.Object({
    script: t.String(),
});

export type CreateVideo = Static<typeof createVideo>;
