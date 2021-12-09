import { fetchMoviesBySearch, fetchMoviesGenres } from '../api-service.js';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import Pagination from 'tui-pagination';
import 'tui-pagination/dist/tui-pagination.min.css';
import { paginationOptions } from '../pagination.js';
import imgPlaceholder from '../../images/no-poster-available.png';
import { startSpin, stopSpin } from '../spinner';

const WARNING_MESSAGE = 'The search string cannot be empty. Please specify your search query.';
const ERROR_MESSAGE = 'Sorry, there are no movies matching your search query. Please try again.';
const FIRST_PAGE = 1;

const formEl = document.querySelector('.header__form');
const moviesGalleryEl = document.querySelector('.gallery__list');
const paginationBoxEl = document.querySelector('#tui-pagination-container');

let pagination;
let currentPage = FIRST_PAGE;
let list = [];
let isApiResponseNotEmpty = false;

initPagination();

formEl.addEventListener('submit', onSearchSubmit);
paginationBoxEl.addEventListener('click', onNextPageClick);

function onSearchSubmit(e) {
  e.preventDefault();
  currentPage = FIRST_PAGE;
  createMoviesGallery(currentPage);
}

async function createMoviesGallery(currentPage) {
  const searchQuery = formEl.elements.searchQuery.value.trim();

  if (!searchQuery) {
    Notify.info(WARNING_MESSAGE);
    return;
  }
  startSpin();

  await fetchMoviesBySearch(searchQuery, currentPage)
    .then(response => {
      const {
        data: { results },
      } = response;

      if (results.length === 0) {
        Notify.failure(ERROR_MESSAGE);
      } else {
        isApiResponseNotEmpty = true;
        list = [];
        results.forEach(movie => {
          let movieData = {
            id: movie.id,
            poster: movie.poster_path,
            title: movie.original_title,
            genres: movie.genre_ids,
            year: movie.release_date ? movie.release_date.slice(0, 4) : 'Year N/A',
          };

          list.push(movieData);
        });
        console.log(response.data);
        if (currentPage === FIRST_PAGE) pagination.reset(response.data.total_results);
        if (response.data.total_pages === 1) {
          paginationBoxEl.classList.add('visually-hidden');
        } else {
          paginationBoxEl.classList.remove('visually-hidden');
        }
        paginationOptions.totalPages = response.data.total_pages;
      }
      !isApiResponseNotEmpty && stopSpin();
    })
    .catch(error => console.log(error));

  if (isApiResponseNotEmpty) {
    await fetchMoviesGenres()
      .then(response => {
        const {
          data: { genres },
        } = response;

        list.forEach(movie => {
          movie.genres = movie.genres.map(id => {
            genres.forEach(obj => {
              if (obj.id === id) {
                id = obj.name;
              }
            });
            return id;
          });

          switch (true) {
            case movie.genres.length > 0 && movie.genres.length <= 2:
              movie.genres = movie.genres.join(', ');
              break;

            case movie.genres.length > 2:
              movie.genres[2] = 'Other';
              movie.genres = movie.genres.slice(0, 3).join(', ');
              break;

            default:
              movie.genres = 'Genre N/A';
              break;
          }
        });
        stopSpin();
      })
      .catch(error => console.log(error));
  }
  isApiResponseNotEmpty && renderGallery(list);

  if (Number(paginationOptions.totalPages) > paginationOptions.visiblePages) {
    document.querySelector(
      '.tui-page-btn-custom.tui-last',
    ).innerHTML = `${paginationOptions.totalPages}`;
    document.querySelector('.tui-page-btn-custom.tui-last').style.background = '#f7f7f7';
    document.querySelector('.tui-page-btn-custom.tui-first').innerHTML = `${FIRST_PAGE}`;
    document.querySelector('.tui-page-btn-custom.tui-first').style.background = '#f7f7f7';
  }
}

function renderGallery(moviesArr) {
  const markup = moviesArr
    .map(({ id, poster, title, genres, year }) => {
      return `
<li class="gallery__item">
        <button class="gallery__link" data-id="${id}">
        <div class="gallery__image-box">
          <img class="gallery__image"
          src="https://image.tmdb.org/t/p/w500/${poster}" 
          alt="${title}" 
          onerror="this.onerror=null;this.src='${imgPlaceholder}';" 
          data-id="${id}">
          </div>
          <h2 class="gallery__title">
            ${title}
          </h2>
          <p class="gallery__text">${genres} | ${year}</p>
        </button>
      </li>
`;
    })
    .join('');

  moviesGalleryEl.innerHTML = markup;
  isApiResponseNotEmpty = false;
}

function initPagination() {
  pagination = new Pagination(paginationBoxEl, paginationOptions);
  paginationBoxEl.classList.add('visually-hidden');
}

async function onNextPageClick() {
  currentPage = pagination.getCurrentPage();
  await createMoviesGallery(currentPage);
}
