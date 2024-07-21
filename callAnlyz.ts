import OpenAI from "openai";
import fs from "fs";
require ("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream("./sample-phone-call.mp3"),
      model: "whisper-1",
      response_format: "text",
    });
  
    console.log(transcription);
  }
  main();