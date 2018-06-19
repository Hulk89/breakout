
function argMax(array) {
  return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}


function arrayClone( arr ) {
  var i, copy;
  if( Array.isArray( arr ) ) {
      copy = arr.slice( 0 );
      for( i = 0; i < copy.length; i++ ) {
          copy[ i ] = arrayClone( copy[ i ] );
      }
      return copy;
  } else if( typeof arr === 'object' ) {
      throw 'Cannot clone array containing an object!';
  } else {
      return arr;
  }
}

function translateAction(action) {
  if (action == 0) {
    return 'left'
  }else {
    return "right"
  }
}

function softmax(logits, temperature) {
  var max_val = Math.max.apply(null, logits)
  var exp_sum = 0;
  for (var i = 0 ; i < logits.length ; i++) {
      exp_sum += Math.exp((logits[i]-max_val)/temperature)
  }
  var exps = []
  for (var i = 0 ; i < logits.length ; i++) {
      exps.push(Math.exp((logits[i]-max_val)/temperature)/exp_sum)
  }
  return exps
}
