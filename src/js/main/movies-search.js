import { fetchMoviesBySearch, fetchMoviesGenres } from '../api-service.js';
import { filterEl } from './main-cards';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import Pagination from 'tui-pagination';
import css from 'tui-pagination/dist/tui-pagination.min.css';
import imgPlaceholder from '../../images/no-poster-available.jpg';

const WARNING_MESSAGE = 'The search string cannot be empty. Please specify your search query.';
const ERROR_MESSAGE = 'Sorry, there are no movies matching your search query. Please try again.';

const formEl = document.querySelector('.header__form');
const moviesGalleryEl = document.querySelector('.gallery__list');
const paginationBoxEl = document.querySelector('#tui-pagination-container');

const pagination = new Pagination(paginationBoxEl, {
  totalItems: 20,
  itemsPerPage: 20,
  visiblePages: 5,
  centerAlign: true,
});

let currentPage = 1;

formEl.addEventListener('submit', onSearchSubmit);
paginationBoxEl.addEventListener('click', onClick);

function onSearchSubmit(e) {
  currentPage = 1;
  e.preventDefault();
  createMoviesGallery();
}

function createMoviesGallery() {
  const searchQuery = formEl.elements.searchQuery.value.trim();

  if (!searchQuery) {
    Notify.info(WARNING_MESSAGE);
    return;
  }

  fetchMoviesBySearch(searchQuery, currentPage)
    .then(response => {
      const {
        data: { results },
      } = response;

      if (results.length === 0) {
        Notify.failure(ERROR_MESSAGE);
      } else {
        renderGallery(results);

        pagination.reset(response.data.total_results);
      }
    })
    .catch(error => console.log(error.message));
}

function renderGallery(moviesArr) {
  const markup = moviesArr
    .map(movie => {
      return `
<li class="gallery__item">
        <button class="gallery__link" data-id="${movie.id}">
        <div class="gallery__image-box">
          <img class="gallery__image" src="https://image.tmdb.org/t/p/w500/${
            movie.poster_path
          }" alt="${
        movie.original_title
      }" onerror="this.onerror=null;this.src='${imgPlaceholder}';" data-id="${movie.id}">
          </div>
          <h2 class="gallery__title">
            ${movie.original_title}
          </h2>
          <p class="gallery__text">
          ${movie.genre_ids ? filterEl(movie.genre_ids) : 'N/A'} | ${
        movie.release_date ? movie.release_date.slice(0, 4) : 'N/A'
      }
          </p>
        </button>
      </li>
`;
    })
    .join('');
  moviesGalleryEl.innerHTML = markup;
}

function onClick() {
  pagination.on('beforeMove', evt => {
    currentPage = evt.page;
  });
  pagination.movePageTo(currentPage);
}
