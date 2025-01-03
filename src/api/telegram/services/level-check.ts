import { Context, Telegraf } from 'telegraf';
import { Menu, PendingAction } from './types';

interface PollOption {
  label: string;
  isCorrect: boolean;
  difficultness: number;
  isChosen: boolean;
}

interface PollItem {
  question: string;
  options: PollOption[];
  score: number;
  multipleChoices: boolean;
}

interface PollSession {
  id: number;
  lead: any;
  poll: any;
  answers: number[];
  isCompleted: boolean;
}

export async function levelCheck(bot: Telegraf) {
  bot.hears(Menu.levelCheck.text, async (ctx: Context) => {
    const chatId = String(ctx.message?.chat.id);
    if (!chatId) return;

    const poll = await strapi.db.query('api::poll.poll').findOne({
      where: { type: 'level', language: 'en' },
      populate: {
        items: {
          populate: { options: true }
        }
      }
    });

    if (!poll) {
      await ctx.reply('❌ No level test available at the moment. Please try again later.');
      return;
    }
  
    await sendNextPoll(ctx, chatId, poll.id);
  });

  bot.on('poll_answer', async (ctx: Context) => {
    const chatId = String(ctx.pollAnswer?.user?.id);
    if (!chatId) return;

    const lead = await strapi.db.query('api::lead.lead').findOne({
      where: {
        user_id: chatId,
      }
    });

    const pollSession: PollSession = await strapi.db.query('api::poll-session.poll-session').findOne({
      where: {
        lead: { user_id: chatId },
        isCompleted: false,
      },
      populate: {
        poll: {
          populate: {
            items: {
              populate: { options: true }
            }
          }
        }
      }
    });

    if (!pollSession) return;

    const pollItems: PollItem[] = pollSession.poll.items;

    pollSession.answers.push(ctx.pollAnswer?.option_ids?.[0]);

    await strapi.db.query('api::poll-session.poll-session').update({
      where: { id: pollSession.id },
      data: {
        answers: pollSession.answers,
      },
    });

    if (pollSession.answers.length < pollItems.length) {
      await sendNextPoll(ctx, chatId, pollSession.poll.id);
    } else {
      const totalScore = pollItems.reduce((acc, item, idx) => {
        const answer = pollSession.answers[idx];
        const correctOption = item.options.findIndex((opt) => opt.isCorrect);
        return acc + (answer === correctOption ? item.score : 0);
      }, 0);

      await strapi.db.query('api::poll-session.poll-session').update({
        where: { id: pollSession.id },
        data: {
          isCompleted: true,
        },
      });

      if (lead.phone_number) {
        await ctx.telegram.sendMessage(
          chatId,
          `🎓 Test complete! Your score: ${totalScore}/${pollSession.answers.length}`
        );
      } else {
        await ctx.telegram.sendMessage(
          chatId,
          '📱 Please share your phone number to complete your profile:',
          {
            reply_markup: {
              keyboard: [
                [
                  {
                    text: '📲 Share Phone Number',
                    request_contact: true,
                  },
                ],
              ],
              one_time_keyboard: true,
              resize_keyboard: true,
            },
          }
        );
        await strapi.db.query('api::lead.lead').update({
          where: { id: lead.id },
          data: {
            pending_actions: [...(lead.pending_actions || []), PendingAction.ShareLEvelCheckResults],
          },
        });
      }
    }
  });
}

async function sendNextPoll(ctx: Context, chatId: string, pollId: number) {
  let pollSession = await strapi.db.query('api::poll-session.poll-session').findOne({
    where: {
      lead: { user_id: chatId},
      isCompleted: false,
      poll: pollId,
    },
    populate: {
      poll: {
        populate: {
          items: {
            populate: { options: true }
          }
        }
      }
    }
  });

  if (!pollSession) {
    const lead = await strapi.db.query('api::lead.lead').findOne({
      where: {
        user_id: chatId,
      }
    });

    if (!lead) {
      await ctx.reply('❌ Lead user not found.');
      return;
    }
    
    pollSession = await strapi.db.query('api::poll-session.poll-session').create({
      data: {
        lead: lead.id,
        poll: pollId,
        answers: [],
        isCompleted: false,
      },
      populate: {
        poll: {
          populate: {
            items: {
              populate: { options: true }
            }
          }
        }
      }
    });
  }
  
  const currentPollItem: PollItem = pollSession.poll.items[pollSession.answers.length];

  await ctx.telegram.sendPoll(
    chatId,
    currentPollItem.question,
    currentPollItem.options.map((opt) => opt.label),
    {
      is_anonymous: false,
      allows_multiple_answers: currentPollItem.multipleChoices,
      explanation: 'Pay attention to grammar and vocabulary!',
    }
  );
}

