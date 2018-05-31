export function rotate(vector, angle, reverse) {
	let sin = Math.sin(angle);
	let cos = Math.cos(angle);
	return {
		x: (reverse) ? (vector.x * cos + vector.y * sin) : (vector.x * cos - vector.y * sin),
		y: (reverse) ? (vector.y * cos - vector.x * sin) : (vector.y * cos + vector.x * sin)
	};
}

export function getDist(distanceX, distanceY) {
	return Math.sqrt(distanceX ** 2 + distanceY ** 2)
}

export function getAngle(distanceX, distanceY) {
	return Math.atan2(distanceY, distanceX)
}

export function collisionReaction(firstVelocity, firstMass, secondVelocity, secondMass) {
	return ((secondMass - firstMass) * secondVelocity + 2 * firstMass * firstVelocity) / (secondMass + firstMass)
}

export function randomBetween(min, max) {
	return Math.floor(Math.random() * (max - (min))) + (min)
}