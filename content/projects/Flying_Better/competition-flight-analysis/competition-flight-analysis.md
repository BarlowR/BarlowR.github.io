---
published: true
category: project
project_category: Flying Better
project_name: Competition Flight Analysis
date: 2025-10-16T12:43:31-07:00
title: Competition Flight Analysis
cover_photo: /content/projects/flying-better/competition-flight-analysis/photos/cover_photo.jpg
layout: project-post
---

## Competition Flight Analysis

### Background

I think those who fly in paragliding competitions should self-categorize in one of four phases. The first phase is one of discovery, where a pilot learns how to fly with larger groups of other pilots, use their flight instrument for flying a task, and can generally tag a few turnpoints before bombing out. The next phase is one of consistency, where a pilot works to be able to complete every task without bombing out. The third phase is speed, where a pilot works to fly faster and score higher in competitions, through improvement of basic skills and calculated risk taking. The final phase is tactical, where one works to optimize their own flight in the context of those around them. 

This article is primarily intended for those in the third phase of competition flying, those who are looking to improve their scoring once they are confident that they can complete nearly any set task. Remember, if you don't make goal, it doesn't matter how fast you go. The topics covered herein are also useful for working to improve one's XC speed outside of competition. 

When looking to fly faster, there are 4 directives:
* Climb better
* Fly a shorter distance
* Glide better
* Don't put yourself in jail

When looking to improve, a necessary prerequisite is a way to measure (relatively) objective performance. Competition flying provides a great way to compare overall performance against others, but most folks generally only consider finish times, subjective reports from other pilots, and occasionally look at track logs. With these metrics, it's difficult to objectively look at where one can improve, especially in the context of the 4 maxims. How can one evaluate how well they climbed? How about how well one glided?

In the service of getting insight into one's performance, I have been working on developing a [set of python tools for IGC track analysis](https://github.com/BarlowR/igc-tools). In the Analysis Tool Methodology section below I discuss how I extract relevant metrics from IGC and task files. If you just care about how to interpret/use the results, skip to the "Using the Analysis Tooling" section.

### Analysis Tool Methodology

#### IGC Data Processing

