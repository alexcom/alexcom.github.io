---
published: true
layout: post
title: Stepping on ANTLR's rakes
categories: java antlr parser
tags: java antlr parser
---
## ANTLR 4
Some quick bullet points to remember things I learned through experiense while developing query language for a software product on my job.

### Use EOF, Luke!

Include it explicitely in the end of the root rule.

### The layout of alternatives inside rule makes sense
It defines precedence order. For example for simple arithmetic expression language you would place  * over + in the rule. This makes development of languages where precedence is important easy as a piece of pie.

### Freaking keywords
When you define a keyword you can get into situation when language user can enter same word but in text part of language statement and it is interpreted by ANTLR as a keyword and will fail syntax check. Basically that means that you can't use keywords in text clauses. Unless you define them as alternative for word using '|'.
E.g.:
 You have simple query language where query looks like this:
 ```
 text=some true thing OR allCaps=true
 ```
 With broken syntax definition this can be interpreted as 
 
 1. text=some // incorrect short text clause
 2. true // boolean literal out of place
 3. thing // text literal out of place
 4. OR allCaps=true //correct boolean part
 
 In this case to give parser a hint that *true* may also be a simple word, not a keyword, you would specify corresponding rule for a *WORD* as follows:
 ```
fragment E : [eE];
fragment R : [rR];
fragment T : [tT];
fragment U : [uU];
 
 ID : [a-zA-Z0-9_]+;
 TRUE: T R U E;
 WORD : ID*
      | TRUE
      ;
 ```
 Here I have to mention that to be able to do that you also have to define each letter as individual token and define all keywords via those fragment tokens. Well, that's the price you pay for flexibility.
