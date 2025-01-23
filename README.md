# MoneyPrinterV3
This version of MoneyPrinter works using Bun instead of node, so if you're not using Bun yet, please install it first:

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

Now you're AI worker is ready to be used, you can test it by navigating it in this way: 
- https://yourworker.yourusername.workers.dev/?type=text&prompt=hi

### Get Firefox Profile Path

To enable automatic publish on YouTube you need to find your Firefox profile path, to do so you can simply navigate the about:profiles path in the URL bar.

!!! Important: Login into your Youtube account before running the script.

### Setup Environment Variables

Now you need to setup your .env file, so:
```bash
cp .env.example .env
```

Now open the .env file in a Code Editor and paste your API Keys, Cloudflare Worker URL ( with final slash / ) and your Firefox Profile Path.

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