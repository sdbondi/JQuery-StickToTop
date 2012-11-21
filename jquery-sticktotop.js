/*global window */
(function(document, $) {
  "use strict";

  $.fn.stickToTop = function(options) {
    options = $.extend({
      scrollParent: window,
      offset: {top: 0, left: 0},
      minParentHeight: false,
      minParentWidth: false,
      bottomBound: false,
      onStick: null,
      onDetach: null
    }, options, true);

    var scrollParent = options.scrollParent,
    /*
    1: BottomBound
    2: Initial
    3: Fixed
    */
    lastApplied = 0, 
    parentPosition = $((scrollParent === window) ? scrollParent.document.body : scrollParent).offset();

    return $(this).each(function() {
      var sticky = this,
      $sticky = $(sticky),
      initialPosition = $sticky.position(),
      initialPositioning = $sticky.css('position'),
      initialWidth = $sticky.width(),
      stickyHeight = $sticky.outerHeight(true),
      resizing = false,
      unsticking = false,

      fnScrollHandler = function() {
        var scrollTop = scrollParent.scrollTop || $(document).scrollTop(),
        parentHeight = ((scrollParent == window) ? window.document.body : scrollParent).offsetHeight,
        parentWidth = ((scrollParent == window) ? window.document.body : scrollParent).offsetWidth,
        // If bottomBound, calculate bottom bound including height of the sticky
        bottomBound = options.bottomBound && (parentHeight - options.bottomBound - stickyHeight),

        applyBottomBound = (!!bottomBound && bottomBound < scrollTop),

        applyFixed = (scrollTop >= initialPosition.top - options.offset.top + parentPosition.top),
        if (options.minParentWidth && parentWidth < options.minParentWidth ) { applyFixed = false; }
        applyInitial = !applyFixed;
        
        

        applyFixed = applyFixed && !applyBottomBound;

        if (applyBottomBound && lastApplied !== 1) {
          var currentPos = $sticky.position();
          $sticky.css({'position': 'absolute', 'top': bottomBound + 'px' , 'left': currentPos.left + 'px'});
          lastApplied = 1;
          if (options.onDetach) {
            options.onDetach.call(sticky);
          }
          return;
        }

        if ((applyInitial && lastApplied !== 2) ||
           (options.minParentHeight && parentHeight < options.minParentHeight)) {
          var props = {'position': initialPositioning};
          if (initialPositioning !== 'static') {
            $.extend(props, {'top': initialPosition.top + 'px', 'left': initialPosition.left + 'px'});
          }
          $sticky.css(props);
          lastApplied = 2;
          if (options.onDetach) {
            options.onDetach.call(sticky);
          }
          return;
        }

        if (applyFixed && lastApplied !== 3) {
          $sticky.css({
            'position':'fixed', 
            'top': parentPosition.top + (options.offset.top || 0)+'px', 
            'left': (parentPosition.left + initialPosition.left + (options.offset.left || 0))+'px',
            'width': initialWidth+'px',
            'z-index': 1000
          });
          lastApplied = 3;
          if (options.onStick) {
            options.onStick.call(sticky);
          }
          return;
        }
      },
      fnResizeHandler = function(e) { 
        if (resizing) {
          return;
        }

        resizing = true;
        window.setTimeout(function() {
          if (unsticking) {
            return;
          }

          var thisPositioning = $sticky.css('position');
          initialPosition.left = $sticky.css('position', initialPositioning).position().left;
          $sticky.css('position', thisPositioning);        
          lastApplied = ''; 
          fnScrollHandler();
          resizing = false;
        }, 50);
      };

      $(window).on('resize', fnResizeHandler);

      if (initialPositioning === 'relative') {
        initialPositioning = 'static';
      }

      $(options.scrollParent).on('scroll', fnScrollHandler);   

      // Function to stop stickToTop
      this.unstickToTop = function() {
        unsticking = true;
        $(options.scrollParent).off('scroll', fnScrollHandler);
        $(window).off('resize', fnResizeHandler);
      };
    });
  };

}(window.document, window.jQuery));