import OpenAI from "openai";
import fs from "fs";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function mp3ToTranscript() {
  const transcript = await openai.audio.transcriptions.create({
    file: fs.createReadStream("./sample-phone-call.mp3"),
    model: "whisper-1",
    response_format: "text",
  });

  return transcript;
}

async function analyzeCallStart(searchPhrase: any) {
  let returnObj = {
    phraseFound: false
  };
  const transcript = await mp3ToTranscript();
  const transcriptString = JSON.stringify(transcript);
  // callStart is the first 30 words of the transcript
  const callStart = transcriptString.split(" ").slice(0, 30).join(" ");
  console.log(callStart);
  // searchPhrase is the phrase we are looking for in the callStart
  if (callStart.includes(searchPhrase)) {
    console.log("The call start contains the phrase: " + searchPhrase);
    returnObj.phraseFound = true;
  } else {
    console.log("The call start does not have the phrase: " + searchPhrase);
  }
  console.log(returnObj);
  return returnObj;
}

const app = express();
const router = express.Router();

router.get("/", (req, res) => {
  res.send("This is home page!");
});

router.get("/analyze", async (req, res) => {
  const result = await analyzeCallStart("Thank you for calling");
  res.json(result);
});

app.use("/", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// export default analyzeCallStart;
