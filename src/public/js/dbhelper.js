/**
 * Common database helper functions.
 */
/**
* @description Create an indexedDB object and upgrade if necessary
* @returns {object} keypath of "id"
*/

let restaurantBackup, reviewBackup; //backup if indexedDB is not supported
const idbName = 'restaurant-data';
const idbResTx = 'restaurant';
const idbRevTx = 'review';
const idbRevForm = 'reviews-to-submit'; //holds reviews that need to be submitted when offline

const dbPromise = idb.open(idbName, 1, upgradeDB => {
  let restaurants = upgradeDB.createObjectStore(idbResTx, { keyPath: 'id' });
  let reviews = upgradeDB.createObjectStore(idbRevTx, { keyPath: 'id' });
  reviews.createIndex('restaurant', 'restaurant_id');
  let reviewsToSubmit = upgradeDB.createObjectStore(idbRevForm, { keyPath: 'createdAt' });
});


/**
* @description Check database to see if any prior form data exists, then delete data
*/
window.onload = function(){
  dbPromise.then( db =>{
    return db.transaction(idbRevForm)
                    .objectStore(idbRevForm)
                    .getAll(); //cannot get individual items using variables, need to get all
  })
  .then( allReviews =>{
    if(allReviews.length == 0){ return }
    let reviews = allReviews;
    dbPromise.then( db => {
      const tx = db.transaction(idbRevForm, 'readwrite');
      const keyValStore = tx.objectStore(idbRevForm);
      reviews.forEach( review =>{
        DBHelper.submitReview(review);
        keyValStore.delete(review.createdAt);
      })
    })
  })
}

