---
layout: post
title:  "Usefull JPQL tricks"
date:   2015-10-31 00:00:00 
categories: java JEE JPA 
---

## This
is a just a note to myself always forgeting **fucking ugly** syntax of JPA query language's *if* statement analogue.

### Returning boolean from JPQL query
Sometimes I need only check object existance without getting a proxy to entity.

```sql
select case when count(s)>1 then true else false end from Subscription s where s.id=:subId
```

### Constructor query

This is usefull in many ways. First, your object does not have to be an entity. So this is ideal to fill some DTOs with data from complex join query. Second, even if it's an entity, created through constructor it will always be detached and having all fields initialized, so your brain could rest a little without struggle with lazy initialization errors.

```sql
select new Subscription(s.id,s.source,s.dest,s.type) from Subscription s where s.id=:subId
```

That's all for now. Will update if recall anything else.