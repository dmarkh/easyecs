
import { merge_objects } from './Util';
import { LOG } from './Log';

class ComponentManager {

	constructor() {
		this.components = new Map();
		this.assemblages = new Map();
	}

	clear() {
		// noop
		// components and asseblages are permanent properties
		// and should not be cleared
	}

	has( component_name ) {
		return this.components.has( component_name );
	}

	hasAssemblage( assemblage_name ) {
		return this.assemblages.has( assemblage_name );
	}

	get( component_name, defaults = {}, extra_defaults = {} ) {
		if ( !this.has( component_name ) ) {
			LOG.ERROR( 'ComponentManager::get - component ' + component_name + ' is not registered' );
			return false;
		}
		let result = JSON.parse(JSON.stringify(this.components.get( component_name )));
		merge_objects( result, defaults || {}, extra_defaults || {} );
		return result;
	}

	getAssemblage( assemblage_name, defaults = {}, extra_defaults = {} ) {
		if ( !this.hasAssemblage( assemblage_name ) ) {
			LOG.ERROR( 'ComponentManager::getAssemblage - assemblage ' + assemblage_name + ' is not registered' );
			return false;
		}
		let result = Object.create( null, {} ),
			assemblage = this.assemblages.get( assemblage_name ),
			component_names = Object.keys( assemblage );
		component_names.forEach( component_name => {
			result[ component_name ] = Object.create( null, {} );
			merge_objects( result[ component_name ], this.get( component_name ),
				assemblage[ component_name ], defaults[ component_name ] || {}, extra_defaults[ component_name ] || {} );
		});
		return result;
	}

	getAssemblages( assemblage_names = [], defaults = {}, extra_defaults = {} ) {
		let result = Object.create( null, {} );
		assemblage_names.forEach( assemblage_name => {
			if ( this.assemblages.has( assemblage_name ) ) {
				merge_objects( result, this.getAsemblage( assemblage_name, defaults, extra_defaults ) );
			}
		});
		return result;
	}

	getAll( component_names = [], defaults = {}, extra_defaults = {} ) {
		let result = Object.create( null, {} );
		component_names.forEach( component_name => {
			let component = this.get( component_name );
			if ( component ) {
				result[ component_name ] = merge_objects( Object.create(null, {}),
					component, defaults[ component_name ] || {}, extra_defaults[ component_name ] || {} );
			} else {
				LOG.ERROR( 'ComponentManager::getAll - component ' + name + ' is not registered' );
			}
		});
		return result;
	}

	register( component_name, fields = {} ) {
		if ( this.components.has( component_name ) ) {
			LOG.ERROR( 'ComponentManager::register - component ' + component_name + ' already registered' );
			return false;
		}
		this.components.set( component_name, fields );
		return true;
	}

	unregister( component_name ) {
		return this.components.delete( component_name );
	}

	registerAssemblage( assemblage_name, components ) {
		// check if assemblage is already registered
		if ( this.hasAssemblage( assemblage_name ) ) {
			LOG.ERROR( 'ComponentManager::registerAssemblage - assemblage ' + assemblage_name + ' already registered' );
			return false;
		}
		let component_names = Object.keys( components );
		// check that components are registered
		for ( let i = 0; i < component_names.length; i++ ) {
			if ( !this.has( component_names[i] ) ) {
				LOG.ERROR( "ComponentManager::registerAssemblage - unregistered component: " + component_names[i] );
				return false;
			}
		}
		this.assemblages.set( assemblage_name, components );
		return true;
	}

	unregisterAssemblage( assemblage_name ) {
		this.assemblages.delete( assemblage_name );
	}

	serialize() {
		let data = '[]';
		try {
			data = JSON.stringify( Array.from( this.components.entries() ) );
		} catch( e ) {
			LOG.ERROR( 'ComponentManager::serialize - cannot serialize components', e );
		}
		return data;
	}

	deserialize( json ) {
		let items = [];
		try {
			items = JSON.parse( json );
		} catch( e ) {
			LOG.ERROR( 'ComponentManager::deserialize - cannot deserialize components', e );
		}
		items.forEach( item => this.components.set( item[0], item[1] ) );
	}

}

export { ComponentManager };
