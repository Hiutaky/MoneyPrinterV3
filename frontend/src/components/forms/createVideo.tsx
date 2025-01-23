import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "../ui/form";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import {
    type CreateVideo,
    createVideo,
} from "../../../../src/models/project.models";
import { Metadata } from "../../../../src/routes/project";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { API } from "../../../../src/client";
import { useEffect, useState } from "react";
import { randomId } from "elysia/utils";
import { prompts } from "@/constants";
import Skeleton from "../ui/skeleton";

const formSchema = createVideo;

const defaultGenerating = {
    topic: false,
    script: false,
    imagesPrompts: false,
    images: false,
    audio: false,
    video: false,
    metadata: false,
    publish: false,
} as const;

type Generating = {
    [key in keyof typeof defaultGenerating]: boolean;
};

const CreateVideo = () => {
    const [videoId, setVideoId] = useState(randomId());
    const [video, setVideo] = useState<boolean>(false);
    const [audio, setAudio] = useState<boolean>(false);
    const [topic, setTopic] = useState<string>("");
    const [script, setScript] = useState<string>("");
    const [imagesPrompts, setImagesPrompts] = useState<string[]>([]);
    const [images, setImages] = useState<string[]>([]);
    const [metadata, setMetadata] = useState({
        title: "",
        description: "",
    });

    const [generating, setGenerating] = useState<Generating>(defaultGenerating);

    const loadVideo = () => {
        const id = window.prompt("Enter Video ID");
        if (!id) return;
        setVideoId(id);
    };

    const form = useForm({
        resolver: typeboxResolver(formSchema),
        defaultValues: {
            argument: "3 facts about",
            language: "english",
            images: 6,
            sentences: 3,
            prompts: prompts,
        },
    });

    async function submit() {
        const values = form.getValues();
        setGenerating((prev) => ({ ...prev, topic: true }));
        const topicResponse = await API.project
            .create({ id: videoId })
            .topic.post({
                argument: values.argument,
                prompt: values.prompts.topic,
            });
        setTopic(topicResponse.data);
        setGenerating((prev) => ({ ...prev, topic: false, script: true }));
        const scriptResponse = await API.project
            .create({ id: videoId })
            .script.post({
                language: values.language,
                prompt: values.prompts.script,
                sentences: values.sentences.toString(),
                topic: topicResponse.data,
            });
        setScript(scriptResponse.data);
        setGenerating((prev) => ({
            ...prev,
            script: false,
            imagesPrompts: true,
        }));
        const imagesPrompts = await API.project
            .create({ id: videoId })
            .imagePrompts.post({
                images: values.images.toString(),
                prompt: values.prompts.image,
                script: scriptResponse.data,
                topic: topicResponse.data,
            });
        setImagesPrompts(imagesPrompts.data);
        setGenerating((prev) => ({
            ...prev,
            imagesPrompts: false,
            images: true,
        }));
    }

    const generateImages = async () => {
        for (const prompt of imagesPrompts) {
            const image = await API.project.create({ id: videoId }).image.post({
                prompt: prompt,
                videoId: videoId,
            });
            // @ts-ignore
            setImages((prevImages) => [...prevImages, image.data]);
        }
        setGenerating((prev) => ({ ...prev, images: false, audio: true }));
        const _audio = await API.project.create({ id: videoId }).sts.post({
            script: script,
        });
        setGenerating((prev) => ({ ...prev, audio: false }));

        setAudio(_audio.data ? true : false);
    };

    const generateVideo = async () => {
        setGenerating((prev) => ({ ...prev, video: true }));
        const response = await API.project
            .create({
                id: videoId,
            })
            .post();

        if (response) setVideo(true);
        setGenerating((prev) => ({ ...prev, video: false }));
    };

    const generateMetadata = async () => {
        setGenerating((prev) => ({ ...prev, metadata: true }));
        const _metadata = await API.project({ id: videoId }).metadata.get();
        if (!_metadata) return;
        // @ts-ignore
        setMetadata(_metadata.data);
        setGenerating((prev) => ({ ...prev, metadata: false }));
    };

    const publish = async () => {
        setGenerating((prev) => ({ ...prev, publish: true }));
        await API.project({
            id: videoId,
        }).publish.get();
        setGenerating((prev) => ({ ...prev, publish: true }));
        alert("Published");
    };

    useEffect(() => {
        async function fetchVideo() {
            const response = await API.project({
                id: videoId,
            }).get();
            if (!response.data.argument) return;
            else {
                const data = response.data as Metadata;
                form.setValue("argument", data.argument);
                form.setValue("language", data.language);
                form.setValue("sentences", data.sentences);
                form.setValue("images", data.images);
                setTopic(data.topic);
                setScript(data.script);
                setImagesPrompts(data.imagesPrompts);
                setImages(data.imagesPath);
                setAudio(data.audio);
                setVideo(data.video);
                setMetadata({
                    title: data.title,
                    description: data.description,
                });
            }
        }
        fetchVideo();
    }, [videoId]);

    useEffect(() => {
        if (imagesPrompts.length && !images.length) generateImages();
    }, [imagesPrompts]);

    const imagescount = form.watch('images')


    return (
        <div className="grid grid-cols-[25%_1fr_25%]">
            <form className="flex flex-col gap-2 p-5 border-e">
                <Form {...form}>
                    <span>
                        Video Id: <b>{videoId}</b>
                    </span>
                    <Button type="button" onClick={loadVideo}>
                        Fetch Video
                    </Button>
                    <FormDescription>
                        Setup the next AI Generated Video
                    </FormDescription>
                    <div className="grid grid-cols-2 items-center gap-3">
                        <FormField
                            name="argument"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Argument</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="language"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Language</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-2 items-center gap-3">
                        <FormField
                            name="images"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Images</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="sentences"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sentences</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormLabel>Prompts</FormLabel>
                    <FormDescription>
                        You can use dynamic tags that will be changed during the
                        creation process. Supported tags are:{" "}
                        <b>
                            %ARGUMENT%, %TOPIC%, %SCRIPT%, %SENTENCES%,
                            %IMAGES%, %LANGUAGE%
                        </b>
                        .
                    </FormDescription>
                    <FormField
                        name="prompts.topic"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Topic</FormLabel>
                                <FormControl>
                                    <Textarea rows={4} {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="prompts.script"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Script</FormLabel>
                                <FormControl>
                                    <Textarea rows={6} {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="prompts.image"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Image</FormLabel>
                                <FormControl>
                                    <Textarea rows={6} {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button loading={generating.topic} type="button" onClick={submit}>
                        Create
                    </Button>
                </Form>
            </form>
            <div className="flex flex-col gap-3 p-5 border-e">
                <b>Topic</b>
                {
                    generating.topic ?
                    <Skeleton /> :
                    <span>{topic}</span>
                }
                <b>Script</b>
                {
                    generating.script ?
                    <Skeleton height={64} /> :
                    <span>{script}</span>
                }
                <b>Image Prompts</b>
                {
                    generating.imagesPrompts ?
                        Array(imagescount).fill(0).map( (_, i) =>
                            <Skeleton key={i} />
                        )
                    :
                    imagesPrompts.map((prompt, p) => (
                        <span key={p}>{prompt}</span>
                    ))
                }
                <b>Images</b>
                <div className={`grid grid-cols-6 gap-3`}>
                    {
                        images.map((image, i) => (
                            <a
                                href={`http://localhost:3000/project/${videoId}/images/${image}`}
                                target="_blank"
                                key={i}
                            >
                                <img
                                    className="rounded"
                                    src={`http://localhost:3000/project/${videoId}/images/${image}`}
                                    key={i}
                                />
                            </a>
                        ))
                    }
                    {
                        generating.images ?
                        Array( imagescount - images.length ).fill(0).map( (_, i) => 
                            <div className="aspect-square bg-slate-200 rounded" key={i}></div>
                        )
                        : ''
                    }
                </div>
                <b>Audio</b>
                {
                    generating.audio ?
                    <div className="bg-slate-200 rounded-full w-[256px] h-[42px]"></div>: 
                    audio ? (
                        <audio controls>
                            <source
                                src={`http://localhost:3000/project/${videoId}/audio`}
                                type="audio/wav"
                            />
                        </audio>
                    ) : (
                        ""
                    )
                }
                {audio && (
                    <Button loading={generating.video} onClick={generateVideo}>
                        Generate video
                    </Button>
                )}
            </div>
            <div className="flex flex-col gap-3 p-5">
                <b>Result Video</b>
                {video ? (
                    <>
                        <video controls className="rounded">
                            <source
                                src={`http://localhost:3000/project/${videoId}/video`}
                            />
                        </video>
                    </>
                ) : (
                    <div
                        className={`aspect-[9/16] flex flex-col items-center font-semibold justify-center bg-slate-200 w-full rounded ${generating ? "animate-pulse" : ""}`}
                    >{
                        generating.video ?
                        "Generating the video..."
                        : ''
                    }</div>
                )}
                <b>Metadata</b>
                <Button
                    disabled={!video}
                    loading={generating.metadata}
                    onClick={generateMetadata}
                >
                    Generate
                </Button>
                <b>Title</b>
                {
                    generating.metadata ?
                    <Skeleton /> : 
                    <span className="text-sm">{metadata.title}</span>
                }
                <b>Description</b>
                {
                    generating.metadata ?
                    <Skeleton />
                    : <span className="text-sm">{metadata.description}</span>
                }
                <Button disabled={!video} onClick={publish}>
                    Publish
                </Button>
            </div>
        </div>
    );
};
export default CreateVideo;
