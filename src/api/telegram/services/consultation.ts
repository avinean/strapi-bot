import { Context, deunionize, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { Menu } from './types';

export function consultation(bot: Telegraf) {
  bot.on(message('contact'), async (ctx: Context) => {
    const contactMessage = deunionize(ctx.message);

    if (!contactMessage?.contact || !ctx.message?.chat.id) return;

    const contact = contactMessage.contact;
    const chatId = ctx.message.chat.id;

    const lead = await strapi.db.query('api::lead.lead').findOne({
      where: { user_id: String(chatId) },
    });

    if (lead) {
      await strapi.db.query('api::lead.lead').update({
        where: { id: lead.id },
        data: {
          phone_number: contact.phone_number,
          first_name: contact.first_name,
          last_name: contact.last_name || null
        },
      });
      await ctx.reply(`Thank you, ${contact.first_name}! We've saved your contact: ${contact.phone_number}`);
    } else {
      await ctx.reply('We couldn’t find your registration in our system. Please start over with /start.');
    }
  });

  
  bot.hears(Menu.consultation.text, async (ctx: Context) => {
    const chatId = ctx.message?.chat.id;
    const user = ctx.message?.from;

    if (!chatId || !user) return;

    const lead = await strapi.db.query('api::lead.lead').findOne({
      where: { user_id: String(chatId) },
      populate: ['telegram'],
    });

    if (!lead) {
      console.warn(`User with chat ID ${chatId} not found in the database.`);
      await ctx.reply('We couldn’t find your details. Please restart the bot with /start.');
      return;
    }

    console.log('🔍 Consultation Request Received:');
    console.log(JSON.stringify(lead, null, 2));

    await ctx.reply(
      `We'll get back to you soon, ${lead.first_name || 'dear user'}! 👌`
    );
  });
}