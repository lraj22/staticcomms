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
for (let i = 0; i < data.length; i += 4) {
	let whiteOrBlack = Math.floor(Math.random() * 2) * 255;
	data[i] = whiteOrBlack; // red
	data[i + 1] = whiteOrBlack; // green
	data[i + 2] = whiteOrBlack; // blue
	// ignore alpha channel
}
ctx.putImageData(pixelData, 0, 0);
