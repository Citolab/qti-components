/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2020 DEPP, Ministère de l'Education Nationale;
 * Developed by Saskia Keskpaik (DEPP)
 */
define(['IMSGlobal/jquery_2_1_1', 'OAT/util/html', 'mathJax'], function($, html, MathJax){
    'use strict';


    // Remove typesetting message
    MathJax.Hub.Config({
        messageStyle: "none"
    });
    
    function mathrenderer($container){
        $container.find('.mathcontent').each(function(){
            var $math = $(this);
            
            // If first occurrence of mathcontent: wrap in math-renderer
            if(($math.parent('.math-renderer')).length == 0) {
                $math.wrap($('<span>', {'class':'math-renderer'}));
            }
            var $wrap = $math.parent('.math-renderer');
            MathJax.Hub.Queue(["Typeset",MathJax.Hub, $wrap[0]]);
        });        
    }



    function addbuttons(id, $container, config) {
        var level = parseInt(config.level) || 2;
        
        $container.find('.buttoncontainer').empty(); 

        // Adjustement of width according to the number of buttons
        if (level == 5 || level == 6 ) {
            $container.find('.buttoncontainer').width("350px");
        } else {
            $container.find('.buttoncontainer').width("450px");
        }
        
        for (let i = 0; i < level; i++) {
            $container.find('.buttoncontainer').append("<button class='respbutton mathcontent response" + i + "'></button>");
        }
    }



    function renderBtnlabel0(id, $container, config) {
        $container.find(('.response0')).html(config.buttonlabel0);
    }
    function renderBtnlabel1(id, $container, config) {
        $container.find(('.response1')).html(config.buttonlabel1);
    }
    function renderBtnlabel2(id, $container, config) {
        $container.find(('.response2')).html(config.buttonlabel2);
    }
    function renderBtnlabel3(id, $container, config) {
        $container.find(('.response3')).html(config.buttonlabel3);
    }
    function renderBtnlabel4(id, $container, config) {
        $container.find(('.response4')).html(config.buttonlabel4);
    }
    function renderBtnlabel5(id, $container, config) {
        $container.find(('.response5')).html(config.buttonlabel5);
    }
    function renderBtnlabel6(id, $container, config) {
        $container.find(('.response6')).html(config.buttonlabel6);
    }
    function renderBtnlabel7(id, $container, config) {
        $container.find(('.response7')).html(config.buttonlabel7);
    }    



    function getTimeRemaining(endtime){
        var millisec = new Date(endtime) -   new Date().getTime();  
        var seconds = Math.floor( (millisec/1000) % 60 );
        var minutes = Math.floor( (millisec/1000/60) % 60 );
        return {
          'millisec': millisec,
          'minutes': minutes,
          'seconds': seconds
        };
    }



    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
      
        while (0 !== currentIndex) { 
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }



    function renderGame(id, $container, config, responseObj, assetManager, timer){

        var level = parseInt(config.level) || 2;
        var feedback = config.feedback || 'false';
        var shufflestimuli = config.shufflestimuli || 'false';
        var respkey = config.respkey || 'false';
        var tlimit = config.tlimit || 0;
        var data = config.data;
        var datain;
        var dataout = [];
        responseObj.base.string = JSON.stringify(dataout);
        var nbconsecutivecorrect = 0;
        var i = 0;


        // Display response buttons and render labels
        addbuttons(id, $container, config);
        renderBtnlabel0(id, $container, config);
        renderBtnlabel1(id, $container, config);
        renderBtnlabel2(id, $container, config);
        renderBtnlabel3(id, $container, config);
        renderBtnlabel4(id, $container, config);
        renderBtnlabel5(id, $container, config);
        renderBtnlabel6(id, $container, config);
        renderBtnlabel7(id, $container, config);


        // Shuffle the data if the shuffle option is selected (do not shuffle the first 3 training stimuli)
        if (shufflestimuli == true && data.length > 3) {
            datain = data.slice(0,3).concat(shuffle(data.slice(3))); 
        } else {
            datain = data;
        }
        

        // Help functions
        function exitgame() {
            $container.find('.respbutton').prop("disabled", true);          
            // Set a little timeout (to display the last feedback)
            setTimeout(function () {
                $container
                    .trigger('pcidone')
                    .find('.globalWrapper').html("<div class='endmsgcontainer'>Cliquer sur Suivant</div>");
            }, 1000);
        }
        
        function renderstimulus(stimulus) {
            $container.find('.stimuluscontainer').html("<div class='stimulustext mathcontent'>" + stimulus.trim() + "</div>");
            mathrenderer($container);
        }


        // Start
        renderstimulus(datain[i]["stimulus"]);
        var start = new Date().getTime();  
        var endtlimit = new Date(new Date().getTime() + tlimit*1000); 
        var timeoutdone = true;


        // Set timeout function
        if(tlimit > 0) {
       
            var timeinterval = setInterval(function(){

                var t = getTimeRemaining(endtlimit);
    
                if(t.millisec <= 0){ 

                    var correctresponse  = (parseInt(datain[i]["response"].trim())-1)
                    var correct = 0;
                    nbconsecutivecorrect = 0;
    
                    // Calculate duration
                    var duration = new Date().getTime() - start;

                    // Push to data
                    dataout.push({"stimulusindex": datain[i]["stimulusindex"].trim(), "stimulus": datain[i]["stimulus"].trim(), "time": duration, "correct": correct});
                    responseObj.base.string = JSON.stringify(dataout);
    
                    // Disable buttons
                    $container.find('.respbutton').prop("disabled", true);

                    // Feedback: color the correct response
                    if (feedback == true) {
                        $container.find(('.response'+(parseInt(datain[i]["response"].trim())-1))).addClass("feedbackcorrect");
                    } 
                    
                    i += 1; 

                    // If last stimulus then exit, otherwise continue
                    if(i == datain.length) { 
                        clearInterval(timeinterval);
                        exitgame(); 
                    } 

                    else {
                        // First remove the feedback...
                        setTimeout(function () {      
                            $container.find('.respbutton').removeClass("feedbackcorrect correct incorrect");
                            $container.find('.feedbackaudio').remove();
                            $container.find('.stimuluscontainer').empty();
                        }, 1000);
                        // ...then display next stimulus and enable responding
                        setTimeout(function () {      
                            renderstimulus(datain[i]["stimulus"]);
                            if (level != 2 || respkey != true) {
                                $container.find('.respbutton').prop("disabled", false); 
                            } 
                            timeoutdone = true;
                        }, 2000);
                        start = new Date(new Date().getTime() + 2000);
                        endtlimit = new Date(new Date().getTime() + tlimit*1000 + 2000);    
                                           
                    }
                    timeoutdone = false;                    
                    
                }
            },1); // each millisecond
        }


        // Response by keys Q and M       
        if(level == 2 && respkey == true) {
            
            // Disable response buttons
            $container.find('.respbutton').prop("disabled", true);
            $container.find('.respbutton').addClass("respkeybutton");

            var keyisdown = {};    
     
            // Set keydown function for keys Q and M
            $(document).keydown(function(e) {
                
                switch(e.which) {
                    case 81: // key Q
                        
                        if (keyisdown['81'] == null && timeoutdone) { // first press
                            
                            // Check if correct     
                            if(parseInt(datain[i]["response"].trim()) == 1) {
                                var correct = 1;
                                nbconsecutivecorrect += 1;
                            } else {
                                var correct = 0;
                                nbconsecutivecorrect = 0;
                            };

                            // Calculate duration
                            var duration = new Date().getTime() - start;
                            
                            // Push to data
                            dataout.push({"stimulusindex": datain[i]["stimulusindex"].trim(), "stimulus": datain[i]["stimulus"].trim(), "time": duration, "correct": correct});
                            responseObj.base.string = JSON.stringify(dataout);

                            // Clean stimulus field
                            $container.find('.stimuluscontainer').empty();

                            // Feedback: color the response according to correct and play the feedback sound
                            if (feedback == true) {
   
                                if (nbconsecutivecorrect > 5) {
                                    nbconsecutivecorrect = 5;
                                }

                                if (nbconsecutivecorrect == 0) {
                                    $container.find('.response0').addClass("incorrect");
                                } else {
                                    $container.find('.response0').addClass("correct");
                                }
                                $container.find('.feedbackcontainer').append("<audio autoplay class='feedbackaudio' src= " + assetManager.resolve('decisiontask/runtime/assets/feedback' + nbconsecutivecorrect + '.wav') + "></audio> ");                                 
                            }

                            i += 1;

                            // If last stimulus then exit, otherwise continue
                            if(i == datain.length) { 
                                if(tlimit > 0) { clearInterval(timeinterval);}
                                exitgame(); 
                                $(document).off( "keydown" ); // remove keydown function
                            } 
                            else {
                                // Set a delay before displaying next stimulus
                                setTimeout(function () {       
                                    renderstimulus(datain[i]["stimulus"]);
                                    $container.find('.respbutton').removeClass("correct incorrect");
                                    $container.find('.feedbackaudio').remove();   
                                    timeoutdone = true;
                                }, 1000);
                                start = new Date(new Date().getTime() + 1000);
                                endtlimit = new Date(new Date().getTime() + tlimit*1000 + 1000);  
                                    
                            }
                            
                            keyisdown['81'] = true; // record that the key's down
                            timeoutdone = false; // record that the timeout's not done
                        }
                    
                    break;
            
                    case 77: // key M

                        if (keyisdown['77'] == null && timeoutdone) { 

                            // Check if correct 
                            if(parseInt(datain[i]["response"].trim()) == 2) {
                                var correct = 1;
                                nbconsecutivecorrect += 1;
                            } else {
                                var correct = 0;
                                nbconsecutivecorrect = 0;
                            };

                            // Calculate duration
                            var duration = new Date().getTime() - start;

                            // Push to data
                            dataout.push({"stimulusindex": datain[i]["stimulusindex"].trim(), "stimulus": datain[i]["stimulus"].trim(), "time": duration, "correct": correct});
                            responseObj.base.string = JSON.stringify(dataout);

                            // Clean stimulus field
                            $container.find('.stimuluscontainer').empty();

                            // Feedback: color the response according to correct and play the feedback sound
                            if (feedback == true) {

                                if (nbconsecutivecorrect > 5) {
                                    nbconsecutivecorrect = 5;
                                }

                                if (nbconsecutivecorrect == 0) {
                                    $container.find('.response1').addClass("incorrect");
                                } else {
                                    $container.find('.response1').addClass("correct");
                                }
                                $container.find('.feedbackcontainer').append("<audio autoplay class='feedbackaudio' src= " + assetManager.resolve('decisiontask/runtime/assets/feedback' + nbconsecutivecorrect + '.wav') + "></audio> ");                                 
                            } 

                            i += 1;

                            // If last stimulus then exit, otherwise continue
                            if(i == datain.length) { 
                                if(tlimit > 0) { clearInterval(timeinterval);}
                                exitgame();
                                $(document).off( "keydown" );
                            } 
                            else {
                                // Set a delay before displaying next stimulus
                                setTimeout(function () {  
                                    renderstimulus(datain[i]["stimulus"]);
                                    $container.find('.respbutton').removeClass("correct incorrect");
                                    $container.find('.feedbackaudio').remove();   
                                    timeoutdone = true;  
                                }, 1000);
                                start = new Date(new Date().getTime() + 1000);
                                endtlimit = new Date(new Date().getTime() + tlimit*1000 + 1000);   
                            }

                            keyisdown['77'] = true; 
                            timeoutdone = false;
                    }
                    break;
            
                    default: return; // exit this handler for other keys
                }
                e.preventDefault(); // prevent the default action (scroll / move caret)
            });
    
            $(document).keyup(function(e) {
                var keycode = (e.keyCode ? e.keyCode : e.which);
                keyisdown[keycode] = null;
            });
        
        } 


        // Response by buttons
        else {

            // Set button click function
            $container.find('.respbutton').click(function() {

                // Compare button ID to correct response. If match => correct = 1, else correct = 0     
                if(parseInt(this.className.slice(this.className.length - 1))+1 === parseInt(datain[i]["response"].trim())) {
                    var correct = 1;
                    nbconsecutivecorrect += 1;
                } else {
                    var correct = 0;
                    nbconsecutivecorrect = 0;
                };

                // Calculate duration
                var duration = new Date().getTime() - start;

                // Push to data
                dataout.push({"stimulusindex": datain[i]["stimulusindex"].trim(), "stimulus": datain[i]["stimulus"].trim(), "time": duration, "correct": correct});
                responseObj.base.string = JSON.stringify(dataout);

                // Clean stimulus field and disable buttons
                $container.find('.stimuluscontainer').empty();
                $container.find('.respbutton').prop("disabled", true);

                if (feedback == true) {

                    if (nbconsecutivecorrect > 5) {
                        nbconsecutivecorrect = 5;
                    }

                    var buttonclass = this.className.slice(this.className.length - 9);
                    if (nbconsecutivecorrect == 0) {
                        $container.find('.' + buttonclass).addClass("incorrect");
                    } else {
                        $container.find('.' + buttonclass).addClass("correct");
                    }
                    $container.find('.feedbackcontainer').append("<audio autoplay class='feedbackaudio' src= " + assetManager.resolve('decisiontask/runtime/assets/feedback' + nbconsecutivecorrect + '.wav') + "></audio> ");                                 
                } 

                i += 1;

                // If last stimulus then exit, otherwise continue
                if(i == datain.length) { 
                    if(tlimit > 0) { clearInterval(timeinterval);}
                    exitgame(); 
                } 
                else {
                    // Set a delay before displaying next stimulus
                    setTimeout(function () {       
                        renderstimulus(datain[i]["stimulus"]);
                        $container.find('.' + buttonclass).removeClass("correct incorrect");
                        $container.find('.feedbackaudio').remove();   
                        $container.find('.respbutton').prop("disabled", false); 
                    }, 1000);
                    start = new Date(new Date().getTime() + 1000);
                    endtlimit = new Date(new Date().getTime() + tlimit*1000 + 1000);  
                }

            }); 
        }

        // Keep track of the timer
        if (tlimit == 0 ) { 
            timer.timeinterval = null
        } else {
            timer.timeinterval = timeinterval;
        };
        timer.id = id;

    }



    function renderItem(id, $container, config, responseObj, assetManager, timer){

        // Remove the previous content
        $container.find('.globalWrapper').empty();
        // Disable previously active keydown handlers
        $(document).off( "keydown" );  
        // Clear previously active timeinterval
        clearInterval(timer.timeinterval);
        
        // Add start button
        $container.find('.globalWrapper').append("<button class='startbutton'>Cliquer ici pour commencer</button>")

        $container.find('.startbutton').click(function() { 
        
            // Create stimulus, button and feedback containers
            $container.find('.globalWrapper').html("<div class='itemWrapper'><div class='stimuluscontainer'></div><div class='buttoncontainer'></div></div>");
            $container.find('.globalWrapper').append("<div class='feedbackcontainer'></div>");
            renderGame(id, $container, config, responseObj, assetManager, timer);
        });  
               
    } 




    return {
        render : function(id, container, config, responseObj, assetManager, timer){

            var $container = $(container);
            renderItem(id, $container, config, responseObj, assetManager, timer);          
            //render rich text content in prompt
            html.render($container.find('.prompt'));
        },
        renderItem : function(id, container, config, responseObj, assetManager, timer){
            renderItem(id, $(container), config, responseObj, assetManager, timer);
        },
        renderBtnlabel0 : function(id, container, config) {
            renderBtnlabel0(id, $(container), config);
        },
        renderBtnlabel1 : function(id, container, config) {
            renderBtnlabel1(id, $(container), config);
        },
        renderBtnlabel2 : function(id, container, config) {
            renderBtnlabel2(id, $(container), config);
        },
        renderBtnlabel3 : function(id, container, config) {
            renderBtnlabel3(id, $(container), config);
        },
        renderBtnlabel4 : function(id, container, config) {
            renderBtnlabel4(id, $(container), config);
        },
        renderBtnlabel5 : function(id, container, config) {
            renderBtnlabel5(id, $(container), config);
        },
        renderBtnlabel6 : function(id, container, config) {
            renderBtnlabel6(id, $(container), config);
        },
        renderBtnlabel7 : function(id, container, config) {
            renderBtnlabel7(id, $(container), config);
        }
    };
});