import { Context } from 'koa';
import telegramService from '../services/telegram';

export default {
  async handle(ctx: Context) {
    try {
      const body = ctx.request.body;
      console.log('Received webhook payload:', body);

      const result = await telegramService.processUpdate(body);

      return ctx.send({
        success: true,
        message: result,
      });
    } catch (error) {
      console.error('Webhook error:', error);
      return ctx.badRequest('Webhook processing failed');
    }
  },
};
