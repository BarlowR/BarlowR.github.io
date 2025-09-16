<%*
	let basePath = "content/trips";
	let today = tp.date.now().format('YYYY-MM-DD');
	let tripLocation = await tp.system.prompt("Trip Location:");
	let tripLat = await tp.system.prompt("Trip Latitude:");
	let tripLong = await tp.system.prompt("Trip Longitude:");

	// Clean location name for URL-friendly slug
	let tripLocationSlug = tripLocation.toLowerCase()
		.replace(/[^\w\s-]/g, '')  // Remove special chars
		.replace(/\s+/g, '-')      // Spaces to hyphens
		.replace(/-+/g, '-')       // Multiple hyphens to single
		.replace(/^-|-$/g, '');    // Remove leading/trailing hyphens

	let tripDateString = await tp.system.prompt(
		"Trip Date (YYYY-MM-DD):",
		default_value = today);
	while (!moment(tripDateString, ["YYYY-MM-DD"]).isValid()){
		tripDateString = await tp.system.prompt(
			"Invalid date. Enter Trip Date (YYYY-MM-DD):",
			default_value = today);
	}
	let tripDate = moment(tripDateString);

	// New naming scheme: YYYY-MM-DD-location-slug
	let folderName = tripDate.format('YYYY-MM-DD') + '-' + tripLocationSlug;
	let folderPath = basePath + "/" + folderName;
	let photoPath = folderPath + "/photos";
	let coverPhotoPath = photoPath + "/cover_photo.jpg";

	await this.app.vault.createFolder(folderPath);
	await this.app.vault.createFolder(photoPath);
	await tp.file.move(folderPath + "/" + folderName);

	let postTitle = tripLocation + " " + tripDate.format('YYYY-MM-DD');

-%>
---
published: false
category: trip
date: <% tripDate.format() %>
title: <% postTitle %>
latitude: <% tripLat %>
longitude: <% tripLong %>
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

