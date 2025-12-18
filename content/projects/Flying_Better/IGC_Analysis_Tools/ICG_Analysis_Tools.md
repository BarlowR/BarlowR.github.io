---
published: true
category: project
project_category: Web Utilities
project_name: IGC Analysis Tools
date: 2025-08-21T17:19:14-08:00
title: IGC Analysis Tools
cover_photo: /content/projects/Outdoor_Gear/Fabric_Analysis/photos/cover_photo.jpg
layout: project-post
---


<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IGC Flight Log Analysis Tools</title>
</head>
<body>
    <h2>IGC Flight Log Analysis Tools</h2>
    
    <br>

    <h4> Create KML tracks from track log, colored by climb rate or speed </h4>
    <input type="file" id="fileInputIgc" accept=".igc" />
    <button id="processBtnIgc" onclick="processFileIgc()" disabled>Process Flight</button>
    
    <div id="outputIgc"></div>
    <script type="text/javascript" src="/content/projects/Flying_Better/IGC_Analysis_Tools/igc_analysis_tooling.js"></script>

    <br>
    <a href = "https://github.com/BarlowR/igc-tools"> GitHub Repo here</a>.

    
</body>
</html>
