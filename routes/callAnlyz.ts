import { Router } from "express";
import OpenAI from "openai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to transcribe the MP3 file to text using OpenAI's Whisper model
async function mp3ToTranscript() {
  const transcript = await openai.audio.transcriptions.create({
    file: fs.createReadStream("./sample-phone-call.mp3"),
    model: "whisper-1",
    response_format: "text",
  });
  return transcript;
}

// Function to analyze the start of the call for a specific phrase
async function analyzeCallStart(searchPhrase: string) {
  let returnObj = {
    phraseFound: false,
  };
  const transcript = await mp3ToTranscript();
  const transcriptString = JSON.stringify(transcript); // Assuming transcript is already a string
  // Extract the first 30 words of the transcript
  const callStart = transcriptString.split(" ").slice(0, 30).join(" ");
  console.log(callStart);
  // Check if the search phrase is in the call start
  if (callStart.includes(searchPhrase)) {
    console.log("The call start contains the phrase: " + searchPhrase);
    returnObj.phraseFound = true;
  } else {
    console.log("The call start does not have the phrase: " + searchPhrase);
  }
  console.log(returnObj);
  return returnObj;
}

router.get("/", (req, res) => {
  res.send("This is home page!");
});

router.get("/analyze", async (req, res) => {
  const result = await analyzeCallStart("Thank you for calling");
  res.json(result);
});

export default router;
