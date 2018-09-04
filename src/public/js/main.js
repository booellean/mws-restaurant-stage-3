let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
// document.addEventListener('DOMContentLoaded', (event) => {
//   initMap(); // added
//   DBHelper.fetchNeighborhoods();
//   DBHelper.fetchCuisines();
// });
/**
 * Fetch neighborhoods and cuisines as soon as database is created
 */

window.addEventListener('load', initiateDatabase);

function initiateDatabase() {
  DBHelper.fetchRestaurants('restaurants/');
}

function initPage() {
  initMap(); // added
  DBHelper.fetchNeighborhoods();
  DBHelper.fetchCuisines();
}


/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = (error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  };

//Original function
// fetchNeighborhoods = () => {
//   DBHelper.fetchNeighborhoods((error, neighborhoods) => {
//     if (error) { // Got an error
//       console.error(error);
//     } else {
//       self.neighborhoods = neighborhoods;
//       fillNeighborhoodsHTML();
//     }
//   });
// }

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = (error, cuisines) => {
  if (error) { // Got an error!
    console.error(error);
  } else {
    self.cuisines = cuisines;
    fillCuisinesHTML();
  }
}

//Original function
// fetchCuisines = () => {
//   DBHelper.fetchCuisines((error, cuisines) => {
//     if (error) { // Got an error!
//       console.error(error);
//     } else {
//       self.cuisines = cuisines;
//       fillCuisinesHTML();
//     }
//   });
// }

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
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

  updateRestaurants();

}

/**
 * Update page and map for current restaurants.
 */

updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood);
}

fillUpdatedRestaurants = (error, restaurants) => {
  if (error) { // Got an error!
    console.error(error);
  } else {
    resetRestaurants(restaurants);
    fillRestaurantsHTML();
  }
};

// updateRestaurants = () => {
//   const cSelect = document.getElementById('cuisines-select');
//   const nSelect = document.getElementById('neighborhoods-select');

//   const cIndex = cSelect.selectedIndex;
//   const nIndex = nSelect.selectedIndex;

//   const cuisine = cSelect[cIndex].value;
//   const neighborhood = nSelect[nIndex].value;

//   DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood);
// }

// fillUpdatedRestaurants = (error, restaurants) => {
//   if (error) { // Got an error!
//     console.error(error);
//   } else {
//     resetRestaurants(restaurants);
//     fillRestaurantsHTML();
//   }
// }

//Original Function
// updateRestaurants = () => {
//   const cSelect = document.getElementById('cuisines-select');
//   const nSelect = document.getElementById('neighborhoods-select');

//   const cIndex = cSelect.selectedIndex;
//   const nIndex = nSelect.selectedIndex;

//   const cuisine = cSelect[cIndex].value;
//   const neighborhood = nSelect[nIndex].value;

//   DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
//     if (error) { // Got an error!
//       console.error(error);
//     } else {
//       resetRestaurants(restaurants);
//       fillRestaurantsHTML();
//     }
//   })
// }

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  const newId = (restaurant.name).replace(/[^A-Za-z0-9]/g, '');
  li.setAttribute('id', newId); //used to create nodes for focus_helper
  li.setAttribute('tabindex', '-1');
  observer.observe(li); //used for lazy loading all classes 'lazy-load'

  const divDescript = document.createElement('div');//To allow proper tabbing, otherwise list gets stuck
  divDescript.setAttribute('aria-label', `${restaurant.name} restaurant. Please Use Arrow Keys to View Items.`);
  divDescript.className = 'list-item-describor focus-item';
  li.append(divDescript);

  let favBoolean = restaurant.is_favorite;
  let favWord;
  let safeName = String(restaurant.name).replace("'", "");

  console.log(favBoolean);

  const favorite = document.createElement('button');

  (favBoolean == 'false' || favBoolean == undefined)  ? favorite.className = 'star-empty focus-item' : favorite.className = 'star-full focus-item';
  (favBoolean == 'false' || favBoolean == undefined)  ? favWord = 'not Favorite' : favWord = 'Favorite';
  (favBoolean == 'false' || favBoolean == undefined)  ? favorite.setAttribute('data-name', 'false') : favorite.setAttribute('data-name', 'true');

  favorite.setAttribute('id', `button${restaurant.id}`);
  favorite.setAttribute('onclick',`DBHelper.toggleFavorite(${restaurant.id},'${safeName}', event)`);
  favorite.setAttribute('aria-label',`Toggle Favorites: ${restaurant.name} is currently ${favWord}`);

  li.append(favorite);

  const image = document.createElement('img');
  image.className = 'focus-item restaurant-img lazy-load';
  image.setAttribute('id', restaurant.id);
  image.setAttribute('alt', restaurant.alt);
  li.append(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  name.className = 'focus-item lazy-load';
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  neighborhood.className = 'focus-item lazy-load';
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  address.className = 'focus-item  lazy-load';
  li.append(address);

  const more = document.createElement('a');
  more.setAttribute('aria-label', `View details and reviews of restaurant ${restaurant.name}`);
  more.innerHTML = 'View Details';
  more.className = 'focus-item lazy-load';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  return li
}

/**
 * Add markers for current restaurants to the map.
 * Inits focus groups for functionality
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  const mapBox = document.getElementById('map');
  const skiplink = document.createElement('a');
  skiplink.className = 'skip-link';
  skiplink.href = '#restaurants-list';
  skiplink.setAttribute('aria-label', 'Skip link: skip Mapbox map and jump to restaurant content.');
  skiplink.setAttribute('tabindex', '0');

  mapBox.prepend(skiplink);

  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });

  indexObjects();

}


