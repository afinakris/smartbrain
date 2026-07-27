// Loads backend environment variables such as database credentials and API keys.
require('dotenv').config({ path: './API.env' });
//require(...) -> load another package/file so I can use it. This is Node.js' older import system called CommonJS.
//'dotenv' loads the dotenv package from node_modules
//.config(...) reads environment variables and load them into process.env

// Express creates the HTTP API server used by the React frontend.
const express = require('express'); //Express is a web server framework. So require('express') loads the Express package.
// bcrypt checks and hashes user passwords for authentication.
const bcrypt = require('bcrypt');
// cors allows the frontend app to call this backend from a different origin/port.
const cors = require('cors');//CORS allows frontend to access backend, without it it wouuld be CORS error.
// knex is the query builder used to communicate with PostgreSQL.
const knex = require('knex'); //instead of writing "SELECT *(..." I can write "db.select('*').from('users')"

// Each controller owns the logic for a related backend route.
const register = require ('./controllers/Register');
const signin = require('./controllers/Signin');
const profile = require('./controllers/Profile');
const image = require('./controllers/Image');
// This imports the same image controller module; the route below uses image.handleApiCall directly.
const handleApiCall = require('./controllers/Image');

// Creates a PostgreSQL database connection using values from API.env.
const db = knex({
    client: 'pg', //use postgresql
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
});

// Initializes the Express app.
const app = express();

// Old in-memory sample data kept in the file, but the active routes use PostgreSQL through knex.
const database = {
    users: [
        {
            id: '123',
            name: 'John',
            email: 'john@example.com',
            password: 'cookies',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'Sally',
            email: 'sally@example.com',
            password: 'bananas',
            entries: 0,
            joined: new Date()
        }
    ]
};

// Parses incoming JSON bodies so req.body is available in controllers.
app.use(express.json());
// Enables browser requests from the frontend Vite app.
app.use(cors())

// Health-check route used to confirm the backend server is running.
app.get('/', (req, res) => { res.send('it is working!')})
// This is a callback function. The frontend Signin component posts credentials here. It acceots POST requests of sending data (req, res, db, bcrypt)
app.post('/signin', (req, res) => { signin.handleSignin(req, res, db, bcrypt) })
// The frontend Register component posts new account data here.
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })
// Fetches one user's profile from the users table by id (parameter) and read the data.
app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db) })
// The frontend calls this after detection to increment the user's entry count. It uses PUT method to update existing data (for entry count)
app.put('/image', (req, res) => { image.handleImage(req, res, db) })
// The frontend sends an image URL here; the Image controller forwards it to Eden AI.
app.post('/imageurl', (req, res) => { image.handleApiCall(req, res) })

// Starts the API server so the frontend can call the routes above.
app.listen(process.env.PORT, '0.0.0.0', () => { //the app.listen is to start listening for requests
    console.log(`Server is running on port ${process.env.PORT}`);
});
