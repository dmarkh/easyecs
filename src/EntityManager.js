
import { ComponentManager } from './ComponentManager';
import { QueryManager } from './QueryManager';
import { Queue } from './Queue';
import { merge_objects, merge_objects_incdec } from './Util';
import { LOG } from './Log';

class EntityManager {

	constructor( componentManager, queryManager ) {
		// managers
		this.componentManager = componentManager;
		this.queryManager = queryManager;
		// containers
		this.entities = new Map();
		this.queueAdd = new Queue();
		this.queueDel = new Queue();
		this.queueUpd = new Queue();
		this.nextid = 1;
		// callbacks
		this.onEntityInserted = false;
		this.onEntityRemoved = false;
		this.onEntityUpdated = false;
	}

	clear() {
		this.queueAdd.clear();
		this.queueDel.clear();
		this.queueUpd.clear();
		this.entities.clear();
	}

	tick() {
		// apply updates to existing entities
		if ( this.queueUpd.size() ) {
			this.queueUpd.dequeueAll().forEach( item => this._updateEntity( item[0], item[1], item[2], item[3] ) );
		}
		if ( this.queueAdd.size() ) {
			// add new entities queued for addition
			this.queueAdd.dequeueAll().forEach( entity => this._insertEntity( entity ) );
		}
		if ( this.queueDel.size() ) {
			// delete entities queued for removal
			this.queueDel.dequeueAll().forEach( entity => this._removeEntity( entity ) );
		}
		return ( this.queueUpd.size() + this.queueAdd.size() + this.queueDel.size() );
	}

	has( id ) {
		if (!id) { return false; }
		return this.entities.has( id );
	}

	get( id ) {
		if (!id) { return false; }
		return ( this.entities.get( id ) || false );
	}

	getAll( ids = [] ) {
		let result = [];
		ids.forEach( id => result.push( this.get( id ) ) );
		return result;
	}

	// queue entities for addition or removal

	add( entity ) {
		if ( !entity.id ) {
			entity.id = this.nextid++;
		}
		this.queueAdd.enqueue( entity );
		return entity;
	}

	del( entity ) {
		if ( !entity.id ) {
			LOG.ERROR( 'EntityManager::del - input entity has no id', JSON.stringify(entity) );
			return;
		}
		this.queueDel.enqueue( entity );
		return entity;
	}

	delByID( id ) {
		if ( !id || !this.entities.has( id ) ) { return; }
		let entity = this.entities.get( id );
		this.queueDel( entity );
		return entity;
	}

	update( entity, component_name, component_data = false, meta = {} ) {
		if ( !entity.id ) {
			LOG.ERROR( 'EntityManager::update - input entity has no id', JSON.stringify(entity) );
			return;
		}
		this.queueUpd.enqueue([ entity, component_name, component_data, meta ]);
		return entity;
	}

	issue_action_intent( action_name, action_data_override, entity, ticks = 20 ) {
		let intent = this.componentManager.get("intent"),
			action_data = this.componentManager.get( action_name, action_data_override ),
			action = this.componentManager.get("action", { ticks, component_name: action_name, component_data: action_data });
		intent.queue.push( action );
		this.update( entity, 'intent', intent );
	}

	// serialize or deserialize state

	serialize() {
		let data = '[]';
		try {
			data = JSON.stringify( Array.from( this.entities.values() ) );
		} catch( e ) {
			LOG.ERROR( 'EntityManager::serialize - serialization failed', e );
		}
		return data;
	}

	deserialize( json ) {
		let data = [];
		try {
			data = JSON.parse( json );
		} catch( e ) {
			LOG.ERROR( 'EntityManager::deserialize - deserialization failed', e );
		}
		data.forEach( entity => this.add( entity ) );
	}

	//--------------- private ---------------

	_insertEntity( entity ) {
		if ( !entity.id ) {
			LOG.ERROR( 'EntityManager::_insertEntity - entity has no id', JSON.stringify(entity) );
			return;
		}
		this.entities.set( entity.id, entity );
		this.queryManager.entityInserted( entity );
		if ( this.onEntityInserted ) {
			this.onEntityInserted( entity );
		}
	}

	_removeEntity( entity ) {
		if ( !entity.id ) {
			LOG.ERROR( 'EntityManager::_removeEntity - entity has no id', JSON.stringify(entity) );
			return;
		}
		this.entities.delete( entity.id );
		this.queryManager.entityRemoved( entity );
		if ( this.onEntityRemoved ) {
			this.onEntityRemoved( entity );
		}
	}

	// modify existing component on the entity
	_updateEntity( entity, component_name, component_data = false, meta = {} ) {
		if ( !entity.id ) {
			LOG.ERROR( 'EntityManager::_updateEntity - entity has no id' );
			return;
		}
		if ( !component_name ) {
			LOG.ERROR( 'EntityManager::_updateEntity - entity has no component "' + component_name + '"' );
			return;
		}
		if ( !this.componentManager.has( component_name ) ) {
			LOG.ERROR( 'EntityManager::_updateEntity - component "' + component_name + '" is not registered' );
			return;
		}
		entity = this.entities.get( entity.id );
		if ( !entity ) {
			LOG.ERROR( 'EntityManager::_updateEntity - cannot get entity by id', JSON.stringify(entity) );
			return;
		}
		if ( !entity[component_name] && component_data ) {
			let prev = false,
					next = merge_objects( this.componentManager.get( component_name ), component_data );
			entity[component_name] = next;
			this.queryManager.entityComponentModified( entity, component_name, component_data );
			// optional place for a hook

		} else if ( entity[component_name] && !component_data ) {
			let prev = entity[component_name],
					next = false; 
			delete entity[component_name];
			this.queryManager.entityComponentModified( entity, component_name, component_data );
			// optional place for a hook

		} else if ( entity[component_name] && component_data ) {
			let prev = entity[component_name],
					next = merge_objects_incdec( entity[component_name], component_data );
			entity[component_name] = next;
			this.queryManager.entityComponentDataUpdated( entity, component_name, component_data );
			// optional place for a hook

		} else {
			// no component, no data
			LOG.ERROR( 'EntityManager::_updateEntity - clearing non-existing component: ' + component_name );
			LOG.ERROR( JSON.stringify(entity) );
			LOG.ERROR( JSON.stringify(component_name) );
			LOG.ERROR( JSON.stringify(component_data) );
		}

	}

}

export { EntityManager };
