<%* 
	let basePath = "content/trips";
	let today = tp.date.now().format('YYYY-MM-DD');
	let tripLocation = await tp.system.prompt("Trip Location:");
	let tripLat = await tp.system.prompt("Trip Latitude:");
	let tripLong = await tp.system.prompt("Trip Longitude:");
	let tripLocationString = tripLocation.replaceAll(" ", "_");
	let tripDateString = await tp.system.prompt(
		"Trip Date (YYYY-MM-DD):", 
		default_value = today);
	while (!moment(tripDateString, ["YYYY-MM-DD"]).isValid()){
		tripDateString = await tp.system.prompt(
			"Invalid date. Enter Trip Date (YYYY-MM-DD):", 
			default_value = today);
	}
	let tripDate = moment(tripDateString);
	let tripString = tripLocationString + tripDate.format('YYYYMMDD');
	let folderPath = basePath + "/" + tripString;
	let photoPath = folderPath + "/photos"
	let coverPhotoPath = photoPath + "/cover_photo.jpg"
	await this.app.vault.createFolder(folderPath);
	await this.app.vault.createFolder(photoPath);
	await tp.file.move(folderPath + "/" + tripString);

	let postTitle = tripLocation + " " +tripDate.format('YYYY-MM-DD');

-%>
---
published: false
category: trip
date: <% tripDate %>
title: <% postTitle %>
latitude: <% tripLatitude %>
latitude: <% tripLatitude %>
cover_photo: <% "/" + coverPhotoPath %>
layout: trip-report
---


## <% postTitle %>

Write about your trip here!

* Add photos to the <% photoPath %> folder
* Add a single cover photo to the <% coverPhotoPath %> folder

```button
name (Mostly) Complete!
type line(2) text
action published: true
replace [2, 2]
color green
remove true
```

