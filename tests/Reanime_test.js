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

    var body = document.body;

    describe( 'Testing Reanime' , function( ) {
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

    describe( 'Testing key triggers' , function( ) {
        var game = new Reanime( );
        var obj;

        var timerCallback;

        beforeEach(function( ) {
            jasmine.Clock.useMock( );

            timerCallback = jasmine.createSpy( 'timerCallback' );

            obj = game.createObject( );
        });

        it( 'trigger start' , function( ) {
            obj.action( 'testStart' , function( ) { timerCallback( ); });
            obj.action( 'testEnd' , function( ) { });

            obj.trigger({
                trigger : 16 ,
                start   : 'testStart' ,
                end     : 'testEnd' ,
                ms      : 30
            });

            expect( timerCallback ).not.toHaveBeenCalled( );

            triggerKeyboardEvent( window , 'keydown' , 16 );

            jasmine.Clock.tick( 100 );

            expect( timerCallback ).toHaveBeenCalled( );
        });

        it( 'trigger end' , function( ) {
            obj.action( 'testStart' , function( ) { });
            obj.action( 'testEnd' , function( ) { timerCallback( ); });

            obj.trigger({
                trigger : 16 ,
                start   : 'testStart' ,
                end     : 'testEnd' ,
                ms      : 30
            });

            expect( timerCallback ).not.toHaveBeenCalled( );

            triggerKeyboardEvent( window , 'keyup' , 16 );

            jasmine.Clock.tick( 300 );

            expect( timerCallback ).toHaveBeenCalled( );
        });
    });
})( );
