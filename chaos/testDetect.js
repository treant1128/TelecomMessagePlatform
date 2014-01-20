function renderHTML(text) { 
    var rawText = text.toString().trim();
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;   

    return rawText.replace(urlRegex, function(url) {   

    if ( ( url.indexOf(".jpg") > 0 ) || ( url.indexOf(".png") > 0 ) || ( url.indexOf(".gif") > 0 ) ) {
            return '<img src="' + url + '">' + '<br/>'
        } else {
            return '<a href="' + url + '">' + url + '</a>' + '<br/>'
        }
    }) 
} 



console.log(renderHTML('I say the url is : http://www.baidu.com, Do you remember that?'));
console.log(renderHTML('I say the url is : http://www.baidu.com/abc/mnt/ddg.jpg, Do you remember that?'));
