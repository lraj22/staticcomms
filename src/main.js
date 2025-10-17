// main.js - handles the main tasks
import "./main.css";

var dom = {};
document.querySelectorAll("[id]").forEach(el => dom[el.id] = el);

const canvas = document.querySelector("canvas"); // dom.canvas
const ctx = canvas.getContext("2d");

// set size
let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;
window.addEventListener("resize", () => {
	width = window.innerWidth;
	height = window.innerHeight;
	canvas.width = width;
	canvas.height = height;
});

// canvas & context ready!
ctx.fillStyle = "lightblue"; // default bg
ctx.fillRect(0, 0, width, height);

let pixelData = ctx.getImageData(0, 0, width, height);
let data = pixelData.data;
for (let y = 0; y < height; y+=2) {
	for (let x = 0; x < width; x+=2) {
		let whiteOrBlack = Math.floor(Math.random() * 2);
		setPixel(data, [x, y], whiteOrBlack);
		setPixel(data, [x + 1, y], whiteOrBlack);
		setPixel(data, [x, y + 1], whiteOrBlack);
		setPixel(data, [x + 1, y + 1], whiteOrBlack);
	}
}
ctx.putImageData(pixelData, 0, 0);

function getPixelNumber (x, y) {
	return (y * width + x) * 4;
}

/*
 * setPixel() -> void
 * takes ImageData, number of pixel, and color of pixel
 * number of pixel can be literal pixel number or array representing [x, y] position of pixel
 * color of pixel can be one value 0 or 1 (black/white), one value 0-255 (all shades of gray), or 3 values (rgb)
 */
function setPixel (pixelData, pixelNumber, red, green, blue) {
	let data = pixelData.data || pixelData;
	if (Array.isArray(pixelNumber)) pixelNumber = getPixelNumber(pixelNumber[0], pixelNumber[1]);
	if ((red === 1) && (typeof green !== "number") && (typeof blue !== "number")) red = 255; // 0 = black = 0, 1 = white = 255
	if (typeof green !== "number") green = red;
	if (typeof blue !== "number") blue = red;
	data[pixelNumber] = red;
	data[pixelNumber + 1] = green;
	data[pixelNumber + 2] = blue;
}
