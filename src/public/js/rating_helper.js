class RatingStars{
  constructor(nodeParent, nodeChildren, rangeSlider){
    this.nodeParent = nodeParent;
    this.nodeChildren = nodeChildren;
    this.parent = document.querySelector(this.nodeParent);
    this.nodes = this.parent.querySelectorAll(this.nodeChildren);
    this.nodeList = Array.from(this.nodes);
    this.nodeIndexes = this.nodes.length - 1;
    this.score = -1;
    this.rangeSlider = document.querySelector(rangeSlider);

     for(let i=0; i<=this.nodeIndexes; i++){
      this.nodeList[i].classList.add('star-empty');
      this.nodeList[i].addEventListener('mouseover', event => this.changeStars(i));
      this.nodeList[i].addEventListener('mouseout', event => this.changeStars(-1));
      this.nodeList[i].addEventListener('click', event => this.setRating(i));
    }

    this.rangeSlider.addEventListener('mouseup', event => this.setRating());
  }

  changeStars(i) {
    for(let k = 0; k <= this.nodeIndexes; k++){
      if( (k >= (this.score)) && (k > i)){
        this.nodeList[k].className = 'star-empty';
      }
      else{
        this.nodeList[k].className = 'star-full';
      }
    }
  }

  setRating(i){
    i != undefined ? this.score = i + 1 : this.score = this.rangeSlider.value;
    this.rangeSlider.value = this.score;
    this.changeStars(this.score - 1);
  }
}

const ratingGroup = new RatingStars('#star-container', 'p', '#rating');