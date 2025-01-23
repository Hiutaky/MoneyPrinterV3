import os
import sys
import time
from config import ROOT_DIR
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options
from webdriver_manager.firefox import GeckoDriverManager
from constants import *

argv = sys.argv

fp_profile_path = argv[1].replace("--profile=", "")
source_video_id = argv[2].replace("--id=", "")
title = argv[3].replace("--title=", "")
description = argv[4].replace("--description=", "")


options: Options = Options()
# if get_headless():
# options.add_argument("--headless")
# Set the profile path
options.add_argument("-profile")
options.add_argument(fp_profile_path)

service: Service = Service(GeckoDriverManager().install())
browser = webdriver.Firefox(service=service, options=options)

def upload_video() -> bool:
    """
    Uploads the video to YouTube.

    Returns:
        print (bool): Whether the upload was printful or not.
    """
        

    # Set the service

    # Initialize the browser
    
    driver = browser
    driver.get("https://studio.youtube.com")
    time.sleep(2)
    channel_id = driver.current_url.split("/")[-1]

    verbose = False

    # Go to youtube.com/upload
    driver.get("https://www.youtube.com/upload")

    video_path = os.path.join(ROOT_DIR, "videos", source_video_id, "combined.mp4")
    print(str(video_path))
    # Set video file
    FILE_PICKER_TAG = "ytcp-uploads-file-picker"
    file_picker = driver.find_element(By.TAG_NAME, FILE_PICKER_TAG)
    INPUT_TAG = "input"
    file_input = file_picker.find_element(By.TAG_NAME, INPUT_TAG)
    file_input.send_keys(video_path)

    # Wait for upload to finish
    time.sleep(5)

    # Set title
    textboxes = driver.find_elements(By.ID, YOUTUBE_TEXTBOX_ID)

    title_el = textboxes[0]
    description_el = textboxes[-1]

    if verbose:
        print("\t=> Setting title...")

    title_el.click()
    time.sleep(1)
    title_el.clear()
    title_el.send_keys(title.replace('"', "", 2))

    if verbose:
        print("\t=> Setting description...")

    # Set description
    time.sleep(10)
    description_el.click()
    time.sleep(0.5)
    description_el.clear()
    description_el.send_keys(description.replace('"', "", 2))

    time.sleep(0.5)

    # Set `made for kids` option
    if verbose:
        print("\t=> Setting `made for kids` option...")

    is_for_kids_checkbox = driver.find_element(By.NAME, YOUTUBE_MADE_FOR_KIDS_NAME)
    is_not_for_kids_checkbox = driver.find_element(By.NAME, YOUTUBE_NOT_MADE_FOR_KIDS_NAME)

    if True:
        is_not_for_kids_checkbox.click()
    else:
        is_for_kids_checkbox.click()

    time.sleep(0.5)

    # Click next
    if verbose:
        print("\t=> Clicking next...")

    next_button = driver.find_element(By.ID, YOUTUBE_NEXT_BUTTON_ID)
    next_button.click()

    # Click next again
    if verbose:
        print("\t=> Clicking next again...")
    next_button = driver.find_element(By.ID, YOUTUBE_NEXT_BUTTON_ID)
    next_button.click()

    # Wait for 2 seconds
    time.sleep(2)

    # Click next again
    if verbose:
        print("\t=> Clicking next again...")
    next_button = driver.find_element(By.ID, YOUTUBE_NEXT_BUTTON_ID)
    next_button.click()

    # Set as unlisted
    if verbose:
        print("\t=> Setting as unlisted...")
    
    radio_button = driver.find_elements(By.XPATH, YOUTUBE_RADIO_BUTTON_XPATH)
    radio_button[2].click()

    if verbose:
        print("\t=> Clicking done button...")

    # Click done button
    done_button = driver.find_element(By.ID, YOUTUBE_DONE_BUTTON_ID)
    done_button.click()

    # Wait for 2 seconds
    time.sleep(2)

    # Get latest video
    if verbose:
        print("\t=> Getting video URL...")

    # Get the latest uploaded video URL
    driver.get(f"https://studio.youtube.com/channel/{channel_id}/videos/short")
    time.sleep(2)
    videos = driver.find_elements(By.TAG_NAME, "ytcp-video-row")
    first_video = videos[0]
    anchor_tag = first_video.find_element(By.TAG_NAME, "a")
    href = anchor_tag.get_attribute("href")
    if verbose:
        print(f"\t=> Extracting video ID from URL: {href}")
    video_id = href.split("/")[-2]

    # Build URL
    url =  f"https://www.youtube.com/watch?v={video_id}"

    uploaded_video_url = url

    if verbose:
        print(f" => Uploaded Video: {url}")


    # Close the browser
    driver.quit()

    return True
    
    
upload_video()