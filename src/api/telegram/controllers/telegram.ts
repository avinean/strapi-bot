import { Context } from 'koa';
import telegramService from '../services/telegram';

export default {
  async handle(ctx: Context) {
    try {
      console.log('Received webhook payload:', ctx.request.body);
      const result = await telegramService.handleUpdate(ctx.request.body);

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
