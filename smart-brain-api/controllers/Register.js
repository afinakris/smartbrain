const saltRounds = 10;

const handleRegister = async (req, res, db, bcrypt) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
        return res.status(400).json('incorrect form submission');// we need to return here because if we don't return then the code will continue to run and it will try to hash the password and insert into the database even though the email, name or password is missing
    }

    try {
        const hash = bcrypt.hashSync(password, 10);
        const user = await db.transaction(async trx => {
            const [loginEmail] = await trx('login')
                .insert({
                    hash: hash,
                    email: email
                })
                .returning('email');

            const [newUser] = await trx('users')
                .insert({
                    email: loginEmail.email,
                    name: name,
                    entries: 0,
                    joined: new Date()
                })
                .returning('*');

            return newUser;
        })

        res.json(user);
    } catch (err) {
        console.log(err);
        res.status(400).json('unable to register')
    }
}

module.exports = {
    handleRegister: handleRegister
};