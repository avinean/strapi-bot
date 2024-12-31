export default {
  routes: [
    {
      method: 'POST',
      path: '/telegram',
      handler: 'telegram.handle',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
