/*
 * Reanime
 * https://github.com/Reanime/Reanime
 *
 * Copyright (c) 2014 Anmo
 * Licensed under the MIT license.
 */

;(function( ) {
    'use strict';

    var lastTime = 0;
    var currTime;

    var requestAnimationFrame = window.requestAnimationFrame ||
                                window.msRequestAnimationFrame ||
                                window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame ||
                                window.oRequestAnimationFrame ||
                                function( callback ) {
                                    var timeToCall = Math.max( 0 , 16 - ( ( currTime = new Date( ).getTime( ) ) - lastTime ) );

                                    var id = setTimeout( function( ) { callback( currTime + timeToCall ); } , timeToCall );

                                    lastTime = currTime + timeToCall;

                                    return id;
                                };

    var cancelAnimationFrame =  window.cancelAnimationFrame ||
                                window.msCancelAnimationFrame ||
                                window.msCancelRequestAnimationFrame ||
                                window.mozCancelAnimationFrame ||
                                window.mozCancelRequestAnimationFrame ||
                                window.webkitCancelAnimationFrame ||
                                window.webkitCancelRequestAnimationFrame ||
                                window.oCancelAnimationFrame ||
                                window.oCancelRequestAnimationFrame ||
                                function( id ) {
                                    clearTimeout( id );
                                };
    var Reanime = function( opt ) {
        return this.init( opt );
    };
    Reanime.prototype = {
        init : function( ) {
            this._objects  = [ ];
            this._triggers = { };

            var self = this;

            if ( 'ontouchstart' in window ) {
                this._start = 'touchstart';
                this._end   = 'touchend';
            } else {
                this._start = 'mousedown';
                this._end   = 'mouseup';
            }

            window.addEventListener( 'keydown' , function( e ) {
                var triggers = self._triggers[ e.keyCode ] || [ ];

                for ( var i = 0, l = triggers.length; i < l; i++ ) {
                    var trigger = triggers[ i ];

                    var obj  = trigger[ 0 ];
                    var act  = trigger[ 1 ];
                    var ms   = act.ms;

                    if ( !( act = obj._actions[ act.start ] ).status ) { self._raf( obj , act , ms ); }
                }
            });

            window.addEventListener( 'keyup' , function( e ) {
                var triggers = self._triggers[ e.keyCode ] || [ ];

                for ( var i = 0, l = triggers.length; i < l; i++ ) {
                    var trigger = triggers[ i ];

                    var obj  = trigger[ 0 ];
                    var act  = trigger[ 1 ];
                    var ms   = act.ms;

                    if ( act.end ) {
                        var start = obj._actions[ act.start ];

                        if ( !( act = obj._actions[ act.end ] ).status ) { self._raf( obj , self._keyupWrapper( start , act ) , ms ); }
                    }
                }
            });

            return this;
        } ,

        _keyupWrapper : function( start , act ) {
            return {
                cb : function( self ) {
                    var notClean = act.cb( self );

                    if ( !notClean ) {
                        cancelAnimationFrame( start.status );
                        delete start.status;
                    }
                }
            };
        } ,

        _raf : function( obj , act , ms ) {
            var self = this;
            var control;

            var raf = function( ts ) {
                if ( !control ) { control = ts; }

                var next = true;
                var delta = ts - control;

                if ( delta >= ms( self ) ) {
                    control = 0;

                    next = act.cb( self );
                }

                if ( next ) { act.status = requestAnimationFrame( raf ); }
                else { delete act.status; }
            };

            act.status = requestAnimationFrame( raf );
        } ,

        createObject : function( ) { return this._Object.apply( this , [ this ].concat( arguments ) ); }
    };

    var _Object = Reanime.prototype._Object = function( game ) {
        if ( !( this instanceof _Object ) ) { return new this._Object( game ); }

        ( this._game = game )._objects.push( this );

        return this.init( );
    };
    _Object.prototype = {
        init : function( ) {
            this._actions = { };

            return this;
        } ,

        action : function( name , cb ) {
            var self = this;

            this._actions[ name ] = { cb : function( ) { return cb.apply( self , arguments ); }  };

            return this;
        } ,

        trigger : function( obj ) {
            if ( 'start' in obj && !( obj.start in this._actions ) || 'end' in obj && !( obj.end in this._actions ) ) { return this; }

            obj.ms = this._ms( obj.ms );

            var trig  = obj.trigger;
            var start = this._actions[ obj.start ];
            var end   = this._actions[ obj.end ];

            if ( typeof obj.trigger !== 'number' || !( 'trigger' in obj ) ) {
                var game = this._game;
                var self = this;

                var ms    = obj.ms;

                var handler = this._startEvent( game , start , ms );

                ( start.elems = start.elems || [ ] ).push( [ trig , game._start , handler ] );

                trig.addEventListener( game._start , handler );

                if ( end ) {
                    handler = this._endEvent( game , start , end , ms );

                    ( end.elems = end.elems || [ ] ).push( [ trig , game._end , handler ] );

                    trig.addEventListener( game._end , handler );
                }

                return this;
            }

            ( this._game._triggers[ obj.trigger ] = this._game._triggers[ obj.trigger ] || [ ] ).push( [ this , obj ] );

            return this;
        } ,

        destroy : function( ) {
            var i, l, o, t, a, k;

            var g   = this._game;
            var ts  = g._triggers;
            var act = this._actions;

            for ( i = 0, o = g._objects, l = o.length; i < l; i++ ) {
                if ( o[ i ] === this ) {
                    o.splice( i , 1 );

                    break;
                }
            }

            for ( k in ts ) {
                if ( !ts.hasOwnProperty( k ) ) { continue; }

                for ( i = 0, t = ts[ k ], l = t.length; i < l; i++ ) {
                    if ( t[ i ][ 0 ] === this ) { t.splice( i , 1 ); }
                }
            }

            for ( k in act ) {
                if ( !act.hasOwnProperty( k ) ) { continue; }

                for ( i = 0, a = act[ k ].elems, l = a && a.length; i < l; i++ ) {
                    var e = a[ i ];

                    e[ 0 ].removeEventListener( e[ 1 ] , e[ 2 ]);

                    delete act[ k ];
                }
            }

            delete this._actions;
        } ,

        _startEvent : function( game , start , ms ) {
            var self = this;

            return function( e ) {
                if ( !start.status ) { game._raf( self , start , ms ); }

                e.preventDefault( );
            };
        } ,

        _endEvent : function( game , start , end , ms ) {
            var self = this;

            return function( e ) {
                if ( !end.status ) { game._raf( self , game._keyupWrapper( start , end ) , ms ); }

                e.preventDefault( );
            };
        } ,

        _ms : function( ms ) {
            var self = this;

            return typeof ms === 'function' ? function( ) { return ms.apply( self , arguments ); } : function( ) { return ms; };
        }
    };

    if ( typeof define === 'function' && define.amd ) {
        define( 'Reanime' , Reanime );
    } else {
        window.Reanime = Reanime;
    }
})( );