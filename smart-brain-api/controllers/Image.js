const EDEN_AI_URL = 'https://api.edenai.run/v3/universal-ai';

const handleApiCall = async (req, res) => {
    const { imageUrl } = req.body;

    if (!imageUrl) {
    return res.status(400).json('imageUrl is required');
    }//preventing the API call if the imageUrl is not provided

    if (!process.env.EDEN_AI_API_KEY) {
        return res.status(500).json('Eden AI API key is not configured');
    }//checking if the API key is set in the environment variables

    try {
        const response = await fetch(EDEN_AI_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.EDEN_AI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'image/face_detection/clarifai',
                input: {
                file: imageUrl,
                },
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(result);
        }
        res.json(result); 
    } catch (err) {
        res.status(500).json('unable to work with API');//500 Internal Server Error if there's an issue with the API call
    }
};

const handleImage = (req, res, db) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            res.json(entries[0].entries);
        })
        .catch(err => res.status(400).json('unable to get entries'))
}

module.exports = {
    handleImage,
    handleApiCall
}