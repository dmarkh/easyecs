
# EasyECS - Entity-Component-System for Javascript ES6+

## Intro

EasyECS is the Entity-Component-System package, that implements all features of the modern [Entity–component–system](https://en.wikipedia.org/wiki/Entity_component_system).

ECS is the architectural pattern that follows the "composition over inheritance" principle.
It allows much greater readability, extensibility and loose module coupling compared to the inheritance-based object designs.

 * Entity - a collection of components that has unique id;
 * Component - plain data structure;
 * Assemblage - helper: a predefined group of components forming pseudo-entity;
 * Query - a rule that describess a selection of entities satisfying some criteria - similar to SQL query;
 * System - code logic module that runs over a set of entities selected by Query(-ies). Systems may add/remove components, or modify component data of a specific entity. Also, Systems may add entities to or remove entities from ECS.

Implementation details:

 * Written using JavaScript ES6;
 * Unlike many Javascript ECS systems, this one does not apply updates immediately, but queues them for 'after-tick' batch processing. This allows to apply Systems in parallel;
 * Implements shared Queues for efficient Entity grouping/processing;
 * Components, Assemblages, Entities, Queries are all simple structures, no classes => store in any format!
 * Implements easy serialization / deserialization of ECS state;
 * Tested to work well with older browsers if transpiled by Babel;
 * Includes basic logging library (see src/Log.js) for easier debugging;

## Core concepts

### ECS initialization

        import { EasyECS, System } from 'easyecs';
        let ecs = new EasyECS();

### Component definitions

        let components = [
          [ 'position', { x: 0, y: 0 } ],
          [ 'speed',  { vx: 0, vy: 0 } ],
        ];
        ecs.registerComponents( components );

### Assemblage definitions

NOTE: all components referred to by Assemblage must be registered with ECS first!

        let assemblages = [
          {
            name: 'moving_object',
            components: {
              position: { x: 0, y: 0 },
              speed: { vx: 0, vy: 0 },
            }
          }
        ];
        ecs.registerComponentAssemblages( assemblages );

### Entity definitions

        let circle = {
          position: { x: 1, y: 1 },
          speed: { vx: 1.5, vy: 0.5 }
        };
        // ...or...
        let circle = ecs.getComponentAssemblage( "moving_object" );
        // ...or, assemblage with defaults...
        let circle = ecs.getComponentAssemblage( "moving_object", { speed: { vx: 1.5, vy: 0.5 } } );
        ecs.addEntities([ circle ]);

### Query definitions

Query definition: ( name, list of component names that MUST present, list of component names that MUST NOT present, is query reactive? ); 
[ '<name>', [ '<component1>'...'<componentN>" ], [ '<component1>' ... '<componentN>' ], true/false ]

        let queries = [
          [ 'query_movable', ['position','speed'], [] ],
          [ 'query_static', ['position'], ['speed'] ],
          [ 'query_display', [ 'position', 'display' ], [], true ]
        ];
        ecs.registerQueries( queries );

### System definitions
NOTE: each System must request one or more Queries, that will provide Entity lists!

        // simple system:
        let SystemMove = new System('SystemMove')
          .on_queries(['query_movable'])
          .on_tick( function( entityManager, componentManager ) {
            this.queries.query_movable.get().forEach( entity => {
              let dx = entity.speed.x, dy = entity.speed.y;
              entityManager.update( entity, 'position', { x: dx, y: dy } );
            });
          });

        // a system that uses reactive query:
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


### Basic ECS loop

        while( 1 ) {
          await ecs.tick();
        }

### ECS state save / load

        // save ECS state to JSON-encoded string:
        let json_string = ecs.serialize();
        
        // then, sometime later, restore ECS state:
        ecs.clear();
        ecs.deserialize( json_string );

## How-To

### Installation

EasyECS package could be installed via NPM:
        
        $> npm install easyecs
        
### Usage 

 Please see "examples" directory for a tutorial(s) on EasyECS

## License

EasyECS is covered under the terms of [MIT License](https://en.wikipedia.org/wiki/MIT_License)
