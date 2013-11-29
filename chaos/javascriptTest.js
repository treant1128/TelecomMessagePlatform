var myArray = [];
myArray.push("abc");
myArray.push("mnt");
myArray.unshift("sdcard");

console.log("The length of myArray: %d", myArray.length);
myArray.forEach(function(item, index, myArray){
	console.log(index + ':' + item + ':' + myArray);
});


var obj = {};
obj['name'] = 'Treant';
obj['age'] = 27;
obj['gender'] = 'male';

console.log(obj.hasOwnProperty('name'));
console.log('%s', obj.hasOwnProperty('age'));
console.log(obj.hasOwnProperty('gender'));

console.log(obj['daddg']);
