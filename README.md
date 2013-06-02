# $hell
jQuery plugin to create a limited interactive shell.

**alpha**

Basic usage:

```html
<html>
    <head>
        <link rel="stylesheet" href="$hell.css">
    </head>
    <body>
        <a class="shell-activator">Show shell</a>

        <script src="jquery.js"></script>
        <script src="$hell.js"></script>
        <script>
            $('body').$hell();
            $('a.shell-activator').on('click', function() { $('.shell').addClass('show').trigger('click'); });
        </script>
    </body>
</html>
```
