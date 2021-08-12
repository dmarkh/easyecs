
class Log {

	constructor() {

			this.LEVELS = { 'FATAL': 1, 'ERROR': 2, 'WARN': 3, 'INFO': 4, 'DEBUG': 5, 'TRACE': 6, 'TRACE2': 7, 'TRACE3': 8, 'NONE': 9 };
			this.COLORS = { 'FATAL': 'purple', 'ERROR': 'red', 'WARN': 'brown', 'INFO': 'green',
											 'DEBUG': 'blue', 'TRACE': 'gray', 'TRACE2': 'gray', 'TRACE3': 'gray' };
			this.FATAL = function() {};
			this.ERROR = function() {};
			this.WARN = function() {};
			this.INFO = function() {};
			this.DEBUG = function() {};
			this.TRACE = function() {};
			this.TRACE2 = function() {};
			this.TRACE3 = function() {};

	}

	// common way to set log level
	setLevel( lvl = 'NONE' ) {
		let val = this.LEVELS[ lvl ];
		if ( !val ) return;
		for (const LEVEL in this.LEVELS ) {
			if ( this.LEVELS[LEVEL] <= val ) {
				let log_id = LEVEL, color_id = this.COLORS[log_id];
				this[LEVEL] = function( ...args ) {
					console.log( '%c'+ log_id + ' | ', 'color: ' + color_id, ...args );
				};
			} else {
				this[LEVEL] = function(){};
			}
		}
	}

	
	// uncommon way to set log levels :)
	levels({ FATAL = false, ERROR = false, WARN = false, INFO = false, DEBUG = false, TRACE = false, TRACE2 = false, TRACE3 = false }) {

		if ( TRACE3 ) {
			this.TRACE3 = function( ...args ) {
				console.log( '%cTRACE | ', 'color: gray', ...args );
			};
		}

		if ( TRACE2 ) {
			this.TRACE2 = function( ...args ) {
				console.log( '%cTRACE | ', 'color: gray', ...args );
			};
		}

		if ( TRACE ) {
			this.TRACE = function( ...args ) {
				console.log( '%cTRACE | ', 'color: gray', ...args );
			};
		}
	
		if ( DEBUG ) {
			this.DEBUG = function( ...args ) {
				console.log( '%cDEBUG | ', 'color: blue', ...args );
			};
		}

		if ( INFO ) {
			this.INFO = function( ...args ) {
				console.log( '%c INFO | ', 'color: green', ...args );
			};
		}

		if ( WARN ) {
			this.WARN = function( ...args ) {
				console.log( '%c WARN | ', 'color: brown', ...args );
			};
		}

		if ( ERROR ) {
			this.ERROR = function( ...args ) {
				console.log( '%cERROR | ', 'color: red', ...args );
			};
		}

		if ( FATAL ) {
			this.FATAL = function( ...args ) {
				console.log( '%cFATAL | ', 'color: purple', ...args );
			};
		}

	}

}

let LOG = new Log();

export { LOG };
