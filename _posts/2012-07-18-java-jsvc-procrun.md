---
layout: post
title:  "Запуск Java-приложений как сервисов различных ОС"
date:   2012-07-18 23:12:00
categories: java service procrun jsvc hsqldb
---

##Вступительная графомания
Представьте себе такую ситуацию. Вы купец на древнем востоке и однажды вздумали себе купить раба. Приходите, значит, на невольничий рынок, подходите к ближайшему помосту на котором как раз самый большой выбор этого товара, показываете пальцем на приглянувшегося раба и спрашиваете у работорговца о цене. Тут возможны варианты, но в нашем случае работорговец говорит вам, что раб собственно бесплатен. То есть абсолютно бесплатен. Серьезно! Просто забирай, уводи и даже пивом работорговца поить не надо. Вы, ошарашенный таким заявлением, осведомляетесь, а в чем же, собственно, загвоздка? Экий вы недоверчивый! После обильного возлияния за ваш счет торгаш, наконец, колется, мол, раб-то не из местных, ни хрена по-нашему, по-древневосточному не шпрехает. И, хотя силен и производителен зело, но делать будет то, что ему захочется, ибо объяснить ему, что он должен делать, нет никакой возможности. Но вы так падки на халяву, что решаете: хрен с ним, как-нибудь найду с рабом общий язык. Получив здоровяка во владение, вы в течение года пытаетесь научить его своему языку или, на худой конец запомнить пару-другую слов его наречия. Согласно закону жанра, у вас ничего не выходит. А раб между тем все ест да ест. За ваш, между прочим, счет. Посовещавшись с соседями, вы решаетесь на последний решительный и вполне идиотский шаг: послать своего сына в страну происхождения этого бездельника. Пусть попутешествует, давно уже нудит по этому поводу. Заодно и польза от его странствий будет. Он молод и быстро выучит чужой язык. Проходит ещё пара лет, сын возвращается и... О, чудо! Действительно, теперь он знает язык раба и после нескольких лет халявы, раб начинает трудиться на благо господина под присмотром его сына. В реальной ситуации раб, скорее всего, попытался бы свалить по-тихому, раз уж халява кончилась. Но я тут провожу параллель(хоть и не вполне корректную) с определенной программистской задачей, так что положим, что он начал таки работать не покладая рук.

