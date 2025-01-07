import { Context, deunionize, Markup, Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { Menu, PendingAction } from './types';

export function shareContact(bot: Telegraf) {
  bot.action(Menu.consultation.action, async (ctx) => {
    await ctx.answerCbQuery(); // Acknowledge the button press

    const chatId = ctx.chat?.id;
    const user = ctx.from;

    if (!chatId || !user) return;

    // Fetch user (lead) from the database
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

    // Check if the user has already provided contact info
    if (lead.phone_number) {
      // ✅ User has already shared their contact – greet them
      await ctx.reply(
        `Welcome back, ${lead.first_name || 'dear user'}! 👌 We'll get in touch with you shortly.`
      );
    } else {
      // 📝 User hasn't shared their contact – ask for it
      await ctx.reply(
        'Please share your contact information so our manager can reach out to you.',
        Markup.keyboard([
          Markup.button.contactRequest('📲 Share Contact'),
        ])
          .oneTime()
          .resize()
      );
    }
  });

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

      if (lead.pending_actions?.includes(PendingAction.ThanksForSharingContacts)) {
        await ctx.reply(`Thank you, ${contact.first_name}! We've saved your contact: ${contact.phone_number}`);

        await strapi.db.query('api::lead.lead').update({
          where: { id: lead.id },
          data: {
            pending_actions: lead.pending_actions.filter((action) => action !== PendingAction.ThanksForSharingContacts),
          },
        });
      } else if (lead.pending_actions?.includes(PendingAction.ShareLEvelCheckResults)) {
        const pollSession = await strapi.db.query('api::poll-session.poll-session').findOne({
          where: {
            lead: { user_id: chatId },
          },
          populate: {
            poll: {
              populate: {
                items: {
                  populate: { options: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        if (!pollSession) return;

        const totalScore = pollSession.poll.items.reduce((acc, item, idx) => {
          const answer = pollSession.answers[idx];
          const correctOption = item.options.findIndex((opt) => opt.isCorrect);
          return acc + (answer === correctOption ? item.score : 0);
        }, 0);

        await ctx.telegram.sendMessage(
          chatId,
          `🎓 Test complete! Your score: ${totalScore}/${pollSession.poll.items.length}`
        );
        await strapi.db.query('api::lead.lead').update({
          where: { id: lead.id },
          data: {
            pending_actions: lead.pending_actions.filter((action) => action !== PendingAction.ShareLEvelCheckResults),
          },
        });
      }
    } else {
      await ctx.reply('We couldn’t find your registration in our system. Please start over with /start.');
    }
  });
}