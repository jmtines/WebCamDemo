"use strict";
const canvas = document.querySelector("#stillCavas");
const imageScreen = document.querySelector("#videoScreen-container");
const captureBtn = document.querySelector("#captureImage");
const startVideoBtn = document.querySelector("#startVideo");
const closeVideo = document.querySelector("#closeVideoScreen");
const mediaDD = document.querySelector("#mediaDeviceDD");
const saveImage = document.querySelector('#saveImage');

let mediaOptions = {
	audio: false,
	video: { deviceId: '' }
};

let imageFile;

(function () {
	captureBtn.addEventListener("click", () => {
		StopVideo(videoScreen)
			.then(() => TakePhoto(mediaOptions))
			.then(blob => SetImageFile(blob))
			.then(imageFile => createImageBitmap(imageFile))
			.then(image => PreviewImage(image, canvas))
			.then(StopVideo(videoScreen))
			.catch(error => console.log(`Photo NOT taken. Error: ${error}`));

		HideElement(imageScreen);
	});

	startVideoBtn.addEventListener("click", () => {
		StopVideo(videoScreen)
			.then(() => PlayVideo(videoScreen, mediaOptions))
			.then(() => ShowElement(imageScreen))
			.catch(error => console.log(`Video NOT started. Error: ${error}`));
	});

	closeVideo.addEventListener("click", () => {
		HideElement(imageScreen);
		StopVideo(videoScreen)
			.catch(error => console.log(`Video NOT stopped. Error: ${error}`));
	});

	mediaDD.addEventListener('change', () => {
		GetSelectedDeviceId(mediaDD)
			.then(sourceId => SetDeviceId(sourceId))
			.catch(error => console.log(`Media Dropdown NOT populated. Error: ${error}`));
	});

	saveImage.addEventListener('click', () => {
		SubmitImage(imageFile);
	});

	GetVideoDevices()
		.then(devices => SetVideoDeviceDD(mediaDD, devices))
		.then(() => GetSelectedDeviceId(mediaDD))
		.then(sourceId => SetDeviceId(sourceId))
		.catch(error => console.log(`Devices not found. Error: ${error}`));
})();

function ShowElement(element) {
	if (element.hidden === true) {
		element.hidden = false;
	}
}

function HideElement(element) {
	if (element.hidden === false) {
		element.hidden = true;
	}
}

function SetImageFile(blob) {
	return new Promise((resolve, reject) => {
		if (blob.type.match('image/*') === false)
			reject("File is NOT an Image.");
		else {
			imageFile = blob;
			resolve(imageFile);
		}
	});
}

function SetDeviceId(deviceId) {
	return new Promise((resolve, reject) => {
		if (deviceId === null || deviceId === '')
			reject("Device Id NOT found");
		else {
			mediaOptions.video.deviceId = deviceId;
			resolve();
		}
	});
}

function SetVideoDeviceDD(select, devices) {
	return new Promise((resolve, reject) => {
		if (select === null || select.tagName !== "SELECT")
			reject("Incorrect input Tag");
		else if (devices.length < 0)
			reject("Device list empty");
		else {
			let count = 1;
			devices.forEach(device => {
				const option = document.createElement("option");
				option.value = device.deviceId;
				option.text = device.label || `Video Input ${count}`;
				count++;
				select.add(option);
			});
			resolve();
		}
	});
}

function GetSelectedDeviceId(option) {
	return new Promise((resolve, reject) => {
		if (option === null)
			reject(false, "Media Dropdown NOT found.");
		else if (option.selectedIndex === 'nothing' || option.selectedIndex < 0)
			reject(false, "Select a Media Device.");
		else {
			let index = option.selectedIndex;
			let deviceId = option.options.item(index).value;
			resolve(deviceId);
		}
	});
}

function SubmitImage(image) {
	let oData = new FormData();
	let fileName = image.name || "Photo";
	oData.append(fileName, image);

	let xhr = new XMLHttpRequest();
	xhr.open('Post', '/UploadImage', true);
	xhr.onload = () => {
		if (xhr.status !== 200) {
			console.log("File NOT sent!!!");
		}
		xhr.send(oData);
	};
}