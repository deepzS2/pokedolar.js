const axios = require('axios');
const fs = require('fs');

module.exports = {
    download_image: (url, image_path) =>
        axios({
            url,
            responseType: 'stream',
        }).then(
            response =>
            new Promise((resolve, reject) => {
                response.data
                    .pipe(fs.createWriteStream(image_path))
                    .on('finish', () => resolve())
                    .on('error', e => reject(e));
            }),
        )
}