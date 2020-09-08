
import { LOG } from './Log';

class System {

	constructor( name = "N/A" ) {
		this.id = 0; // to be set by SystemManager
		this.name = name;
		this.enabled = true;
		// this.queries = { queryName: queryObj ... QueryName: QueryObj }
		// as returned by QueryManager.getAll([name1, ... nameN]);
		this.queries = false; // Object.create( null, {} );
		this.query_names = false;
		// callback for real system codes
		this._cb_tick = false;
		this._cb_clear = false;
		this._cb_init = false;
		this._cb_deinit = false;
	}

	on_queries( query_names = [] ) {
		this.query_names = query_names;
		return this;
	}

  on_tick( cb = function() { } ) {
    this._cb_tick = cb.bind(this);
    return this;
  }

	on_clear( cb = function() {} ) {
		this._cb_clear = cb.bind(this);
		return this;
	}

	on_init( cb = function() {} ) {
		this._cb_init = cb.bind(this);
		return this;
	}

	on_deinit( cb = function() {} ) {
		this._cb_deinit = cb.bind(this);
		return this;
	}

	tick( entityManager, componentManager, queryManager ) {
		if ( !this._cb_tick ) { return; }
		// delayed query initialization
		if ( !this.queries && this.query_names ) {
			this.queries = queryManager.getAll( this.query_names );
		}
		// user callback invocation
		this._cb_tick( entityManager, componentManager );

		// COMMON OPERATIONS:

		// QUERIES:
		// this.queries.<name>.get() => Set().forEach( entity => { } );

		// ENTITY OPERATIONS:
		// entityManager.get( id ); // get entity by id
		// entityManager.add( entity ); // queues entity for insert
		// entityManager.del( entity ); // queues entity for deletion
		// entityManager.delByID( id ); // queues entity for deletion

		// COMPONENT OPERATIONS:
		// entityManager.update( entity, component_name, component_data = false ) => delete component on entity
		// entityManager.update( entity, component_name, component_data = { a: 1 }, { meta: "data" } ) => modify or create component
		// entityManager.update( entity, "blinded", componentManager.get("blinded", { ticks: 1000 } ) ); => modify or create, stackable
	}

	clear() {
		if ( this._cb_clear ) { this._cb_clear(); }
	}

	init() {
		if ( this._cb_init ) { this._cb_init(); }
	}

	deinit() {
		if ( this._cb_deinit ) { this._cb_deinit(); }
	}

}

export { System };
