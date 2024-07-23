import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function answerQuestion(articles: { title: string, body: string }[], question: string): Promise<string> {
  const articleContent = articles.map(article => `Title: ${article.title}\n\nBody: ${article.body}`).join('\n\n---\n\n');
  
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: "You are an assistant that answers questions based on provided articles. Your answers are no longer than two paragraphs." },
      { role: 'assistant', content: `The article content is as follows: ${articleContent}` },
      { role: 'user', content: `The question is: ${question}` },
    ],
    model: 'gpt-4o-mini',
  });

  const answer = completion.choices[0].message.content ?? 'Answer not found';
  console.log(answer);
  return answer;
}

router.get('/', (req: Request, res: Response) => {
  res.send('This is the home page for question helper!');
});

router.post('/ask', async (req: Request, res: Response) => {
  const { articles, question } = req.body;

  if (!articles || articles.length === 0 || !question) {
    return res.status(400).json({ error: 'Articles and question are required' });
  }

  try {
    const answer = await answerQuestion(articles, question);
    res.json({ answer });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
