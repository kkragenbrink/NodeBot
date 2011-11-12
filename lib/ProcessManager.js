var ProcessManager = function() {
    var self                    = this;
    var maxPid                  = Math.pow( 2, 32 ) - 1; // 32 bit integer really better be enough.
    var NodeBot                 = {};
    var pid                     = 0;
    var processes               = {};

    /**
     * Initializes the ProcessManager object.
     * @param NodeBot NB
     */
    self.init = function( NB ) {
        NodeBot              = NB;
    };

    /**
     * Creates a new process and returns the pid.
     * @param data
     * @param callback
     * @return int
     */
    self.createProcess = function( data, callback ) {

        var pid                 = getPid();
        NodeBot.log( 'ProcessManager', "Created new process %d.", pid );

        var proc                = new NodeBot.Process( self, pid, { data : data, callback : callback } );
        processes[pid]          = proc;

        return proc;
    };

    /**
     * Recycles a pid.
     * @param pid
     */
    self.destroyProcess = function( pid ) {

        if ( processes[pid] instanceof NodeBot.Process ) {
            NodeBot.log( 'ProcessManager', "Process %d complete.", pid );
            delete processes[pid];
        }
    };

    /**
     * Gets a known process by its pid.
     * @param pid
     * @return Process
     */
    self.getProcess = function( pid ) {
        if ( processes[pid] instanceof NodeBot.Process ) {
            return processes[pid];
        }
        else {
            NodeBot.warn( 'ProcessManager', 'Attempted to call non-existent process' );
        }
    };

    /**
     * Returns a unique Process ID between 0 and maxPid.
     * Process IDs will be recycled when processes are complete.
     * @private
     */
    var getPid = function() {

        // pid cannot be higher than maxPid so when we get there, reset pid.
        if ( pid === maxPid ) {
            pid         = 0;
        }

        var p           = pid++;

        // Make sure we don't re-use a pid that's still in use.
        if ( p in processes ) {
            p           = self.getPid();
        }

        return p;
    };

    return self;
};

module.exports          = new ProcessManager();