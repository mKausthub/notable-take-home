const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

// Init Middleware
app.use(cors());
// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Define Routes
app.use('/api', require('./routes/doctors'));

// initialize the port number for server
const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
	console.log(`Server started on port ${PORT}`);
});
