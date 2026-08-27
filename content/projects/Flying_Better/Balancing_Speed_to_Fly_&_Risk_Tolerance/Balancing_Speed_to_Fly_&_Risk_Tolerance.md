---
published: true
category: project
project_category: Active Flying
project_name: Balancing MacCready Regime & Risk Tolerance
date: 2025-01-01T13:51:55-08:00
title: Balancing Speed to Fly & Risk Tolerance
cover_photo: /content/projects/Flying_Better/Balancing_Speed_to_Fly_&_Risk_Tolerance/photos/cover_photo.jpg
layout: project-post
---

## Balancing MacCready Regime & Risk Tolerance
2025-01-01

In [The Insight of MacCready](/content/projects/Flying_Better/The_Insight_of_MacCready_Speed_to_Fly/The_Insight_of_MacCready_Speed_to_Fly), I make the argument that the true value of MacCready speed to fly theory is in setting up a fixed relationship between altitude and time for unpowered flight. Lower MC numbers correlate to a higher value on altitude and a lower value on time (speed), and higher MC numbers map to lower value on altitude and higher value on time (speed). 

One issue with this interpretation is that despite the explicit relationship between altitude and time, altitude is only considered in the relative sense. The relationship does not factor in absolute altitude, I.E. how close the pilot is to needing to land. It also doesn't factor in other technical or tactical risks. This could be seen as a significant flaw. As such, it's worth considering how to factor in perceived risk and risk tolerance into a mental model of speed to fly. 

## Continuous Altitude Degradation

John Cochrane has proposed an exact solution to the altitude problem in his writeup, [Just a little faster, please](https://static1.squarespace.com/static/581f5f9129687f6b1d73b1e8/t/58c39a0320099e3e84c4dd3e/1489213957260/FlyingFaster.pdf). Figure 2 shows a numerical solution for adjusting MacCready setting based on altitude. Cochrane notes that calculating what this curve should be needs to take in the following: 

* What is the thermal profile of the day?
* What is the frequency of thermals?
* What is the performance of the aircraft?
* What is the penalty of landing out?
* What is the altitude tolerance of the pilot?
* What is the skill level of the pilot?
* How will the conditions change in the near future?

In the *Final glides* section, Cochrane adds in distance to goal to complicate the curve more.  Figure 3 shows the (very) non-linear solution to the complex problem. 

This is a lot to consider to determine the correct MC setting. While the concept is useful, the solution is likely too much to carry around in a pilot's head. Even Cochrane doesn't calculate it mentally; He has implemented the solution in MatLab to be used in the air (source needed). Thankfully, he breaks down the general advice into a few maxims:

* Steadily reduce the MacReady setting as you get lower.
* Leave weak thermals to go find better lift as you get higher.
* MacCready settings should be substantially lower than best climbs.

These can be easily applied by any pilot. 

## Discrete Risk Tolerance Approach

While the continuous altitude degradation approach does solve the altitude problem directly and provides some guidelines, we don't yet have a good mental model for trading MC number with risk. 

In their paper [Bounded Rationality and Risk Strategy in Thermal Soaring](https://chessintheair.com/wp-content/uploads/2018/08/BirSaz18.pdf) Bird, Sazhin and Langelaan consider how to balance these two factors. After investigating the topic, they propose a simple flow model that trades these two factors, shown below. 

::photo{src="photos/risktrade.png" style="width:80%;"}
.

This model makes explicit the pilot's information loop, including obtaining information and assessing the current situation, all an assumed part of the decision making process. The insight they propose is a binary decision between flight modes of "Racing" and "Risk Minimization." 

* **Racing** mode means making flight decisions around the appropriate MC setting for the day, and adjusting decision making (flight path, glide speed and thermal selection) to match.
* **Risk Minimization** mode, which I interpret as "Stay up", means setting your MC to 0 and doing everything you can to stay in the air. 

The authors propose defining a "Risk Tolerance" before flying, which can be then used as a mapping for when to switch between modes. This may include an altitude threshold, a qualitative measure of tactical or technical risk, and/or pilot gut feeling. 

By making this decision binary, a pilot can then easily make the distinction for what the best course of action is for a given situation, even under time pressure or in a stressful situation. Is the perceived risk the pilot experiences below the predetermined risk threshold? The pilot should fly in racing mode. Is the perceived risk above the predetermined risk threshold? The pilot should fly in risk minimization mode. 

## A More Complete Model of Speed to Fly

With these two concepts, we can build a model of speed to fly that factors in risk tolerance. 
* Pilots should define their own idea of risk tolerance before a flight
* Using the most basic model:
	* A pilot can switch between flying at MC 0 (stay up) and the normal MC number for the conditions based on their perceived current risk in relation to their predefined risk tolerance.
* A more advanced model combines the discrete and continuous concepts above. 
	* A pilot can switch between MC 0 and "Racing Mode" based on their perceived current risk in relation to their predefined risk tolerance.
	* In "Racing Mode", MC is degraded by perceived risk.

::photo{src="photos/MCRiskModel.png" style="width:40%;"}
.

