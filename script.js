// script.js
const img = new Image(); // used to load image from <input> and draw to canvas
const clearBtn = document.getElementById("button-group").childNodes[1];
const readTextBtn = document.getElementById("button-group").childNodes[3];
const topTextInput = document.getElementById("text-top");
const bottomTextInput = document.getElementById("text-bottom");
const generateBtn = document.getElementById("generate-meme");
const volumeSlider = document.getElementById("volume-group").childNodes[3];
const voiceSelection = document.getElementById("voice-selection");
const volumeIcon = document.getElementById("volume-group").childNodes[1];

// handling the file upload
const imgInput = document.getElementById("image-input");
imgInput.addEventListener("change", handleImage, false);

var canvas = document.getElementById("user-image");
var ctx = canvas.getContext("2d");

function handleImage(e) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var reader = new FileReader();
  reader.onload = function (event) {
    img.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
}

var synth = window.speechSynthesis;
var voices = synth.getVoices();

function populateVoiceList() {
  if (typeof speechSynthesis === "undefined") {
    return;
  }

  for (var i = 0; i < voices.length; i++) {
    var option = document.createElement("option");
    option.textContent = voices[i].name + " (" + voices[i].lang + ")";

    if (voices[i].default) {
      option.textContent += " -- DEFAULT";
    }

    option.setAttribute("data-lang", voices[i].lang);
    option.setAttribute("data-name", voices[i].name);
    document.getElementById("voice-selection").appendChild(option);
  }
}

populateVoiceList();
if (
  typeof speechSynthesis !== "undefined" &&
  speechSynthesis.onvoiceschanged !== undefined
) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

voiceSelection.onsubmit = function (event) {
  event.preventDefault();
  var utterThis = new SpeechSynthesisUtterance(topTextInput.value);
  var selectedOption = voiceSelection.selectedOptions[0].getAttribute(
    "data-name"
  );
  for (var i = 0; i < voices.length; i++) {
    if (voices[i].name === selectedOption) {
      utterThis.voice = voices[i];
    }
  }
};

volumeSlider.addEventListener("input", (e) => {
  if(volumeSlider.value == 0){
    volumeIcon.src = "icons/volume-level-0.svg"
  }else if(volumeSlider.value <= 33){
    volumeIcon.src = "icons/volume-level-1.svg"
  }else if(volumeSlider.value <= 66){
    volumeIcon.src = "icons/volume-level-2.svg"
  }else{
    volumeIcon.src = "icons/volume-level-3.svg"
  }
});

topTextInput.addEventListener("input", (e) => {

  if (topTextInput.value == "" && bottomTextInput.value == "") {
    readTextBtn.disabled = true;
    voiceSelection.disabled = true;
  } else {
    readTextBtn.disabled = false;
    voiceSelection.disabled = false;
  }

});


readTextBtn.addEventListener("click", (e) => {
  e.preventDefault();

  var utterThis = new SpeechSynthesisUtterance(
    topTextInput.value + bottomTextInput.value
  );
  var selectedOption = voiceSelection.selectedOptions[0].getAttribute(
    "data-name"
  );
  for (var i = 0; i < voices.length; i++) {
    if (voices[i].name === selectedOption) {
      utterThis.voice = voices[i];
    }
  }
  utterThis.volume = volumeSlider.value* .01;
  synth.speak(utterThis);
});

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener("load", (e) => {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // scale and draw image
  var dimensions = getDimmensions(
    canvas.width,
    canvas.height,
    img.width,
    img.height
  );

  img.width = dimensions.width;
  img.height = dimensions.height;

  clearBtn.disabled = false;

  ctx.drawImage(
    img,
    dimensions.startX,
    dimensions.startY,
    dimensions.width,
    dimensions.height
  );

  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

generateBtn.addEventListener("submit", (e) => {
  e.preventDefault();

  clearBtn.disabled = false;

  ctx.font = "20px Impact";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";

  ctx.fillText(
    bottomTextInput.value,
    canvas.width / 2,
    canvas.height - 30,
    canvas.width
  );
  ctx.fillText(topTextInput.value, canvas.width / 2, 20, canvas.width);

});

// clear the canvas
clearBtn.addEventListener("click", (e) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas = document.getElementById("user-image");
  ctx = canvas.getContext("2d");
  clearBtn.disabled = true;
  readTextBtn.disabled = true;
  imgInput.disabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { width: width, height: height, startX: startX, startY: startY };
}
