var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();
const router = Router();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
function answerQuestion(articles, question) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const articleContent = articles.map(article => `Title: ${article.title}\n\nBody: ${article.body}`).join('\n\n---\n\n');
        const completion = yield openai.chat.completions.create({
            messages: [
                { role: 'system', content: "You are an assistant that answers questions based on provided articles. Your answers are no longer than two paragraphs." },
                { role: 'assistant', content: `The article content is as follows: ${articleContent}` },
                { role: 'user', content: `The question is: ${question}` },
            ],
            model: 'gpt-4o-mini',
        });
        const answer = (_a = completion.choices[0].message.content) !== null && _a !== void 0 ? _a : 'Answer not found';
        console.log(answer);
        return answer;
    });
}
router.get('/', (req, res) => {
    res.send('This is the home page for question helper!');
});
router.post('/ask', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { articles, question } = req.body;
    if (!articles || articles.length === 0 || !question) {
        return res.status(400).json({ error: 'Articles and question are required' });
    }
    try {
        const answer = yield answerQuestion(articles, question);
        res.json({ answer });
    }
    catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
export default router;
