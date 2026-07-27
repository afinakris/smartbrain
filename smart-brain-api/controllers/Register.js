// Number of bcrypt salt rounds intended for password hashing. The higher the number, the more secure but slower, 10 is a standard balance.
//salt rounds is how many times bcrypt scrambles it.
const saltRounds = 10;

// Handles POST /register from the frontend Register component, using async meaning that function will use await so it can pause for database operations.
// The parameters are req (incoming req from frontend), res (response used to send data back (res.json)), db (database connection), bcrypt (password hashing tool)
const handleRegister = async (req, res, db, bcrypt) => { //using async because this function will do slow opertaions (db calls & pass hash), without it, JS wouldn't wait for them.
    // The frontend sends these values in the JSON request body.
    const { email, name, password } = req.body;
    if (!email || !name || !password) { //if ANY field is empty
        return res.status(400).json('incorrect form submission');// we need to stop function  because if we don't return then the code will continue to run and it will try to hash the password and insert into the database even though the email, name or password is missing
    }

    try {//attempt database operations safely
        const hash = bcrypt.hashSync(password, 10); // Hash the plain-text password before storing anything in the login table.
        //bcrypt.hashSync -> encrypt password immediately.
        //password, 10 -> inputs of plain text from user; with salt rounds.
        const user = await db.transaction(async trx => {// A transaction keeps login credentials (email & password hash) and user profile (name & entries) inserts together, either BOTH succeed or both fail.
            //starting database session (trx) where multiple DB actions are done. First is inserting the login table (from trx('login')) below
            //db.transaction -> run multiple database operations as ONE unit. Why? so both inserts succeed OR both fail.
            //await is to wait until entire transaction finishes. Bceause inserting login, user, commit/rollback takes time, and each step must finish before next step because second insert depends on first so order is critical.

            const [loginEmail] = await trx('login')//going into login table.
            //First insert the secure login record with email and password hash.
            //trx('login') -> select login table
            //[loginEmail] -> Why brackets? array destructuring: take first item of array [{email:...}]
                .insert({ //.insert({...}) -> add row email & hash
                    hash: hash,
                    email: email
                })
                .returning('email'); //return inserted email after trx ('login'). Result becomes loginEmail = {...}

            // Then insert the public user profile linked by the same email address.
            const [newUser] = await trx('users')
                .insert({
                    email: loginEmail.email,
                    name: name,
                    entries: 0,
                    joined: new Date()
                })
                .returning('*'); //after inserting, returning full fields of user object that was created, i.e. id, email, name, entries, joined. Without it, you insert data but get NOTHING back.

            return newUser; //returning value from the transaction block. So user = neewUser. This is sending data OUT of transaction.
        })

        // Sending data TO frontend. The frontend stores this user in App.jsx and moves to the home route.
        res.json(user);
    } catch (err) {
        console.log(err);
        // Registration can fail because of duplicate emails, database errors, or invalid data.
        res.status(400).json('unable to register')
    }
}

// Exports the handler so server.js can attach it to POST /register.
module.exports = {
    handleRegister: handleRegister
};
