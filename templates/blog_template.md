
<%* 
	let thisMonth = moment().format("MMM");
	let basePath = "content/posts/" + thisMonth;
	
	let postTitle = await tp.system.prompt("Enter the post Title");
	let projectPostString = postTitle.replaceAll(" ", "");
	
	const yn = ["Yes", "No"]
	let makePhotoFolder = await tp.system.suggester(yn, yn)
	if (makePhotoFolder== yn[0]){
		let photoFolder = basePath + "/" + projectPostString+"_photos"
		await this.app.vault.createFolder(photoFolder);
	}

	await tp.file.move(basePath + "/" + projectPostString);

-%>

---
published: false
tag:  blog, post, 
date: <% moment() %>
title: <% postTitle %>
layout: post
---


<% moment().format("YYYY-MM-DD") %>


Write here!


```button
name (Mostly) Complete!
type line(2) text
action published: true
replace [2, 2]
color green
remove true
```
