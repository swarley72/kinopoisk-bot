require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const { APIServices } = require('./services/apiServices');
const { TelegramServices } = require('./services/telegramServices');

const token = process.env.TELEGRAM_KEY;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

bot.setMyCommands([
  { command: '/start', description: 'start bot' },
  { command: '/info', description: ' some info' },
  { command: '/id', description: 'movie info' },
]);

// Matches "/echo [whatever]"
bot.onText(/\/start/, (msg, match) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;
  // const messageId = msg.message_id;

  bot.sendMessage(
    chatId,
    `Hi, ${username}`,
    TelegramServices.createInlineKeyboardStart()
  );
});

bot.onText(/\/\d*/, async (msg, match) => {
  const chatId = msg.chat.id;
  const movieId = msg.text.slice(1);
  const movieInfo = await APIServices.getMovieInfo(movieId);
  const message = TelegramServices.createMovieMessage(movieInfo);

  await bot.sendMessage(chatId, message);
});

bot.on('callback_query', async (msg) => {
  const callbackData = JSON.parse(msg.data);
  const chatId = msg.message.chat.id;
  const messageId = msg.message.message_id;

  let message;
  let data;
  let inlineKeyboard;
  let genreId;
  // let startYear;
  // let endYear;
  switch (callbackData.type) {
    case 'genresList':
      inlineKeyboard = await TelegramServices.createInlineKeyboardGenres();

      bot.sendMessage(chatId, 'Choose genre', inlineKeyboard);
      break;

    case 'genresDate':
      genreId = callbackData.genreId;
      inlineKeyboard = TelegramServices.createInlineKeyboardDates(genreId);
      bot.editMessageText('Choose year', {
        reply_markup: inlineKeyboard,
        chat_id: chatId,
        message_id: messageId,
      });
      break;

    case 'getMoviesByGenres':
      // console.log(callbackData);
      // startYear = callbackData.startYear;
      // endYear = +callbackData.startYear + 20;

      data = await TelegramServices.createMoviesListByGenreId(
        callbackData.genreId
        // startYear,
        // endYear
      );
      message = TelegramServices.createMoviesListMessage(data.films);

      if (data.currentPage < data.pagesCount) {
        inlineKeyboard = TelegramServices.createOneInlineNavigation(
          'next',
          'getNextMoviesByGenre',
          data.currentPage + 1,
          data.genreId
        );
        bot.editMessageText(message, {
          reply_markup: inlineKeyboard,
          chat_id: chatId,
          message_id: messageId,
        });
      } else {
        bot.editMessageText(message, {
          chat_id: chatId,
          message_id: messageId,
        });
      }
      break;

    case 'getNextMoviesByGenre':
      data = await TelegramServices.createMoviesListByGenreId(
        callbackData.genreId,
        callbackData.page
      );
      message = TelegramServices.createMoviesListMessage(data.films);

      if (data.currentPage < data.pagesCount) {
        bot.editMessageText(message, {
          reply_markup: TelegramServices.createInlineNavigation(
            data.currentPage - 1,
            data.currentPage + 1,
            data.genreId
          ),
          chat_id: chatId,
          message_id: messageId,
        });
      } else {
        inlineKeyboard = bot.editMessageText(message, {
          reply_markup: TelegramServices.createOneInlineNavigation(
            'prev',
            'getPrevMoviesByGenre',
            data.currentPage - 1,
            data.genreId
          ),
          chat_id: chatId,
          message_id: messageId,
        });
      }

      break;

    case 'getPrevMoviesByGenre':
      data = await TelegramServices.createMoviesListByGenreId(
        callbackData.genreId,
        callbackData.page
      );
      message = TelegramServices.createMoviesListMessage(data.films);

      if (data.currentPage > 1) {
        bot.editMessageText(message, {
          reply_markup: TelegramServices.createInlineNavigation(
            data.currentPage - 1,
            data.currentPage + 1,
            data.genreId
          ),
          chat_id: chatId,
          message_id: messageId,
        });
      } else {
        inlineKeyboard = TelegramServices.createOneInlineNavigation(
          'next',
          'getNextMoviesByGenre',
          data.currentPage + 1,
          data.genreId
        );
        bot.editMessageText(message, {
          reply_markup: inlineKeyboard,
          chat_id: chatId,
          message_id: messageId,
        });
      }
      break;

    default:
      break;
  }
});
