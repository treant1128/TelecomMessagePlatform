var aes = require('./AES.js');

var p = aes.DecryptBase64('mh+JJHiymCaztA0NMyIwiA==');

console.log(p);
console.log(p.constructor);

p = p.toString();

console.log(p);
console.log(p.constructor);
