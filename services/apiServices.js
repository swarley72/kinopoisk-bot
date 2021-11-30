require('dotenv').config();
const axios = require('axios');

class APIServices {
  static async getGenres() {
    const response = await axios({
      method: 'get',
      url: 'https://kinopoiskapiunofficial.tech/api/v2.1/films/filters',
      headers: { 'X-API-KEY': process.env.API_KEY },
    });
    if (response.status <= 400) {
      const { genres } = response.data;
      return genres;
    }
  }

  static async getMoviesWithFilter(
    genreId,
    page = 1,
    startYear = 1888,
    endYear = 2020,
    sortBy = 'RATING', // NUM_VOTE, YEAR,
    type = 'ALL', // FILM, TV_SHOW
    minRating = 0
  ) {
    const url = `https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-filters?country=0&genre=${genreId}&order=${sortBy}&type=${type}&ratingFrom=${minRating}&ratingTo=10&yearFrom=${startYear}&yearTo=${endYear}&page=${page}`;
    const response = await axios({
      method: 'get',
      url,
      headers: { 'X-API-KEY': process.env.API_KEY },
    });
    // console.log(response.status);
    if (response.status <= 400) {
      // console.log(response.data);
      return { genreId, currentPage: page, ...response.data };
    }
  }

  static async getMovieInfo(movieId) {
    const url = `https://kinopoiskapiunofficial.tech/api/v2.2/films/${movieId}`;

    const response = await axios({
      method: 'get',
      url,
      headers: { 'X-API-KEY': process.env.API_KEY },
    });

    if (response.status <= 400) {
      const { nameRu, posterUrlPreview, ratingImdb, webUrl, shortDescription } =
        response.data;
      return { nameRu, posterUrlPreview, ratingImdb, shortDescription };
    }
  }
}

// TMDBServices.getPopularMovies();
// APIServices.getGenres();

module.exports = {
  APIServices,
};
