import { Telegraf, Context } from 'telegraf';
import { start } from './start';
import { shareContact } from './share-contact';
import { levelCheck } from './level-check';



const botToken = process.env.TELEGRAM_BOT_TOKEN;
if (!botToken) {
  throw new Error('TELEGRAM_BOT_TOKEN is missing in environment variables');
}

const bot = new Telegraf(botToken);

function setupBotActions() {
  start(bot);
  shareContact(bot);
  levelCheck(bot);
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
