---
layout: projects
title: Software
type: field
---

{% assign project_list = site.pages | where: "type", "software" %}
{% include project_grid.html %}


