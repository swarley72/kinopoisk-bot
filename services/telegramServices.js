const { APIServices } = require('./apiServices');

class TelegramServices {
  static createInlineKeyboardStart() {
    return {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Popular',
              callback_data: JSON.stringify({
                type: 'popularList',
              }),
            },
            {
              text: 'Genres',
              callback_data: JSON.stringify({
                type: 'genresList',
              }),
            },
          ],
        ],
      },
    };
  }

  static async createInlineKeyboardGenres() {
    const genres = await APIServices.getGenres();
    const inlineKeyboard = genres.map((genreObj) => {
      return [
        {
          text: genreObj.genre,
          callback_data: JSON.stringify({
            type: 'getMoviesByGenres',
            genreId: genreObj.id,
          }),
        },
      ];
    });

    return { reply_markup: { inline_keyboard: inlineKeyboard } };
  }

  static createInlineKeyboardDates(genreId) {
    let arr = [];
    for (let i = 1900; i < 2020; i += 20) {
      arr.push([
        {
          text: i + ' - ' + (i + 20),
          callback_data: JSON.stringify({
            type: 'getMoviesByGenres',
            genreId,
            startYear: i,
          }),
        },
      ]);
    }

    return { inline_keyboard: arr };
  }

  static async createMoviesListByGenreId(
    genreId,
    page = 1,
    startYear = 1888,
    endYear = 2020,
    sortBy = 'RATING',
    type = 'ALL',
    minRating = 0
  ) {
    const response = await APIServices.getMoviesWithFilter(
      genreId,
      page,
      startYear,
      endYear,
      sortBy,
      type,
      minRating
    );
    // console.log(res);
    const { currentPage, pagesCount, films } = response;

    // console.log({ currentPage });
    // console.log({ films });
    return { currentPage, pagesCount, films, genreId };
  }

  static createMoviesListMessage(movieArr) {
    return movieArr
      .map((film) => '/' + film.filmId + ' ' + film.nameRu)
      .join('\n');
  }

  static createMovieMessage(movieInfo) {
    return Object.entries(movieInfo)
      .map((info) => info.join(': '))
      .join('\n');
  }

  static createInlineNavigation(prevPage, nextPage, genreId) {
    return {
      inline_keyboard: [
        [
          {
            text: 'prev',
            callback_data: JSON.stringify({
              type: 'getPrevMoviesByGenre',
              page: prevPage,
              genreId,
            }),
          },
          {
            text: 'next',
            callback_data: JSON.stringify({
              type: 'getNextMoviesByGenre',
              page: nextPage,
              genreId,
            }),
          },
        ],
      ],
    };
  }

  static createOneInlineNavigation(text, type, page, genreId) {
    return {
      inline_keyboard: [
        [
          {
            text,
            callback_data: JSON.stringify({
              type,
              page,
              genreId,
            }),
          },
        ],
      ],
    };
  }
}

module.exports = {
  TelegramServices,
};
