"use strict";
function NoImageDevices() {
	return !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia;
}

function PlayVideo(mediaDisplay, options) {
	return new Promise((resolve, reject) => {
		if (NoImageDevices())
			reject("No Media Device found");
		else {
			navigator.mediaDevices.getUserMedia(options)
				.then(stream => {
					mediaDisplay.srcObject = stream;
					mediaDisplay.play();
					resolve("Display Image");
				});
		}
	});
}

function StopVideo(videoScreen) {
	return new Promise((resolve, reject) => {
		if (videoScreen === null)
			reject("Video source NOT found!!!");
		else if (videoScreen.srcObject === null)
			resolve("Video Stopped");
		else {
			let tracks = videoScreen.srcObject.getTracks();
			tracks.forEach(track => track.stop());
			videoScreen.srcObject = null;
			resolve("Video Stopped");
		}
	});
}

function GetVideoDevices() {
	return new Promise((resolve, reject) => {
		if (NoImageDevices())
			reject("No Media Device found");
		else {
			let mediaDevices = [];
			navigator.mediaDevices.enumerateDevices()
				.then(devices => {
					devices.forEach(device => {
						if (device.kind === 'videoinput') {
							mediaDevices.push(device);
						}
					});
					resolve(mediaDevices);
				});
		}
	});
}

function PreviewImage(image, canvas) {
	return new Promise((resolve, reject) => {
		if (image === null)
			reject("File is NOT an Image.");
		else if (canvas === 'nothing')
			reject("Image render Area NOT found.");
		else {
			let imageWidth = canvas.width;
			let imageHeight = canvas.height;
			const context = canvas.getContext('2d');

			context.drawImage(image, 0, 0, imageWidth, imageHeight);
			resolve();
		}
	});
}

function TakePhoto(options) {
	return new Promise((resolve, reject) => {
		if (NoImageDevices())
			reject("No Media Device found.");
		else if (options.video.deviceId === '')
			reject("SourceId NOT found.");
		else {
			navigator.mediaDevices.getUserMedia(options)
				.then(mediaStream => {
					const track = mediaStream.getVideoTracks()[0];
					let imageCapture = new ImageCapture(track);
					imageCapture.takePhoto()
						.then(blob => resolve(blob));
				});
		}
	});
}