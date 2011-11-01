$(function () {
    var socket = io.connect();
    var color = Math.floor(Math.random() * 0xFFFFFF).toString(16);
    while (color.length < 6) {
        color = '0' + color;
    }

    socket.on('change', function (data) {
        if (data) {
            $('#' + data.id).css('background-color', '#' + data.color);
        }
        var favicon = $('#favicon');
        favicon.remove();
        favicon.attr({ href: '/favicon?' + new Date().getTime() });
        $('head').prepend(favicon);
    });

    // mouse
    (function () {
        var mouse = false;
        var colorToHex = function (color) {
            if (color.substr(0, 1) === '#') {
                return color;
            }
            var digits = /rgb\((\d+), (\d+), (\d+)\)/.exec(color);
            var r = parseInt(digits[1], 10);
            var g = parseInt(digits[2], 10);
            var b = parseInt(digits[3], 10);
            var res = ((r << 16) | (g << 8) | b).toString(16);
            while (res.length < 6) {
                res = '0' + res;
            }
            return res;
        };
        var changeColor = function (id, color) {
            var div = $('#' + id);
            if (color !== colorToHex(div.css('background-color'))) {
                div.css('background-color', '#' + color);
                socket.json.emit('change', {
                    id: id,
                    color: color
                });
            }
        };
        $('.cell').mousemove(function () {
            if (mouse) {
                changeColor($(this).attr('id'), color);
            }
        }).click(function () {
            changeColor($(this).attr('id'), color);
        });
        $(document).mousedown(function () {
            mouse = true;
        });
        $(document).mouseup(function () {
            mouse = false;
        });
    }());

    // color
    $('#color').change(function () {
        color = this.color.toString();
    });
    $('#color').val(color);
});
