<%* 
	let today = moment().format('YYYY-MM-DD');

	
	let postTitle = await tp.system.prompt("Enter the post Title");
	let trainingDateString = await tp.system.prompt(
		"Trip Date (YYYY-MM-DD):", 
		default_value = today);
		
	let trainingMonth = moment(trainingDateString).format("MMMYYYY");
	let postTitleString = postTitle.replaceAll(" ", "_");
	let basePath = "content/training_log/" + trainingMonth;
	await tp.file.move(basePath + "/" + postTitleString);
-%>
---
published: false
category: training_log
date: <% moment(trainingDateString) %>
title: <% postTitle %>
layout: training-log
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
