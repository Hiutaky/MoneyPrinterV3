import sys
import os
from uuid import uuid4
from classes.tts import TTS

tts = TTS()

ROOT_DIR = os.path.dirname(sys.path[0])

script = sys.argv[1].replace("--script=", "")
videoId = sys.argv[2].replace("--id=", "")
audioName = "tts" + ".wav"
path = os.path.join(ROOT_DIR, "videos", videoId, audioName );

tts.synthesize(script, path)

print(audioName)