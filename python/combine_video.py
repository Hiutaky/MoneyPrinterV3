import os
import sys
from moviepy.video.tools.subtitles import SubtitlesClip
from moviepy.editor import *
from moviepy.video.fx.all import crop
from config import *
from utils import choose_random_song

args = sys.argv

videoId = args[1].replace("--id=", "")

ROOT_DIR = os.path.dirname(sys.path[0])

def get_verbose():
    return False

def get_png_files(folder_path):
    """
    Returns a list of all .png files in the specified folder.

    Args:
        folder_path (str): The path to the folder to search for .png files.

    Returns:
        list: A list of paths to .png files.
    """
    png_files = []
    for file_name in os.listdir(folder_path):
        if file_name.endswith('.png'):
            png_files.append(os.path.join(folder_path, file_name))
    return png_files



def combine() -> str:
        """
        Combines everything into the final video.

        Returns:
            path (str): The path to the generated MP4 File.
        """
        folder_path = os.path.join(ROOT_DIR, "videos", videoId)
        combined_image_path = os.path.join(ROOT_DIR, "videos", videoId, "combined.mp4")
        tts_path = os.path.join(ROOT_DIR, "videos", videoId, "tts.wav")
        subtitles_path = os.path.join( folder_path, "sub.srt" )

        images = get_png_files(folder_path)
        tts_clip = AudioFileClip(tts_path)
        max_duration = tts_clip.duration
        req_dur = max_duration / len(images)

        # Make a generator that returns a TextClip when called with consecutive
        generator = lambda txt: TextClip(
            txt,
            font=os.path.join(get_fonts_dir(), "badabb.ttf"),
            fontsize=100,
            color="#FFFF00",
            stroke_color="black",
            stroke_width=5,
            size=(1080, 1920),
            method="caption",
        )

        print("[+] Combining images...")

        clips = []
        tot_dur = 0

        # Add downloaded clips over and over until the duration of the audio (max_duration) has been reached
        while tot_dur < max_duration:
            for image_path in images:
                if os.path.exists(image_path):
                    clip = ImageClip(image_path, transparent=False)
                    clip.duration = req_dur
                    clip = clip.set_fps(30)

                    # Not all images are same size,
                    # so we need to resize them
                    if round((clip.w/clip.h), 4) < 0.5625:
                        if get_verbose():
                            print(f" => Resizing Image: {image_path} to 1080x1920")
                        clip = crop(clip, width=clip.w, height=round(clip.w/0.5625), \
                                    x_center=clip.w / 2, \
                                    y_center=clip.h / 2)
                    else:
                        if get_verbose():
                            print(f" => Resizing Image: {image_path} to 1920x1080")
                        clip = crop(clip, width=round(0.5625*clip.h), height=clip.h, \
                                    x_center=clip.w / 2, \
                                    y_center=clip.h / 2)
                    clip = clip.resize((1080, 1920))

                    clip = clip.fx(vfx.resize, lambda t: 1 + 0.02 * t)

                    clips.append(clip)
                    tot_dur += clip.duration


        final_clip = concatenate_videoclips(clips)
        random_song = choose_random_song()
        equalize_subtitles(subtitles_path, 10)
        
        subtitles = SubtitlesClip(subtitles_path, generator)
        subtitles.set_pos(("center", "center"))
        random_song_clip = AudioFileClip(random_song).set_fps(44100)

        # Turn down volume
        random_song_clip = random_song_clip.fx(afx.volumex, 0.1)
        comp_audio = CompositeAudioClip([
            tts_clip,
            random_song_clip
        ])

        # Add audio and set the duration based on tts
        final_clip = final_clip.set_audio(comp_audio)
        final_clip = final_clip.set_duration(tts_clip.duration)
        
        # Get the face clip, resize and position it left-bottom
        face_clip = VideoFileClip(os.path.join(ROOT_DIR, "faces", "therock.mp4"))
        face_clip.set_fps(30)
        face_clip = face_clip.resize((1080/3, 1920/3))
        masked_clip = face_clip.fx(vfx.mask_color, color=[0,154,62], s=5, thr=100)
        masked_clip = masked_clip.set_duration(max_duration)
        masked_clip = masked_clip.set_position(("left", "bottom"))

        # Compose final clip
        final_clip = CompositeVideoClip([
            final_clip,
            masked_clip,
            subtitles,
        ])

        final_clip.write_videofile(combined_image_path, codec="libx264", fps=30 )

        print(f"Wrote Video to \"{combined_image_path}\"")

        return combined_image_path


combine()