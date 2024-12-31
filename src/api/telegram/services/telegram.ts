import { Telegraf, Context } from 'telegraf';
import { start } from './start';
import { Menu } from './types';
import { consultation } from './consultation';



const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  throw new Error('TELEGRAM_BOT_TOKEN is missing in environment variables');
}

const bot = new Telegraf(botToken);

function setupBotActions() {
  start(bot);
  consultation(bot);

  bot.hears(Menu.levelCheck.text, async (ctx: Context) => {
    await ctx.reply('You have selected "Check my level". Please follow the instructions to complete the test.');
  });

  
}

setupBotActions();

export default {
  async handleUpdate(body: any) {
    try {
      await bot.handleUpdate(body);
      return 'Update processed by Telegraf';
    } catch (error) {
      console.error('Telegraf handleUpdate error:', error);
      throw new Error('Failed to process Telegram update');
    }
  },
};
