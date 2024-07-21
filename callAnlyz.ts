import OpenAI from "openai";
import fs from "fs";
require ("dotenv").config();

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

async function analyzeCallStart() {
    const transcript = await mp3ToTranscript();
    const transcriptString = JSON.stringify(transcript);
    // callStart is the first 30 words of the transcript
    const callStart = transcriptString.split(" ").slice(0, 30).join(" ");
    console.log(callStart);
    return callStart;
}

analyzeCallStart();