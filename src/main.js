import './main.css';
import Ball from './modules/ball.js';
import {randomBetween} from './modules/helper.js';

let cont = document.querySelector('.container');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let raf;
let balls = [];

function init() {
  balls[0] = new Ball(canvas, 100, 100, 50);
  balls[0].draw();
  raf = window.requestAnimationFrame(draw);
}

function draw() {
  ctx.fillStyle = '#333';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < balls.length; i++) {
    balls[i].calcPos();
  }
  for (let i = 0; i < balls.length; i++) {
    balls[i].checkBoundaryCollision();
    for (let j = 0; j < balls.length; j++) {
      if (i != j) balls[i].checkCollision(balls[j]);
    }
    balls[i].draw();
  }
  raf = window.requestAnimationFrame(draw);
}
init()

// EventListener
canvas.addEventListener('click', function (e) {
  let x = e.clientX - canvas.offsetLeft - cont.offsetLeft;
  let y = e.clientY - canvas.offsetTop;
  balls.push(new Ball(canvas, x, y, randomBetween(30, 60)));
});