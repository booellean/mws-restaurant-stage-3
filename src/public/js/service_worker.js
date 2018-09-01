window.addEventListener('load', swRegister);

/**
* @description Handles service worker (sw) registration if sw is available
* @returns {string} scope of the service worker
*/

function swRegister(){
  if(!navigator.serviceWorker){return};

  navigator.serviceWorker.register('/sw.js')
  .then(function(reg){
    console.log(`I did something`);
    scope: '/'
    //TODO: create functions for reg.waiting and reg.installing to notify users of updates
  })
  .catch(err => {throw err});
}
