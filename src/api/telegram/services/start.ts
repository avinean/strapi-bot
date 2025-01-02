import { Context, Markup, Telegraf } from 'telegraf';
import { Menu } from './types';

export function start(bot: Telegraf) {
  bot.command('start', async (ctx: Context) => {
    const chatId = ctx.message?.chat.id;
    const user = ctx.message?.from;

    if (!chatId || !user) return;

    let existingLead = await strapi.db.query('api::lead.lead').findOne({
      where: { user_id: String(chatId) },
    });

    if (!existingLead) {
      const lead = await strapi.db.query('api::lead.lead').create({
        data: {
          user_id: String(chatId),
          is_bot: user.is_bot,
          first_name: user.first_name,
          username: user.username,
          language_code: user.language_code,
          type: 'start',
          payload: ctx.update
        },
      });

      existingLead = lead;
    }

    const hasContact = existingLead.phone_number || existingLead.contact_shared;

    const buttons = hasContact
      ? [[Menu.consultation.text, Menu.levelCheck.text]]
      : [[Markup.button.contactRequest(Menu.consultation.text), Menu.levelCheck.text]];

    await ctx.reply(
      hasContact
        ? `Welcome back, ${existingLead.first_name || 'user'}! 👋`
        : 'Welcome! You have been registered as a lead.\nPlease share your contact information.',
      Markup.keyboard(buttons).oneTime().resize()
    );
  });
}
