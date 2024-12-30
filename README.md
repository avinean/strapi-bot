# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

## ⚙️ Local development

To test bot locally, you can use [ngrok](https://ngrok.com/).

First, run the Strapi server:
```bash
npm run dev
```
It will start the server on `http://localhost:1337`.\
Then, run ngrok:

```bash
ngrok http 1337
```
It will give you a public URL.\
Now, you can use this URL to set up the webhook in your bot.
```bash
https://<your-ngrok-url>/webhooks/telegram/webhook
```
After that you can set up the webhook in your bot.
```bash
curl -F "url={YOUR NGROK URL}" https://api.telegram.org/bot{YOUR_BOT_TOKEN}/setWebhook
```

