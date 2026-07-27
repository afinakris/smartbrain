// Handles POST /signin from the frontend Signin component.
// The parameters are req (incoming req from frontend), res (response used to send data back (res.json)), db (database connection), bcrypt (password hashing tool)
const handleSignin = (req, res, db, bcrypt) => {
    // The frontend sends email and password in the JSON request body.
    const { email, password } = req.body;
    if (!email || !password) {
    //if !email || !password-> email / pass is empty OR undefined
        return res.status(400).json('incorrect form submission');// we need to stop the function here because if we don't return then the code will continue to run and it will try to hash the password and insert into the database even though the email, name or password is missing
    }
    // Query the users table for the requested id.
    // Look up the login table (.from('login')) and pick columns of email and stored password hash which will be checked.
    db.select('email', 'hash').from('login')
        .where('email', '=', email) //this is to filter user by finding row where email matches user input
        .then(data => {
            // Compare the plain-text password from the form with the stored bcrypt hash.
            const isValid = bcrypt.compareSync(password, data[0].hash);
            //const isValid -> creates variable that has true or false result
            //bcrypt.compareSync -> compares plain password (user input) vs. hashed password (database) synchronously (so no waiting)
            //password -> the input from user, and 
            // data[0] -> the input from database. DB queries return the first item in the array, which is the first user with the unique email and password.
            //.hash -> stored password hash
            if (isValid) { //isValid comes from bcrypt.compareSync(...). If true, password correct
                // After credentials are valid, fetch the full public user profile from users table.
                return db.select('*').from('users')
                //.select('*') means select ALL columns
                //.from('users') means look inside users table
                    .where('email', '=', email)//filtering out user finding row ehere emaill matches user input
                    .then(user => { //this runs when database returs result. Because DB is async: request -> wait -> response; the user is an array (of id:.., name:..., email:...)
                        // The frontend stores this user in App.jsx through loadUser.
                        res.json(user[0]) 
                        //because user is ALWAYS an array, array starts at index 0 - with value of the user id, etc. So user[0] will give the actual user object.
                    })
                    .catch(err => res.status(400).json('unable to get user'))
                    // Error is when database user lookup fails. This runs insid ethe block "db.select('*')...." it's like "we already verified pass is correct, but failed to fetch user profile"
            } else {
                res.status(400).json('wrong credentials')
                // Wrong password returns a credentials error without exposing details. It is when running "if (isValid)"
            }
        })
        // Missing email or database lookup errors also return a credentials error.
        .catch(err => res.status(400).json('wrong credentials'))
}

// Exports the handler so server.js can attach it to POST /signin.
module.exports = {
    handleSignin: handleSignin
}
