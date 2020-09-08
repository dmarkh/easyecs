
import { Query } from './Query';
import { Queue } from './Queue';
import { LOG } from './Log';

class QueryManager {

	constructor() {
		// containers
		this.queries = new Map(); // query_name => Query object => set of components
		this.components = Object.create(null,{}); // { component_name => [ query, query ] }
	}

	tick() {
		this.queries.forEach( ( query, key, map ) => query.tick() );
	}

	clear() {
		this.queries.forEach( ( query, key, map ) => {
			query.clear();
		});
	}

	has( name ) {
		return this.queries.has( name );
	}

	get( name ) {
		if ( !name ) {
			LOG.ERROR( 'QueryManager::get - query name is not provided' );
			return false;
		}
		let query = this.queries.get( name );
		if ( !query ) {
			LOG.ERROR( 'QueryManager::get - query ' + name + ' is not registered' );
			return false;
		}
		return query.get();
	}

	getAll( names = [] ) {
		let result = Object.create( null, {} );
		names.forEach( name => {
			let query = this.queries.get( name );
			if ( query ) {
				result[name] = query;
			} else {
				LOG.ERROR( 'QueryManager::getAll - query ' + name + ' is not registered' );
			}
		});
		return result; // object { queryName: queryObj ... queryName: queryObj }
	}

	register( name, required_components = [], unrequired_components = [], is_reactive = false ) {
		if ( !name ) {
			LOG.ERROR( 'QueryManager::register - trying to register unnamed query');
			return;
		}
		if ( this.queries.has( name ) ) {
			LOG.ERROR( 'QueryManager::register - query ' + name + ' is already registered' );
			return;
		}
		let query = new Query( name, required_components, unrequired_components, is_reactive );

		// map component to queries
		required_components.forEach( component => {
			if ( !this.components[component] ) { this.components[component] = new Set(); }
			this.components[component].add( query );
		});
		unrequired_components.forEach( component => {
			if ( !this.components[component] ) { this.components[component] = new Set(); }
			this.components[component].add( query );
		});
	
		// check if there is a registered Query with same signature
		for ( const [key, value] of this.queries ) {
			if ( value.signature === query.signature ) {
				this.queries.set( name, value );
				return;
			}
		}
		this.queries.set( name, query );
	}

	unregister( name ) {
		if ( !name ) {
			LOG.ERROR( 'QueryManager::unregister - trying to unregister unknown query ', name );
			return;
		}
		this.queries.delete( name );
	}

	// new Entity inserted
	entityInserted( entity ) {
		this.queries.forEach( ( query, key, map ) => query.process( entity ) );
	}

	// existing Entity deleted forever
	entityRemoved( entity ) {
		this.queries.forEach( ( query, key, map ) => query.remove( entity ) );
	}

	// component added / removed
	entityComponentModified( entity, component_name, component_data ) {
		if ( this.components[ component_name ] ) {
			this.components[ component_name ].forEach( query => query.process( entity ) );
		}
		// handle add/remove component for reactive queries even if they do not require certain component
		this.queries.forEach( ( query, key, map ) => {
			if ( query.is_reactive && query.has( entity ) ) {
				query.mark_updated( entity );				
			}
		});	
	}

	// component data updated
	entityComponentDataUpdated( entity, component_name, component_data ) {
		if ( this.components[ component_name ] ) {
			this.components[ component_name ].forEach( query => {
				if ( query.is_reactive ) {
					query.mark_updated( entity );
				}
			});
		}
	}

}

export { QueryManager };
