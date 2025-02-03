import { Controller, Get, Post } from "@nestjs/common";
import OpenAI from "openai";
import { Query } from "@nestjs/common";

const client = new OpenAI({
  apiKey: "api-key", // not really needed on local
  baseURL: "http://localhost:1234/v1",
});

@Controller()
export class AppController {
  @Get("health")
  async getHealth() {
    return { status: "ok" };
  }

  @Get("aichat")
  async getAiChat(@Query("question") question: string) {
    console.log("question", question);
    const chatCompletion = await client.chat.completions.create({
      messages: [{ role: "user", content: question }],
      model: "deepseek-r1-qwen-7b",
    });
    console.log("chatCompletion", chatCompletion);
    console.log("choices", chatCompletion.choices);
    return { status: "ok", message: chatCompletion.choices[0].message.content };
  }
}
