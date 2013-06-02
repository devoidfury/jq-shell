/* $hell
 *
 * $(el).$hell(opts);
 *
 * opts:
 * {
 *     prompt: '$ ',
 *     greeting: 'Welcome to $hell.<br><br>Use the "help" command to list available commands.<br>Press ESC or use exit command to exit.',
 *     unknown: "command '{{cmd}}' not found",
 *     commands: additional commands to expose, {}
 * }
 *
 * command format:
 * function(shell, args, cb) {
 *     // do something
 *     cb(return_code, output);
 * }
 * return_code: 0 for success, 1+ for failure
 *
 * */
(function ($) {
    'use strict';
    $.fn.$hell = function(opts) {
        this.length && this.each(function() {
            $(this).append(Shell(opts).$hell);
        });
        return this;
    };

    function Shell(opts) {
        if (!(this instanceof Shell)) return new Shell(opts);

        opts = opts || {};
        this.opts = $.extend({}, this.opts, opts);
        this.cmds = $.extend({}, opts.commands || {}, this.cmds);

        // commandments of bygone times
        this.chronicle = [];
        this.record = 0;

        this.$hell = $('<div class="shell"></div>');

        var self = this;
        this.$hell.on('click', function(e) {
            return self.set_sight();
        });
        this.$hell.on('keydown', function(e) {
            return self.preventDeletePrompt(e)
        });
        this.$hell.on('keyup', function(e) {
            return self.keyHandler(e);
        });

        this.$in = $('<input value="'+this.opts.prompt+'">');
        this.$hell.append(this.$in);

        this.inscribe(this.opts.greeting, true);
    }

    // default options
    Shell.prototype.opts = {
        prompt: '$ ',
        greeting: 'Welcome to $hell.<br><br>' +
            'Use the "help" command to list available commands.<br>' +
            'Press ESC or use exit command to exit.',
        unknown: "command '{{cmd}}' not found"
    };


    // for use in other commands
    Shell.prototype.helpers = {
        playAudio: function(text, vid_id) {
            var str = text + ' (stop command to kill)<iframe width="0" height="0" src="';
            str += 'https://www.youtube.com/embed/' + vid_id + '?autoplay=1&rel=0" frameborder="0" allowfullscreen></iframe>';
            return str;
        },
        keys: function(obj) {
            var keys = [];
            for (var key in obj) { keys.push(key); }
            return keys;
        }
    };

    // default commands
    Shell.prototype.cmds = {
        // print list of available commands
        help: function(shell, args, cb) {
            cb(0, '<a href="https://github.com/devoidfury/jq-shell">$hell</a> ' +
                '- available commands:<br>' + shell.helpers.keys(shell.cmds).join(' '))
        },
        clear: function(shell, args, cb) {
            shell.$hell.find('p').remove();
            cb(0);
        },
        stop: function(shell, args, cb) {
            shell.$hell.find('iframe').remove();
            cb(0, 'all audio/video stopped');
        },
        // exit $hell
        exit: function(shell) {
            shell.$in.val(shell.opts.prompt);
            shell.$hell.removeClass('show');
        }
    };

    /* write a line of output.
     *
     * line: text to write
     * safe: true if line should be written as html
     * code: indicates success/failure. success = 0, all other values are failure
     */
    Shell.prototype.inscribe = function inscribe(line, safe, code) {
        var $p = $('<p></p>')[safe ? 'html' : 'text'](line);

        if (typeof code !== 'undefined') $p.addClass(code === 0 ? 'green' : 'red');

        $p.insertBefore(this.$in);
        this.$hell.scrollTop(this.$hell[0].scrollHeight);
    };

    // focus the prompt
    Shell.prototype.set_sight = function (){
        var len = this.$in.val().length;

        this.$in.focus();
        this.$in[0].setSelectionRange ?
            this.$in[0].setSelectionRange(len, len) :
            this.$in.val(this.$in.val());
    };

    // don't allow user to delete prompt
    Shell.prototype.preventDeletePrompt = function(e) {
        return !(e.keyCode === 8 && this.$in.val().length <= this.opts.prompt.length);
    };

    Shell.prototype.keyHandler = function(e) {
        var val = this.$in.val(),
            self = this;

        // make sure prompt is always there
        if (val.indexOf(this.opts.prompt) !== 0) {
            this.$in.val(this.opts.prompt);
            return false;
        }

        switch (e.keyCode) {
            // exit on <ESC>
            case 27:
                return this.cmds.exit(this);

            // execute command on <enter>
            case 13:
                this.enforce(val, function(cmd, code, out) {
                    self.inscribe(cmd, false, code);

                    out && self.inscribe(out, true);
                    self.$in.val(self.opts.prompt);
                });
                break;

            // up arrow -- backwards
            case 38:
                if (this.record !== 0) {
                    this.$in.val(this.opts.prompt + this.chronicle[--this.record]);
                    this.set_sight();
                }
                break;

            // down arrow -- forwards
            case 40:
                if (this.record !== this.chronicle.length) {
                    this.$in.val(this.opts.prompt + (this.chronicle[++this.record] || ''));
                    this.set_sight();
                }
                break;
        }
    };

    // enforce a command
    Shell.prototype.enforce = function(cmd, cb) {
        var args = cmd.substring(this.opts.prompt.length, cmd.length - this.opts.prompt.length + 2).split(' ');
        args[0] && this.chronicle.push(args.join(' '));
        this.record = this.chronicle.length;

        args[0] ?
            typeof this.cmds[args[0]] === 'function' ?
                this.cmds[args[0]](this, args, function(code, out) {
                    cb(cmd, code, out);
                }) :
                cb(cmd, 1, this.opts.unknown.split('{{cmd}}').join(args[0])) :
            cb(cmd, 0);
    };
}(jQuery));
