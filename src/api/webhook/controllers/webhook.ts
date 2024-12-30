import { Context } from 'koa';
import { Telegraf } from 'telegraf';

export default {
  async handle(ctx: Context) {
    try {
      const body = ctx.request.body;
      console.log('Received webhook payload:', body);

      // Access the TELEGRAM_BOT_TOKEN from the .env file
      const botToken = process.env.TELEGRAM_BOT_TOKEN;

      // Ensure the token is available
      if (!botToken) {
        console.error('TELEGRAM_BOT_TOKEN not found in environment variables');
        return ctx.badRequest('Bot token is missing');
      }

      // Initialize Telegraf with the bot token from the environment
      const bot = new Telegraf(botToken);

      // Check if the message exists in the payload
      if (body?.message) {
        const chatId: number = body.message.chat.id;
        const text: string = body.message.text;

        console.log(`Chat ID: ${chatId}, Text: ${text}`);

        // Store the entire webhook payload into the 'webhooks' collection using the new API
        const webhook = await strapi.db.query('api::webhook.webhook').create({
          data: {
            payload: body, // Storing the entire webhook payload
          },
        });

        console.log('Webhook created successfully:', webhook);

        // If the message is '/start', create a new 'lead'
        if (text === '/start') {
          const leadData = {
            user_id: String(chatId),
            is_bot: body.message.from.is_bot,
            first_name: body.message.from.first_name,
            username: body.message.from.username,
            language_code: body.message.from.language_code,
            type: 'start',
          };

          // Log lead data for debugging purposes
          console.log('Lead data to be created:', leadData);

          // Save the lead into the 'leads' collection using the new API
          const lead = await strapi.db.query('api::lead.lead').create({
            data: leadData,
          });

          console.log('Lead created successfully:', lead);

          // Now, associate the lead with the webhook
          if (lead && webhook) {
            await strapi.db.query('api::lead.lead').update({
              where: { id: lead.id },
              data: {
                webhook: webhook.id,  // Connecting the lead to the webhook via the relation
              },
            });

            console.log('Lead and Webhook relation created successfully');
          } else {
            console.error('Failed to create the lead or webhook');
          }

          // Send a response to the user
          await bot.telegram.sendMessage(chatId, 'Welcome! You have been registered as a lead.');
        }

        return ctx.send({
          success: true,
          message: `Message received and processed: ${text}`,
        });
      }

      return ctx.send({
        success: true,
        message: 'Webhook received successfully',
      });
    } catch (error) {
      console.error('Webhook error:', error);
      return ctx.badRequest('Webhook processing failed');
    }
  },
};
