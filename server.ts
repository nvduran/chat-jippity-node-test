import OpenAI from "openai";
require ("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "You are a helpful assistant." }],
      model: "gpt-4o-mini",
    });

    console.log(completion.choices[0]);
  } catch (error) {
    console.error("Error creating completion:", error);
  }
}

main();
