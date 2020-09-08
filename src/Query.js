
import { Queue } from "./Queue";
import { LOG } from './Log';

class Query {

	constructor( name, required_components, unrequired_components, is_reactive = false ) {
		this.name = name;
		this.is_reactive = is_reactive;
		this.entities = new Set();
		this.required_components = required_components || [];
		this.required_components.sort(); // required by signature
		this.unrequired_components = unrequired_components || [];
		this.unrequired_components.sort(); // required by signature
		this.signature = JSON.stringify({ r: this.required_components, u: this.unrequired_components });
		this.entities_inserted = new Set();
		this.entities_deleted  = new Set();
		this.entities_updated  = new Map(); // [Entity] => Set( component_name, component_name ... )
	}

	tick() {
		if ( this.entities_inserted.size ) {
			this.entities_inserted.clear();
		}
		if ( this.entities_deleted.size ) {
			this.entities_deleted.clear();
		}
		if ( this.entities_updated.size ) {
			this.entities_updated.clear();
		}
	}

	clear() {
		this.entities.clear();
		this.entities_inserted.clear();
		this.entities_deleted.clear();
		this.entities_updated.clear();
	}

	has( entity ) {
		return this.entities.has( entity );
	}

	// internal use only
	add( entity ) {
		if ( this.has( entity ) ) { return; }
		this.entities.add( entity );
		this.entities_inserted.add( entity );
	}

	// internal use only
	remove( entity ) {
		if ( !this.has( entity ) ) { return; }
		this.entities.delete( entity );
		this.entities_deleted.add( entity );
	}

	is_changed() {
		return ( this.entities_inserted.size || this.entities_deleted.size );
	}

	is_updated() {
		return this.entities_updated.size;
	}

	get() {
		return this.entities; // returns Set, iterable via Set.forEach( entity )
	}

	signature() {
		return this.signature;
	}

	// check whether entity matches query or not
	process( entity ) {
		for ( let i = 0; i < this.unrequired_components.length; i++ ) {
			if ( entity[ this.unrequired_components[i] ] ) {
				if ( this.has( entity ) ) {
					this.remove( entity );
				}
				return false;
			}
		}
		for ( let i = 0; i < this.required_components.length; i++ ) {
			if ( !entity[ this.required_components[i] ] ) {
				if ( this.has( entity ) ) {
					this.remove( entity );
				}
				return false;
			}
		}
		this.add( entity );
		return true;
	}

	mark_updated( entity, component_name ) {
		if ( !this.has( entity ) ) { return; }
		let components = this.entities_updated.get( entity );
		if ( components ) {
			if ( !components.includes( component_name ) ) {
				components.push( component_name );
			}
		} else {
			this.entities_updated.set( entity, [ component_name ] );
		}
	}


}

export { Query };
