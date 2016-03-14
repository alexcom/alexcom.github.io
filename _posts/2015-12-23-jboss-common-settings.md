---
layout: post
title:  "Common JBoss standalone.xml snippets"
date:   2015-12-23 00:00:00 
categories: java JEE JPA 
---

## Just
to remind myself about some often used features of JBoss application server( version 7 in particular) I'll collect here some of the snippets I use all the time in almost each and every application.


### Datasource configuration

The first and main snippet is the DataSource. Everyone knows how to set it up, so I won't explain it in detail. In particular you'll have to google how to add jdbc driver :-).

```xml
<datasource jta="false" jndi-name="java:jboss/myDS" pool-name="myPool" enabled="true" use-ccm="false">
    <connection-url>jdbc:postgresql://localhost/myDB</connection-url>
    <driver-class>org.postgresql.Driver</driver-class>
    <driver>postgresql</driver>
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
```

### Authentication
This is essential if you need *User* concept in your application.

```xml
<security-domain name="my-security">
    <authentication>
        <login-module code="org.jboss.security.auth.spi.DatabaseServerLoginModule" flag="required">
            <module-option name="dsJndiName" value="java:jboss/myDS"/>
            <module-option name="principalsQuery" value="select password from users where name=?"/>
            <module-option name="rolesQuery" value="select role,'Roles' from user_roles where name=?"/>
        </login-module>
    </authentication>
</security-domain>
```

To use it you will have to create tables like these:

```sql
create table users(
  name varchar(50) primary key,
  password varchar(255)
);
create table user_roles(
  name varchar(50),
  role varchar(50),
  foreign key (name) references users(name)
);
```

Of cource you can do a single table and rewrite queries if you need single role. It's flexible in JBoss.

### Email settings

I use SMTP via GMail, so here's how to configure it.
First, define the outbound socket like this:

```xml
<outbound-socket-binding name="mail-gmail" source-port="0" fixed-source-port="false">
    <remote-destination host="smtp.googlemail.com" port="465"/>
</outbound-socket-binding>
```

Then just add a mail session configuration.

```xml
<mail-session jndi-name="java:jboss/mail/mymail">
    <smtp-server ssl="true" outbound-socket-binding-ref="mail-gmail">
        <login name="myemail@gmail.com" password="mypassword"/>
    </smtp-server>
</mail-session>
```

