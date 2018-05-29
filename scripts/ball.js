"use strict";

import {randomBetween, getDist, getAngle, collisionReaction, rotate} from './helper.js';

export default class Ball {

  constructor(el, x, y, r) {
    this.element = el; 
    this.pos = { x, y };
    this.velocity = { x: randomBetween(-3, 3), y: randomBetween(-3, 3) };
    this.radius = r;
    this.mass = r;
    this.color = '#f2683a';
  }

  calcPos() {
    this.pos.x += this.velocity.x;
    this.pos.y += this.velocity.y;
  }

  checkCollision(other) {
    let distanceX = this.pos.x - other.pos.x;
    let distanceY = this.pos.y - other.pos.y;
    let distance = getDist(distanceX, distanceY);
    let addedRadius = this.radius + other.radius;

    if (distance < addedRadius) {

      let angle = getAngle(distanceX, distanceY);

      //rotate velocity
      let otherTempVelocity = rotate(other.velocity, angle, true);
      let thisTempVelocity = rotate(this.velocity, angle, true);
      let velocityXTotal = otherTempVelocity.x - thisTempVelocity.x;

      otherTempVelocity.x = collisionReaction(thisTempVelocity.x, this.mass, otherTempVelocity.x, other.mass);
      thisTempVelocity.x = velocityXTotal + otherTempVelocity.x;

      //rotate velocity back
      other.velocity = rotate(otherTempVelocity, angle, false),
      this.velocity = rotate(thisTempVelocity, angle, false);

      this.calcPos();
      other.calcPos();
    }
  }

  checkBoundaryCollision() {
    
    if (this.pos.x > this.element.width - this.radius) {
      this.pos.x = this.element.width - this.radius;
      this.velocity.x *= -1;
    } else if (this.pos.x < this.radius) {
      this.pos.x = this.radius;
      this.velocity.x *= -1;
    } else if (this.pos.y > this.element.height - this.radius) {
      this.pos.y = this.element.height - this.radius;
      this.velocity.y *= -1;
    } else if (this.pos.y < this.radius) {
      this.pos.y = this.radius;
      this.velocity.y *= -1;
    }
  }

  draw() {
    let ctx = this.element.getContext('2d');
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }

}