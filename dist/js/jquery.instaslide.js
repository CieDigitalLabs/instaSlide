(function ($) {
    /* Instaslide plugin
     * @param {object} options - extends plugin
     */
    $.fn.instaSlide = function (options) {
        var defaults = {
            media: {
                images: [],
                video: []
            },
            contentAttrs: {
                class: "instaSlide-content"
            },
            sliderAttrs: {
                class: "instaSlide-slider owl-carousel"
            },
            wrapperAttrs: {
                id: "image-slider-",
                class: "reveal-modal instaSlide-modal"
            },
            wrapperCSS: {},
            owlOptions: {
                items: 1,
                autoHeight: true,
                navText: ["", ""],
                nav: true,
                video: true
            },
            onSliderShow: function () { }
        };

        var settings = $.extend(true, {}, defaults, options),
            $that = $(this),
            slider;

        /* Represents a slider
         * @constructor
         * @returns {obj} this
         */
        var Slider = function () {
            return this;
        };

        Slider.prototype = {
            /* Entry point
             * @param {object} media - Images and Video
             * @returns this
             */
            init: function (media) {
                this.media = media,
                this.modal = this._build(media);
                this._add(this.modal);
                this._setupSlider(this.modal)
                return this;
            },
            /* Build the slider
             * @param {object} content - media
             * Foundation reveal modal required
             */
            _build: function (content) {
                var modal = $("<div />", {
                    html: $("<div />")
                    .attr(settings.contentAttrs)
                })
                .attr(settings.wrapperAttrs)
                .css(settings.wrapperCSS),
                closeBtn = $("<a />", {
                    "class": "close-reveal-modal",
                    html: "&#215;"
                }),
                medium = this._renderMedia(content),
                slider = $("<div />", {
                    click: function (e) {
                        e.stopPropagation();
                    }
                })
                .attr(settings.sliderAttrs);
                modal.attr({
                    "data-reveal": "",
                    "aria-labelledby": "modalTitle",
                    "aria-hidden": true,
                    "role": "dialog"
                });
                slider.append(medium);
                modal.find('.' + settings.contentAttrs.class).append([closeBtn, slider]);
                return modal;
            },
            /* Add Slider to page
             * @param {object} content - The modal
             */
            _add: function (content) {
                $('body').append(content);
                $(document).foundation('reveal', 'reflow');
            },
            /* Render media
             * @param {object} media - Images and video
             * @returns {string} HTML of img tags and div's
             */
            _renderMedia: function (media) {
                var images = this._renderImages(media.images);
                var video = this._renderVideo(media.video);
                return images + video;
            },
            /* Render Images
             * @param {array} images
             * @returns {string} html - image tags
             */
            _renderImages: function (images) {
                var html = "";
                for (var i = 0; i < images.length; i++) {
                    html += "<img src=" + images[i].src + " alt=" + images[i].altText + ">";
                }
                return html;
            },
            /* Render Video
             * @param {array} video
             * @returns {string} html - div's containg video
             */
            _renderVideo: function (video) {
                var html = "";
                for (var i = 0; i < video.length; i++) {
                    html += "<div class='item-video'><a class='owl-video' href='" + video[i].src + "'></a></div>";
                }
                return html;
            },
            /* Setup Slider
             * @param {object} content - The modal
             */
            _setupSlider: function (content) {
                // Initialize Owl Carousel
                var owl = content.find(".owl-carousel").owlCarousel(settings.owlOptions);
                // Fixed height issue on resize
                owl.on('resized.owl.carousel', function (event) {
                    var $this = $(this);
                    $this.find('.owl-height').css('height', $this.find('.owl-item.active').height());
                })
                // Fixed height issue on video play
                owl.on('play.owl.video', function (event) {
                    console.log("video play");
                    setTimeout(function () {
                        owl.find('iframe').attr('height', owl.find('.owl-stage-outer').height());
                    }, 800);
                })
                // Close any video frames
                content.on("closed.fndtn.reveal", function (e) {
                    owl.find('iframe').remove();
                });
            }
        }

        /* Represents a picture
         * @param {object} el - DOM element
         * @param {string} src - Source to picture
         * @param {string} altText
         * @returns {object} this 
         * @constructor
         */
        var Picture = function (el, src, altText) {
            this.el = el;
            this.src = src;
            this.altText = altText;
            return this;
        }

        Picture.prototype = {
            /* Strip params
             * @returns {object} this
             */
            strip: function () {
                var srcValue = this.src;
                srcValue = srcValue.split("?");
                this.src = srcValue[0];
                return this;
            },
            /* Wrap element
             * @param {Number} index - Position of media element
             * @returns {Object} this
             */
            wrapCheck: function (index) {
                var $el = $(this.el),
                    $parent = $el.parent(),
                    html = "<a href='#' class='js-image-slider-item image-slider-item' data-index='" + index + "' data-reveal-id='" + settings.wrapperAttrs.id + "'></a>";
                // Check if parent is a picture element and not already
                // wrapped with an anchor tag.
                if ($parent.is("picture")) {
                    if ($parent.parent().not("a")) {
                        this._wrapElement($parent, html);
                    } else {
                        this._wrapElement($parent.parent(), null, true, index);
                    }
                    return this;
                }
                // If element is not wrapped with a picture tag
                if ($parent.not("a")) {
                    this._wrapElement($el, html);
                } else {
                    this._wrapElement($parent, null, true, index);
                }
                return this;
            },
            /* onClick handler for Picture items
             * @returns {Object} this
             */
            onClick: function () {
                var $el = $(this.el),
                    that = this,
                    $container = $el.closest(".js-image-slider-item"),
                    index = $container.attr("data-index");


                $container.on("click.owl", function () {
                    // Timeout needed for foundation modal to display
                    setTimeout(function () {
                        // Recalculate slider width
                        var carousel = $("#" + settings.wrapperAttrs.id + " .owl-carousel").data('owl.carousel');
                        if (carousel == null) {
                            carousel = $("#" + settings.wrapperAttrs.id + " .owl-carousel").data('owlCarousel'); // Support older versions of Owl < 2.1
                        }
                        carousel._width = $("#" + settings.wrapperAttrs.id + " .owl-carousel").width();
                        carousel.invalidate('width');
                        carousel.refresh();
                        // Hack to display the first image on slider properly
                        if (index == 0) {
                            carousel.to(1, [0]); // Hack :(
                        }
                        // Move to image selected
                        carousel.to(index, [0]);
                    }, 300)

                    // Callback
                    settings.onSliderShow.call(that.el);
                });
                return this;
            },
            /* Wrap provided element with slider wrapper
             * @param {Object} $el - jQuery object
             * @param {String} html - Wrapper html
             * @param {Bool} isClass - Only add class
             * @param {Number} index - Index of provided element
             * @returns null
             */
            _wrapElement: function ($el, html, isClass, index) {
                if (isClass != null) {
                    $el.addClass("js-image-slider-item image-slider-item").attr("data-index", index);
                    return;
                }
                $el.wrap(html);
            }
        };

        /* Represents a Video Element
         * @parms {Objec} el - Dom Element
         * @params {String} src - Media source link
         * @returns {Object} this
         * @constructor
         */
        var Video = function (el, src) {
            this.el = el;
            this.src = src;
            return this;
        }

        Video.prototype = {
            /* Convert video to be usable by Owl Carousel
             * @returns {Object} this
             */
            convert: function () {
                this._stripEmbed();
                return this;
            },
            /* Remove youtube embed code and switch to direct link
             * @returns null
             */
            _stripEmbed: function () {
                var videoId = this._getId(this.src);
                this.src = "http://www.youtube.com/watch?v=" + videoId;
            },
            /* Retrive ID form youtube link
             * @param {string} url - Video link
             * @returns {String} Youtube ID
             */
            _getId: function (url) {
                //Function used from http://stackoverflow.com/questions/21607808/convert-a-youtube-video-url-to-embed-code                    
                var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                var match = url.match(regExp);

                if (match && match[2].length == 11) {
                    return match[2];
                } else {
                    return 'error';
                }
            }
        }

        //Business Logic

        // Create a unique slider Id
        settings.wrapperAttrs.id += $that.attr("id") || Math.random().toString(36).substring(7);;

        // Check for passed in media elements
        if (settings.media.images.length > 0) {
            for (var i = 0; i < settings.media.images.length; i++) {
                var image = settings.media.images[i];
                // If valid url create Picture object
                if (isLink(image.src)) {
                    settings.media.images[i] = new Picture(null, image.src, image.alt);
                } else {
                    settings.media.images.splice(i, 1);
                }
            }
        }

        // get all images and strip any contraints
        var mediaCounter;
        settings.media.images.length != 'undefined' ? mediaCounter = settings.media.images.length : 0;
        $that.find("img, iframe").each(function () {
            var $this = $(this),
								srcVal = $this.attr("srcset") ? $this.attr("srcset") : $this.attr("src");

            if (isVideo($this)) {
                settings.media.video.push(new Video($this[0], srcVal).convert());
            } else {
                settings.media.images.push(new Picture($this[0], srcVal, $this.attr("alt")).strip().wrapCheck(mediaCounter).onClick());
                mediaCounter++;
            }

        });

        // Create Slider
        slider = new Slider().init(settings.media);

        // Helper functions             
        // Check for valid url
        function isLink(str) {
            // Regex used from http://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-an-url
            var pattern = new RegExp('(https?:\\/\\/)?((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*(\\?[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$', 'i');
            return pattern.test(str);
        }
        // Check if is video
        function isVideo($el) {
            if ($el[0].tagName == "IFRAME") return true;
        }
    };
})(jQuery);
// End instaSlide plugin