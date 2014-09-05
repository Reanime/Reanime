(function( ) {
    'use strict';

    var triggerEvent = function( el , eventType , keyCode ) {
        var eventObj;

        try {
            eventObj = new Event( eventType );
        } catch ( e ) {
            eventObj = document.createEvent( 'Event' );
            eventObj.initEvent( eventType , true , false);
        }

        if ( keyCode ) {
            eventObj.keyCode = keyCode;
            eventObj.which = keyCode;
        }

        el.dispatchEvent ? el.dispatchEvent( eventObj ) : el.fireEvent( 'on' + eventType , eventObj );
    };

    var body = document.body;
    var touch = 'ontouchstart' in window;

    describe( 'Testing Reanime\n\t' , function( ) {
        var game = new Reanime( );
        var obj;

        it( 'no args' , function( ) {
            expect( game instanceof Reanime ).toBe(true);
        });

        it( 'create an object' , function( ) {
            expect( ( obj = game.createObject( ) ) instanceof Reanime.prototype._Object ).toBe(true);

            expect( game._objects.length ).toBe( 1 );
        });

        it( 'create an action' , function( ) {
            obj.action( 'testStart' , function( ) { } );
            obj.action( 'testEnd' , function( ) { } );

            expect( typeof obj._actions.testStart.cb ).toBe( 'function' );
            expect( typeof obj._actions.testEnd.cb ).toBe( 'function' );
        });

        it( 'create a trigger (key)' , function( ) {
            obj.trigger({
                trigger : 16 ,
                start   : 'testStart' ,
                end     : 'testEnd' ,
                ms      : 30
            });

            expect( game._triggers[ 16 ].length ).toBe( 1 );
        });

        it( 'create a trigger (elem)' , function( ) {
            obj.trigger({
                trigger : body ,
                start   : 'testStart' ,
                end     : 'testEnd' ,
                ms      : 30
            });

            expect( 'elems' in obj._actions.testStart ).toBe( true );
            expect( obj._actions.testStart.elems.length ).toBe( 1 );
        });

        it( 'destroy an object' , function( ) {
            obj.destroy( );

            expect( game._objects.length ).toBe( 0 );
            expect( obj._actions ).toBe( undefined );
            expect( game._triggers[ 16 ].length ).toBe( 0 );
        });
    });

    describe( 'Testing key triggers\n\t' , function( ) {
        var game = new Reanime( );
        var obj;

        var timerCallback;
        var flag;

        beforeEach(function( ) {
            timerCallback = jasmine.createSpy( 'timerCallback' );

            obj = game.createObject( );
        });

        it( 'trigger start' , function( ) {
            obj.action( 'testStart' , function( ) {
                flag = true;

                timerCallback( );
            });
            obj.action( 'testEnd' , function( ) { });

            obj.trigger({
                trigger : 16 ,
                start   : 'testStart' ,
                end     : 'testEnd' ,
                ms      : 30
            });

            runs(function( ) {
                flag = false;

                triggerEvent( window , 'keydown' , 16 );

                expect( timerCallback ).not.toHaveBeenCalled( );
            });

            waitsFor(function( ) { return flag; } , 'start callback didn\'t run' , 200 );

            runs(function( ) { expect( timerCallback ).toHaveBeenCalled( ); });
        });

        it( 'trigger end' , function( ) {
            obj.action( 'testStart' , function( ) { });
            obj.action( 'testEnd' , function( ) {
                flag = true;

                timerCallback( );
            });

            obj.trigger({
                trigger : 16 ,
                start   : 'testStart' ,
                end     : 'testEnd' ,
                ms      : 30
            });

            runs(function( ) {
                flag = false;

                triggerEvent( window , 'keyup' , 16 );

                expect( timerCallback ).not.toHaveBeenCalled( );
            });

            waitsFor(function( ) { return flag; } , 'end callback didn\'t run' , 200 );

            runs(function( ) { expect( timerCallback ).toHaveBeenCalled( ); });
        });
    });

    describe( 'Testing elem triggers\n\t' , function( ) {
        var game = new Reanime( );
        var obj;

        var timerCallback;
        var flag;

        beforeEach(function( ) {
            timerCallback = jasmine.createSpy( 'timerCallback' );

            obj = game.createObject( );
        });

        it( 'trigger start' , function( ) {
            obj.action( 'testStart' , function( ) {
                flag = true;

                timerCallback( );
            });
            obj.action( 'testEnd' , function( ) { });

            obj.trigger({
                trigger : body ,
                start   : 'testStart' ,
                end     : 'testEnd' ,
                ms      : function( ) { return 30; }
            });

            runs(function( ) {
                flag = false;

                triggerEvent( body , touch ? 'touchstart' : 'mousedown' );

                expect( timerCallback ).not.toHaveBeenCalled( );
            });

            waitsFor(function( ) { return flag; } , 'start callback didn\'t run' , 200 );

            runs(function( ) { expect( timerCallback ).toHaveBeenCalled( ); });
        });

        it( 'trigger end' , function( ) {
            obj.action( 'testStart' , function( ) { });
            obj.action( 'testEnd' , function( ) {
                flag = true;

                timerCallback( );
            });

            obj.trigger({
                trigger : body ,
                start   : 'testStart' ,
                end     : 'testEnd' ,
                ms      : function( ) { return 30; }
            });

            runs(function( ) {
                flag = false;

                triggerEvent( body , touch ? 'touchend' : 'mousedown' );

                expect( timerCallback ).not.toHaveBeenCalled( );
            });

            waitsFor(function( ) { return flag; } , 'end callback didn\'t run' , 200 );

            runs(function( ) { expect( timerCallback ).toHaveBeenCalled( ); });
        });
    });
})( );