As a first step to extracting metrics, the provided tracklog must be parsed. IGC files follow the [FAI's IGC file specification](https://www.fai.org/sites/default/files/igc_fr_specification_2020-11-25_with_al6.pdf), which was used as the reference for building the IGC parser. In the ICG parser module, the user provided IGC file is parsed row by row into header, body and footer rows. Date, time, and pilot name is extracted from the header rows. Positional reports are recorded in IGC files at 1HZ as "BFIX" rows, which are read in from the body rows and parsed into a row-wise data structure with columns for time, GPS altitude, Baro altitude, GPS fix validity, latitude, and longitude. Footer rows are ignored. 
All rows are then filtered for unreasonable values. 4 filters are run to check and remove unreasonable position, unreasonable altitude, unreasonable speed, or unreasonable vertical speed rows. 

Next, first order differential fields are calculated from the altitude and position fields. This tool uses on GPS altitude for all calculations. We are interested in distance, speed, altitude change and vertical speed. These fields are calculated for 1 second, 5 second and 20 second discrete intervals. Shorter intervals are noisier, but are faster to respond to changes in the underlying data. The comparison with the past element was chosen to portray the data that is available to the pilot at a given time step, as opposed to a centered window which would portray the best approximation of the true underlying data. 

Once first order differential fields are calculated, some useful states can be obtained. 
* When a pilot is circling in a thermal, they will not travel far over the course of 20 seconds compared to flying straight. A boolean field "stopped_to_climb" is calculated based on the distance traveled by the 20s speed rate compared against a threshold of 200m. 
* A paraglider generally descends at a rate of 1m/s. If the pilot is moving with a vertical speed higher than -1m/s, then they are likely in a rising airmass. A boolean field "climbing" is calculated based on the 5s vertical speed rate compared against a threshold of -0.5 m/s. 
* Using these 2 boolean states, we can calculate a matrix of 4 derived states: Stopped and climbing, stoped and not climbing, on glide, and climbing on glide.

Next, aggregate fields can be calculated.
* Cumulative time is aggregated across all 6 states above for "time_spent_<>" fields
* Differential distance is aggregated to compute a "distance flown" field.
* Differential altitude change is aggregated to compute "altitude gained" and "altitude lost" fields. 

Finally, climb rate fields are calculated.
* A "climb_rate_avg" field is computed by averaging the 5s climb rate over rows where "climbing" is true
* Duration is counted across 7 different bins of climb rates: Maintaining, 1m/s, 2m/s, 3m/s, 4m/s, 5m/s, and >5m/s.

#### .xctsk Processing

Competition tasks are distributed in a number of different formats, but my instrument uses .xctsk files so I've standardized on using them. xctsk files are just json files with a different extension, which makes them really easy to work with. 

The tasks are loaded in with a json parsing library, and they are associated with the IGC tracklog object. Progress of the pilot around the task is computed by walking through each row of the icg log and tracking which turnpoints have been hit in the appropriate order. 
Using the time that the pilot passed the "End of Speed Section" (ESS) designated turnpoint, along with the start time of the task, the IGC tracklog is cropped to include only the time spent flying the task, and aggregate metrics are recomputed. 

### Using the Analysis Tooling

The October event of the NorCal Sprint League had a great task In Dunlap, CA, with 6 pilots in goal after a ~30km task. The first pilot completed the task in one hour and 5 minutes, and the last pilot completed the task in one hour and 50 mins. All pilots flew generally the same course zig zagging back and forth along the mountain range, so what separated the leaders from the back of the pack? This task provides a great example for comparative analysis using these tools. I've generated an analysis page for this task:

[Dunlap 2025-10-12 Analysis](/competition_report.html)

#### Climb Better

First we can consider the first directive of flying fast, *Climb Better*. Average climb rate is the immediate metric to look at when looking to analyze climbing performance. The winner, Travis, had the fastest climb rate of the finishers, averaging 1.72 m/s over the course of the competition. Climbing fast allows a pilot to spend minimal time climbing to get the required altitude, which is reflected by Travis's time spent "Stopped and Climbing", which is the lowest of the finishers. 

Another metric one can use to analyze their performance against the Climb Better directive is time spent "Stopped and Not Climbing". This may be a result of searching for a climb, falling out of a climb, or circling on top of a climb after the climb rate drops off. A close friend of mine would call this "faffing about". I'm proud to say that I spent the least amount of time "faffing about" in this particular competition, with Travis a close second. 

For further analysis on climbing performance, the analysis tool generates a plot of the percentage of time each pilot spent at a given climb rate. To *Climb Better*, a pilot should:
* Optimize the thermal they are in, working to attain the highest climb rate possible
* Only climb in strong thermals. 

Doing both of these things results in a higher average climb rate. On the climb rate plot, this results in larger percentage values at higher climb rates, and lower percentage values at lower climb rates. Of the folks who finished, Travis did this the best with higher percentages of time spent at higher climb rates, resulting in the highest average climb rate. 

#### Fly a Shorter Distance

Climbing well alone isn't enough. Robert Parker's climb rate average of 1.69 over the course of the competition was second best of all finishers, but he reached ESS last. How did Parker end up in last place of the finishers while climbing the second fastest? He flew the farthest of everyone, covering a total of 50km before reaching ESS. This is in opposition to the second directive of flying fast, *Fly a Shorter Distance*. Travis again leads this metric with a "Total Distance Flown" of only 32km. 

Flying a shorter distance results in less time spent gliding, which itself results in less altitude required to be gained in thermals to complete the course. Closely connected to Travis' shortest path, the metrics show that he:
* Gained the least amount of altitude over the task.
* Spent the least amount of time climbing.
* Spent the least amount of time gliding. 

It's a bit ironic to consider that the winner of a paragliding competition did the least actual paragliding. 

#### Glide Better

The third directive of flying fast is to *Glide Better*. In practice and in analysis, this is nebulous. The closest metric this maps to directly is the percentage of time spent "Climbing on glide". Kenny Kim leads this category, with Travis once again in second. 

Remember that "climbing" is considered as any vertical rate higher than -0.5 m/s, so this metric does not mean that the pilot necessarily went up, but instead that they were flying through a moving airmass.

*Glide Better* also means [adjusting your flying for the right MacCready value](/content/projects/Flying_Better/The_Insight_of_MacCready_Speed_to_Fly/The_Insight_of_MacCready_Speed_to_Fly). When using this analysis tool for your own flights, consider the reported "Average Climb Rate" of the task and consider how this should map to the decisions you made in the flight. 

Note: Airspeed estimates are difficult to extract from IGC tracklog groundspeed due to the variability of wind direction and speed throughout a day of flying (If only we all carried airspeed probes), so I don't include it in the analysis. As a result, we can't work out if any given pilot was flying the right speed (one element of MacCready). 

#### Don't Put Yourself in Jail

*Well Rob*, you may ask, *if you understand these concepts and are giving this advice, why didn't you win?* My response would be that I violated the 4th directive of flying fast, *Don't Put Yourself In Jail*. This directive is often times directly at odds with *Fly a Shorter Distance*. 

In this competition, I attempted to follow the back ridge of the Dunlap range to the Delilah turnpoint. The normal route requires gliding out and around the front of the mountain, climbing somewhere on the front of the mountain, and then gliding back deeper to tag the turnpoint. Flying along the back ridge would be significantly shorter than the normal route, but would require a climb somewhere along the back ridge to have enough altitude to reach the turnpoint and glide out. 

I couldn't find the required climb, and so I ended up on a harrowing low glide to bail out of the back range canyon and reconnect with the normal route, now much lower. 

Unfortunately, this doesn't show up directly in metric analysis. Sure, I ended up with a longer "Total Distance Flown", but the reasons why aren't directly apparent. 

### Final Thoughts

As highlighted in my story of putting myself in jail, its useful to remember that quantitative analysis doesn't tell the whole story. These metrics are useful for analysis of how well one followed the 4 directives, but they do not provide evidence for *why* the pilot flew this way. Similarly, they are likely not useful as actionable items for improving one's competition flying. For example, trying to focus on just "climbing on glide" won't yield improvement in that category; one needs to identify and improve the flying behaviors that result in "climbing on glide", I.E. aligning to lift lines in wind, flying over energy lines, or using other pilots/markers to determine where an airmass is going up.

Nonetheless, these tools can help in identify which directives you are following well and which ones you are not following. Hopefully this can help you understand where you can improve your flying. 






