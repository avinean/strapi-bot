export default {
  routes: [
    {
      method: 'POST',
      path: '/webhook',
      handler: 'webhook.handle',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
