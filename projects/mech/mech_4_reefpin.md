---
layout: projects
title: ReefPin
type: mechanical
cover_image: /images/100isle.jpg
image_folder: /images/reefpin/
---

During the summer of 2018, I worked in the University of California San Diego's Engineers for Exploration Lab. While there, I was tasked with creating a solution for divers in the 100 Island Challenge at the Scripps Institute of Oceanography. 

The 100 Island Challenge is concerned with the creation of time-span 3D models of 100 coral reefs around the world. Divers create these 3D maps of the coral using a camera rig and swimming  a lawnmower pattern over the relevant area. The thousands of images captured are then stitched together to create 3D models.   

Unfortunately, while these models are incredibly stunning, they provide little insight into the coral itself; they are essentially visual models floating in space with no orientation, depth or heading information. Scripps had prototyped a few solutions to ground these models in space, using a combination of metal markers and dive watches, but these systems were bulky and time consuming in a environment where space and time are of utmost importance.   

This is where I come in. I worked on a team of two to design, manufacture and test a sensor system to help improve the workflow of this underwater 3D mapping.   

My partner and I spent the first  4 weeks focusing solely on a user oriented approach to the design of the system. We interviewed divers, swam with them during their 3D mapping training sessions, and worked closely with the lead diver to iterate on ergonomics, user interface and functionality. We also worked with the individual in charge of image post-processing/model creation to determine key elements of her process could be completed or eased by our system. 
After developing a looks-like/feels-like model that everyone was happy with, we then moved on to PCB design and part spec-ing. This process was 4 weeks of research, iteration and a heck of a lot of datasheets that culminated in a finalized PCB. I also worked to research and create a waterproofing and shockproof way to house our electronics.  

The last 2 weeks we spent assembling, testing and presenting our solution. The Reef Pin, as we named it, is waterproof to 100+ meters, shockproof, and nearly bulletproof. The system calculates heading and depth down to .5 degrees and 2cm respectively, and this information is displayed on 2 sets of 7 segment LED displays and a LED ring. The system is powered with a lithium polymer battery that is wirelessly charged and has power for 15 hours of constant use and a power off shelf life of weeks. Best of all, the system requires no diver iteration to be used; it turns on when placed in water, and information recording begins when the sensor self-determines that it is placed on the bottom of the reef. Information from each sensor can be viewed on the display post-dive by placing a magnet in a specified slot.  

