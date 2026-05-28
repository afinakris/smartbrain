const handleProfileGet = (req, res, db) => {
    const { id } = req.params;
    //let found = false;// we need to loop through the users to find the one with the matching id, if we find it we set found to true and return the user, if we finish the loop and we haven't found it then we return an error
    db.select('*').from('users').where({ id })
        .then(user => {
            if (user.length) {
                res.json(user[0])
            } else {
                res.status(400).json('Not found');
            }
        })
        .catch(err => res.status(400).json('error getting user'))
}

module.exports = {
    handleProfileGet
}