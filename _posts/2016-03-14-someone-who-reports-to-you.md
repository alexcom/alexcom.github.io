---
layout: post
title: Someone who reports to you
date: 2016-03-14T13:06:00.000Z
categories: automation
tags: powershell bash build
---


## When
you are working on a project all alone or if you just happened to be in a huge team where you are the smallest fish in the pond you can became sad and lonely. To get rid of this stupid sucking feeling that you are on your own try to get yourself a friend. Personalize your machine! Or if you are a *normal* person without any complexes or with high self-esteem like me then just use the script below to add some voice to your bash scripts on Windows. You'll need *Powershell* and MinGW that seems to come from out of the box with lots of tools nowadays(to mention at least Git and Docker Toolbox).


### The Solution


```bash
SAY_SCRIPT='Add-Type -AssemblyName System.Speech; $synth = New-Object -TypeName System.Speech.Synthesis.SpeechSynthesizer; $synth.Speak("Oh,my Master! Project build is complete!");'
source do-some-real-work.sh
powershell.exe -command ${SAY_SCRIPT}
```


### The conclusion
Even if you are mentally healthy it's extreemely pleasant to have something on your machine that's reporting to you :)
<iframe width="560" height="315" src="https://www.youtube.com/embed/hkwcehPhOXw" frameborder="0" allowfullscreen></iframe>
