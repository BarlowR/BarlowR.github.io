---
layout: projects
title: Other
type: field_p
---


## Other Projects

{% assign project_list = site.pages | where: "type", "other_p" %}
{% include project_grid.html %}


