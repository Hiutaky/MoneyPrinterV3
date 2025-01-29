# MoneyPrinterV3
This version of MoneyPrinter (partially based on https://github.com/FujiwaraChoki/MoneyPrinterV2 by @FujiwaraChoki ) works using Bun instead of node, so if you're not using Bun yet, please install it first:

```bash
npm install -g bun
```
## Installation

To install the needed dependencies:

### Backend
Install all the dependecies needed for the backend server made with ElysiaJs
```bash
bun install
```
### Python packages
Install all the needed dependecies for Python. Suggested pyhton version: 3.10.

```bash
# Create a virtual env
python -m venv venv

# Activate the virtual environment - Windows
.\venv\Scripts\activate

# Activate the virtual environment - Unix
source venv/bin/activate

# Install the packages
pip install -r requirements.txt
```

### Frontend
```bash
cd frontend && bun install
```

## Configuration

MoneyPrinterV3 is less dependant on local AIs, infact leverage Cloudflare AI Workers for LLM and Image Generation and OpenAI for Text-To-Speech for a better voice and audio quality, while AssemblyAI is used to create timed-subtitles.

This means that you've to get a OpenAI and AssemblyAI API Key, while AssemblyAI is mostly free thanks to a 50$ credit, for OpenAI you need an account with a valid card connected.

Regarding Cloudflare, you can use up to 10 000 neuron ( AI Operation ) per day for free, so you just need a free account.

### Create Cloudflare Worker
Once you've a Cloudflare account, you can create your first AI Worker by navigating the menu on the left:
- Click on the Workers menu then Create
- Now click on Create Worker
- Give your worker a name ( optional ) and click on Distribute
- Now click on Edit Code
- Open the cloudflare-worker folder in this project and copy the ai-worker.js file content
- Paste it into your Cloudflare Worker Editor and then click on Distribute
- Go in the Worker Settings Tab, navigate to Bindings
- Add a new Binding and select Workers AI, then as name use AI, save

Now you're AI worker is ready to be used, you can test it by navigating it in this way: 
- https://[yourworker].[yourusername].workers.dev/?type=text&prompt=hi

### Get Firefox Profile Path

To enable automatic publish on YouTube you need to find your Firefox profile path, to do so you can simply navigate the about:profiles path in the URL bar.

!!! Important: Login into your Youtube account before running the script.

### Setup Environment Variables

Now you need to setup your .env file, so:
```bash
cp .env.example .env
```

Now open the .env file in a Code Editor and paste your API Keys, Cloudflare Worker URL ( with final slash / ) and your Firefox Profile Path.

### Setup ImageMagick

ImageMagick is a image-editing library used to create TextClips and resize the images. 

To check if you've ImageMagick installed on your system run:
- Linux: `convert -version`
- MacOS: `magick -version`
- Windows: `magick -version`

If not installed, you can install it from [here](https://imagemagick.org/script/download.php)

To get the location of ImageMagick on your system run:
- Linux: `which convert`
- MacOS: `magick -list configure | grep prefix`
- Windows: `where magick`

It can happen that due to Policy rules, while running the combine_video.py script you can get an error.

Before running the script check if in the Policy there're these 2 directives:
```xml
<policy domain="path" rights="read|write" pattern="@*"/>
<policy domain="coder" rights="read|write" pattern="TXT"/>
```
It can happen that the <policy domain="path" rights="read|write" pattern="@*"/> directive is already configurated with rights value to none, if so you need to change it to read|write.

You can find the policy.xml file in this path:
- Linux: /etc/ImageMagick-[yourversion]/policy.xml
- MacOS: /etc/ImageMagick-[yourversion]/policy.xml
- Windows: C:\Program Files\ImageMagick-[yourversion]/policy.xml

## Running MoneyPrinterV3

To properly run MoneyPrinterV3 you need to run the backend server and the frontend interface, while the Python scripts will be started on-demand.

Open 2 different terminals in the root folder and run:
```bash
# Start the backend server
bun run backend
```

```bash
# Start the frontend
bun run frontend
```

Navigate to http://localhost:5173/ to open the Frontend UI.

Have fun.