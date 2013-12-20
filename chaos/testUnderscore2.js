var _ = require('underscore');

var a = [1, 2, 3];
var b = [101, 2, 1, 10];
var c = [2, 1];

var union = _.union(a, b, c);
console.log(union);

var intersection = _.intersection(a, b, c);
console.log(intersection);

var difference = _.difference([1, 2, 3, 4, 5, 'mnt', 'abc', 'ddg'], [5, 2, 'ddg', 'mnt', 10]);
console.log(difference);

var without= _.without([1, 2, 3, 4, 5, 'mnt', 'abc', 'ddg'], [5, 2, 'ddg', 'mnt', 10]);
console.log(without);

var without2= _.without([1, 2, 3, 4, 5, 'mnt', 'abc', 'ddg'], 5, 2, 'ddg', 'mnt', 10);
console.log(without2);
