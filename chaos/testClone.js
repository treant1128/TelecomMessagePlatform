var a = {'name':"Treant", age:27};

var b = a;
 b.name="Panda";
 b.age = 28;

 console.log('-------a-------');
 console.log(a);

 console.log('---------b-------');
 console.log(b);



 var _ = require('underscore');

 var c = {'name' : "ddg", isGood : true};

 var d = _.clone(c);
 d.name = "mntabc";
 d.isGood = false;

 console.log('##########c#####');
 console.log(c);

 console.log('$$$$$$$$d$$$$$$');
 console.log(d);
