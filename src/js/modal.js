import { fetchMovieById } from './api-service';
import { myLibrary, foundFilms } from './main/guests-object';
import axios from 'axios';
import genres from './main/genres';
import './main/main-cards';
import sprite from '../images/sprite.svg';
import imgPlaceholder from '../images/no-poster-available.jpg';
import { Spinner } from 'spin.js';
import opts from './spinner';
// import { startSpin, stopSpin } from './spinner';

myLibrary.initializationLibrary();

const gallery = document.querySelector('.gallery__list');
const backdrop = document.querySelector('[data-modal]');
const modal = document.querySelector('.modal');
const body = document.querySelector('body');
const toTopArrow = document.querySelector('.back-to-top');

gallery.addEventListener('click', onMovieCLick);

async function onMovieCLick(event) {
  event.preventDefault();
  // startSpin();
  var target = document.getElementById('modal-spin');
  var spinner = new Spinner(opts).spin(target);
  modal.innerHTML = '';
  if (
    event.target.nodeName !== 'IMG' &&
    event.target.nodeName !== 'H2' &&
    event.target.nodeName !== 'P' &&
    event.target.nodeName !== 'BUTTON'
  ) {
    return;
  }
  openModal();

  const movieId = event.target.dataset.id;
  await fetchMovieById(movieId)
    .then(responce => {
      const movieInfo = responce.data;
      myLibrary.film = movieInfo;
      renderModalCard(movieInfo);
    })
    .catch(error => console.log(error));
  // stopSpin();
  spinner.stop();
  document.addEventListener('keydown', onEscClose);
  document.addEventListener('click', onClickClose);
}

function renderModalCard({
  poster_path,
  title,
  vote_average,
  vote_count,
  popularity,
  original_title,
  genres,
  overview,
  id,
}) {
  const genresList = genres.map(genre => genre.name).join(', ');
  modal.innerHTML = `<div>
  <div class="movie__container">
    <div class="image__container"> 
    <img class="modal__movie-img" src='https://image.tmdb.org/t/p/w500/${poster_path}' alt="${title}" onerror="this.onerror=null;this.src='${imgPlaceholder}';">
    </div>
    <div class="movie__info">
    <h2 class="modal__movie-title">${title}</h2>
    <ul class="modal__movie-info">
      <li class="movie__info-item">
        <span class="movie__info-title">Vote / Votes</span><span class="movie__info-data"><span class="votes__colored">${vote_average}</span><span class="vote__divide">/</span> ${vote_count}</span>
      </li>
      <li class="movie__info-item">
        <span class="movie__info-title">Popularity</span><span class="movie__info-data">${popularity}</span>
      </li>
      <li class="movie__info-item">
        <span class="movie__info-title">Original Title</span><span class="movie__info-data original-title">${original_title}</span>
      </li> 
      <li class="movie__info-item">
        <span class="movie__info-title">Genre</span><span class="movie__info-data">${genresList}</span>
      </li>
    </ul>
    <h3 class="movie__overview-title">ABOUT</h3>
    <p class="movie__overview-text">${overview}</p>
    <div class="movie__buttons">
    <button type="button" class="add-button" data-id="${
      myLibrary.isWatched(id) ? 'current-button' : ''
    }" data-action="button__watched">ADD TO WATCHED</button>
    <button type="button" class="add-button" data-id="${
      myLibrary.isQueue(id) ? 'current-button' : ''
    }" data-action="button__queue">ADD TO QUEUE</button>
    <button type="button" id="modal-close" class="modal__close">
    <svg class="close-icon" id="close-icon" width="14px" height="14px">
    <use id="close-svg" href="${sprite}#icon-close"></use>
    </svg>
      </button>
    </div>
    </div>
    </div>`;
}

function onEscClose(event) {
  if (event.key === 'Escape') {
    closeModal();
  }
}

function onClickClose(event) {
  switch (event.target.dataset.action) {
    case 'button__watched':
      myLibrary.addWatched(myLibrary.film);
      break;
    case 'button__queue':
      myLibrary.addQueue(myLibrary.film);
      break;
  }
  if (
    event.target === backdrop ||
    event.target.id === 'modal-close' ||
    event.target.id === 'close-icon' ||
    event.target.id === 'close-svg'
  ) {
    closeModal();
  }
}

function openModal() {
  backdrop.classList.remove('is-hidden');
  body.classList.add('no-scroll');
  toTopArrow.classList.remove('back-to-top_show');
}

function closeModal() {
  backdrop.classList.add('is-hidden');
  body.classList.remove('no-scroll');
  toTopArrow.classList.add('back-to-top_show');
  document.removeEventListener('click', onClickClose);
  document.removeEventListener('keydown', onEscClose);
}
