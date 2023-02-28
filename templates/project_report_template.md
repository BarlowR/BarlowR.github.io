<%* 
	let basePath = "content/projects"
	let projectCategories = ["New"];
	let projectFolders = await this.app.vault.fileMap[basePath].children;
	for (let i = 0; i < projectFolders.length; i++){
		projectCategories.push(projectFolders[i].name);
	}
	let projectCategory = await tp.system.suggester(projectCategories, projectCategories);
	let projectName = "";
	if (projectCategory == "New"){
		projectCategory = await tp.system.prompt("Enter the new category name:");
		projectName = await tp.system.prompt("Enter the new Project Name");
	} else {
		let currentProjects = ["New"];
		let projectsInCategory = 
			await this.app.vault.fileMap[basePath + "/" + projectCategory].children;
		for (let i = 0; i < projectsInCategory.length; i++){
			currentProjects.push(projectsInCategory[i].name);
		}
		projectName = await tp.system.suggester(currentProjects, currentProjects);
		if (projectName == "New"){
			projectName = await tp.system.prompt("Enter the new Project Name");
		}
	}
	
	let projectNameString = projectName.replaceAll(" ", "");
	let projectPath = basePath + "/" + projectCategory + "/" + projectNameString;
	let photoFolder = projectPath + "/photos"
	let coverPhotoFolder = photoFolder + "/cover_photo"
	
	for (path in [projectPath, photoFolder, coverPhotoFolder]){
		if (!this.app.vault.exists(path)){
			await this.app.vault.createFolder(path);
		}
	}
	
	let projectFinalString = projectNameString + "Final";
	await tp.file.move(projectPath + "/" + projectFinalString);

-%>
---
tag:  project, report, <%projectNameString + ", " + projectCategory%>
project_category : <% projectCategory %>
date: <% moment() %>
---


## <% projectName %> 


Write about your project here!

* Add photos to the <% photoFolder %> folder
* Add a single cover photo to the <% coverPhotoFolder %> folder




```button
name (Mostly) Complete!
type line(3) text
action visibility: visible
color green
remove true
```
