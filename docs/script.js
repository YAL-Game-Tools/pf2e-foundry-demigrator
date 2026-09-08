(async () => {
	const find = (id) => document.getElementById(id);
	/** @type {HTMLTextAreaElement} */
	const fdInput = find("in");
	/** @type {HTMLTextAreaElement} */
	const fdOutput = find("out");
	/** @type {HTMLSpanElement} */
	const spFoundryVersions = find("foundry-versions");
	/** @type {HTMLSpanElement} */
	const spSystemVersions = find("system-versions");
	/** @type {HTMLInputElement} */
	const fdNewFoundryVersion = find("new-foundry-version");
	/** @type {HTMLInputElement} */
	const fdNewSystemVersion = find("new-system-version");
	//
	const rxFoundryVersion = /("coreVersion"|"foundry")(:\s*")(\d+\.\d+(?:\.\d+)?)/g;
	const rxSystemVersion = /("systemVersion")(:\s*")(\d+\.\d+(?:\.\d+)?)/g;
	/**
	 * @param {string} thisVersion
	 * @param {string} thatVersion
	 */
	function isNewerThan(thisVersion, thatVersion) {
		let theseNumbers = thisVersion.split(".").map(i => parseInt(i));
		let thoseNumbers = thatVersion.split(".").map(i => parseInt(i));
		let n = Math.max(theseNumbers.length, thoseNumbers.length);
		for (let i = 0; i < n; i += 1) {
			let thisNumber = theseNumbers[i] ?? 0;
			let thatNumber = thoseNumbers[i] ?? 0;
			if (thisNumber > thatNumber) return true;
		}
		return false;
	}
	//
	function gatherVersions(text, rx, mtiVersion) {
		const versions = [];
		for (let arr of text.matchAll(rx)) {
			const version = arr[mtiVersion];
			if (!versions.includes(version)) {
				versions.push(version);
			}
		}
		return versions;
	}
	//
	function updateVersions() {
		const input = fdInput.value;
		spFoundryVersions.innerText = gatherVersions(input, rxFoundryVersion, 3).join(", ");
		spSystemVersions.innerText = gatherVersions(input, rxSystemVersion, 3).join(", ");
	}
	fdInput.onchange = e => {
		updateVersions();
	}
	//
	find("convert").onclick = e => {
		let text = fdInput.value;
		//
		let newFoundryVersion = fdNewFoundryVersion.value.trim();
		if (newFoundryVersion != "") {
			text = text.replaceAll(rxFoundryVersion, (orig, pfx, sep, ver) => {
				if (isNewerThan(ver, newFoundryVersion)) {
					return pfx + sep + newFoundryVersion;
				} else return orig;
			});
		}
		//
		let newSystemVersion = fdNewSystemVersion.value.trim();
		if (newSystemVersion != "") {
			text = text.replaceAll(rxSystemVersion, (orig, pfx, sep, ver) => {
				if (isNewerThan(ver, newSystemVersion)) {
					return pfx + sep + newSystemVersion;
				} else return orig;
			});
		}
		//
		fdOutput.value = text;
	}
	
	//
	let fileName = "player.json";
	/** @type {HTMLFormElement} */
	const fmFileInput = find("in-form");
	/** @type {HTMLInputElement} */
	const fdFileInput = find("in-file");
	fdFileInput.onchange = async _ => {
		let file = fdFileInput.files[0];
		if (!file) return;
		try {
			fdInput.value = await file.text();
			fileName = file.name;
		} catch (_) {}
		fmFileInput.reset();
	}
	find("download").onclick = () => {
		let blob = new Blob([fdOutput.value]);
		window.saveAs(blob, fileName);
	}
	
	
	/*/
	const sample = await fetch("test.json");
	fdInput.value = await sample.text();
	updateVersions();
	//*/
})();