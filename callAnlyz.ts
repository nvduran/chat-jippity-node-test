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

async function analyzeCallStart(searchPhrase: string) {
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

analyzeCallStart("Thank you for calling");