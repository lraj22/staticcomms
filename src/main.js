// main.js - handles the main tasks
import "./main.css";

var dom = {};
document.querySelectorAll("[id]").forEach(el => dom[el.id] = el);

const canvas = document.querySelector("canvas"); // dom.canvas
const ctx = canvas.getContext("2d", {
	// "willReadFrequently": true,
});

// set size
let pixelSize = 4;
let width = window.innerWidth;
let height = window.innerHeight;
let pxWidth = Math.ceil(width / pixelSize);
let pxHeight = Math.ceil(height / pixelSize);
canvas.width = width;
canvas.height = height;
window.addEventListener("resize", () => {
	width = window.innerWidth;
	height = window.innerHeight;
	pxWidth = Math.ceil(width / pixelSize);
	pxHeight = Math.ceil(height / pixelSize);
	canvas.width = width;
	canvas.height = height;
});

// canvas & context ready!
ctx.fillStyle = "lightblue"; // default bg
ctx.fillRect(0, 0, width, height);

// key management
let isShiftDown = false;
window.addEventListener("keydown", e => {
	isShiftDown = e.shiftKey;
});
window.addEventListener("keyup", e => {
	isShiftDown = e.shiftKey;
});

const fps = 12;
const fpsMinMilliseconds = 1000 / fps;
let lastTick = 0;
let firstTime = true;
function tick () {
	// key control
	if (isShiftDown) { // hold shift to freeze
		requestAnimationFrame(tick);
		return;
	}
	
	// control fps
	let now = Date.now();
	if (now < (lastTick + fpsMinMilliseconds)) {
		requestAnimationFrame(tick);
		return;
	}
	lastTick = now;
	
	// update screen
	let pixelData = ctx.getImageData(0, 0, width, height);
	let data = pixelData.data;
	for (let y = 0; y < pxHeight; y++) {
		if (
			(y > (100 + performance.now() / 100)) && (y < (150 + performance.now() / 100))
			&& (!firstTime)
		) continue; // purpose: to keep a solid block on screen and see how it acts visibly
		for (let x = 0; x < pxWidth; x++) {
			let whiteOrBlack = Math.floor(Math.random() * 2);
			setPixel(data, x, y, Math.random() * 255);
		}
	}
	ctx.putImageData(pixelData, 0, 0);
	firstTime = false;
	requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

function getPixelNumber (x, y) {
	return (y * width + x) * 4 * pixelSize;
}

/*
 * setPixel() -> void
 * takes ImageData, number of pixel, and color of pixel
 * number of pixel can be literal pixel number or array representing [x, y] position of pixel
 * color of pixel can be one value 0 or 1 (black/white), one value 0-255 (all shades of gray), or 3 values (rgb)
 */
function setPixel (pixelData, x, y, red, green, blue) {
	let data = pixelData.data || pixelData;
	if ((red === 1) && (typeof green !== "number") && (typeof blue !== "number")) red = 255; // 0 = black = 0, 1 = white = 255
	if (typeof green !== "number") green = red;
	if (typeof blue !== "number") blue = red;
	let pixelNumber = getPixelNumber(x, y);
	for (let pxCol = 0; pxCol < pixelSize; pxCol++) {
		for (let pxRow = 0; pxRow < pixelSize; pxRow++) {
			if ((pixelSize * x + pxRow) >= width) continue;
			let pxShift = 4 * (pxCol * width + pxRow);
			data[pixelNumber + pxShift] = red;
			data[pixelNumber + pxShift + 1] = green;
			data[pixelNumber + pxShift + 2] = blue;
		}
	}
}
