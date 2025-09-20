const app = require('express')();
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const fs = require('fs');

const port = 5000;

// Configure fetch for Google Generative AI
if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = fetch.Headers;
  globalThis.Request = fetch.Request;
  globalThis.Response = fetch.Response;
}

app.use(bodyParser.json());

const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.API_KEY; // Use environment variable for API key
const genai = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 0,
  topP: 0.95,
  topK: 64,
}

async function run(prompt,history) {
  try {
    const model = genai.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "Make every response very shot, maximum 150 characters length."
    })

    const chatsection = model.startChat({
      generationConfig,
      history: history,
    })

    const result = await chatsection.sendMessage(prompt);
    return {Responsive: true, Text: result.response.text()};
  }catch(error) {
    console.error(error);
    return {Responsive: false, Text: error};
  }
}

app.post("/", async (req, res) => {
  const prompt = req.body.prompt;
  const history = req.body.history;

  const response = await run(prompt, history)

  if (response.Responsive == true){
    res.status(200).send(response.Text);
  }else{
    res.status(500).send("Server Error!")
  }
})

app.listen(port, '0.0.0.0', () => console.log("Server is running on port " + port));

// Basic route
app.get('/', (req,res) => {
  res.send('Hello World! Server is running with your specified dependencies and API key is configured.');
});
