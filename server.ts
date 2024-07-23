import OpenAI from 'openai';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import Callsroutes from './routes/callAnlyz.js'; // Import the routes
import Questionsroutes from './routes/questionHelper.js'; // Import the routes

dotenv.config();

const app = express();

// CORS error fix
app.use(cors());

// Middleware to parse request body
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Use the imported routes
app.use('/calls', Callsroutes);
app.use('/question', Questionsroutes);

async function main() {
  // Example usage of OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Who won the world series in 2020?' },
      { role: 'assistant', content: 'The Los Angeles Dodgers won the World Series in 2020.' },
      { role: 'user', content: 'Where was it played?' },
    ],
    model: 'gpt-4o-mini',
  });

  console.log(completion.choices[0].message.content);
}

main().catch(err => console.error(err));

const PORT = process.env.PORT || 3104;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