class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static DATABASE_URL(dbsection) {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/${dbsection}`;
    // const port = 1337
    // return `https://booellean.github.io/${port}/restaurants/`;
  }

  /**
   * Fetch all restaurants.
   */
  // static fetchRestaurants(method, cuisine, neighborhood, id) {
  static fetchRestaurants(dbsection) {
    fetch(DBHelper.DATABASE_URL(dbsection))
    .then( response => {
      const restaurants = response.json();
      return restaurants;
    })
    .then( restaurants => {
      if(!window.indexedDB){
        restaurantBackup = restaurants;
        return;
      }
      let items = restaurants;
      dbPromise.then( db => {
        const tx = db.transaction(idbResTx, 'readwrite');
        const keyValStore = tx.objectStore(idbResTx);
        return keyValStore.count();
      }).then( count => {
        if( count != items.length){
          idb.delete(idbResTx);
          return items;
        }else{ return items = null; }
        }).then( restaurants => {
          console.log(restaurants);
          if(restaurants != null){
            dbPromise.then( db => {
              const tx = db.transaction(idbResTx, 'readwrite');
              const keyValStore = tx.objectStore(idbResTx);
              restaurants.forEach( restaurant => {
                  keyValStore.put({
                    id: restaurant.id,
                    name: restaurant.name,
                    neighborhood: restaurant.neighborhood,
                    photograph: restaurant.photograph,
                    ext: restaurant.ext,
                    alt: restaurant.alt,
                    address: restaurant.address,
                    latlng: restaurant.latlng,
                    cuisine_type: restaurant.cuisine_type,
                    operating_hours: restaurant.operating_hours
                  });
                });
              })
          }
          return initPage(); //this gaurantees a page is only initiated once.
        })
      })
    // .then( restaurants => {
    //   method(null, restaurants, cuisine, neighborhood, id);
    // })
    .catch( error => {
      console.log(error);
      restaurantBackup = (error, null);
      return initPage();
    })

    //Original code
    // )
    // let xhr = new XMLHttpRequest();
    // xhr.open('GET', DBHelper.DATABASE_URL);
    // xhr.onload = () => {
    //   if (xhr.status === 200) { // Got a success response from server!
    //     const json = JSON.parse(xhr.responseText);
    //     const restaurants = json.restaurants;
    //     callback(null, restaurants);
    //   } else { // Oops!. Got an error from server.
    //     const error = (`Request failed. Returned status of ${xhr.status}`);
    //     callback(error, null);
    //   }
    // };
    // xhr.send();
  }

  static fetchReviews(dbsection) {
    fetch(DBHelper.DATABASE_URL(dbsection))
    .then( response => {
      const reviews = response.json();
      return reviews;
    })
    .then( reviews => {
      if(!window.indexedDB){
        reviewBackup = reviews;
        return;
      }
      let items;
      dbPromise.then( db => {
        items = reviews;
        const tx = db.transaction(idbRevTx, 'readwrite');
        const keyValStore = tx.objectStore(idbRevTx);
        return keyValStore.count();
      }).then( count => {
        if( count != items.length){
          idb.delete(idbRevTx);
          return items;
        }else{ return items = null; }
      }).then( reviews => {
        console.log(reviews);
        if(reviews != null){
          dbPromise.then( db => {
            const tx = db.transaction(idbRevTx, 'readwrite');
            const keyValStore = tx.objectStore(idbRevTx);
            reviews.forEach( review => {

              let unixDate = new Date(review.createdAt); //standardizes the Unix Time Stamp
              let options = {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric'};
              let formatDate = unixDate.toLocaleDateString('en-US', options);

              keyValStore.put({
                id: review.id,
                restaurant_id: review.restaurant_id,
                name: review.name,
                createdAt: formatDate,
                updatedAt: review.updatedAt,
                rating: review.rating,
                comments: review.comments
              });
            });
          })
        }
        return DBHelper.fetchRestaurants('restaurants');
      })
    })
    .catch( error => {
      console.log(error);
      reviewBackup = (error, null);
      return DBHelper.fetchRestaurants('restaurants');
    })
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, error) {
    // fetch all restaurants with proper error handling.
      if (error) {
        fillFetchedRestaurantFromURL(error, null);
      } else {
        dbPromise.then( db => {
          const tx = db.transaction(idbResTx);
          const keyValStore = tx.objectStore(idbResTx);
          const restaurants = keyValStore.getAll();

          return restaurants;

        }).then( restaurants => {
          const restaurant = restaurants.find(r => r.id == id);
          if (restaurant) { // Got the restaurant
            fillFetchedRestaurantFromURL(null, restaurant);
          } else { // Restaurant does not exist in the database
            fillFetchedRestaurantFromURL('Restaurant does not exist', null);
          }
        })
      }

    //Original Function
    // DBHelper.fetchRestaurants( (error, restaurants) => {
    // if (error) {
    //   callback(error, null);
    // } else {
    //   const restaurant = restaurants.find(r => r.id == id);
    //   if (restaurant) { // Got the restaurant
    //     callback(null, restaurant);
    //   } else { // Restaurant does not exist in the database
    //     callback('Restaurant does not exist', null);
    //   }
    // }
    // });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  // static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    // DBHelper.fetchRestaurants((error, restaurants) => {
    //   if (error) {
    //     return fetch(error, null);
    //   } else {
    //     // Filter restaurants to have only given cuisine type
    //     const results = restaurants.filter(r => r.cuisine_type == cuisine);
    //     return fetch(null, results);
    //   }
    //   // if (error) {
    //   //   callback(error, null);
    //   // } else {
    //   //   // Filter restaurants to have only given cuisine type
    //   //   const results = restaurants.filter(r => r.cuisine_type == cuisine);
    //   //   callback(null, results);
    //   // }
    // });
  // }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  // static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    // DBHelper.fetchRestaurants((error, restaurants) => {
    //   if (error) {
    //     return fetch(error, null);
    //   } else {
    //     // Filter restaurants to have only given neighborhood
    //     const results = restaurants.filter(r => r.neighborhood == neighborhood);
    //     return fetch(null, results);
    //   }
    //   // if (error) {
    //   //   callback(error, null);
    //   // } else {
    //   //   // Filter restaurants to have only given neighborhood
    //   //   const results = restaurants.filter(r => r.neighborhood == neighborhood);
    //   //   callback(null, results);
    //   // }
    // });
  // }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, error) {
    // Fetch all restaurants
    if (restaurantBackup === (error, null)) {
      fillUpdatedRestaurants(error, null);
    } else {
      dbPromise.then( db => {
        const tx = db.transaction(idbResTx);
        const keyValStore = tx.objectStore(idbResTx);
        const restaurants = keyValStore.getAll();

        return restaurants;

      }).then( restaurants => {
        let results = restaurants;
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        fillUpdatedRestaurants(null, results);
      })
    }

    //Original function
    // DBHelper.fetchRestaurants((error, restaurants) => {
    //   if (error) {
    //     return fetch(error, null);
    //   } else {
    //     let results = restaurants
    //     if (cuisine != 'all') { // filter by cuisine
    //       results = results.filter(r => r.cuisine_type == cuisine);
    //     }
    //     if (neighborhood != 'all') { // filter by neighborhood
    //       results = results.filter(r => r.neighborhood == neighborhood);
    //     }
    //     return fetch(null, results);
    //   }
    // });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(error) {
    // Fetch all restaurants
    if (restaurantBackup === (error, null)) {
      fetchNeighborhoods(error, null);
    } else {
      // Get all neighborhoods from all restaurants
      dbPromise.then( db => {
        const tx = db.transaction(idbResTx);
        const keyValStore = tx.objectStore(idbResTx);
        const restaurants = keyValStore.getAll();

        return restaurants;

      }).then( restaurants => {
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        fetchNeighborhoods(null, uniqueNeighborhoods);
      })
    }

      //Original code
      // if (error) {
      //   callback(error, null);
      // } else {
      //   // Get all neighborhoods from all restaurants
      //   const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
      //   // Remove duplicates from neighborhoods
      //   const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
      //   callback(null, uniqueNeighborhoods);
      // }
    // });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(error) {
    // Fetch all restaurants
    if (error) {
      fetchCuisines(error, null);
    } else {
      dbPromise.then( db => {
        const tx = db.transaction(idbResTx);
        const keyValStore = tx.objectStore(idbResTx);
        const restaurants = keyValStore.getAll();

        return restaurants;

      })
      .then( restaurants => {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        fetchCuisines(null, uniqueCuisines);
        })
    }

    //Original code
    // Fetch all restaurants
    // DBHelper.fetchRestaurants((error, restaurants) => {
    //   if (error) {
    //     return fetch(error, null);
    //   } else {
    //     // Get all cuisines from all restaurants
    //     const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
    //     // Remove duplicates from cuisines
    //     const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
    //     return fetch(null, uniqueCuisines);
    //   }
    // });
  }

  /**
   * Fetch all reviews with proper error handling.
   */

  static fillReviewsHTML(id, error) {
    if (error) {
      fillReviewsHTML(error, null);
    } else {
      dbPromise.then( db => {
        const tx = db.transaction(idbRevTx);
        const keyValStore = tx.objectStore(idbRevTx);
        const reviews = keyValStore.index('restaurant');

        return reviews.getAll(id);

      })
      .then( reviews => {
        fillReviewsHTML(reviews);
      });
    }
  }

  /**
   * Submit Review for restaurant
   */

  static submitReview(review){
    let data = review;
    fetch(DBHelper.DATABASE_URL('reviews/'), {
      method: 'POST',
      body: JSON.stringify(data),
      mode: 'cors',
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then( response => {
      console.log(response);
    })
    .catch( error => {
      console.log(error);
      let catchdata = data;
      dbPromise.then( db =>{
        const tx = db.transaction(idbRevForm, 'readwrite');
        tx.objectStore(idbRevForm).put({
          restaurant_id: catchdata.restaurant_id,
          name: catchdata.name,
          createdAt: catchdata.createdAt,
          updatedAt: catchdata.updatedAt,
          rating: catchdata.rating,
          comments: catchdata.comments
        })
      })
    })
  }

    // fetch(DBHelper.DATABASE_URL('reviews/'))
    // .then( response => {
    //   let reviews = response.json();
    //   console.log(reviews);
    //   return reviews;
    // }).then( reviews => {
    //   console.log(reviews.length);
    //   return reviews.length;
    // }).then( length => {
    //   data.id += length; //By having this process in this step of the fetch request, ids with the same values can be avoided.
    //   fetch(DBHelper.DATABASE_URL('reviews/'), {
    //     method: 'POST',
    //     body: JSON.stringify(data),
    //     mode: 'cors',
    //     redirect: 'follow',
    //     headers: {
    //       'Content-Type': 'application/json'
    //     }
    //   })
    //   .then( response => {
    //     console.log(response);
    //   })
    //   .catch( error => {
    //     console.log(error);
    //   })
    // })
    // .catch( error => {
    //   console.log(error);
    // })

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}${restaurant.ext}`);
  }

  static imageSrcsetForRestaurant(restaurant) {
	return (`/img/${restaurant.photograph}-200${restaurant.ext} 400w,
			 /img/${restaurant.photograph}-400${restaurant.ext} 600w,
			 /img/${restaurant.photograph}-600${restaurant.ext} 800w,
			 /img/${restaurant.photograph}${restaurant.ext} 1000w`);
  }

  static imageSizesForRestaurant(restaurant){
	 return (`(max-width: 320px) 400w,
	          (max-width: 400px) 600w,
			      (max-width: 600px) 800w,
			      1000w`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name + 'location marker',
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  }

}

