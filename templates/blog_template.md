<%*
	let today = moment();
	let thisYear = today.format("YYYY");
	let basePath = "content/posts/" + thisYear;

	let postTitle = await tp.system.prompt("Enter the post Title");

	// Create URL-friendly slug from title
	let postSlug = postTitle.toLowerCase()
		.replace(/[^\w\s-]/g, '')  // Remove special chars
		.replace(/\s+/g, '-')      // Spaces to hyphens
		.replace(/-+/g, '-')       // Multiple hyphens to single
		.replace(/^-|-$/g, '');    // Remove leading/trailing hyphens

	// Filename format: MM-DD-slug
	let filename = today.format("MM-DD") + "-" + postSlug;

	// Ensure year directory exists
	await this.app.vault.createFolder(basePath);
	await tp.file.move(basePath + "/" + filename);
-%>
---
published: false
category: blog_post
date: <% moment().format() %>
title: <% postTitle %>
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
