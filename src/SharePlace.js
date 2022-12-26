import { Modal } from "./UI/Modal";
import { Map } from "./UI/Map";
import { getCoordsFromAddress, getAddressFromCoords } from "./Utility/Location";

class PlaceFinder {
	constructor() {
		const addressForm = document.querySelector("form");
		const locateUserBtn = document.getElementById("locate-btn");
		this.shareBtn = document.getElementById("share-btn");

		locateUserBtn.addEventListener(
			"click",
			this.locateUserHandler.bind(this)
		);

		this.shareBtn.addEventListener("click", this.sharePlaceHandler);

		addressForm.addEventListener(
			"submit",
			this.findAddressHandler.bind(this)
		);
	}

	sharePlaceHandler() {
		const sharedLinkInputElement = document.getElementById("share-link");
		if (!navigator.clipboard) {
			sharedLinkInputElement.select();
			return;
		}

		navigator.clipboard
			.writeText(sharedLinkInputElement.value)
			.then(() => {
				alert("Copied into Clipboard!");
			})
			.catch((err) => {
				console.log(err);
				sharedLinkInputElement.select();
			});
	}

	selectPlace(coordinates, address) {
		if (this.map) {
			this.map.render(coordinates);
		} else {
			this.map = new Map(coordinates);
		}

		this.shareBtn.disabled = false;
		const sharedLinkInputElement = document.getElementById("share-link");
		sharedLinkInputElement.value = `${
			location.origin
		}/my-place?address=${encodeURI(address)}&lat=${coordinates.lat}&lng=${
			coordinates.lng
		}`;
	}

	locateUserHandler() {
		if (!navigator.geolocation) {
			alert(
				"Location feature is not available in your browser - please use an updated browser or manually enter an address."
			);
			return;
		}
		const modal = new Modal(
			"loading-modal-content",
			"Loading location - Please wait!"
		);

		modal.show();

		navigator.geolocation.getCurrentPosition(
			async (successResult) => {
				const coordinates = {
					lat: successResult.coords.latitude,
					lng: successResult.coords.longitude,
				};
				const address = await getAddressFromCoords(coordinates);
				modal.hide();
				this.selectPlace(coordinates, address);
			},
			(error) => {
				modal.hide();
				alert("Couldn't locate you, Please enter an address manually.");
			}
		);
	}

	async findAddressHandler(event) {
		event.preventDefault();
		const address = event.target.querySelector("input").value;
		if (!address || address.trim().length === 0) {
			alert("Invalid address - Please try again!");
			return;
		} else {
			const modal = new Modal(
				"loading-modal-content",
				"Loading location - Please wait!"
			);
			modal.show();
			try {
				const coordinates = await getCoordsFromAddress(address);
				this.selectPlace(coordinates, address);
			} catch (err) {
				alert(err.message);
			}
			modal.hide();
		}
	}
}

const placeFinder = new PlaceFinder();
