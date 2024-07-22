import { Router } from "express";
import OpenAI from "openai";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";
import { Request, Response } from "express";
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

async function mp3ToTranscript(filePath: string): Promise<string> {
  try {
    const normalizedPath = path.resolve(filePath);
    console.log(`Transcribing file at normalized path: ${normalizedPath}`);
    
    const fileStream = fs.createReadStream(normalizedPath);
    console.log(`File stream created for file: ${normalizedPath}`);

    const transcript = await openai.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-1',
      response_format: 'text',
    });

    console.log('Transcript received:', transcript);
    return transcript.text;
  } catch (error) {
    console.error('Error during transcription:', error);
    throw error;
  }
}

async function getSentiment(text: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: "You are analyzing a phone call transcript in order to analyze the customer's sentiment." },
      { role: 'assistant', content: `The phone call transcript is as follows: ${text}` },
      { role: 'user', content: 'What is the customer sentiment?' },
    ],
    model: 'gpt-4o-mini',
  });

  const sentiment = completion.choices[0].message.content ?? 'Sentiment not found';
  console.log(sentiment);
  return sentiment;
}

async function rankSentiment(text: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: "You are analyzing a phone call transcript in order to analyze the customer's sentiment on a numerical scale from 1 to 10." },
      { role: 'assistant', content: `The phone call transcript is as follows: ${text}` },
      { role: 'user', content: 'What is the customer sentiment as a number from 1 to 10? Please answer with just the number.' },
    ],
    model: 'gpt-4o-mini',
  });

  const sentiment = completion.choices[0].message.content ?? 'Sentiment not found';
  console.log(sentiment);
  return sentiment;
}

async function analyzeCall(filePath: string, startPhrase: string, endPhrase: string) {
  let returnObj = {
    startPhraseFound: false,
    endPhraseFound: false,
    custSentiment: '',
    custSentimentScore: '',
  };
  const transcript = await mp3ToTranscript(filePath);
  const transcriptString = (transcript ?? '').toString();
  const callStart = transcriptString.split(' ').slice(0, 30).join(' ');
  const callEnd = transcriptString.split(' ').slice(-30).join(' ');

  if (callStart.includes(startPhrase)) {
    console.log('The call start contains the phrase: ' + startPhrase);
    returnObj.startPhraseFound = true;
  } else {
    console.log('The call start does not have the phrase: ' + startPhrase);
  }

  if (callEnd.includes(endPhrase)) {
    console.log('The call end contains the phrase: ' + endPhrase);
    returnObj.endPhraseFound = true;
  } else {
    console.log('The call end does not have the phrase: ' + endPhrase);
  }

  let sentiment = await getSentiment(transcriptString);
  returnObj.custSentiment = sentiment;

  let sentimentScore = await rankSentiment(transcriptString);
  returnObj.custSentimentScore = sentimentScore;

  console.log(returnObj);
  return returnObj;
}

router.get('/', (req: Request, res: Response) => {
  res.send('This is the home page!');
});

router.post('/analyze', upload.single('file'), async (req: Request, res: Response) => {
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
    const result = await analyzeCall(file.path, startPhrase, endPhrase);
    res.json(result);
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      }
    });
  } catch (error) {
    console.error('Error analyzing call:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
