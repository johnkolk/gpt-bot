import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import config from "config";
import { ogg } from "./ogg.js";
import { openai } from "./openai.js";
import { code } from "telegraf/format";

const bot = new Telegraf(config.get("TELEGRAM_TOKEN"));

// bot.on(message("text"), async (ctx) => {
//   await ctx.reply(JSON.stringify(ctx.message, null, 2));
// });

bot.on(message("voice"), async (ctx) => {
  try {
    await ctx.reply(code("Waiting response..."));

    const link = await ctx.telegram.getFileLink(ctx.message.voice);
    const userId = String(ctx.message.from.id);

    const oggPath = await ogg.create(link.href, userId);
    const mp3Path = await ogg.toMp3(oggPath, userId);

    const text = await openai.voiceToText(mp3Path);
    await ctx.reply(code(`Your request: ${text}`));
    const message = [{ role: openai.roles.USER, content: text }];
    const response = await openai.chat(message);

    await ctx.reply(response.content);
  } catch (e) {
    console.log("Error while voice message ", e.message);
  }
});

bot.command("start", async (ctx) => {
  await ctx.reply(JSON.stringify(ctx.message, null, 2));
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
