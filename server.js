var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import OpenAI from 'openai';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Callsroutes from './routes/callAnlyz.js'; // Import the routes
import Questionsroutes from './routes/questionHelper.js'; // Import the routes
dotenv.config();
const app = express();
// CORS error fix
app.use(cors({
    origin: 'http://192.168.1.109:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));
// Middleware to parse request body
app.use(bodyParser.json());
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
// Use the imported routes
app.use('/calls', Callsroutes);
app.use('/question', Questionsroutes);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Example usage of OpenAI API
        const completion = yield openai.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Who won the world series in 2020?' },
                { role: 'assistant', content: 'The Los Angeles Dodgers won the World Series in 2020.' },
                { role: 'user', content: 'Where was it played?' },
            ],
            model: 'gpt-4o-mini',
        });
        console.log(completion.choices[0].message.content);
    });
}
main().catch(err => console.error(err));
const PORT = process.env.PORT || 3104;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
