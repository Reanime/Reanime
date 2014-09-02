(function( ) {
    'use strict';

    var triggerKeyboardEvent = function( el , eventType , keyCode ) {
        var eventObj = document.createEventObject ? document.createEventObject( ) : document.createEvent( 'Events' );

        if ( eventObj.initEvent ){ eventObj.initEvent( eventType , true , true ); }

        if ( keyCode ) {
            eventObj.keyCode = keyCode;
            eventObj.which = keyCode;
        }

        el.dispatchEvent ? el.dispatchEvent( eventObj ) : el.fireEvent( 'on' + eventType , eventObj ); 
    };

    var triggerMouseEvent = function( el , eventType ) {
        var eventObj = document.createEvent( 'Events' );

        eventObj.initEvent( eventType , true , false );

        el.dispatchEvent( eventObj );
    };

    var body = document.body;

    describe( 'Testing Reanime\n\t' , function( ) {
        var game = new Reanime( );
        var obj;

        it( 'no args' , function( ) {
            expect( game instanceof Reanime ).toBe(true);
        });

        it( 'create a object' , function( ) {
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
            spyOn( game , 'trigger' ).andCallThrough( );

            obj.trigger({
                trigger : body ,
                start   : 'testStart' ,
                end     : 'testEnd' ,
                ms      : 30
            });

            expect( game.trigger ).toHaveBeenCalled( );
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

                triggerKeyboardEvent( window , 'keydown' , 16 );

                expect( timerCallback ).not.toHaveBeenCalled( );
            });

            waitsFor(function( ) { return flag; } , 'start callback didn\'t run' , 60 );

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

                triggerKeyboardEvent( window , 'keyup' , 16 );

                expect( timerCallback ).not.toHaveBeenCalled( );
            });

            waitsFor(function( ) { return flag; } , 'end callback didn\'t run' , 120 );

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

                triggerMouseEvent( body , 'mousedown' );

                expect( timerCallback ).not.toHaveBeenCalled( );
            });

            waitsFor(function( ) { return flag; } , 'start callback didn\'t run' , 180 );

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

                triggerMouseEvent( body , 'mouseup' );

                expect( timerCallback ).not.toHaveBeenCalled( );
            });

            waitsFor(function( ) { return flag; } , 'end callback didn\'t run' , 240 );

            runs(function( ) { expect( timerCallback ).toHaveBeenCalled( ); });
        });
    });
})( );
