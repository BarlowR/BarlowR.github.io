<%* 
	var projectName, projectNameString, projectCategory, projectCategoryString, postTitle, postTitleString;
	var basePath, categoryPath, projectPath, photoPath, coverPhotoPath;
	
	basePath = "content/projects";
	let projectCategories = 
		tp.user.get_folders(this.app.vault, basePath, true);
	projectCategories.push("New");
	projectCategory = 
		await tp.system.suggester(projectCategories, projectCategories);
	if (projectCategory == "New"){
		projectCategory = await tp.system.prompt("Enter the new category name:");
	}
	projectCategoryString = projectCategory.replaceAll(" ", "_");
	categoryPath = basePath + "/" + projectCategoryString;

	let projectsInCategory = 
		tp.user.get_folders(this.app.vault, categoryPath, true);

	if (projectsInCategory.length == 0){
		projectName = "New";
	} else {
		projectsInCategory.push("New");
		projectName = 
			await tp.system.suggester(projectsInCategory, projectsInCategory);
	}
	if (projectName == "New"){
		projectName = await tp.system.prompt("Enter the new Project name:");
	}
	projectNameString = projectName.replaceAll(" ", "_");
	
	projectPath = categoryPath + "/" + projectNameString;
	photoPath = projectPath + "/photos";
	coverPhotoPath = photoPath + "/cover_photo";
	
	for (path in [projectPath, photoPath, coverPhotoPath]){
		if (!this.app.vault.exists(path)){
			await this.app.vault.createFolder(path);
		}
	}

	postTitle = projectName + " Report"
	postTitleString = postTitle.replaceAll(" ", "_");
	await tp.file.move(projectPath + "/" + postTitleString);

-%>
---
tag:  project, report, <%projectNameString + ", " + projectCategoryString%>
project_category : <% projectCategoryString %>
date: <% moment() %>
---


## <% postTitle %> 


Write about your project here!

- Add photos to the *<% photoPath %>* folder
- Add a single cover photo to the *<% coverPhotoPath %>* folder





```button
name (Mostly) Complete!
type line(3) text
action visibility: visible
color green
remove true
```
