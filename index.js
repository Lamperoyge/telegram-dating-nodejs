const Telegraf = require("telegraf");
const Composer = require("telegraf/composer");
const session = require("telegraf/session");
const Stage = require("telegraf/stage");
const Markup = require("telegraf/markup");
const WizardScene = require("telegraf/scenes/wizard");
const stepHandler = new Composer();
const { storeToDb, setUserInfo } = require("./utils");

let picCount = 0;
stepHandler.action("next", (ctx) => {
  ctx.reply(
    "Great! Now, please send me your location or type in your city, or if you want to go borderless just type borderless You can edit this at anytime later",
    Markup.resize()
      .keyboard([Markup.locationRequestButton("Send location")])
      .oneTime()
      .extra()
  );
  return ctx.wizard.next();
});

stepHandler.command("borderless", (ctx) => {
  ctx.reply(
    "Alright, you've chosen borderless. After all, love has no borders, right?"
  );
});
const superWizard = new WizardScene(
  "super-wizard",
  (ctx) => {
    ctx.reply(
      "Hi! Welcome to HeartBeat. We know that people's voices can be very attractive. That's why we want you to hear their voice first, and only if you like the voice, you'll get to see the picture. Press Next to continue",
      Markup.inlineKeyboard([Markup.callbackButton("➡️ Next", "next")]).extra()
    );
    return ctx.wizard.next();
  },
  stepHandler,
  (ctx) => {
    if (ctx.message.location) {
      storeToDb("location", ctx.message.location);
    } else {
      storeToDb("location", "borderless");
    }
    ctx.reply(
      "Great! Now please enter your age",
      Markup.forceReply().oneTime()
    );
    return ctx.wizard.next();
  },
  (ctx) => {
    let message;
    if (Number(ctx.message.text) && ctx.message.text.length === 2) {
      storeToDb("age", ctx.message.text);
      ctx.reply(
        "Please choose your gender",

        Markup.inlineKeyboard([
          Markup.callbackButton("Male", "setGenderMale"),
          Markup.callbackButton("Female", "setGenderFemale"),
          Markup.callbackButton("Trans", "setGenderTrans"),
        ]).extra()
      );
      return ctx.wizard.next();
    } else {
      message = "Please use a number from 16-99";
      ctx.reply(message);
    }
  },
  (ctx) => {
    if (ctx.callbackQuery) {
      setUserInfo(ctx.callbackQuery.data);
    }
    ctx.reply(
      "Please choose who you're interested in",

      Markup.inlineKeyboard([
        Markup.callbackButton("Men", "setInterestMen"),
        Markup.callbackButton("Women", "setInterestWomen"),
        Markup.callbackButton("Both", "setInterestBoth"),
      ]).extra()
    );
    return ctx.wizard.next();
  },
  (ctx) => {
    if (ctx.callbackQuery) {
      setUserInfo(ctx.callbackQuery.data);
    }
    ctx.reply(
      "Cool! Now please send me a voice message. 🎤. You can later edit the voice by typing /voice"
    );
    return ctx.wizard.next();
  },
  (ctx) => {
    console.log(ctx.updateSubTypes);
    if (ctx.updateSubTypes[0] === "voice") {
      ctx.reply(
        "Yay! Now type /photos to select your pictures and you're done"
      );
      setUserInfo(ctx.message.voice);
    }
    return ctx.wizard.next();
  },
  (ctx) => {
    if (ctx.message.text === "/photos") {
      return ctx.scene.leave();
    }
  }
);

const BOT_TOKEN = "1128379813:AAESfgmDAHn5JnStWu5tSePKGtwSwaM1ewo";
const bot = new Telegraf(BOT_TOKEN);
const stage = new Stage([superWizard], { default: "super-wizard" });

bot.use(session());
bot.use(stage.middleware());
bot.launch();
