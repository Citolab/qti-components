define(['taoQtiItem/portableLib/jquery_2_1_1', 'mathJax'], function($, MathJax){
    'use strict';
    return {
        render : function render($container){
            if(MathJax){
                $container.find('math').each(function(){
                    var $wrap;
                    var $math = $(this);
                    $math.wrap($('<span>', {'class' : 'math-renderer'}));
                    $wrap = $math.parent('.math-renderer');
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub, $wrap[0]]);
                });
            }
        }
    };
});