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
// Function to analyze the start of the call for a specific phrase
function analyzeCallStart(searchPhrase) {
    return __awaiter(this, void 0, void 0, function* () {
        let returnObj = {
            phraseFound: false,
        };
        const transcript = yield mp3ToTranscript();
        const transcriptString = JSON.stringify(transcript); // Assuming transcript is already a string
        // Extract the first 30 words of the transcript
        const callStart = transcriptString.split(" ").slice(0, 30).join(" ");
        console.log(callStart);
        // Check if the search phrase is in the call start
        if (callStart.includes(searchPhrase)) {
            console.log("The call start contains the phrase: " + searchPhrase);
            returnObj.phraseFound = true;
        }
        else {
            console.log("The call start does not have the phrase: " + searchPhrase);
        }
        console.log(returnObj);
        return returnObj;
    });
}
router.get("/", (req, res) => {
    res.send("This is home page!");
});
router.get("/analyze", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield analyzeCallStart("Thank you for calling");
    res.json(result);
}));
export default router;
