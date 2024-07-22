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
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
dotenv.config();
const router = Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.resolve('uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${Date.now()}${ext}`);
    }
});
const upload = multer({ storage: storage });
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
function mp3ToTranscript(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const normalizedPath = path.resolve(filePath);
            console.log(`Transcribing file at normalized path: ${normalizedPath}`);
            const fileStream = fs.createReadStream(normalizedPath);
            console.log(`File stream created for file: ${normalizedPath}`);
            const transcript = yield openai.audio.transcriptions.create({
                file: fileStream,
                model: 'whisper-1',
                response_format: 'text',
            });
            console.log('Transcript received:', transcript);
            const transcriptText = JSON.stringify(transcript);
            return transcriptText;
        }
        catch (error) {
            console.error('Error during transcription:', error);
            throw error;
        }
    });
}
function getSentiment(text) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const completion = yield openai.chat.completions.create({
            messages: [
                { role: 'system', content: "You are analyzing a phone call transcript in order to analyze the customer's sentiment." },
                { role: 'assistant', content: `The phone call transcript is as follows: ${text}` },
                { role: 'user', content: 'What is the customer sentiment?' },
            ],
            model: 'gpt-4o-mini',
        });
        const sentiment = (_a = completion.choices[0].message.content) !== null && _a !== void 0 ? _a : 'Sentiment not found';
        console.log(sentiment);
        return sentiment;
    });
}
function rankSentiment(text) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const completion = yield openai.chat.completions.create({
            messages: [
                { role: 'system', content: "You are analyzing a phone call transcript in order to analyze the customer's sentiment on a numerical scale from 1 to 10." },
                { role: 'assistant', content: `The phone call transcript is as follows: ${text}` },
                { role: 'user', content: 'What is the customer sentiment as a number from 1 to 10? Please answer with just the number.' },
            ],
            model: 'gpt-4o-mini',
        });
        const sentiment = (_a = completion.choices[0].message.content) !== null && _a !== void 0 ? _a : 'Sentiment not found';
        console.log(sentiment);
        return sentiment;
    });
}
function analyzeCall(filePath, startPhrase, endPhrase) {
    return __awaiter(this, void 0, void 0, function* () {
        let returnObj = {
            startPhraseFound: false,
            endPhraseFound: false,
            custSentiment: '',
            custSentimentScore: '',
        };
        const transcript = yield mp3ToTranscript(filePath);
        const transcriptString = (transcript !== null && transcript !== void 0 ? transcript : '').toString();
        const callStart = transcriptString.split(' ').slice(0, 30).join(' ');
        const callEnd = transcriptString.split(' ').slice(-30).join(' ');
        if (callStart.includes(startPhrase)) {
            console.log('The call start contains the phrase: ' + startPhrase);
            returnObj.startPhraseFound = true;
        }
        else {
            console.log('The call start does not have the phrase: ' + startPhrase);
        }
        if (callEnd.includes(endPhrase)) {
            console.log('The call end contains the phrase: ' + endPhrase);
            returnObj.endPhraseFound = true;
        }
        else {
            console.log('The call end does not have the phrase: ' + endPhrase);
        }
        let sentiment = yield getSentiment(transcriptString);
        returnObj.custSentiment = sentiment;
        let sentimentScore = yield rankSentiment(transcriptString);
        returnObj.custSentimentScore = sentimentScore;
        console.log(returnObj);
        return returnObj;
    });
}
router.get('/', (req, res) => {
    res.send('This is the home page!');
});
router.post('/analyze', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { startPhrase, endPhrase } = req.body;
    const file = req.file;
    if (!startPhrase || !endPhrase || !file) {
        return res.status(400).json({ error: 'startPhrase, endPhrase, and file are required' });
    }
    const allowedMimeTypes = ['audio/flac', 'audio/x-flac', 'audio/m4a', 'audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/mpga', 'audio/ogg', 'audio/oga', 'audio/wav', 'audio/webm'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: 'Unsupported file format. Please upload a valid audio file.' });
    }
    console.log(file);
    try {
        const result = yield analyzeCall(file.path, startPhrase, endPhrase);
        res.json(result);
        fs.unlink(file.path, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            }
        });
    }
    catch (error) {
        console.error('Error analyzing call:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
export default router;
