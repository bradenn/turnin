const tar = require('tar-stream');
const streamifier = require('streamifier');
const {unzipSync} = require('zlib');

exports.untar = (buffer) => new Promise((resolve, reject) => {
    let textData = [];
    const extract = tar.extract();
    // Extract method accepts each tarred file as entry, separating header and stream of contents:
    extract.on('entry', (header, stream, next) => {
        stream.on('data', (chunk) => {
            let filename = header.name.substr(header.name.lastIndexOf('/') + 1);
            if(!filename.includes('._') &&
                (filename.endsWith("in") || filename.endsWith("out") || filename.endsWith("err")
                || filename.endsWith("exit") || filename.endsWith("cmd") || filename.endsWith("hide"))){
                textData.push({name: filename, content: String(chunk).split('\n')});
            }
        });
        stream.on('error', (err) => {
            reject(err);
        });
        stream.on('end', () => {
            next();
        });
        stream.resume();
    });
    extract.on('finish', () => {
        // We return array of tarred files's contents:
        resolve(textData);
    });
    // We unzip buffer and convert it to Readable Stream and then pass to tar-stream's extract method:
    streamifier.createReadStream(unzipSync(buffer)).pipe(extract);
});