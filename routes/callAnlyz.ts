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
      { role: "system", content: "You are analyzing a phone call transcript in order to analyze the customer's sentiment." },
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


async function rankSetiment(text: string) {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are analyzing a phone call transcript in order to analyze the customer's sentiment on a numerical scale from 1 to 10." },
      { role: "assistant", content: `The phone call transcript is as follows: ${text}` },
      { role: "user", content: "What is the customer sentiment as a number from 1 to 10? Please answer with just the number." },
    ],
    model: "gpt-4o-mini",
  });

    // Ensure content is a string or provide a default value
    const sentiment = completion.choices[0].message.content ?? "Sentiment not found";
    console.log(sentiment);
    return sentiment;
  }

// Function to analyze the start of the call for a specific phrase
async function analyzeCall(startPhrase: string, endPhrase : string) {
  let returnObj = {
    startPhraseFound: false,
    endPhraseFound: false,
    custSentiment: "",
    custSentimentScore: "",
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
  if (callStart.includes(startPhrase)) {
    console.log("The call start contains the phrase: " + startPhrase);
    returnObj.startPhraseFound = true;
  } else {
    console.log("The call start does not have the phrase: " + startPhrase);
  }
  // Check if the search phrase is in the call end
  if (callEnd.includes(endPhrase)) {
    console.log("The call end contains the phrase: " + endPhrase);
    returnObj.endPhraseFound = true;
  } else {
    console.log("The call end does not have the phrase: " + endPhrase);
  }

  // Get the sentiment of the customer and add it to the return object
  let sentiment = await getSentiment(transcriptString);
  returnObj.custSentiment = sentiment;

  // Get the sentiment score of the customer and add it to the return object
  let sentimentScore = await rankSetiment(transcriptString);
  returnObj.custSentimentScore = sentimentScore;

  console.log(returnObj);
  return returnObj;
}

router.get("/", (req, res) => {
  res.send("This is home page!");
});

router.get("/analyze", async (req, res) => {
  const result = await analyzeCall("Thank you for calling", "anything else");
  res.json(result);
});

export default router;
