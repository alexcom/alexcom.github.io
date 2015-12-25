---
layout: post
title:  "Common JBoss standalone.xml snippets"
date:   2015-10-31 00:00:00 
categories: java JEE JPA 
---

<font style="color:red">THIS IS A DRAFT</font>

##Just
to remind myself about some often used features of JBoss application server( version 7 in particular) I'll collect here some of the snippets I use all the time in almost each and every application.


###Datasource configuration (PostgreSQL example)

The first and main snippet is the DataSource. Everyone knows how to set it up, so I won't explain it in detail.

{% highlight xml %}
    <datasource jta="false" jndi-name="java:jboss/britta" pool-name="Britta" enabled="true" use-ccm="false">
        <connection-url>jdbc:postgresql://localhost/britta</connection-url>
        <driver-class>org.postgresql.Driver</driver-class>
        <driver>postgresql-9.1-901-1.jdbc4.jar</driver>
        <security>
            <user-name>postgres</user-name>
            <password>postgres</password>
        </security>
        <validation>
            <validate-on-match>false</validate-on-match>
            <background-validation>false</background-validation>
        </validation>
        <statement>
            <share-prepared-statements>false</share-prepared-statements>
        </statement>
    </datasource>
{% endhighlight %}

###Authentication
This is essential if you need *User* concept in your application.

{% highlight xml %}
    <security-domain name="my-security">
        <authentication>
            <login-module code="org.jboss.security.auth.spi.DatabaseServerLoginModule" flag="required">
                <module-option name="dsJndiName" value="java:jboss/myAuthDS"/>
                <module-option name="principalsQuery" value="select password from users where name=?"/>
                <module-option name="rolesQuery" value="select role,'Roles' from user_roles where name=?"/>
            </login-module>
        </authentication>
    </security-domain>
{% endhighlight %}

To use it you will have to create tables like these:

{% highlight sql %}
    create table users(
      name varchar(50) primary key,
      password varchar(255)
    );
    create table user_roles(
      name varchar(50),
      role varchar(50),
      foreign key (name) references users(name)
    );
{% endhighlight %}

Of cource you can do a single table and rewrite queries. It's flexible in JBoss.

###Email settings
