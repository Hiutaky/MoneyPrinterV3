import os
import sys
import random

ROOT_DIR = os.path.dirname(sys.path[0])

def choose_random_song() -> str:
    """
    Chooses a random song from the songs/ directory.

    Returns:
        str: The path to the chosen song.
    """
    try:
        songs = os.listdir(os.path.join(ROOT_DIR, "songs"))
        song = random.choice(songs)
        print(f" => Chose song: {song}")
        return os.path.join(ROOT_DIR, "songs", song)
    except Exception as e:
        print(f"Error occurred while choosing random song: {str(e)}")
