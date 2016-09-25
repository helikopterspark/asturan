(function($) {

    $.fn.addGallery = function() {
        // Gallery
        function buildHTML() {
            var gallery_container = {
                'margin': 'auto',
                'padding': '10px',
                'margin-bottom': '22px',
                'text-align': 'center',
                'width': '85%',
                'height': '700px',
                'background-color': '#333333',
                '-moz-box-shadow': 'inset 0 0 30px 20px #000',
                '-webkit-box-shadow': 'inset 0 0 30px 20px #000',
                'box-shadow': 'inset 0 0 30px 20px #000',
                'border-radius': '20px'
            };

            var big_img = {
                'position': 'relative',
                'top': '15px',
                'left': 0,
                'margin': 'auto',
                'padding': '10px',
                'padding-top': '15px',
                'height': '70%'
            };

            var img_array = {
                'width': '580px',
                'margin': '0 auto',
                'position': 'relative',
                'top': '15px'
            };
            $('#lightbox-gallery-container').append('<div id="gallery_container"><div id="big_img"></div><div id="img_array"></div></div>');
            $('#gallery_container').css(gallery_container);
            $('#big_img').css(big_img);
            $('#img_array').css(img_array);
        }

        function listThumbnails() {
            var big_img_img = {
                'width': 'auto',
                'height': '100%',
                'margin': 'auto',
                'border': '1px solid #000',
                'box-shadow': '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'
            };
            var img_array_img = {
                'float': 'left',
                'border': '1px solid #000',
                'margin': '5px',
                'width': '60px',
                'height': '60px',
                'box-shadow': '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'
            }
            var i, img, images = '';
            if ($("#lightbox-gallery-container").length) {
                images = $("#lightbox-gallery-container").data('images').split(",");
            }
            for (i = 0; i < images.length; i++) {
                if (images[i]) {
                    img = new Image();
                    img.src = images[i];
                    $("#img_array").append(img);
                }
            }
            $('#img_array img').css(img_array_img);
            img = new Image();
            $('#big_img').append(img);
            $('#big_img img').css(big_img_img);
        }

        // select first thumbnail as large image
        function displayFirst() {
            $("#img_array img").first().trigger("click");
        }

        buildHTML();
        listThumbnails();

        // select large image
        $("#img_array img").click(function(event) {
            $( "img" ).each(function() {
                $(this).css('border-color', 'black');
            });
            $(this).css('border-color', 'white');
            $('#big_img img')
            .attr('src', $(this).attr('src'));
            return false;
        });

        // hover over thumbnail
        $("#img_array img").hover(
            function() {
                $(this).css('border-color', 'red');
            },
            function() {
                if ($(this).attr('src') === $('#big_img img').attr('src')) {
                    $(this).css('border-color', 'white');
                } else {
                    $(this).css('border-color', 'black');
                }
            }
        );

        // open lightbox for large image
        $("#big_img img").click(function(event) {
            $(this).addLightbox();
        });

        displayFirst();
    }

    // Lightbox
    $.fn.addLightbox = function() {
        // Based on the lightbox example in the book jQuery - from novice to ninja
        function positionLightboxImage() {
            var top = ($(window).height() - $('#lightbox_container').height()) / 2;
            var left = ($(window).width() - $('#lightbox_container').width()) / 2;
            $('#lightbox_container')
            .css({
                'position': 'fixed',
                'top': top,
                'left': left,
                'background-color': '#282828',
                'padding': '15px',
                'border-radius': '10px',
                'z-index': 10
            })
            .fadeIn();
        }

        function removeLightbox() {
            $('body').off("mousewheel", false); // enable mousewheel scrolling
            $('#lightbox_overlay, #lightbox_container')
            .fadeOut('fast', function() {
                $(this).remove();
                $('body').css('overflow-y', 'auto'); // show scrollbars!
            });
        }

        $(document).keyup(function(e) {
            if (e.keyCode == 27) removeLightbox();   // esc
        });

        $('body').css({'overflow-y': 'hidden'}); // hide scrollbars!
        $("body").on("mousewheel", false);  // disable mousewheel scrolling

        $('<div id="lightbox_overlay"></div>')
        .css({'top': $(document).scrollTop()})
        .css({'position': 'absolute',
        'left': 0,
        'height': '100%',
        'width': '100%',
        'background': 'black no-repeat scroll center center'
    })


    .css({'opacity': '0'})
    .animate({'opacity': '0.5'}, 'slow')
    .appendTo('body');

    $('<div id="lightbox_container"></div>')
    .hide()
    .appendTo('body');

    $('<img id="lb_image">')
    .attr('src', $(this).attr('src'))
    .css({'max-width': '100%', 'max-height': 'auto'})
    .load(function() {
        positionLightboxImage();
    })
    .click(function() {
        removeLightbox();
    })
    .appendTo('#lightbox_container');

}

})(jQuery);
