const http = require('http');
const formidable = require('formidable');
const cors = require('cors');

const server = http.createServer((req, res) => {
  cors()(req, res, () => {
    if (req.method === 'POST' && req.url === '/upload') {
      const form = new formidable.IncomingForm();

      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Error parsing form:', err);
          res.statusCode = 500;
          res.end('An error occurred while processing the form.');
        } else {
          console.log('Received files:');
          console.log(files);

          res.statusCode = 200;
          res.end('Files uploaded successfully!');
        }
      });
    } else {
      res.statusCode = 404;
      res.end('Not found');
    }
  });
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
