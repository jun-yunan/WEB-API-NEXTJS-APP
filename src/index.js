const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const route = require('./routes');
const handlebars = require('express-handlebars').engine;
const database = require('./config/databaseConfig');

const app = express();
app.use(cors());
database.connect();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.engine(
    'hbs',
    handlebars({
        extname: '.hbs',
    }),
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

route(app);

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
