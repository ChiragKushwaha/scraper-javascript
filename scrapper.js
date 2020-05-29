const fetch = require('node-fetch');
const cheerio = require('cheerio');

const searchUrl = 'https://www.imdb.com/find?s=tt&ref_=nv_sr_sm&q=';
const movieUrl = 'https://www.imdb.com/title/';

function searchMovies(searchTerm){
    return fetch(`${searchUrl}${searchTerm}`)
    .then(response => response.text())
    .then(body =>{
        const movies = [];
        const $ = cheerio.load(body);
        $('.findResult').each(function(i, element){
            const $element = $(element);
            const $image = $element.find('td a img');
            const $title = $element.find('tr td.result_text a');
            const imdbID = $title.attr('href').match(/title\/(.*)\//)[1];
            
            const movie = {
                image: $image.attr('src'),
                title: $title.text(),
                imdbID
            };
            movies.push(movie);
        });
        return movies;
    });
}

function getMovie(imdbID){
    return fetch(`${movieUrl}${imdbID}`)
    .then(response => response.text())
    .then(body => {
        const $ = cheerio.load(body);
        const $title = $('.title_wrapper h1');

        const title = $title.first().contents().filter(function(){
            return this.type === 'text';
        }).text().trim();
       
  
        let [rating, runTime, genre, datePublished ] = $('div.subtext').first().contents().text().split('|').map((value)=> value.trim());
        genre = genre.split(',');
        const imdbRating = $('span[itemprop="ratingValue"]').text();
        const poster = $('div.poster a img').attr('src');
        const summary = $('div.summary_text').text().trim();
        return {
            imdbID,
            title,
            rating,
            runTime,
            genre,
            datePublished,
            imdbRating,
            poster,
            summary
        };
    });
}

module.exports = {
    searchMovies,
    getMovie
};

