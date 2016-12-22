---
published: false
---
## ANTLR 4
Some quick bullet points to remember all things I learned via experiense while developing query language for a software product on my job.

### Use EOF, Luke!

Include it explicitely in the end of the root rule.

### The layout of alternatives inside rule has sense
It defines precedence order. For example for simple arythmetic expression language you would place  * over + in the rule. This makes development of languages where precedence is important easy as a piece of pie.

