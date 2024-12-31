import { Telegraf } from 'telegraf';

const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
  throw new Error('TELEGRAM_BOT_TOKEN is missing in environment variables');
}

const bot = new Telegraf(botToken);

export default {
  async processUpdate(body: any) {
    if (!body?.message) {
      return 'No valid message in payload';
    }

    const chatId: number = body.message.chat.id;
    const text: string = body.message.text;

    console.log(`Chat ID: ${chatId}, Text: ${text}`);

    // Store telegram
    const telegram = await strapi.db.query('api::telegram.telegram').create({
      data: { payload: body },
    });

    console.log('telegram created:', telegram);

    // Handle specific commands
    if (text === '/start') {
      const leadData = {
        user_id: String(chatId),
        is_bot: body.message.from.is_bot,
        first_name: body.message.from.first_name,
        username: body.message.from.username,
        language_code: body.message.from.language_code,
        type: 'start',
      };

      console.log('Creating Lead:', leadData);

      const lead = await strapi.db.query('api::lead.lead').create({
        data: leadData,
      });

      await strapi.db.query('api::lead.lead').update({
        where: { id: lead.id },
        data: { telegram: telegram.id },
      });

      console.log('Lead and telegram relation created');

      await bot.telegram.sendMessage(chatId, 'Welcome! You have been registered as a lead.');

      return 'Lead created and associated with telegram';
    }

    return 'Message processed';
  },
};
