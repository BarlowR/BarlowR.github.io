---
published: true
category: project
project_category: Active Flying
project_name: The Insight of MacCready Speed to Fly
date: 2024-12-28T12:56:24-08:00
title: The Insight of MacCready Speed to Fly
cover_photo: /content/projects/Flying_Better/The_Insight_of_MacCready_Speed_to_Fly/photos/cover_photo.jpg
layout: project-post
---

## The Insight of MacCready Speed to Fly
2024-12-28

# Introduction

Dr. Paul MacCready was a prolific aeronautical engineer, known for [winning the Kremer prize for human powered aircaft](https://en.wikipedia.org/wiki/MacCready_Gossamer_Condor), wining the US sailplane nationals in 1948, 1949, and 1953, and starting the UAS company [Aerovironment](https://www.avinc.com/). MacReady speed to fly theory, invented by and named after Dr. MacCready, is a concept one may come across in any soaring sport (sailplanes, paragliders, etc). 

MacCready theory seeks to answer a simple question: When a pilot is at the top of a thermal in a non-powered aircraft, how fast should the pilot fly to the next reachable thermal of known strength?

As non-powered aircraft fly faster, their sink rate drops off non-linearly. One way to think of this is that glide ratio, the distance flown horizontally divided by the altitude lost, decreases with additional speed. For example, on a EN-B paraglider, one may fly at 10:1 at 38km/h (trim), but this drops non-linearly to ~7:1 at ~52km/h (full speed bar). 

The bounding of the MacCready problem is relatively simple- knowing this relationship for a glider and the strength of the next climb the pilot will take, minimize the sum of the time spent gliding and the time spend climbing by optimizing the speed that the pilot will fly between thermals. 

MacCready speed to fly is often represented directly as a MacCready (MC) value. This value corresponds to the expected strength of the next climb. For example, "Flying MC 4" means flying MacCready speed to fly for an expected next climb of 4 m/s.

::photo{src="photos/MCDiagram.png" style="width:80%;"}
.

# MacCready Speed to Fly Solution Derivation

The solution for optimal MacCready speed to fly is a function of the strength of the next expected climb. (Note: It's also a function of wind the pilot is flying in and the current sink rate, but we'll leave those aside for now). For a mathematical derivation, see the page on [MacCready Derivation](/projects/flying-better/maccready-speed-to-fly-derivation/).

# MacCready Example Solution

Below for reference is a table for optimal MacCready speed to fly for a high-b paraglider. 
::photo{src="photos/stf_chart.png" style="width:80%;"}
.

# MacCready Interpretation
## Does strict MacCready Speed to Fly work? (MacCready Calculation Assumptions)

Consider the following scenario. A pilot is flying in a competition or on a cross country flight, and they just topped out a climb. Halfway up the climb, their vario peaked at 4 m/s. The pilot remembers reading about MacCready, so they point it straight down course line into a blue hole and dial into MC 4.

What will happen? If they're persistent, they will fly the optimal MacCready speed to fly straight into the ground. 

In building a better understanding of the MacCready speed to fly calculation, one must first examine the assumptions that go into the calculation:

1. The location of the next thermal is known
2. The strength of the next thermal is known
3. The pilot will find and center the next thermal immediately
4. Thermals set up along course-line
5. Thermal strength does not change with altitude

Anyone who has tried to do a thermal cross-country flight on an unpowered aircraft will know that these assumptions all fall apart. Many folks look at MacCready speed to fly and discard it completely because of this. Others, such as [Reichmann](https://www.cumulus-soaring.com/store/cross-country-soaring-free) or [Cochrane](https://static1.squarespace.com/static/581f5f9129687f6b1d73b1e8/t/58c39a0320099e3e84c4dd3e/1489213957260/FlyingFaster.pdf), have expanded out MacCready speed to fly theory to address some of the assumptions.

However, the true value in MacCready's analysis work is not just to tell you specifically how fast to fly. Instead, MC number can be used as a broad tool for decision making in unpowered flight.
## MacCready number as a tool

MacCready speed to fly defines a fixed relationship between speed and altitude. At first look, this is "How much can one trade altitude for speed on glide" or "How much should one degrade their glide ratio to go faster?"

However, this relationship also works the other way. Given the fixed relationship between altitude and speed, MacCready speed to fly theory defines, not just how to trade altitude for speed, but also *how to trade speed for altitude*.

The first clear example of this is on glide between thermals. If a pilot is flying at MC 2m/s, and they come across a 3m/s climb, this pilot should obviously take the climb. Said another way, gaining 3 meters per second is worth more than the loss in time of stopping progress down course line. Conversely, if a pilot flying at MC 2m/s comes across a climb that is only 1m/s, they shouldn't take it. This is because gaining 1 meter per second is worth less than the time loss it incurs. 

By setting a MacCready value, one is then not just setting a speed to fly, but is *defining the relationship between time (speed) and altitude.* 
## Using MacCready number to reason about trades of time to altitude

In sailplanes, pilots install rings around their airspeed indicator that can adjusted to a desired MC numbed, yielding the corresponding speed to fly. It's not only the speed that good pilots look at, but also the MC number. Since this number defines the relationship between speed and altitude, it can be used to make decisions in cross country or competition flight. 

Of course, the first decision the MacCready number informs is how fast to fly on glide. This is a direct trade of altitude for time down courseline. 

As discussed above, the next decision this can directly inform is what climbs to take, and which to leave. If one is flying at a MacCready value of 2 m/s, one should take all climbs above 2 m/s and discard climbs below 2 m/s. This should be applied while in climbs as well; thermals often decrease in energy near the top, so they should be left when their strength drops below a pilot's MC setting.

A third decision MC number informs is what direction to fly. Consider a pilot at the top of a climb, who has two options: straight along course-line, or on a diversion that takes them along a mountain ridge, above a large number of thermal triggers. 

* Option 1: Course-line. 300s to fly.
* Option 2: Diversion, mountain ridge. 400s to fly, 250m altitude gain on option 1.

If the pilot is flying at MC 2m/s, then the 100s diversion is worth 250/2 = 125s in time gain, making option 2 worth it. If the pilot is flying at MC 3m/s, then the diversion is worth 250/3 = 83s in time gain, which is not worth the 100s cost.

When flying at lower MC numbers, large deviations are very valuable. Conversely, when flying at high MC numbers, deviations must return much higher altitude gains to be worth their time penalty. 
## Example MC number "Flight Modes" for a High-B paraglider

### MC < 0.5
* Speed to fly: Trim speed or 1/3 speedbar (adjust for wind/sink)
* Climbs: Take anything, at any altitude, all the way to the top
* Course Deviations: Go in any direction to try to find a climb

### MC 1
* Speed to fly: 1/3 speedbar(adjust for wind/sink). Slow down in any lift.
* Climbs: Take anything above 1 m/s, leave when the climb rate drops decently below 1 m/s. 
* Course Deviations: Large course line deviations up to 90 degrees are likely valuable.

### MC 3
* Speed to fly: 2/3 speedbar or full bar (adjust for wind/sink). Slow down for any climb above 1 m/s 
* Climbs: Take anything above 3 m/s, leave when the climb drops below 3 m/s.
* Course Deviations: Smaller course line deviations up to 20 degrees are likely valuable.

## Realistically setting MC number

With the understanding that MC number defines a relationship between time and altitude, the question that follows is: how does one accurately set MC value?

Remember the assumptions that went into MacCready's calculation. MC number is the 
"known strength" of the "next reachable thermal". As a paraglider pilot, it's almost laughable to say that one *knows* there is thermal out there, let alone the strength of that thermal. The best that can be done is to make an educated guess. 

There are two tools that can be wielded when trying to make this educated guess. The first is information. One can apply general,  specific, and/or hyper specific information. Examples of general information may be one's model of how thermals form and release or how patterns of weather form and propagate. Specific information could be the forecast for the day or prior knowledge of a site. Hyper-specific information could be other pilots in the air, birds, or one's climb in the last thermal. 

As an aside, remember that MacCready considers everything between stopping glide to leaving the top of the climb as part of the climb, which includes all time spent finding the core, falling out of the side, and faffing around at the top. If a pilot stops gliding, climbs 1000m and starts gliding again after 500s, their true climb rate is 2 m/s, even if they had portions of the climb at 5m/s. This means that true climb rate is generally less than perceived from the readout of the vario in the climb.

The second tool that one can use in making a good educated guess at the strength of the next reachable thermal is to guess low. On any given day, there are many more weaker climbs than there are strong climbs. By guessing lower, one increased the probability of being correct that there is a reachable thermal in-front of them at the specified strength. 

These two tools should be used in conjunction. The more information a pilot has, the better they can guess at the actual strength of the next thermal and the less they need to guess low. The less information a pilot has, the lower they should guess to increase their chances of guessing correctly.  

Another important consideration is that one needs to continually re-apprise the right MC number as conditions change throughout the day. Maybe one begins the day at a familiar site with lots of other pilots in the air in good thermal conditions (high information, low uncertainty, high MC), but later in the day finds themselves alone, far from launch, with high clouds moving in (lower information, higher uncertainty, lower MC). 

Once MC number is guessed, the next information to consider is what regime the pilot would like to be flying in. MC number should never be more than the pilot's best guess at the known strength of the next reachable climb (this just results in lost time and altitude), but it can be purposely degraded. Remember that MC sets the relationship between time and altitude; if one values altitude more than time, MC can be degraded. For example, if a pilot is on a long XC flight traversing remote terrain, dropping the MC number is appropriate to fly more conservatively. Degrading MC is also appropriate for newer pilots still learning where to find thermals. In competition, some pilots chose to begin their final glide into goal at MC 0 no matter what the conditions, to guarantee they will make it. 

Risk posture is the final factor. This is examined in further detail in [Balancing MacCready Regime & Risk Tolerance](/projects/flying-better/balancing-speed-to-fly-risk-tolerance/).

### Bonus: Gliding in headwind, tailwind, lift and sink

My friend Muuo has written a great post on how flying in moving air masses effect glide ratio and how a pilot can respond with appropriate speed. Check it out here:
[Thoughts on Glide Ratio, Muuo Wambua](https://www.cs.toronto.edu/~muuo/writing/thoughts-on-glide-ratio/)
