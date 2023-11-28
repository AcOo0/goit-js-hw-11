import './sass/index.scss';
import Notiflix from 'notiflix';
import axios from "axios";
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
    form: document.querySelector('#search-form'),
    gallery: document.querySelector('.gallery'),
    loadMoreBtn: document.querySelector('.load-more'),
};

const galleryLightbox = new SimpleLightbox('.gallery a');
const input = refs.form.elements.searchQuery;

refs.form.addEventListener('submit', handleSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

let page = 1;
let limit = 1;
const perPage = 40;

refs.loadMoreBtn.classList.add('hidden');

function handleSubmit(event) {
    event.preventDefault();
    refs.gallery.innerHTML = '';
    // refs.loadMoreBtn.classList.add('hidden');
    const form = event.currentTarget;
    if (form.searchQuery.value.trim() === '') {
        Notiflix.Notify.info("Enter something to search for");
        return
    }
    createGallery(page);
};

async function createGallery(page) {
    try {
        const data = await searchService(input.value.trim(), page, perPage);
        limit = data.totalHits / perPage;
        // console.log(data);
        if (!data.totalHits) {
    refs.loadMoreBtn.classList.add('hidden');
    Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
    );
        }
        if (page === 1 && data.totalHits !== 0) {
    Notiflix.Notify.info(`Hooray! We found ${data.totalHits} images.`);
        }
        if (page > limit && data.totalHits > 0) {
    refs.loadMoreBtn.classList.add('hidden');
    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
        }
    createMarkup(data.hits);
        galleryLightbox.refresh();
        if (data.hits.length >= perPage) {
            refs.loadMoreBtn.classList.remove('hidden');
        } else {
            refs.loadMoreBtn.classList.add('hidden');
        }
    } catch (err) {
        Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        console.log(err);
    }
    // finally {
    //     input.value = '';
    // }
};

function searchService(searchItem, page, perPage) {
    const API_KEY = '40906088-25cb83659f245cce39ac642e2';
    const BASE_URL = "https://pixabay.com/api/"
    return axios.get(BASE_URL, {
        params: {
            key: API_KEY,
            q: `${searchItem}`,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: true,
            per_page: perPage,
            page: page
        }
    })
        .then(response => {
        const { total, totalHits, hits } = response.data;
        return { total, totalHits, hits };
        })
        .catch((err) => {
            Notiflix.Notify.failure('Error fetching data from Pixabay API');
        });
}

function onLoadMore() {
    page += 1;
    createGallery(page);
};

function createMarkup(arr) {
    const markup = arr
    .map(
        ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
        }) => {
        return `<div class="gallery-card">
        <a href="${largeImageURL}"><img class="gallery-img" src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
        <div class="gallery-info">
            <p class="gallery-info-item">
            <b>Likes</b>
            ${likes}
            </p>
            <p class="gallery-info-item">
            <b>Views</b>
            ${views}
            </p>
            <p class="gallery-info-item">
            <b>Comments</b>
            ${comments}
            </p>
            <p class="gallery-info-item">
            <b>Downloads</b>
            ${downloads}
            </p>
        </div>
        </div>`
        }
    )
    .join('');
    refs.gallery.insertAdjacentHTML('beforeend', markup);
}
