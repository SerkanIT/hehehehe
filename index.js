const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");

const token = "6326059519:AAFCqjyOtn9LV1R6fSA7l8zKTq0Wyt8rD3Y";

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

bot.setMyCommands([
  { command: "/start", description: "About Books" },
  { command: "/courses", description: "More Books" },
]);

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") {
    await bot.sendMessage(
      chatId,
      `Hello ${msg.from?.first_name}`,
      {
        reply_markup: {
          keyboard: [
            [
              {
                text: "Go to order",
                web_app: {
                  url: "https://www.pandora.com.tr/",
                },
              },
            ],
          ],
        },
      }
    );
  }

  if (text === "/courses") {
    await bot.sendMessage(
      chatId,
      "Fill out the form before order or buy the book",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Fill out the form",
                web_app: {
                  url: "https://telegram-web-bot.vercel.app",
                },
              },
            ],
          ],
        },
      }
    );
  }

  if (msg.web_app_data?.data) {
    try {
      const data = JSON.parse(msg.web_app_data?.data);

      await bot.sendMessage(
        chatId,
        "Thank you for your order or purchase. We are very trustworthy"
      );

      for (item of data) {
        await bot.sendPhoto(chatId, item.Image);
        await bot.sendMessage(chatId, `${item.title} - ${item.quantity}x`);
      }

      await bot.sendMessage(
        chatId,
        `Total price - ${data
          .reduce((a, c) => a + c.price * c.quantity, 0)
          .toLocaleString("en-US", {
            style: "currency",
            currency: "TL",
          })}`
      );
    } catch (error) {
      console.log(error);
    }
  }
});

app.post("/web-data", async (req, res) => {
  const { queryID, products } = req.body;

  try {
    await bot.answerWebAppQuery(queryID, {
      type: "article",
      id: queryID,
      title: "You ordered a good item",
      input_message_content: {
        message_text: `You chose ${products
          .reduce((a, c) => a + c.price * c.quantity, 0)
          .toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })} worth of items: ${products
          .map((c) => `${c.title} ${c.quantity}X`)
          .join(", ")}`,
      },
    });
    return res.status(200).json({});
  } catch (error) {
    console.log(error);
    return res.status(500).json({});
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
