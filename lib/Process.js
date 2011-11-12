/**
 * Creates a new Process object.
 * @param int pid
 * @param object ob
 */
var Process = function( pm, pid, ob ) {

    var self                                = this;
    self.pid                                = pid;
    self.data                               = ob.data || {};
    self.callback                           = ob.callback || function() {};
    self.pm                                 = pm;
    self.children                           = [];
    self.parent                             = null;

    /**
     * Sets the parent process for this process.
     * @param proc
     */
    self.setParent = function( proc ) {

        self.parent                         = proc;
    };

    /**
     * Adds a child process to this process.
     * @param proc
     */
    self.addChild = function( proc ) {

        if ( proc instanceof Process ) {
            self.children.push( proc );
        }
        else {
            throw new Error( "Attempted to add a non-process as a process child." );
        }
    };

    /**
     * Destroys this process and all of its children.
     */
    self.destroy = function() {

        for ( var i in self.children ) {

            self.children[i].destroy();
        }

        if ( self.parent instanceof Process ) {
            self.parent.removeChild( self );
        }

        self.pm.destroyProcess( self.pid );
    };

    /**
     * Removes a specific child from this process.
     * @param proc
     */
    self.removeChild = function( proc ) {

        var index = self.children.indexOf( proc );
        if ( proc instanceof Process && index > -1 ) {
            self.children.splice( index, 1 );
        }
    };

    /**
     * Calls the process manager to spawn a child process
     * @param object data
     * @param function callback
     * @return int
     */
    self.spawn = function( data, callback ) {


        var proc                            = self.pm.createProcess( data, callback );
        self.addChild( proc );
        proc.setParent( self );

        return proc;
    };

    /**
     * Triggers the process callback, then destroys the process.
     * @param data
     */
    self.trigger = function( data ) {

        if ( typeof data !== 'array' ) {

            data                            = [data];
        }

        self.callback.apply( self, data );
        self.destroy();

        
        if ( self.parent instanceof Process && self.parent.children.length === 0 ) {
            self.parent.trigger();
        }
    };

    return self;
};

module.exports                              = Process;