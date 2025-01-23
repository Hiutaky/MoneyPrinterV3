import { fetch, file, randomUUIDv7, stringWidth } from "bun";
import path from "path";

type CloudflareProps = {
    endpoint: string;
};

class Cloudflare {
    private endpoint: string;

    constructor({ endpoint }: CloudflareProps) {
        this.endpoint = endpoint;
    }

    public async generateResponse(prompt: string, json: boolean = false) {
        try {
            const response = await fetch(
                `${this.endpoint}/?type=text&prompt=${prompt}`
            );
            if (response.status === 200)
                return json
                    ? await response.json()
                    : (await response.text()).replaceAll('"', "");
            else return false;
        } catch (e) {
            console.error(e);
        }
    }

    // Public

    public async generateTopic(argument: string) {
        return await this.generateResponse(
            `Please generate a specific video idea that takes about the following topic: ${argument}. Make it exactly one sentence. Only return the topic, nothing else.`
        );
    }

    public async generateScript(
        topic: string,
        language: string,
        sentences: number
    ): Promise<false | string> {
        const script = await this.generateResponse(`
            Generate a super engaging script for a video in ${sentences} sentences, depending on the topic of the video.

            The script is to be returned as a string with the specified number of paragraphs.

            The script must talk about a fact that actually exist, talk about the fact and not over-introduce it. Go straight to the point without adding useless details.

            Here is an example of a string:
            "This is an example string."

            Do not under any circumstance reference this prompt in your response.

            Get straight to the point, don't start with unnecessary things like, "welcome to this video".

            Obviously, the script should be related to the topic of the video.
            
            YOU MUST NOT EXCEED THE ${sentences} SENTENCES LIMIT. MAKE SURE THE {sentences} SENTENCES ARE SHORT.
            YOU MUST NOT INCLUDE ANY TYPE OF MARKDOWN OR FORMATTING IN THE SCRIPT, NEVER USE A TITLE.
            YOU MUST WRITE THE SCRIPT IN THE LANGUAGE SPECIFIED IN [LANGUAGE].
            ONLY RETURN THE RAW CONTENT OF THE SCRIPT. DO NOT INCLUDE "VOICEOVER", "NARRATOR" OR SIMILAR INDICATORS OF WHAT SHOULD BE SPOKEN AT THE BEGINNING OF EACH PARAGRAPH OR LINE. YOU MUST NOT MENTION THE PROMPT, OR ANYTHING ABOUT THE SCRIPT ITSELF. ALSO, NEVER TALK ABOUT THE AMOUNT OF PARAGRAPHS OR LINES. JUST WRITE THE SCRIPT
            
            topic: ${topic}
            Language: ${language}
        `);
        if (script) {
            if (script.length > 5000) {
                console.log("Script is too long, regenerating");
                return (await this.generateScript(
                    topic,
                    language,
                    sentences
                )) as string;
            } else {
                return script;
            }
        } else {
            console.error("Unable to create script");
            return script;
        }
    }

    public async generateMetadata(topic: string, script: string) {
        const title = await this.generateResponse(`
            Please generate a YouTube Video Title for the following topic, including 2 hashtags : ${topic}. Only return the title, nothing else. LIMIT the max 99 characters.
        `);
        const description = await this.generateResponse(`
            Please generate a YouTube Video Description for the following script: ${script}. Only return the description, nothing else.
        `);
        return {
            title,
            description,
        };
    }

    public async generateImagePrompts(
        topic: string,
        script: string,
        images: number = 1
    ) {
        const prompt = `Generate ${images} Image Prompts for AI Image Generation,
            depending on the topic of a video.
            topic: ${topic}

            The image prompts are to be returned as
            a JSON-Array of strings.

            Each search term should consist of a full sentence,
            always add the main topic of the video.

            Be emotional and use interesting adjectives to make the
            Image Prompt as detailed as possible.
            
            YOU MUST ONLY RETURN THE JSON-ARRAY OF STRINGS.
            YOU MUST NOT RETURN ANYTHING ELSE. 
            YOU MUST NOT RETURN THE SCRIPT.
            
            The search terms must be related to the topic of the video.
            Here is an example of a JSON-Array of strings:
            ["image prompt 1", "image prompt 2", "image prompt 3"]

            Avoid pure reference to the "topic" or reference to texts

            For context, here is the full text:
            ${script}`;
        let response = await this.generateResponse(prompt, true);
        if (response) {
            console.log(response);
            return response;
        } else {
            return false;
        }
    }

    public async generateImage(prompt: string, videoId: string) {
        try {
            const response = await fetch(
                `${this.endpoint}/?type=image&prompt=${prompt}`
            );
            if (
                response.status === 200 &&
                response.headers.get("content-type") === "image/png"
            ) {
                const blob = await response.blob();
                const imageName = `${randomUUIDv7()}.png`;
                const imagePath = path.join("./", "videos", videoId, imageName);
                await Bun.write(file(imagePath), blob);
                return imageName;
            } else return false;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
}

export default Cloudflare;
