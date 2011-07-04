Concoct : CoffeeScript, Less-css, Haml and RequireJS compiler for the Java world
================================================================================

Concoct your web-app with [HAML](http://haml-lang.com/), [CoffeeScript](http://jashkenas.github.com/coffee-script/), [Less-Css](http://lesscss.org/) and [RequireJS](http://requirejs.org/) in your Java world.


Concept
-------

The whole idea is to provide a simple way to use JavaScript compiler (less, haml, coffee-script, requireJs) for Java projects (based on Rhino).

Each compiler is independant and is easy to use.

For exemple, if you want to compile a require-js file, all you need to do is : 

  - import the concoct jar from maven
  - call this simple lines of code : 

    import org.filirom1.concoct.requireJs.*;
    
    String compiledJs = new RequireJsCompiler().compile(new File("/home/romain/require-js-project/app.js"));


For less, haml, and coffescript it is very simple too. Look at the tests in the sources to see real-life exemple.


Actually there is no maven-plugin, ant-plugin, gradle-plugin, grails-plugin, buildr-plugin, sbt-plugin,... using this library. Because there is a lot of build tools, this is up to you to create your own, but there will be no problem for you I think, because I tried to keep this library as simple as possible.

Shortly I will do the grails, and the maven plugin because I need it, keep tuned.



How to import using Maven
-------------------------

The library is not yet on maven central. I am waiting for some feedback before releasing a 1.0 version under maven-central.

So, if you are a maven user edit your pom.xml : 

    <dependencies>
    ...
        <dependency>
            <groupId>org.filirom1</groupId>
            <artifactId>concoct-require-js</artifactId>
            <version>0.1</version>
            <type>jar</type>
        </dependency>
    ...
    </dependencies>

    <repositories>
        <repository>
            <id>filirom1-repo</id>
            <url>https://Filirom1@github.com/Filirom1/filirom1-mvn-repo/raw/master/releases</url>
        </repository>
        <repository>
            <id>maven-restlet</id>
            <url>http://maven.restlet.org</url>
        </repository>
    </repositories>



All the compilers
-----------------

You have the choice to import : 

    <artifactId>concoct-require-js</artifactId>
    <artifactId>concoct-coffee-script</artifactId>
    <artifactId>concoct-haml</artifactId>
    <artifactId>concoct-less</artifactId> 


A groovy grape exemple
----------------------

If you have grovvy installed on your machine, you can test the compiler very easily with a groovy script : 

    @GrabResolver(name = 'filirom1', root = 'https://Filirom1@github.com/Filirom1/filirom1-mvn-repo/raw/master/releases')
    @Grab(group = 'org.filirom1', module = 'concoct-require-js', version = '0.1')

    import org.filirom1.concoct.requireJs.*;

    println new RequireJsCompiler().compile(new File("/home/romain/require-js-project/app.js"));


How to contribute
-----------------

You want to create a markdown compiler in Java using the Javascript version,... or you anything else, just fork this project, code, make a test and ask for a pull-request.

I will be happy to add your contribution. Open Source rocks !!!!!


Licenses
--------
The code is under Apache2 licence : 

<http://www.apache.org/licenses/LICENSE-2.0.html>


Thanks to
---------

 - jakewins (Jacob Hansson) for its requirejs-maven project which inspired me a lot :
<https://github.com/jakewins/requirejs-maven>

 - Asual lesscss java compiler implementation which is included in this project :
<http://www.asual.com/lesscss/>

 - JCoffeeScript for its implementation which is included in this project :
<https://github.com/yeungda/jcoffeescript>