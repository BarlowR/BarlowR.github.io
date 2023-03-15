<%* 
	let thisMonth = moment().format("MMM");
	let basePath = "content/posts/" + thisMonth;
	
	let postTitle = await tp.system.prompt("Enter the post Title");
	let postTitleString = postTitle.replaceAll(" ", "_");

	await tp.file.move(basePath + "/" + postTitleString);
-%>
---
published: false
category: blog_post
project_category : <% projectCategory %>
project_name : <% projectName %>
date: <% moment() %>
title: <% postTitle %>
cover_photo: <% "/" + coverPhotoPath %>
layout: blog-post
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
