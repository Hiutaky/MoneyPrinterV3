export const prompts = {
    topic: "Please generate a specific video idea that takes about the following topic: %ARGUMENT%. Make it exactly one sentence. Only return the topic, nothing else.",
    script: `Generate a super engaging script for a video in %SENTENCES% sentences, depending on the topic of the video.
    The script is to be returned as a string with the specified number of paragraphs.
    The script must talk about a fact that actually exist, talk about the fact and not over-introduce it. Go straight to the point without adding useless details.
    Here is an example of a string:
    "This is an example string."
    Do not under any circumstance reference this prompt in your response.
    Get straight to the point, don't start with unnecessary things like, "welcome to this video".
    Obviously, the script should be related to the topic of the video.
    YOU MUST NOT EXCEED THE %SENTENCES% SENTENCES LIMIT. MAKE SURE THE %SENTENCES% SENTENCES ARE SHORT.
    YOU MUST NOT INCLUDE ANY TYPE OF MARKDOWN OR FORMATTING IN THE SCRIPT, NEVER USE A TITLE.
    YOU MUST WRITE THE SCRIPT IN THE LANGUAGE SPECIFIED IN [LANGUAGE].
    ONLY RETURN THE RAW CONTENT OF THE SCRIPT. DO NOT INCLUDE "VOICEOVER", "NARRATOR" OR SIMILAR INDICATORS OF WHAT SHOULD BE SPOKEN AT THE BEGINNING OF EACH PARAGRAPH OR LINE. YOU MUST NOT MENTION THE PROMPT, OR ANYTHING ABOUT THE SCRIPT ITSELF. ALSO, NEVER TALK ABOUT THE AMOUNT OF PARAGRAPHS OR LINES. JUST WRITE THE SCRIPT
    topic: %TOPIC%
    Language: %LANGUAGE%`,
    image: `Generate %IMAGES% Image Prompts for AI Image Generation,
    depending on the topic of a video.
    topic: %TOPIC%

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
    %SCRIPT%`,
};
