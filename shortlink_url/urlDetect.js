function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    })
    // or alternatively
    // return text.replace(urlRegex, '<a href="$1">$1</a>')
}

var text = "Find me at http://www.example.com and also at http://stackoverflow.com";
var html = urlify(text);
console.log(html);


function linkify(text) {  
	var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;  
	return text.replace(urlRegex, function(url) {  
		return '<a href="' + url + '">' + url + '</a>';  
	})  
}

console.log(linkify("打丁狗123mntabcfdsa http://www.stackoverflow.comio f的回调方法的gjfdj"));
