const options = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver(lazyLoad, options);

function lazyLoad(elements){
  elements.forEach( el => {
    if(el.intersectionRatio > 0.1){
      loadItem(el.target);
      observer.unobserve(el.target);
    }
  });
}

function loadItem(el){
  let childs = el.children;
  let childrenEls = Array.from(childs);

  childrenEls.forEach( child => {
    const restaurantId = child.id;
    if(!(child instanceof HTMLImageElement)){
      return child.classList.remove('lazy-load');
    }
    if(child instanceof HTMLImageElement){
      dbPromise.then( db =>{
        return db.transaction('restaurant')
                 .objectStore('restaurant')
                 .getAll(); //cannot get individual items using variables, need to get all
      })
      .then( restaurants => {
        //must use '==' instead of '===' or will get blank array
        let restObject = restaurants.filter( item => item.id == restaurantId );
        let restaurant = restObject[0];

        child.setAttribute('srcset', DBHelper.imageSrcsetForRestaurant(restaurant));
        child.setAttribute('sizes', DBHelper.imageSizesForRestaurant(restaurant));
        child.src = DBHelper.imageUrlForRestaurant(restaurant);
        child.classList.remove('lazy-load');
      });
      return;
    }
  });
}
