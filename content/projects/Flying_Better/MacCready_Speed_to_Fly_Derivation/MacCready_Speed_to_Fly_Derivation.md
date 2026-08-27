---
published: true
category: project
project_category : Active Flying
project_name : MacCready Speed to Fly Derivation
date: 2024-12-28T17:23:02-08:00
title: MacCready Speed to Fly Derivation
cover_photo: /content/projects/Flying_Better/MacCready_Speed_to_Fly_Derivation/photos/cover_photo.jpg
layout: project-post
---

## MacCready Speed to Fly Derivation
2024-12-28


## Brief MacCready Solution Derivation

Here's a brief derivation of MacCready speed to fly theory. See [The Insight of MacCready Speed to Fly](/projects/flying-better/the-insight-of-maccready-speed-to-fly/) for the bigger picture.

::photo{src="photos/MCDiagram.png" style="width:80%;"}
.
## Objective:

$Minimize: t_{total}(V_{Horizontal}) = t_{Flying} + t_{Climbing}$

$t_{Flying}=D_{Horizontal}/V_{horizontal}$

$t_{Climbing}=\frac{Alt_{Lost}}{V_{Climb}}$

### Where :

$D_{horizontal}$  : distance between climbs

$V_{horizontal}$   : horizontal velocity

$V_{climb}$  : expected vertical velocity of the next climb

$Alt_{Lost}$ is the altitude lost flying between the thermals, based on our horizontal speed:

$Alt_{Lost}=t_{Flying}*SinkRate(V_{horizontal})$


## Solution: 

Substituting everything back into the objective and doing some simplification:

$Min:  t_{total} = t_{Flying} + \frac{t_{Flying}*SinkRate(V_{horizontal)}}{V_{Climb}}$

 $Min: t_{total} = t_{Flying} (1 + \frac{ SinkRate(V_{horizontal})}{ V_{Climb}})$
 
$Min:  t_{total} = \frac{D_{Horizontal}}{V_{Climb}} * ( \frac{V_{Climb} + SinkRate(V_{horizontal})}{V_{horizontal}})$

$D_{horizontal}$ and $V_{Climb}$ are constants, so they can be factored out, yielding:

$Min:  t_{total} =  \frac{V_{Climb} + SinkRate(V_{horizontal})}{V_{horizontal}}$

We can solve this by differentiating with respect to $V_{horizontal}$  and finding the intercept:

$0 = (\frac{V_{Climb} + SinkRate(V_{horizontal})}{V_{horizontal}})\frac{d}{dV_{Horizontal}}$

$0 = \frac{SinkRate'(V_{Horizontal})}{V_{Horizontal}} - \frac{V_{Climb} + SinkRate(V_{horizontal})}{V_{horizontal}^2}$

$\frac{SinkRate'(V_{Horizontal})}{V_{Horizontal}} = \frac{V_{Climb} + SinkRate(V_{horizontal})}{V_{horizontal}^2}$

$V_{Climb} + SinkRate(V_{horizontal}) = V_{Horizontal} * SinkRate'(V_{Horizontal})$

This is equivalent to [MacCready's equation](https://soaringweb.org/Soaring_Index/1954/PDF/1954_Mar-Apr_08.html), first published in *Soaring* Magazine, Mar-Apr 1954 issue. 

## Interpretation

This is likely best interpreted visually on the polar graph:
::photo{src="photos/PolarChart.png" style="width:80%;"}
.






