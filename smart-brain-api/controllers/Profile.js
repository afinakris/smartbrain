// Handles GET /profile/:id by looking up one user in the database.
// The parameters are req (incoming req from frontend), res (response used to send data back (res.json)), db (database connection).
const handleProfileGet = (req, res, db) => {
    // Express stores URL parameters such as :id on req.params.
    const { id } = req.params;
    //let found = false;
    // // we need to loop through the users to find the one with the matching id, if we find it we set found to true and return the user, if we finish the loop and we haven't found it then we return an error
    // Query the users table for the requested id.
    db.select('*').from('users').where({ id })
    //.select('*') means select ALL columns
    //.from('users') means look inside users table
    //.where({id}) means WHERE id = 7
        .then(user => { //this runs when database returs result. Because DB is async: request -> wait -> response; the user is an array (of id:.., name:..., email:...)
            // knex returns an array, so a matching user is stored at index 0.
            if (user.length) {// this is to check if user exists.
            // User.length means if array has at least 1 item, condition passes. This basically asks: "Does the array contain at least 1 item?"
                res.json(user[0]) //because user is ALWAYS an array, array starts at index 0 - with value of the user id, etc. So user[0] will give the actual user object.
            } else {
                res.status(400).json('Not found'); // If no matching row is found, it returns a error message.
            }
        })
        .catch(err => res.status(400).json('error getting user')) // Database fails are caught like DB offline/bad query/connection error
}

// Exports the profile handler so server.js can register the route.
module.exports = {
    handleProfileGet
}
