<%* 
	let basePath = "content/trips";
	let today = tp.date.now().format('YYYY-MM-DD');
	let tripLocation = await tp.system.prompt("Trip Location:");
	let tripLocationString = tripLocation.replaceAll(" ", "");
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
	let photoFolder = folderPath + "/photos"
	let coverPhotoFolder = photoFolder + "/cover_photo"
	await this.app.vault.createFolder(folderPath);
	await this.app.vault.createFolder(photoFolder);
	await this.app.vault.createFolder(coverPhotoFolder);
	await tp.file.move(folderPath + "/" + tripString);

	let postTitle = tripLocation + " " +tripDate.format('YYYY-MM-DD');

-%>
---
published: false
tag:  trip, post, <% tripLocationString %>
date: <% moment() %>
postTitle: <% postTitle %>
layout: trip-report
---


## <% postTitle %>

Write about your trip here!

* Add photos to the <% photoFolder %> folder
* Add a single cover photo to the <% coverPhotoFolder %> folder

```button
name (Mostly) Complete!
type line(2) text
action published: true
replace [2, 2]
color green
remove true
```

