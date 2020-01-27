let request = require('request');

function getJson(target, data, cb){
    request.post(target, {form: data}).on('response', function(response) {
        let body = '';
        response.on('data', function (chunk) {
            body += chunk;
        });
        response.on('end', function () {
            cb(body);
        });
    });
}

let getAuthenticatedPost = (target, data, cb) => {
    getJson(target, data,body => {
        cb(body);
    });
};

module.exports.getAuthenticatedPost = getAuthenticatedPost;