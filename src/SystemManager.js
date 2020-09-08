
import { LOG } from './Log';

class SystemManager {

	constructor( entityManager, componentManager, queryManager ) {
		// managers
		this.entityManager = entityManager;
		this.componentManager = componentManager;
		this.queryManager = queryManager;
		// containers
		this.systems = [];
		this.nextid = 1;
		this.whiteboard = Object.create(null, {});
	}

	tick() {
		this.systems.forEach( system => {
			if ( system.enabled ) {
				system.tick( this.entityManager, this.componentManager, this.queryManager );
			}
		});
	}

	clear() {
		this.systems.forEach( system => system.clear() );
	}

	init() {
		this.systems.forEach( system => system.init() );
	}

	deinit() {
		this.systems.forEach( system => system.deinit() );
	}

	has( system ) {
		return this.systems.includes( system );
	}

	register( system ) {
		// internal system id
		system.id = this.nextid++;
		// common shared space for systems
		system.whiteboard = this.whiteboard;
		this.systems.push( system );
		return system;
	}

	unregister( system ) {
		let pos = this.systems.indexOf( system );
		if ( pos == -1 ) { return; }
		return (this.systems.splice(pos, 1))[0];
	}

	toggle( system_name ) {
		let system = this.systems.find( system => system.name === system_name );
		if ( system ) { system.enabled = system.enabled ? false : true; }
	}
	
	enable( system_name ) {
		let system = this.systems.find( system => system.name === system_name );
		if ( system ) { system.enabled = true; }
	}

	disable( system_name ) {
		let system = this.systems.find( system => system.name === system_name );
		if ( system ) { system.enabled = false; }
	}

	setWhiteboard( name, data = {} ) {
		this.whiteboard[name] = data;
	}

	getWhiteboard( name ) {
		return this.whiteboard[name];
	}

}

export { SystemManager };
