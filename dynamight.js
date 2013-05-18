(function() {
  if (typeof module === "undefined") self.dyna = dyna;
  else module.exports = dyna;
  dyna.version = "0.5";

  var slice = [].slice;

  function dyna(config)
  {
    var queue = {},
        tasks = [],
        started = 0,
        active = 0,
        remaining = 0,
        popping,
        error = null,
        await = nop,
        closed = false;

    dyna.results = [];
    dyna.pending = 0;
    dyna.thens = [];
    dyna.thensOffset = 0;

    if (!config) config = {};

    if (!config.parallelism) config.parallelism = Infinity;

    if (!config.container) config.container = 'body';

    if (!config.route) config.route = false;

    dyna.now = function()
    {
      if (closed)
        return dyna;

      if (arguments.length == 0)
        return undefined;

      if (!error)
      {
        tasks.push(arguments);
        ++remaining;
        pop();
      }
      else
        console.log('Dyna Error: 1.0');
      
      return dyna;
    };

    dyna.then = function(f)
    {
      if ((!dyna.remaining && !dyna.pending && dyna.results.length === 0) ||
         (f.length > dyna.results.length))
        return undefined;

      dyna.thens.push({last: (dyna.results.length - 1 - dyna.thensOffset), then: f});
      dyna.thensOffset += f.length - 1;

      return dyna;
    };

    dyna.finished = function(f)
    {
      if (!dyna.remaining && !dyna.pending && dyna.results.length === 0) return undefined;

      closed = true;
      await = f ? f : function(){return;};

      if (!remaining && !dyna.pending)
        notify();
      
      return dyna;
    };

    dyna.ajax = function(config)
    {
      ++dyna.pending;
      if (config.type === undefined)
        config.type = 'GET';
      if (config.url === undefined)
      {
        console.log('Dyna Error: 2.1');
        return dyna;
      }
      if (config.data === undefined)
        config.data = null;

      dyna.now(doAjax, tasks.length, config.type, config.url, config.data, config.before, config.after);

      return dyna;
    };

    dyna.view = function(relative, target, empty, before)
    {
      dyna.now(doAjax, tasks.length, 'GET', ('/' + relative), null, undefined, function(r)
        {
          if (!target)
            target = config.container;

          // jQuery selector compatibility
          if (target[0] !== undefined)
            target = target[0];

          if (before)
            before(target);

          if (empty)
            target.innerHTML = '';

          target.innerHTML += r.responseText;
          --dyna.pending;
        }, dyna.view);

      return dyna;
    };

    dyna.code = function(relative)
    {
      dyna.now(doAjax, tasks.length, 'GET', relative, null, undefined, function(r)
        {
          var newScript = document.createElement('script');
          var relativeParts = relative.split('.js');
          var fileParts = relativeParts[relativeParts.length - 2].split('/');
          
          newScript.setAttribute('id', ('dyna-' + fileParts[fileParts.length - 1].replace('.', '-')));
          newScript.innerHTML = r.responseText;
          document.body.appendChild(newScript);
          --dyna.pending;
        }, null);

      return dyna;
    };

    dyna.navigateTo = function(endpoint)
    {
      for (var i in config.views)
      {
        if (i === endpoint.split('?')[0])
        {
          dyna.view(config.views[i].view, config.container, true);
          if (config.views[i].code) dyna.code(config.views[i].code);

          history.pushState(null, endpoint, '/' + endpoint);
          return;
        }
      }

      if (config.views['404'] !== null)
        dyna.navigateTo('404');
      else
        console.log('Dyna Error: 1.0');
    };

    function doAjax(index, type, url, data, before, after, context)
    {
      var request;
      if (window.XMLHttpRequest)
        request = new XMLHttpRequest();
      else
        request = new ActiveXObject("Microsoft.XMLHTTP");

      request.onreadystatechange = function()
      {
        if (request.readyState === 4)
        {
          request.onreadystatechange = undefined;

          --dyna.pending;

          if (after)
            after.call(context, request, index);

          if (!remaining && !dyna.pending)
            dyna.finished(await);
        }
      };

      request.open(type, url, true);

      if (before)
        before(request);
      
      request.send(data);

      return url;
    }

    function pop()
    {
      while (popping = started < tasks.length && active < config.parallelism)
      {
        var i = started++,
            t = tasks[i],
            a = slice.call(t, 1);

        a.push(callback(i));
        ++active;
        dyna.results.push(t[0].apply(null, a));

        remaining--;
      }
    }

    function callback(i)
    {
      return function(e, r)
      {
        --active;

        if (error !== null)
          return;

        if (e !== null)
        {
          error = e;
          started = remaining = NaN;
          notify();
        } 

        else
        {
          tasks[i] = r;
          if (--remaining)
            popping || pop();
          else 
            notify();
        }
      };
    }

    function handleThens()
    {
      for (var i in dyna.thens)
      {
        if ((dyna.thens[i].last + 1) - dyna.thens[i].then.length < 0)
        {
          thenError30();
          return;
        }

        var argsArray = [];
        for (var arg = dyna.thens[i].then.length - 1; arg >= 0; arg--)
          argsArray.push(dyna.results[dyna.thens[i].last - arg]);

        dyna.results.splice( (dyna.thens[i].last - dyna.thens[i].then.length + 1), 
                             dyna.thens[i].then.length,
                             dyna.thens[i].then.apply(null, argsArray));
      }
    }
    function thenError30(){console.log('Dyna Error: 3.0');}

    function notify()
    {
      if (dyna.pending)
        return;

      if (dyna.thens.length)
         handleThens();

      if (error !== null)
        await(error);
      else
        await.apply(null, [error, dyna.results]);
    }

    if (config.route)
    {
      var domain = window.location.href.split('/')[2];
      var domainIndex = document.location.href.indexOf(domain);
      var autoroute = document.location.href.substring(domainIndex + domain.length + 1);
      dyna.navigateTo(autoroute);
    }

    return dyna;
  }

  function nop() {}
})();