//server_backAdmin要处理大量来自server_userMails的dnode请求
//导致请求静态资源文件图片的请求全部timeout
//需要单独开一个服务来响应图片的请求
//
var express = require('express');
var app = express();
app.use('/', express.static(__dirname + '/file-upload'));
var port = 8086;
app.listen(port);

console.log('静态资源服务监听Port: ' + port);
