var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
function mp3ToTranscript() {
    return __awaiter(this, void 0, void 0, function* () {
        const transcript = yield openai.audio.transcriptions.create({
            file: fs.createReadStream("./sample-phone-call.mp3"),
            model: "whisper-1",
            response_format: "text",
        });
        return transcript;
    });
}
function getSentiment(text) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const completion = yield openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are analyzing a phone call transcript in order to analyze the customer's sentiment." },
                { role: "assistant", content: `The phone call transcript is as follows: ${text}` },
                { role: "user", content: "What is the customer sentiment?" },
            ],
            model: "gpt-4o-mini",
        });
        // Ensure content is a string or provide a default value
        const sentiment = (_a = completion.choices[0].message.content) !== null && _a !== void 0 ? _a : "Sentiment not found";
        console.log(sentiment);
        return sentiment;
    });
}
function rankSetiment(text) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const completion = yield openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are analyzing a phone call transcript in order to analyze the customer's sentiment on a numerical scale from 1 to 10." },
                { role: "assistant", content: `The phone call transcript is as follows: ${text}` },
                { role: "user", content: "What is the customer sentiment as a number from 1 to 10? Please answer with just the number." },
            ],
            model: "gpt-4o-mini",
        });
        // Ensure content is a string or provide a default value
        const sentiment = (_a = completion.choices[0].message.content) !== null && _a !== void 0 ? _a : "Sentiment not found";
        console.log(sentiment);
        return sentiment;
    });
}
// Function to analyze the start of the call for a specific phrase
function analyzeCall(startPhrase, endPhrase) {
    return __awaiter(this, void 0, void 0, function* () {
        let returnObj = {
            startPhraseFound: false,
            endPhraseFound: false,
            custSentiment: "",
            custSentimentScore: "",
        };
        const transcript = yield mp3ToTranscript();
        const transcriptString = (transcript !== null && transcript !== void 0 ? transcript : "").toString(); // Ensure transcript is a string
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
        }
        else {
            console.log("The call start does not have the phrase: " + startPhrase);
        }
        // Check if the search phrase is in the call end
        if (callEnd.includes(endPhrase)) {
            console.log("The call end contains the phrase: " + endPhrase);
            returnObj.endPhraseFound = true;
        }
        else {
            console.log("The call end does not have the phrase: " + endPhrase);
        }
        // Get the sentiment of the customer and add it to the return object
        let sentiment = yield getSentiment(transcriptString);
        returnObj.custSentiment = sentiment;
        // Get the sentiment score of the customer and add it to the return object
        let sentimentScore = yield rankSetiment(transcriptString);
        returnObj.custSentimentScore = sentimentScore;
        console.log(returnObj);
        return returnObj;
    });
}
router.get("/", (req, res) => {
    res.send("This is home page!");
});
router.get("/analyze", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield analyzeCall("Thank you for calling", "anything else");
    res.json(result);
}));
export default router;
