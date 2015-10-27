---
layout: post
title:  "Getting rid of logging copy-paste"
date:   2015-10-28 00:00:00 
categories: java logging 
---

##It is awfull
how many good professionals in Java around me don't know what new features apeared in which version of Java. Well...most of them do know that annotations were introduced in J5 and that diamonds are J7's feature. Some individuals even used NIO2. But there's not so many of those. Just a couple of months ago some senior dev in my company suggested me to convert all my loggers from instance fields back to statics to avoid unnecessary objects creation. **SENIOR** developer. Obviously enough that I used something  akin to following.

{% highlight java %}
public class SomeLogic {
    private final Logger log = LoggerFactory.getLogger(getClass());    
}
{% endhighlight %}

On one hang he was right that and I sacrificed some memory to have cleaner code. On the other hand he stated that everyone is suffering but continues to use static logger instances with hand-coded names of classes. And I must do that too. Thanks, but I'm not buying this bullshit. Not anymore. The answer to "how to make it better" is below and it uses API that appeared in Java 7, that is in summer of 2011.

{% highlight java %}
public class SomeAwesomeLogic {
    private final static Logger log = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());    
}
{% endhighlight %}

**Learn your languages libraries, colleagues!**