var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');

var ROOT = __dirname;

http.createServer(function(req, res){

    if(url.parse(req.url).pathname =='/admin.html'&&!checkAccess(req)){
        res.statusCode = 403;
        res.end("Enter the password");
        return;
    }
    sendFileSafe(url.parse(req.url).pathname, res);

}).listen(3000);

function checkAccess(req){
    return url.parse(req.url, true).query.password == '12345';
}

function sendFileSafe(filePath, res){
    try{
        filePath = decodeURIComponent(filePath);
    }catch(e){
        res.statusCode = 400;
        res.end("Bad Request");
        return;
    }

    if(~filePath.indexOf('\0')){
        res.statusCode = 400;
        res.end("Bad Request");
        return;
    }

    filePath = path.normalize(path.join(ROOT, filePath));

    if(filePath.indexOf(ROOT) != 0){
        res.statusCode = 404;
        res.end("File not found");
        return;
    }

    fs.stat(filePath, function(err, stats){
        if(err || !stats.isFile()){
            res.statusCode = 404;
            res.end("File not found");
            return;
        }

        sendFile(filePath, res);
    });
}

function sendFile(filePath, res){
    fs.readFile(filePath, function(err, content){
        if (err) throw err;
        res.end(content);
    });
}