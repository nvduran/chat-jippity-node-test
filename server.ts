import OpenAI from "openai";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";

dotenv.config();

const app = express();

// CORS error fix
app.use(cors());

// middleware to parse res.body
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req: any, res: any) => {
  res.send("This is home page!");
});

async function main() {
  // conversation example
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Who won the world series in 2020?" },
      { role: "assistant", content: "The Los Angeles Dodgers won the World Series in 2020." },
      { role: "user", content: "Where was it played?" }
    ],
    model: "gpt-4o-mini",
  });

  console.log(completion.choices[0]);
}

main();

app.listen(process.env.PORT || 3104, () => {
  console.log("$$$$$$$$/// STARTED THE SERVER ///$$$$$$$$");
});
