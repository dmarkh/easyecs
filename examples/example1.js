
import { EasyECS, System, LOG, sleep } from 'easyecs';

LOG.setLevel( 'WARN' );
let ecs = new EasyECS();

//----- create & register components -----
let components = [
  [ 'position', { x: 0, y: 0 } ],
  [ 'speed',  { x: 0, y: 0 } ],
	[ 'display', { radius: 20, color: 0 } ]
];
ecs.registerComponents( components );

//----- create & register assemblages -----
let assemblages = [
  {
		name: 'circle_moving',
    components: {
			position: {},
			speed: {},
			display: {}
		}
	},
  {
		name: 'circle_static',
    components: {
			position: {},
			display: {},
		}
	}
];
ecs.registerComponentAssemblages( assemblages );

//----- create & register queries -----
let queries = [
	[ 'query_movable', ['position','speed'], [] ],
	[ 'query_static', ['position'], ['speed'] ],
	[ 'query_display', [ 'position', 'display' ], [], true ] // reactive
];
ecs.registerQueries( queries );

//----- create & register systems -----

let SystemMove = new System('SystemMove')
	.on_queries(['query_movable'])
	.on_tick( function( entityManager, componentManager ) {
		this.queries.query_movable.get().forEach( entity => {
			// updates are supplied as deltas for numeric properties:
			// x = x + dx, y = y + dy
			let dx = entity.speed.x, dy = entity.speed.y;
			// request an update via entityManager
			entityManager.update( entity, 'position', { x: dx, y: dy } );
			// requested update is applied "between" ECS ticks (when all systems are done processing)
			// Entity operations:
			//   entityManager.del( entity );
			//   entityManager.add( entity );
			// componentManager could be used to retrieve components or assemblages:
			//   componentManager.getAssemblage("circle_moving")
			//   componentManager.get("position", { x: 10 , y: 20 })
		});
	});

let SystemDisplay = new System('SystemDisplay')
	.on_queries(['query_display'])
	.on_tick( function( entityManager, componentManager ) {
		// a system that intercepts insert/delete/move of entities, and acts accordingly
		if ( this.queries.query_display.is_changed() ) {
			// new entries added or old ones removed
			this.queries.query_display.entities_inserted.forEach( entity => {
				// new entity just inserted, let's add a sprite to screen here
			});
			this.queries.query_display.entities_deleted.forEach( entity => {
				// entity scheduled for removal, remove sprite from screen
			});
		}
		if ( this.queries.query_display.is_updated() ) {
			this.queries.query_display.entities_updated.forEach( ( components, entity, map ) => {
				// some entity component was updated, let's move sprite
			});
		}
	});

ecs.registerSystems([ SystemDisplay ]);

//----- create & insert basic entities -----
let circle = {
	position: { x: 1, y: 1 },
	speed: { x: 1, y: 0 }
};

ecs.addEntities([]);

//----- ECS loop -----
while( 1 ) {
	/* rc = 1 => no entities updated, rc > 1 => entities were updated  */
	let rc = await ecs.tick();
	// throttle idle cycles
	if ( rc === 1  ) {
		await sleep( 10 );
	}
}
