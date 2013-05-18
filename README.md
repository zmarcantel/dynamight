dynamight
===============

Lightweight Async Tasking, View/Code loading, and Routing library for dynamic applications.

__Use it in the DOM. Use it in NodeJS.__

Version `0.1.0` Goals:
  1. Automated DOM Testing
  2. XMLHttpRequest2
  3. Clean Up Documentation

[Designing Modular Websites](#design-implications)

About
===============
Dynamight at its core is an asynchronous tasking library.

The library removes nested callbacks from the syntax as well as suggesting build patterns. Escape the spaghetti of callbacks and nesting functions as arguments. Developers think linearly and assume things finish before the next step. Wouldn't it be great if we could write code the same way? Now we can.

What this turns into, however, is an excellent way to build websites that refuse to download everything upfront.

Mitigating bandwidth will cut server costs and make your website oh so snappy.

How
===============
Check out the [exposed functions](#functions) to see what all is available.

Now, how can this library claim any of these benefits?

To understand how, you first have to understand the [router](#routing) and the general [design implications](#design-implications) of Dynamight.

Once you do, you'll see that a natural modularity evolves that removes the up front cost of serving a website. User Experience becomes much smoother by developing a tree of dependencies and "fooling" the user into thinking the website is loaded while it actually loads (for a second or two tops).

Design Implications
===============
Only being able to load one file per type (javascript/html) automatically via the [router](#routing) is Dynamight's `defining` design suggestion. This method implies, almost requires, that a page is a `module` that references dependencies, not large chunks of code and html that may or may not be run or even seen.

We must follow two rules for this to be effective:
  1. The view contains all the html that must be `immediately` displayed.
  2. The code contains a module as described below, and is intelligent in its dynamic loading.

__Module Suggestion__

    var global_var;

    // this is automatically run, and no variables are global
    (function(){
      var local_to_module;

      dyna()     // automatically appends to <body>
        .code('js/lib/helper.js')
        .code('js/your.api.js')
        .view('views/page.modal.vw')
        .now(doSomethingOnceAvailable)
        .now(doSomethingElse)
        .then(waitForChanges)
        .finished(cleanUp);

      use.other().code().here[too];
    })();

By doing this, we load all the information that is `mandatory` to make the user `think` the page has fully loaded. In the two seconds it takes the user to realize the page has loaded and then make an action, you can guarantee the page will be responsive without a lot of lag up front.

Routing
===============
With the built in routing function, just pass in a simple structure, and Dynamight will dynamically download `only` the html and javascript you require for that page.

Notice the `404`

    dyna({
        views: {
          ''               : {view: 'views/home.vw'},
          'signup'         : {view: 'views/signup.vw', code: 'js/signup.js'},
          'profile/edit'   : {view: 'views/verify.vw', code: 'js/profile/edit.js'},
          '404'            : {view: 'views/404.vw'}
        }
      })

The above shows the structure of views in the configuration process. Below is a strict layout for it in expressive JSON.

    url : {
      view: 'relative/url/to/html/file',
      code: 'relative/url/to/js/file'
    }

Functions
===============

  * Async Functions
    * [now()](#now)
    * [then()](#then)
    * [finished()](#finished)
  * DOM Functions
    * [view()](#view)
    * [code()](#code)
    * [navigateTo()](#navigateTo)

### .now()

`.now(function, comma, separated, arguments)`

Accepts a function as its first and only `mandatory` argument. Arguments to the function are passed as subsequent arguments to the .now() call.

    dyna().now(function(){ return 5; })
         .now(noArgumentFunction)
         .now(oneArgumentFunction, one)
         .now(twoArgumentFunction, one, two)
         .now(function(a, b){
            return a + b;
          }, 2, 3);

### .then()

`.then(function)`

Accepts a function of `n` arguments. These arguments are pulled from preceding [.now()](#now) call results.

    dyna().now(returnSeven)      // MANDATORY preceding .now()
         .then(subtract3)       // modified results list!
         .now(returnEight)      // results = [ 4, 8 ]
         .then(addTwo)          // removes arguments, places result
         .now(printResults)     // prints out [ 12 ]

### .finished()

`.finished(function(errors, results))`

Passes any errors and results (so far) to the given function

    dyna().now(returnSeven)      // MANDATORY preceding .now()
         .finished()            // closure not mandatory

    dyna().now(returnSeven)      // MANDATORY preceding .now()
         .finished(function(e,r){
            if (e)
              handle(e);

            return ((r[0] + r[1]) / r[3]);
          })

### .view()

`.view(path)`

Retrieve html and insert it into a given parent element

    // jQuery selector OR vanilla
    dyna({container: $(selector)})
      .view('relative/path/to/file')

The contents will be `appended` to the container with no modification

### .code()

`.code(path)`

Dynamically download and insert any type of code that the browser is capable of running (although this will typically be javascript). For security reasons, this function is limited to files served from the origin domain and CDN's that support CORS.

    dyna()
      .code('relative/path/to/file.js');

The above code would append the contents of the file into a script tag as follows:
    <script id="dyna-file">{{contents}}</script>

The naming of the script tag is as follows
    
    1. Remove path info
    2. Remove '.js'
    3. Prepend 'dyna-'

    ex. jquery-2.0.0.js
        -> (dyna-) + jquery-2.0.0 | .js
    id = dyna-jquery-2.0.0


### .navigateTo()

`.navigateTo(url_string)`

Call upon the [router](#routing) to navigate to a given url relative to the top domain.

    var v = dyna(config);

    if (something)
      v.navigateTo('home');
    else
      v.navigateTo('profile/edit');