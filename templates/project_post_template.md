<%* 
	var projectName, projectNameString, projectCategory, projectCategoryString, postTitle, postTitleString;
	var basePath, categoryPath, projectPath, photoPath, coverPhotoPath;
	
	basePath = "content/projects";
	let projectCategories = 
		tp.user.get_folders(this.app.vault, basePath, true);
	projectCategories.push("New");
	projectCategory = 
		await tp.system.suggester(projectCategories, projectCategories);
	let newCategory = false;
	if (projectCategory == "New"){
		projectCategory = await tp.system.prompt("Enter the new category name:");
		newCategory = true;
	}
	// Create URL-friendly category slug
	let projectCategorySlug = projectCategory.toLowerCase()
		.replace(/[^\w\s-]/g, '')  // Remove special chars
		.replace(/\s+/g, '-')      // Spaces to hyphens
		.replace(/-+/g, '-')       // Multiple hyphens to single
		.replace(/^-|-$/g, '');    // Remove leading/trailing hyphens

	categoryPath = basePath + "/" + projectCategorySlug;

	let projectsInCategory = 
		tp.user.get_folders(this.app.vault, categoryPath, true);

	if (newCategory){
		projectName = "New";
	} else {
		projectsInCategory.push("New");
		projectName = 
			await tp.system.suggester(projectsInCategory, projectsInCategory);
	}
	if (projectName == "New"){
		projectName = await tp.system.prompt("Enter the new Project name:");
	}
	// Create URL-friendly project slug
	let projectNameSlug = projectName.toLowerCase()
		.replace(/[^\w\s-]/g, '')  // Remove special chars
		.replace(/\s+/g, '-')      // Spaces to hyphens
		.replace(/-+/g, '-')       // Multiple hyphens to single
		.replace(/^-|-$/g, '');    // Remove leading/trailing hyphens

	projectPath = categoryPath + "/" + projectNameSlug;
	photoPath = projectPath + "/photos";
	coverPhotoPath = photoPath + "/cover_photo.jpg";
	
	for (path of [projectPath, photoPath]){
		//console.log("checking "+ path);
		let exists = await this.app.vault.exists(path);
		//console.log(exists);
		if (!exists){
			await this.app.vault.createFolder(path);
		}
	}

	postTitle = projectName;
	postTitleString = projectName;
	await tp.file.move(projectPath + "/" + projectNameSlug);
-%>
---
published: false
category: project
project_category : <% projectCategory %>
project_name : <% projectName %>
date: <% moment().format() %>
title: <% postTitle %>
cover_photo: <% "/" + coverPhotoPath %>
layout: project-post
---

## <% postTitle %>
<% moment().format("YYYY-MM-DD") %>


Write about your project progress here!

- Add photos to the *<% photoPath %>* folder
- Add a single cover photo as cover_photo.jpg



```button
name (Mostly) Complete!
type line(2) text
action published: true
replace [2, 2]
color green
remove true
```
