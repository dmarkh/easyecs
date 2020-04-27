
function merge_objects( target = Object.create( null, {} ), ...objects ) {
	const is_object = obj => ( obj && typeof obj === 'object' && !Array.isArray(obj) );
	return objects.reduce((prev, obj) => {
		Object.keys(obj).forEach(key => {
			const pVal = prev[key];
			const oVal = obj[key];
			if ( is_object(pVal) && is_object(oVal) ) {
				prev[key] = merge_objects(pVal, oVal);
			} else {
				prev[key] = oVal;
			}
		});
		return prev;
	}, target );
};

function merge_objects_incdec( target = Object.create( null, {} ), ...objects ) {
	const is_object = obj => ( obj && typeof obj === 'object' && !Array.isArray(obj) );
	const is_number = obj => ( obj !== false && obj !== undefined && typeof obj === 'number' );
	return objects.reduce((prev, obj) => {
		Object.keys(obj).forEach(key => {
			const pVal = prev[key];
			const oVal = obj[key];
			if ( is_number(pVal) && is_number(oVal) ) {
 				prev[key] = pVal + oVal; // incdec
			} else if ( is_object(pVal) && is_object(oVal) ) {
				prev[key] = merge_objects(pVal, oVal); // dive deeper
			} else {
				prev[key] = oVal; // replacement
			}
		});
		return prev;
	}, target );
};

function make_grid( x, y, v = 0 ) {
	return Array.from( Array( x ), () => Array( y ).fill( v ));
}

function rnd_int( lowerBound, upperBound ) {
  let max = Math.max(lowerBound, upperBound),
      min = Math.min(lowerBound, upperBound);
  return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

function dist( x1, y1, x2, y2 ) {
  return Math.sqrt( Math.pow(x1 - x2,2) + Math.pow(y1 - y2,2) );
}

export { merge_objects, merge_objects_incdec, make_grid, rnd_int, dist };
