define(['taoQtiItem/portableLib/lodash'], function(_){
    'use strict';

    return function EventMgr(){
        
        var events = {};
        
        this.get = function get(event){
            if(event && events[event]){
                return _.clone(events[event]);
            }else{
                return [];
            }
        };
        
        this.on = function on(event, callback){
            var name;
            var tokens = event.split('.');
            if(tokens[0]){
                name = tokens.shift();
                events[name] = events[name] || [];
                events[name].push({
                    ns : tokens,
                    callback : callback
                });
            }
        };
        
        this.off = function off(event){
            if(event && events[event]){
                events[event] = [];
            }
        };
        
        this.trigger = function trigger(event, data){
            if(events[event]){
                _.forEach(events[event], function(e){
                    e.callback.apply({
                        type : event,
                        ns : []
                    }, data);
                });
            }
        };
    };
});