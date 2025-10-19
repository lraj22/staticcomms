// main.js - handles the main tasks
import "./main.css";

var dom = {};
document.querySelectorAll("[id]").forEach(el => dom[el.id] = el);

const canvas = document.querySelector("canvas"); // dom.canvas
const ctx = canvas.getContext("2d", {
	// "willReadFrequently": true,
});
let animFrameHandle = null;

// set size
const minPxLength = 343;
let width = window.innerWidth;
let height = window.innerHeight;
let pxLength = Math.min(width, height, minPxLength);
let pixelSize = Math.floor(Math.min(width, height) / pxLength);
let pxWidth = Math.ceil(width / pixelSize);
let pxHeight = Math.ceil(height / pixelSize);
canvas.width = width;
canvas.height = height;

// canvas to determine where text pixels are (not displayed)
const textCanvas = document.createElement("canvas");
textCanvas.id = "textCanvas";
document.body.appendChild(textCanvas);
textCanvas.width = pxWidth;
textCanvas.height = pxHeight;
const textCtx = textCanvas.getContext("2d");
textCtx.font = "100px monospace";
textCtx.textAlign = "center";
textCtx.textBaseline = "middle";
textCtx.fillStyle = "white";
let text = "Hello!";
textCtx.fillText(text, textCanvas.width / 2, textCanvas.height / 2);
function initTextCanvas () {
	textCtx.font = "100px monospace";
	textCtx.textAlign = "center";
	textCtx.textBaseline = "middle";
	textCtx.fillStyle = "white";
	textCtx.fillText(text, textCanvas.width / 2, textCanvas.height / 2);
}

window.addEventListener("resize", () => {
	width = window.innerWidth;
	height = window.innerHeight;
	pxLength = Math.min(width, height, minPxLength);
	pixelSize = Math.floor(Math.min(width, height) / pxLength);
	pxWidth = Math.ceil(width / pixelSize);
	pxHeight = Math.ceil(height / pixelSize);
	canvas.width = width;
	canvas.height = height;
	textCanvas.width = pxWidth;
	textCanvas.height = pxHeight;
	initTextCanvas();
	ctx.fillStyle = "black"; // default bg
	ctx.fillRect(0, 0, width, height);
	fillStatic();
});

function writeText (text) {
	text = text.split(" ");
	let textBlocks = [];
	let currentBlocks = [];
	let currentWidth = 0;
	let maxWidth = pxWidth * 0.8;
	let widestLine = 0;
	
	for (let segment of text) {
		let effectiveSegment = segment;
		if (currentWidth !== 0) effectiveSegment = " " + effectiveSegment;
		let additionalWidth = textCtx.measureText(effectiveSegment).width;
		if ((currentWidth + additionalWidth) > maxWidth) {
			if (currentBlocks.length) {
				textBlocks.push(currentBlocks.join(" "));
				currentBlocks = [];
				widestLine = Math.max(widestLine, currentWidth);
				currentWidth = 0;
			}
		}
		currentBlocks.push(segment);
		
		// in case the new word is so long that it overflows the entire screen
		if (additionalWidth > maxWidth) {
			let segmentChars = segment.split("");
			let segmentPart = "";
			for (let char of segmentChars) {
				let partWidth = textCtx.measureText(segmentPart + char).width;
				if (partWidth > maxWidth) {
					textBlocks.push(segmentPart);
					currentBlocks = [];
					widestLine = Math.max(widestLine, partWidth);
					segmentPart = "";
				}
				segmentPart += char;
			}
			currentBlocks.push(segmentPart);
			additionalWidth = textCtx.measureText(segmentPart).width;
		}
		currentWidth += additionalWidth;
	}
	if (currentBlocks.length) {
		textBlocks.push(currentBlocks.join(" "));
		widestLine = Math.max(widestLine, currentWidth);
	}
	
	textCtx.clearRect(0, 0, pxWidth, pxHeight);
	let lineHeight = 200 / pixelSize;
	let totalLines = textBlocks.length;
	textBlocks.forEach((block, i) => {
		let lineDiff = (i - Math.floor(totalLines / 2) + 0.5 * (1 - totalLines % 2));
		// above line of code: center middle line in center (perfect for odd # of lines),
		// and then shift half a line if even number of lines (so that even # of lines is also properly centered)
		
		textCtx.fillText(block, pxWidth / 2, (pxHeight / 2) + (lineDiff * lineHeight));
	});
}

// canvas & context ready!
ctx.fillStyle = "black"; // default bg
ctx.fillRect(0, 0, width, height);
fillStatic();

// key management
let isShiftDown = false;
window.addEventListener("keydown", e => {
	isShiftDown = e.shiftKey;
	if (!e.shiftKey && !e.ctrlKey && !e.altKey && e.key === "x") {
		document.querySelector(".popup.active").classList.remove("active");
	}
	if (!e.shiftKey && !e.ctrlKey && !e.altKey && e.key === "h") {
		document.getElementById("helpMenu").classList.add("active");
	}
	if (!e.shiftKey && !e.ctrlKey && !e.altKey && e.key === "Enter") {
		let newText = prompt("Enter the new text to show", text);
		if (newText !== null) {
			writeText(newText);
			text = newText;
		}
	}
});
window.addEventListener("keyup", e => {
	isShiftDown = e.shiftKey;
});

const fps = Infinity; // should be high enough to see message
const fpsMinMilliseconds = 1000 / fps;
let frame = 0;
let lastTick = 0;
let lastReset = 0;
function tick () {
	// key control
	if (isShiftDown) { // hold shift to freeze
		animFrameHandle = requestAnimationFrame(tick);
		return;
	}
	
	// control fps
	let now = Date.now();
	if (now < (lastTick + fpsMinMilliseconds)) {
		animFrameHandle = requestAnimationFrame(tick);
		return;
	}
	lastTick = now;
	
	frame++;
	if (now > (lastReset + 950)) {
		lastReset = now;
		fillStatic();
	}
	
	// update screen
	let pixelData = ctx.getImageData(0, 0, width, height);
	const textData = textCtx.getImageData(0, 0, textCanvas.width, textCanvas.height).data;
	let data = pixelData.data;
	for (let y = 0; y < pxHeight; y++) {
		for (let x = 0; x < pxWidth; x++) {
			let gray = Math.random() * 240; // not 255: 240 is slightly less bright to make contrast better! trading off static obscurity for moving contrast
			
			if (textData[(y * pxWidth + x) * 4] > 128) { // if white (indicates text),
				continue; // do not update because text remains constant
			}
			
			setPixel(data, x, y, gray);
		}
	}
	ctx.putImageData(pixelData, 0, 0);
	animFrameHandle = requestAnimationFrame(tick);
}
animFrameHandle = requestAnimationFrame(tick);

function getPixelNumber (x, y) {
	return (y * width + x) * 4 * pixelSize;
}

function fillStatic () {
	let data = ctx.getImageData(0, 0, width, height);
	for (let y = 0; y < pxHeight; y++) {
		for (let x = 0; x < pxWidth; x++) {
			setPixel(data, x, y, Math.random() * 255);
		}
	}
	ctx.putImageData(data, 0, 0);
}

/*
 * setPixel() -> void
 * takes ImageData, pixel location, and color of pixel
 * pixel location is an [x, y] pair representing the coordinate of the pixel
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
			data[pixelNumber + pxShift + 3] = 255;
		}
	}
}

document.querySelectorAll(".closeBtn").forEach(closeBtn => {
	closeBtn.addEventListener("click", () => {
		closeBtn.parentElement.classList.remove("active");
	});
});
