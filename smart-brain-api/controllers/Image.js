// Eden AI endpoint used by the backend to run face detection on an image URL. The URL here is the variable value.
const EDEN_AI_URL = 'https://api.edenai.run/v3/universal-ai';

// Handles POST /imageurl from App.jsx and forwards the image URL to Eden AI.
const handleApiCall = async (req, res) => {
    // The frontend sends imageUrl in the JSON request body.
    const { imageUrl } = req.body;

    if (!imageUrl) {//this is validation check where imageUrl is checked if missing or not.
        return res.status(400).json('imageUrl is required'); //400: bad request - HTTP error
    }//preventing the API call if the imageUrl is not provided

    if (!process.env.EDEN_AI_API_KEY) { //validation check for if API key exists or not.
        return res.status(500).json('Eden AI API key is not configured'); //500: server error - backend is misconfigured.
    }//checking if the API key is set in the environment variables

    try {
        // The backend calls (by fetch) to Eden AI (EDEN_AI_URL) instead of exposing the secret API key to the frontend.
        const response = await fetch(EDEN_AI_URL, {
        //const response -> store result from API call
        //await -> wait until API responds
        //fetch(...) -> send HTTP request
        //EDEN_AI_URL => EdenAI ednpoint
            method: 'POST', //sending data
            headers: { //this is metadata about request
                Authorization: `Bearer ${process.env.EDEN_AI_API_KEY}`, //when backend calls EdenAI, it must provide that it's allowed to use the API, so it sends authorization with the API Key
                //Bearer -> this is the owners of the API Key. It cannot just send the key because APIs follow standards.
                //${} -> inserting actual API key value into string
                //process.env... -> secret key
                'Content-Type': 'application/json', //sending json data
            },
            body: JSON.stringify({ //turns JS object into JSON string
                model: 'image/face_detection/clarifai', // This asks Eden AI to use Clarifai's face-detection model.
                input: {
                // Eden AI receives the image URL submitted by the frontend user.
                file: imageUrl,
                },
            }),
        });

        // Convert Eden AI's response body to JS object before sending it back to App.jsx.
        const result = await response.json();

        // If Eden AI returns an error status, preserve that status for the frontend.
        if (!response.ok) {
            return res.status(response.status).json(result);
        }
        // Successful detection results are sent back to App.jsx for box calculation.
        res.json(result); 
    } catch (err) {
        res.status(500).json('unable to work with API');//500 Internal Server Error if there's anything else crashes like network error, invalid API, or server issue
    }
};

// Handles PUT /image from App.jsx after an image has been submitted successfully.
const handleImage = (req, res, db) => {
    // App.jsx sends the signed-in user's id in the request body. And backend extracts that id.
    const { id } = req.body;
    // Find the user row in tables and finds users with matching id.
    db('users').where('id', '=', id)
        .increment('entries', 1)//increases image count by 1
        .returning('entries') // returning the updated count back.
        .then(entries => { //this runs AFTER database updates
            // App.jsx uses this number to update Rank without refetching the whole profile.
            res.json(entries[0].entries);
            //entries[0].entries is used because PostgreSQL returns the result of an update as an array containing one object. We first access the first element of the array, then extract the entries field from that object to get the updated count
        })
        .catch(err => res.status(400).json('unable to get entries')) //sending response of error if database failed.
}

// Exports both handlers so server.js can attach them to Express routes.
module.exports = { //this is node.js way of sharing functions
    handleImage,
    handleApiCall
}
