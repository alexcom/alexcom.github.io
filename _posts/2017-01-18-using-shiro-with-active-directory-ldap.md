---
published: true
---
## Authentication and authorization are hard

That's why it's simply stupid to do them yourself.
As a relatively smart guy I use frameworks and libraries written by people smarter then I that invested massive amount of their time into that code. That guaranties code quality, right?..

On my job I get to work with [Apache Shiro][1]. After several attempts to use it's capabilities you often get to implementing something of your own. Like own Realm using NOSQL DBMS for users/password/roles or in my case I have just link it with Active Directory. "That's it?! AD integration comes out of the box with Shiro" - you say. Okay, I agree, there's some support. Example code to handle authentication is 6 lines. Plus exception handling. Nothing hard. Just like this:

```java
public static void main(String[] args) {
        try {
            IniSecurityManagerFactory factory = new IniSecurityManagerFactory("classpath:shiro.ini");
            SecurityManager instance = factory.getInstance();
            SecurityUtils.setSecurityManager(instance);
            UsernamePasswordToken token = new UsernamePasswordToken("Aleksandr Kravets", "dummypass");
            Subject subject = SecurityUtils.getSubject();
            subject.login(token);
            System.out.println("User authenticated Succesfully");
        } catch (Throwable t) {
            System.out.println(t.getMessage()+"\n"+t.getCause().getMessage());
        }
    }
```



[1]:https://shiro.apache.org