##Часть первая, виндовая
Эта мутная аналогия была скучной частью статьи, а теперь приступим к занимательной. Есть в природе такие процессы, написанные на Java, которые не очень хочется показывать пользователю. Например, известная в кругах джавашников [HSQLDB](http://hsqldb.org/) с одной стороны, конечно, встраиваемая БД, но  с другой вполне запускается как сервер, вешается на порт c номером более 9000 и слушает, не затребует ли её кто. И всё бы ничего, если б не две несомненные фигни. Фигня первая, простая: сервер открывает окно стандартного вывода с логом прямо на экран, что не особо надо на машине конечного пользователя. Фигня вторая, посложнее: хотелось бы нашему брату-программисту чтобы оно не просто запускалось при старте, но и управлялось при желании пользователя стандартными средствами операционки. Если кто не в курсе, чтобы заглушить сервер корректно надо подключиться к нему клиентом и выполнить комманду "SHUTDOWN". Не очень удобно даже при наличии вспомогательного скрипта.
Итак, задача ясна. За дело! Открываем известный могильничек разного опен-сорца: [ASF](http://commons.apache.org/daemon/). Проект [Apache Commons Daemon](http://commons.apache.org/daemon/) позволяет организовывать общение между средствами контроля служб, представляемыми ОС, и тем инструментарием, который имеется в наличии нашей подопытной.
Текущая задача организовать службу Windows, поэтому обратим наш взор  на [Procrun](http://commons.apache.org/daemon/procrun.html). В архиве из раздела загрузок есть да главных для нас файла: __prunsrv.exe__ и __prunmgr.exe__. Первый это тот самый файл, обеспечивающий интеграцию со средствами ОС, а второй - несложная утилита управления.
Для того чтобы наш Java-сервис работал с этим инструментарием прежде всего надо написать wrapper реализующий определенный интерфейс. И сразу же поправка: не вполне определенный. Дело в том что в качестве параметров __prunsrv.exe__ принимает в том числе классы и методы для старта и остановки службы. Мы не будем усложнять задачу и обойдемся одним классом. Назначение методов __start__ и __stop__ очевидно. Дальше - особенности: метод __serviceStart__ запускается, делает полезную работу и засыпает. Именно так демон следит за исполнением процесса под ОС Windows - проверяет, запущен ли метод переданный ему в качестве метода старта. Периодически метод просыпается, чтобы проверить состояние процесса HSQLDB представленного классом __Server__. Если состояние равно 16( SHUTDOWN), то нет смысла засыпать снова и метод завершается. Собственно остановка происходит в методе __serviceStop__, который останавливает HSQLDB и оповещает об этом собственный экземпляр. Метод __windowsService__ упрощает работу с классом убирая необходимость вызывать разные методы. Ни разу не сложно... 

    {% highlight java %}
    package esc.service;
    
    import org.hsqldb.persist.HsqlProperties;
    import org.hsqldb.server.Server;
    
    public class HsqldbWrapper {
    
        private static Server srv = null;
        private static HsqldbWrapper wrapperInstance = new HsqldbWrapper();
    
        public static void windowsService(String args[]) {
            String cmd = "start";
            if (args.length 0){
                cmd = args[0];
            }
    
            if ("start".equals(cmd)) {
                wrapperInstance.serviceStart();
            } else {
                wrapperInstance.serviceStop();
            }
        }
    
        public void serviceStart() {
            start();
            synchronized (this) {
                while (srv.getState() != 16) {
                    try {
                        this.wait(60000);
                    } catch (Throwable t) {
                        t.printStackTrace();
                    }
                    System.out.println("Server is running " + srv.getState());
                }
            }
        }
    
        public void serviceStop() {
            stop();
            synchronized (this) {
                this.notify();
            }
        }
    
        public static void start() {
            if (srv == null) {
                System.out.println("Creating new server");
                srv = new Server();
                System.out.println("Setting start properties");
    
                String databaseString = System.getProperty("hsqlsrv.path");
                if (databaseString == null) {
                    databaseString = "file:./db/database";
                } else {
                    databaseString = "file:" + databaseString + "\\db\\database";
                }
                String[] params = {"-database.0", databaseString, "-dbname.0", "database", "-shutdownarg", "COMPACT"};
                HsqlProperties props = HsqlProperties.argArrayToProps(params, "server");
                try {
                    srv.setProperties(props);
                } catch (Throwable t) {
                    t.printStackTrace();
                }
                srv.setSilent(false);
                System.out.println("Starting server");
                srv.start();
                System.out.println("Started Successfully!"); 
            }
        }
    
        public static void stop() {
            System.out.println("Stopping server");
            if (srv != null) {
                srv.stop();
                srv.shutdown();
            }
        }
    }
    {% endhighlight %}

И вот теперь, когда наше чадо уже сотворено, знает язык раба и готово его погонять, приходит пора дать задание, а именно запускать службу. Делается это настоящим путем - через командную строку и кучу параметров. Для того чтобы легко находить в списке процессов нашу службу, мы переименуем __prunsrv.exe__ в более понятный __HSQLDBSrv.exe__. У меня вышла вот такая конструкция:


    {% highlight batch %}
    SET CURR_DIR=%~dp0
    cd %CURR_DIR%
    SET JAVA_HOME=%CURR_DIR%jre 
    @HSQLDBSrv.exe //IS//@HSQLDBService \
    --Description="HSQLDB Database Service" \
    --DisplayName="HSQLDB Service" \
    --Startup=auto \
    --Classpath="%CURR_DIR%lib\*" \
    --StartClass=esc.service.HsqldbWrapper \
    --StartMethod=windowsService \
    ++StartParams="start" \
    --StopClass=esc.service.HsqldbWrapper \
    --StopMethod=windowsService \
    ++StopParams="stop" \
    --StartMode=Jvm \
    --StartPath="%JAVA_HOME%bin" \
    --StopMode=Jvm \
    --StopPath="%JAVA_HOME%bin" \
    --LogLevel=Error \
    --StdOutput=auto \
    --StdError=auto \
    --LogPath="%CURR_DIR%log" \
    --Jvm="%CURR_DIR%jre\bin\client\jvm.dll" \
    ++JvmOptions="-Dhsqlsrv.path=%CURR_DIR%"
    {% endhighlight %}

Значение большинства параметров довольно очевидно. Не очевидный момент - использование двух плюсов для ключей, которые могут встречаться в командной строке несколько раз. Пояснение остальных легко найти на сайте демона. Обратите внимание на предпоследнюю строчку. Да, я ношу с собой JRE. Вынужденная мера в моем случае. В вашем достаточно просто вставить сюда реальный путь к вашей JRE или организовать подстановку пути, скажем, инсталлятором. Также интересен параметр "--DisplayName". Он не только указывает имя сервиса в оснастке Windows; об этом чуть далее...
Если все прошло нормально, то служба запустится сразу и начнет писать логи в папке установки( если вы конечно не сменили пути руками). Если что-то пошло не так или просто надо удалить службу, следующий скрипт показывает как.

    {% highlight batch %}
    echo off
    SET CURR_DIR=%~dp0
    cd %CURR_DIR%
    SET JAVA_HOME=%CURR_DIR%jre
    HSQLDBSrv.exe //DS//HSQLDBService
    {% endhighlight %}

Зачем нужна утилита __prunmgr.exe__? В этом месте надо воспеть гениальных программистов ASF, которые сделали утилитку несколько более полезной чем ожидалось. Дело в том, что она по-умолчанию управляет службой, именем которой( "--DisplayName", помните?) назван ее исполняемый файл. То есть если запустить ее просто так, она скорее всего выдаст ошибку, мол, служба не установлена. Но если переименовать exe-файл в "HSQLDB Service.exe", она запустится и покажет нам интерфейс управления, похожий на родной в консоли Windows, но с кучей специфических настроек. Интерфейс можно использовать для экспериментов, если не все с первого раза заработало удачно.  Как следствие этот файл можно переименовать в...Spooler! Или любую другую службу Windows и получить простой интерфейс для управления ею прямо из любого удобного вам места, например, с рабочего стола.

![prunmgr.exe](http://4.bp.blogspot.com/-2tshT7gDImI/UAb52F9HLsI/AAAAAAAAAEA/CRJgULAqfNU/s320/servicecontrol.png "prunmgr.exe")


##Часть вторая, ос-иксовая

Мы вступаем в зону боли миллионов хомячков, стремящихся оказаться в рядах тех самых семи процентов. Иначе говоря - в храм <b style="font-style: italic;">Святого Стива Джобса</b>. Где несомненно нагадим  в дароносицу.<br />
Реализация Apache Commons Daemon под OS X( и прочие Unix-like системы) отличается от реализации под Windows. Что и не удивительно. Первое отличие - отдельный демон <a href="http://commons.apache.org/daemon/jsvc.html">__jsvc__</a>. Второе отличие: реализация обертки требует соблюдения конкретного интерфейса __org.apache.commons.daemon.Daemon__, а ,следовательно, кроме бинарного файла нам потребуется иметь под рукой jar-файл __commons-daemon.jar__ совместимой версии. Код реализации также претерпевает изменения: все методы делают свои дела и уходят, нет ждущего метода. Ну что-же, нам же проще! Если не считать ручной сборки бинарника, хотя может они и лежат где-то готовые... Мне искать было лень. Реализация обертки получилась примерно такая:

    {% highlight java %}
    package esc.service;
    import java.io.File;
    import org.apache.commons.daemon.Daemon;
    import org.apache.commons.daemon.DaemonContext;
    import org.apache.commons.daemon.DaemonInitException;
    import org.hsqldb.persist.HsqlProperties;
    import org.hsqldb.server.Server;
    
    public class DaemonMac implements Daemon {
     
     private static Server srv =null;
     private final static String dbPath = "/Library/HSQLDBServer/db/database";
     
     @Override
     public void destroy() {
      srv = null;
      
     }
    
     @Override
     public void init(DaemonContext arg0) throws DaemonInitException, Exception {
      if (srv==null)
      {
       System.out.println("Creating new server");
       srv=new Server();
       System.out.println("Setting start properties");
       
       String databaseString=System.getProperty("hsqlsrv.path");
       if(databaseString==null) databaseString="file:"+dbPath;
       else databaseString = "file:"+ databaseString +File.separator+"db"+File.separator+"database";
       String[] params={"-database.0",databaseString,"-dbname.0","mydatabase","-shutdownarg","COMPACT"};
       HsqlProperties props = HsqlProperties.argArrayToProps(params, "server"); 
       try{
       srv.setProperties(props);
       }catch (Throwable t){t.printStackTrace();}
       srv.setSilent(false);
       System.out.println("Starting server");
      }
    
     }
    
     @Override
     public void start() throws Exception {
      if (srv!=null)
      {
       srv.start();
       System.out.println("Started Successfully!"); 
      }
     }
    
     @Override
     public void stop() throws Exception {
      if (srv!=null){
       srv.stop();
       srv.shutdown();
      }
     }
    }
    {% endhighlight %}

На этом этапе на ум приходит фраза "блеск и нищета OpenSource". Ведь мы сейчас будем устанавливать службу! __jsvc__ имеет параметры командной строки "-install", "-remove", "-service", но покопавшись в коде можно обнаружить, что они не используются. Одно из двух: либо лень одолела и ASF не стали реализовывать эту функциональность, либо особенности разных Unix-систем таковы, что невозможно написать единую реализацию. Я лично склоняюсь к первому варианту. Сужу по себе, как же ещё!
Из сказанного выше следует, что мы будем использовать характерный для нашей системы способ запуска службы. В OS X службами управляет система инициализации Launchd. В качестве языка описания параметров сервисов она использует plist-файлы, представляющие из себя богомерзкий XML. Который к тому же должен быть валидным. Для редактирования plist-файлов я бы посоветовал бесплатный редактор, но не помню его названия, а поэтому рекомендую <a href="http://www.sublimetext.com/">SublimeText2</a> в качестве альтернативы. Tакой __plist__ получился у меня:


    {% highlight html %}
    <plist version="1.0">
    <dict>
     <key>KeepAlive</key>
     <false>
     <key>Label</key>
     <string>hsqldbserver</string>
     <key>OnDemand</key>
     <true>
     <key>ProgramArguments</key>
     <array>
      <string>/opt/HSQLDBServer/HSQLDBServer</string>
      <string>-server</string>
      <string>-outfile</string>
      <string>/opt/HSQLDBServer/out.txt</string>
      <string>-errfile</string>
      <string>/opt/HSQLDBServer/err.txt</string>
      <string>-verbose</string>
      <string>-debug</string>
      <string>-nodetach</string>
      <string>-home</string>
      <string>/System/Library/Frameworks/JavaVM.framework/Home</string>
      <string>-cp</string>
      <string>/opt/HSQLDBServer/lib/hsqldb.jar:/opt/HSQLDBServer/lib/hsqldb-wrapper.jar:/opt/HSQLDBServer/lib/commons-daemon.jar</string>
      <string>esc.service.DaemonMac</string>
     </array>
     <key>RunAtLoad</key>
     <true>
     <key>StandardErrorPath</key>
     <string>/opt/HSQLDBServer/stderr.log</string>
     <key>StandardOutPath</key>
     <string>/opt/HSQLDBServer/stdout.log</string>
     <key>WorkingDirectory</key>
     <string>/opt/HSQLDBServer</string>
    </dict>
    </plist>
    {% endhighlight %}

Важные грабли, на которые мне довелось наступить: опция __jsvc__ "-nodetach" обязательна, иначе __Launchd__ не сможет контролировать службу после старта и придется её убивать; ключ "OnDemand" означает, что службу можно остановить, иначе при  попытке остановить службу она будет перезапускаться.
Устанавливается и удаляется демон __Launchd__ следующими командами:


{% highlight bash %}
#!/bin/bash
sudo launchctl load /Library/LaunchDaemons/hsqldbserver.plist
{% endhighlight %}

    {% highlight bash %}
    #!/bin/bash
    sudo launchctl unload /Library/LaunchDaemons/hsqldbserver.plist
    {% endhighlight %}

Команда "sudo" здесь также обязательна, иначе будет установлен так называемый LaunchAgent - пользовательская служба, работающая только когда пользователь залогинен. 


В заключение хочется сказать, что я в глубоком расстройстве от того, сколько времени заняло у меня написание этой заметки. Буквально, месяцы. Вот хоть сейчас же иди на мотивационный тренинг...