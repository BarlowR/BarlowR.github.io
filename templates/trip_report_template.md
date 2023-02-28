
<%* 
	let basePath = "content/trips";
	let today = tp.date.now().format('YYYY-MM-DD');
	let tripLocation = await tp.system.prompt("Trip Location:");
	let tripDateString = await tp.system.prompt(
		"Trip Date (YYYY-MM-DD):", 
		default_value = today);
	while (!moment(tripDateString, ["YYYY-MM-DD"]).isValid()){
		tripDateString = await tp.system.prompt(
			"Invalid date. Enter Trip Date (YYYY-MM-DD):", 
			default_value = today);
	}
	let tripDate = moment(tripDateString);
	let tripString = tripLocation.replace(" ", "")+tripDate.format('YYYYMMDD');
	let folderPath = basePath + "/" + tripString;
	let photoFolder = folderPath + "/photos"
	let coverPhotoFolder = photoFolder + "/cover_photo"
	await this.app.vault.createFolder(folderPath);
	await this.app.vault.createFolder(photoFolder);
	await this.app.vault.createFolder(coverPhotoFolder);
	await tp.file.move(folderPath + "/" + tripString);

-%>

---
tag:  trip, post, tripLocation
date: <% moment() %>
---

## <% tripLocation %> Trip
## <% tripDate.format('YYYY-MM-DD') %>


Write about your trip here!

* Add photos to the <% photoFolder %> folder
* Add a single cover photo to the <% coverPhotoFolder %> folder


```button
name (Mostly) Complete!
type line(3) text
action visibility: visible
color green
remove true
```