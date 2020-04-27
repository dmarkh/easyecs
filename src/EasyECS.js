
import { ComponentManager } from './ComponentManager';
import { EntityManager } from './EntityManager';
import { QueryManager } from './QueryManager';
import { SystemManager } from './SystemManager';
import { LOG } from './Log';

class EasyECS {

	constructor() {
		this.componentManager = new ComponentManager();
		this.queryManager = new QueryManager();
		this.entityManager = new EntityManager( this.componentManager, this.queryManager );
		this.systemManager = new SystemManager( this.entityManager, this.componentManager, this.queryManager );
		this.tickid = 1;
	}

	clear() {
		this.componentManager.clear();
		this.queryManager.clear();
		this.entityManager.clear();
		this.systemManager.clear();
	}

	registerComponents( components = [] ) {
		// [ component_name, { component_data } ] 
		components.forEach( component => this.componentManager.register( component[0], component[1] ) );
	}

	unregisterComponents( components = [] ) {
		// [ component_name ]
		components.forEach( component => this.componentManager.unregister( component ) );
	}

	registerComponentAssemblages( assemblages = [] ) {
		// assemblage = [ { name, components: { a: {}, b: {} } } ]
		assemblages.forEach( assemblage => this.componentManager.registerAssemblage( assemblage.name, assemblage.components ) );
	}

	unregisterComponentAssemblages( assemblage_names = [] ) {
		assemblage_names.forEach( assemblage_name => this.componentManager.unregisterAssemblage( assemblage_name ) );
	}

	registerQueries( queries = [] ) {
		// [ name, req_components = [], unreq_components = [] ]
		queries.forEach( query => this.queryManager.register( query[0], query[1], query[2], query[3] || false ) ); 
	}

	unregisterQueries( names = [] ) {
		// names = [ name1, ... nameN ]
		names.forEach( name => this.queryManager.unregister( name ) );
	}

	registerSystems( systems = [] ) {
		// [ System object instance ]
		systems.forEach( system => this.systemManager.register( system ) );
	}

	unregisterSystems( systems = [] ) {
		// [ System object instance ]
		systems.forEach( system => this.systemManager.unregister( system ) );
	}

	async tick() {
		return new Promise( (resolve, reject) => {
			this.queryManager.tick();
			let res = 1 + this.entityManager.tick();
			this.systemManager.tick();
			resolve( res );
		});
	}

	hasEntity( entity_id ) {
		return this.entityManager.has( entity_id );
	}

	addEntity( entity ) {
		return this.entityManager.add( entity );
	}

	addEntities( entities = [] ) {
		entities.forEach( entity => this.addEntity( entity ) );
	}

	delEntity( entity ) {
		return this.entityManager.del( entity );
	}

	delEntities( entities = [] ) {
		entities.forEach( entity => this.delEntity( entity ) );
	}

	getComponentsProto( component_names = [], defaults = {} ) {
		return this.componentManager.getAll( component_names, defaults );
	}

	getComponentAssemblage( assemblage_name, defaults = {} ) {
		return this.componentManager.getAssemblage( assemblage_name, defaults );
	}

	getQueries( names = [] ) {
		return this.queryManager.getAll( names );
	}

	setWhiteboard( name, data = {} ) {
		return this.systemManager.setWhiteboard( name, data );
	}

	getWhiteboard( name ) {
		return this.systemManager.getWhiteboard( name );
	}

	serialize() {
		// only entities have to be serialized and re-imported between levels
		return this.entityManager.serialize();
	}

	deserialize( json ) {
		// only entities have to be serialized and re-imported between levels
		return this.entityManager.deserialize( json );
	}

};

export { EasyECS };
