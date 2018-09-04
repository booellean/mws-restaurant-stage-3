let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
// document.addEventListener('DOMContentLoaded', (event) => {
//   initMap();
// });
/**
 * Fetch neighborhoods and cuisines as soon as database is created
 */

//both InitiateDatabase and submitReview uses this data, keep in global scope
let url = window.location.search;
let stringID = url.split("?id=")[1];
let id = parseInt(stringID); //find id from window location

window.addEventListener('load', initiateDatabase);
function initiateDatabase() {
  DBHelper.fetchReviews(`reviews/?restaurant_id=${id}`);
}

function initPage() {
  fetchRestaurantFromURL();
}

/**
 * Initialize leaflet map
 */
initMap = (error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiYm9vZWxsZWFuIiwiYSI6ImNqaXo3eHdodDA0YW4zcXBjMjd6dXowZnIifQ.d5RF4w_C9ppt_nAyldHBXQ',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);

      const mapBox = document.getElementById('map');
      const skiplink = document.createElement('a');
      skiplink.className = 'skip-link';
      skiplink.href = '#restaurant-container';
      skiplink.setAttribute('aria-label', 'Skip link: skip Mapbox map and jump to restaurant content.');
      skiplink.setAttribute('tabindex', '0');

      mapBox.prepend(skiplink);

    }
  };

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id);
  }
}

fillFetchedRestaurantFromURL = (error, restaurant) => {
  self.restaurant = restaurant;
  if (!restaurant) {
    console.error(error);
    return;
  }
  fillRestaurantHTML();
  initMap(null, restaurant);
}

//Original Function
// fetchRestaurantFromURL = (callback) => {
//   if (self.restaurant) { // restaurant already fetched!
//     callback(null, self.restaurant)
//     return;
//   }
//   const id = getParameterByName('id');
//   if (!id) { // no id found in URL
//     error = 'No restaurant id in URL'
//     callback(error, null);
//   } else {
//     DBHelper.fetchRestaurants(id, (error, restaurant) => {
//       self.restaurant = restaurant;
//       if (!restaurant) {
//         console.error(error);
//         return;
//       }
//       fillRestaurantHTML();
//       callback(null, restaurant)
//     });
//   }
// }

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const restaurantContainer = document.getElementById('restaurant-container');
  const divDescript = document.createElement('div');//To allow proper tabbing, otherwise list gets stuck
  divDescript.setAttribute('aria-label', `${restaurant.name} details section. Please Use Arrow Keys to View Items.`);
  divDescript.className = 'list-item-describor focus-item';
  observer.observe(restaurantContainer); //used for lazy loading all classes 'lazy-load'

  let favBoolean = restaurant.isfavorite || false; //in case it hasn't been set yet
  let favWord;
  const favorite = document.createElement('button');
  favBoolean == false ? favorite.className = 'star-empty focus-item' : favorite.className = 'star-full focus-item';
  favBoolean == false ? favWord = 'not Favorite' : favWord = 'Favorite';
  favorite.setAttribute('id', `button${restaurant.id}`);
  favorite.setAttribute('data-name', favBoolean);
  favorite.setAttribute('aria-label',`Toggle Favorites: ${restaurant.name} is currently ${favWord}`);
  favorite.setAttribute('onclick',`DBHelper.toggleFavorite(${restaurant.id}, '${restaurant.name}', event)`);

  restaurantContainer.prepend(favorite);
  restaurantContainer.prepend(divDescript);

  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  name.className = 'focus-item lazy-load';

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
  address.className = 'focus-item lazy-load';

  const image = document.getElementById('restaurant-img');
  image.className = 'focus-item restaurant-img lazy-load';
  image.setAttribute('alt', restaurant.alt);
  image.setAttribute('id', restaurant.id); //reset the id for the lazyLoad function in lazyload.js

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;
  cuisine.className = 'focus-item lazy-load';

  const reviewForm = document.getElementById('form-container');
  const divDescriptTwo = document.createElement('div');//To allow proper tabbing, otherwise list gets stuck
  divDescriptTwo.setAttribute('aria-label', `${restaurant.name} review form. Please describe your experience at this restaurant.`);
  divDescriptTwo.setAttribute('tabindex', '0')
  divDescriptTwo.className = 'list-item-describor';

  const skiplink = document.createElement('a');
  skiplink.className = 'skip-link';
  skiplink.href = '#footer';
  skiplink.setAttribute('aria-label', 'Skip link: skip form section');
  skiplink.setAttribute('tabindex', '0');

  reviewForm.prepend(skiplink);
  reviewForm.prepend(divDescriptTwo);

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  DBHelper.fillReviewsHTML(restaurant.id, null);
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  observer.observe(hours); //used for lazy loading all classes 'lazy-load'
  for (let key in operatingHours) {
    const row = document.createElement('tr');
    row.className = 'lazy-load';

    const day = document.createElement('td');
    day.innerHTML = key;
    day.className = 'focus-item';
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    time.className = 'focus-item';
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.review) => {
  const container = document.getElementById('reviews-container');
  const divDescript = document.createElement('div');//To allow proper tabbing, otherwise list gets stuck
  divDescript.setAttribute('aria-label', `Review Information. Please tab over and use arrow keys to cycle through content`);
  divDescript.className = 'list-item-describor focus-item';
  container.prepend(divDescript);
  observer.observe(container); //used for lazy loading all classes 'lazy-load'

  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  title.className = 'focus-item lazy-load';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    noReviews.className = 'focus-item lazy-load';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);

  restaurantObjects(); //creates focus objects for document
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.className = 'focus-item lazy-load';
  li.appendChild(name);
  observer.observe(li); //used for lazy loading all classes 'lazy-load'

  const date = document.createElement('p');
  date.innerHTML = review.createdAt;
  date.className = 'focus-item lazy-load';
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.className = 'focus-item lazy-load';
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.className = 'focus-item lazy-load';
  li.appendChild(comments);

  return li;

}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const breadcrumbUL = breadcrumb.querySelector('ul');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('tabindex', '0');
  li.setAttribute('aria-current', 'page');
  breadcrumbUL.appendChild(li);

}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Submit review of restuarant from form.
 */

 submitReview = (e) => {
  let name = document.querySelector('#name').value;
  let rating = parseInt(document.querySelector('#rating').value);
  let comments = document.querySelector('#comments').value;
  let time = Math.round((new Date()).getTime() / 1000); //Math was found through https://www.electrictoolbox.com/unix-timestamp-javascript/

  let review = {
    restaurant_id: id,
    name: name,
    createdAt: time,
    updatedAt: time,
    rating: rating,
    comments: comments
  };

  DBHelper.submitReview(review);
  e.preventDefault();

 }