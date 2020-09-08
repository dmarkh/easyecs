//
// Simple Queue implemented using Set: only uniqie items get queued
// 

class Queue {

	constructor() {
		this.items = new Set();
	}

	size() {
		return this.items.size;
	}

	clear() {
		this.items.clear();
	}

	has( item ) {
		return this.items.has( item );
	}

	enqueue( item ) {
		if ( !item ) { return; }
		this.items.add( item );
	}

	enqueueAll( items = [] ) {
		items.forEach( item => this.items.set( item ) );
	}

	dequeue() {
		if ( !this.size() ) { return false; }
		let item = this.front();
		this.items.delete( item );
		return item;
	}

	dequeueAll() {
		if ( !this.size() ) { return []; }
		let items = Array.from( this.items.values() );
		this.clear();
		return items;
	}

	front() {
		if ( !this.size() ) { return false; }
		return Array.from( this.items.values() )[0];
	}

	back() {
		if ( !this.size() ) { return false; }
		return Array.from( this.items.values() )[ this.size - 1 ];
	}

}

export { Queue };
