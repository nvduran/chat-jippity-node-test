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

async function getSentiment(text: string) {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are analyzing a phone call transcript in order to analyze the customer's sentiment, from horrible to great." },
      { role: "assistant", content: `The phone call transcript is as follows: ${text}` },
      { role: "user", content: "What is the customer sentiment?" },
    ],
    model: "gpt-4o-mini",
  });

  // Ensure content is a string or provide a default value
  const sentiment = completion.choices[0].message.content ?? "Sentiment not found";
  console.log(sentiment);
  return sentiment;
}

// Function to analyze the start of the call for a specific phrase
async function analyzeCall(searchPhrase: string) {
  let returnObj = {
    startPhraseFound: false,
    endPhraseFound: false,
    custSentiment: "",
    custSentimentScore: 0,
  };
  const transcript = await mp3ToTranscript();
  const transcriptString = (transcript ?? "").toString(); // Ensure transcript is a string
  // Extract the first 30 words of the transcript
  const callStart = transcriptString.split(" ").slice(0, 30).join(" ");
  // Extract the last 30 words of the transcript
  const callEnd = transcriptString.split(" ").slice(-30).join(" ");
  console.log(callStart);
  console.log(callEnd);
  // Check if the search phrase is in the call start
  if (callStart.includes(searchPhrase)) {
    console.log("The call start contains the phrase: " + searchPhrase);
    returnObj.startPhraseFound = true;
  } else {
    console.log("The call start does not have the phrase: " + searchPhrase);
  }
  // Check if the search phrase is in the call end
  if (callEnd.includes(searchPhrase)) {
    console.log("The call end contains the phrase: " + searchPhrase);
    returnObj.endPhraseFound = true;
  } else {
    console.log("The call end does not have the phrase: " + searchPhrase);
  }

  // Get the sentiment of the customer and add it to the return object
  let sentiment = await getSentiment(transcriptString);
  returnObj.custSentiment = sentiment;

  console.log(returnObj);
  return returnObj;
}

router.get("/", (req, res) => {
  res.send("This is home page!");
});

router.get("/analyze", async (req, res) => {
  const result = await analyzeCall("Thank you for calling");
  res.json(result);
});

export default router;
