import React, { Component } from 'react';
import ParticlesBg from "particles-bg";
import FaceRecognition from './components/FaceRecognition/FaceRecognition.jsx';
import Navigation from './components/Navigation/Navigation.jsx';
import Signin from './components/Signin/Signin.jsx';
import Register from './components/Register/Register.jsx';
import Logo from './components/Logo/Logo.jsx';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.jsx';
import Rank from './components/Rank/Rank.jsx';
import './App.css';

//constant variable cannot be reassigned and changed.

const API_URL = import.meta.env.VITE_API_URL;
// Vite injects this base URL from the VITE_API_URL environment variable.
// import.meta is a special Vite object. It contains build information and environment variables.

const initialState = {//initial state of the app, used for resetting state on sign out and for defining the default state when the app loads.
  input: '', // This is "current typing"; whatever value of the image URL input field inside image URL box (ImageLinkForm -> onInputChange -> App state) is stored in 'input' until the user clicks the Detect button.
  imageUrl: '', // The URL of the image to be processed, set when the user submits the form. When user clicks Detect, current 'input' value is copied to 'imageUrl'.onButtonSubmit sets 'imageUrl' to the current 'input' value, which is then passed down to FaceRecognition as a prop. When 'imageUrl' changes, FaceRecognition will display the new image and call onImageLoad, which in turn calls calculateFaceLocation and displayFaceBoxes to show the detected face boxes on the new image.
  faces: [], // faces stores the raw face-detection response returned by the backend/Eden AI. 
  boxes: [], // boxes stores the calculated CSS positions used to draw overlays on the image. This is used by FaceRecognition.jsx to render the face boxes on the screen. displayFaceBoxes is the function that updates 'boxes' in the state after calculating the positions from the raw API response stored in 'faces'.
  isDetecting: false, // isDetecting controls the Detect button disabled state and loading label. This is Boolean. It is set to 'true' when a detection request is in progress, and 'false' when no detection is happening. This helps prevent multiple simultaneous detection requests.
  error: '', //error stores any error messages to be displayed to the user.
  route: 'signin', //route decides whether App renders Signin, Register, or the home page.
  isSignedIn: false, // Set to 'false' by default to show the Signin component first. Change to 'true' if you want to show the home page first without signing in.
  user: { //stores currently logged-in user data. This is updated when the user successfully signs in or registers, and cleared when the user signs out.
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}
//const initialState contains the default state of the application. So it is created separately from the App component's state to allow for easy resetting of the state when the user signs out. When the user signs out, we can simply set the state back to initialState, which will clear all user data, image data, and reset the route to 'signin'. This helps ensure that when a new user signs in after another user has signed out, they start with a clean slate without any leftover data from the previous user.

//App is the central coordinator between UI components and backend API calls.
class App extends Component { //creates a React component named App that extends the base Component class from React. 
  constructor() { // The constructor is a special method that is called when a new instance of the App component is created. It is used to initialize the component's state and bind event handlers. In this case, we call super().
    super(); //we call super() to call the constructor of the parent Component class, and then we set the initial state of the App component to the initialState object defined above.
    this.state = initialState;// Take all values from initialState and put them into App state, then the app starts with a signed-out user and an empty image detection state.
  };

  //this function is to receive user information from the backend after a successful SIGN IN or REGISTRATION, and store that information in the App component's state. This allows the app to keep track of the currently logged-in user and display their information (e.g., name, entry count) in the UI.
  loadUser = (data) => {
    this.setState({user: { //setState is used to update the state of the component. Here we are updating the 'user' part of the state with the data received from the backend after a successful sign in or registration. We take the relevant fields from the data object and store them in the user state, which can then be used throughout the app to display user information and manage user-specific functionality.
      id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
    }})
  }

  onInputChange = (event) => {
  // event handler that captures user input from ImageLinkForm. Every time the user types in the input field, this updates the 'input' state with the current value of the field.
    this.setState({ input: event.target.value });
    // event.target.value is the current value of the input field. By setting this to the 'input' state, we keep track of what the user is typing in real-time. This allows us to use this value when the user submits the form to send it to the backend for face detection.
  };

  displayFaceBoxes = (boxes) => { // Stores final overlay boxes so FaceRecognition can render them -> draws the face box on the screen
    this.setState({ boxes });
  };

  //handles different API response field names by returning the first valid number. This is used in calculateFaceLocation to extract the bounding box coordinates from the raw API response, which may have different field names depending on the face detection API used by the backend (Eden AI supports multiple face detection models, and different models may return bounding box data in different formats).
  getFirstNumber = (...values) => { // the function getFirstNumber takes a variable number of arguments (using the rest parameter syntax ...values) to return something.
    return values.find((value) => typeof value === 'number' && !Number.isNaN(value)); //the condition is checking if the value is of type 'number' and is not NaN (Not-a-Number). && is the logical AND operator, which meanns that both must be true.
  };

  getFaceBoundingBox = (face) => { //gets the face data from the backend/AI after sending the image URL to the backend and returns the bounding box data.
    if (!face || typeof face !== 'object') { // If !face -> if face is empty/null; typeof face !== 'object' -> if it's not an object; meaning reject bad data. It is a validation to ensure we have a valid face object before trying to access its properties.
      return null;
    }

    const kind = String(face.kind || face.label || face.category || '').toLowerCase(); // Some APIs might use 'kind', 'label', or 'category' to describe the type of detection. We check these to ensure we're working with a face detection result.
    //String is to force value into text. .toLowerCase() is to make everything lowercase -> not having to worry about capitalization differences in the API response.
    const isFaceItem = !kind || kind.includes('face'); // This allows for some flexibility in the API response format while still ensuring we're processing face detection results.
    //If 'kind' is not provided, we assume it's a face item. If 'kind' is provided, we check if it includes the word 'face'. 

    if (!isFaceItem) { // If this item is not identified as a face, we skip it by returning null. This helps prevent errors when processing API responses that may include multiple types of detections (e.g., faces, objects, landmarks) in the same response.
      return null;
    }

    return face.bounding_box || face.bounding_boxes || face.boundingBox || face.box || null; // Different APIs might use different field names for the bounding box data. We check several common possibilities and return the first one we find. If none are found, we return null.
  };

  calculateFaceLocation = (faces) => { // This function takes the raw face detection results from the backend and calculates the CSS positions for the bounding boxes to be displayed on the image. It handles various formats of bounding box data and ensures that the coordinates are valid and properly scaled to the displayed image size.
    // FaceRecognition renders the image with this id; App reads its dimensions here.
    const image = document.getElementById('inputimage'); //getting the image currently show on the screen in the HTML to read its dimensions.
    if (!image || !image.width || !image.height) {
      return []; // if the image is not found or doesn't have valid dimensions, return an empty array/not calculating anything.
    }

    const displayWidth = Number(image.width); // The actual width of the image as displayed on the screen.
    const displayHeight = Number(image.height); // The actual height of the image as displayed on the screen.
    const naturalWidth = Number(image.naturalWidth || image.width); // The original width of the image file. If naturalWidth is not available, we fall back to the displayed width. 
    const naturalHeight = Number(image.naturalHeight || image.height); // The original height of the image file. If naturalHeight is not available, we fall back to the displayed height.

    return faces //starts processing the list of faces from AI from the face data.
    // Some APIs include a confidence score for each detected face. We can filter out detections that are below a certain confidence threshold (e.g., 0.7) to reduce false positives. If the API does not provide confidence scores, we include all detections.
      .filter((face) => face.confidence === undefined || face.confidence >= 0.7) //keeps only faces with good confidence scores, or all faces if confidence is not provided.
      .map(this.getFaceBoundingBox) //converts each face into its bounding box format using the getFaceBoundingBox function.
      .filter(Boolean) //removes invalid data (nulls, underfined, invalid faces) from the list of bounding boxes.
      .map((box) => { //processing each face box one by one.
        const left = this.getFirstNumber(box.x_min, box.xmin, box.left_col, box.leftCol, box.left, box.x); // Different APIs might use different field names for the bounding box coordinates. We check several common possibilities for each coordinate and return the first valid number we find.
        const top = this.getFirstNumber(box.y_min, box.ymin, box.top_row, box.topRow, box.top, box.y); // We also check for 'x' and 'y' as fallbacks, as some APIs might provide the top-left corner of the bounding box using these fields instead of 'left' and 'top'.
        const right = this.getFirstNumber(box.x_max, box.xmax, box.right_col, box.rightCol, box.right); // For the right and bottom coordinates, we check for 'x_max'/'xmax' and 'y_max'/'ymax', as well as 'right_col'/'rightCol' and 'bottom_row'/'bottomRow'. We do not check for 'right' and 'bottom' as fallbacks for these, since they are less commonly used to represent the bottom-right corner of a bounding box.
        const bottom = this.getFirstNumber(box.y_max, box.ymax, box.bottom_row, box.bottomRow, box.bottom); // We do not check for 'x' and 'y' as fallbacks for the right and bottom coordinates, since they are more commonly used to represent the top-left corner of a bounding box. This helps prevent confusion when processing API responses that may use 'x' and 'y' for the top-left corner and separate fields for the bottom-right corner.
        const boxWidth = this.getFirstNumber(box.width, box.w); // Some APIs might provide the width and height of the bounding box instead of the right and bottom coordinates. If we have the width and height, we can calculate the right and bottom coordinates by adding them to the left and top coordinates, respectively.
        const boxHeight = this.getFirstNumber(box.height, box.h); // We check for both 'width' and 'w' as possible field names for the bounding box width, and both 'height' and 'h' for the height, to accommodate different API response formats.
        const xMax = right ?? (boxWidth !== undefined ? left + boxWidth : undefined); // If the right coordinate is not provided, but we have the width, we can calculate the right coordinate by adding the width to the left coordinate. If neither is available, xMax will be undefined.
        const yMax = bottom ?? (boxHeight !== undefined ? top + boxHeight : undefined); // Similarly, if the bottom coordinate is not provided, but we have the height, we can calculate the bottom coordinate by adding the height to the top coordinate. If neither is available, yMax will be undefined.

        if ([left, top, xMax, yMax].some((value) => value === undefined)) {//if any value is missing, cannot calculate the box, so skip this face by returning null.
          return null;
        }

        if (xMax <= left || yMax <= top) { //rejects invalid boxes where the right/bottom coordinates are not greater than the left/top coordinates, which would indicate an invalid bounding box. This helps prevent errors when rendering the face boxes on the image, as invalid coordinates could cause issues with CSS positioning and display.
          return null;
        }

        //detect format type of the coordinates (ratio, percent, or pixel) based on the maximum coordinate value. This is important because different APIs may return bounding box coordinates in different formats. Some APIs return coordinates as ratios (0 to 1) relative to the image dimensions, some return them as percentages (0 to 100), and others return them as absolute pixel values. By detecting the format, we can correctly scale the coordinates to match the displayed image size.
        const maxCoordinate = Math.max(left, top, xMax, yMax); //finds the biggest number among the coordinates to determine the format. If the max coordinate is less than or equal to 1, we assume it's a ratio. If it's greater than 1 but less than or equal to 100, we assume it's a percentage. If it's greater than 100, we assume it's in pixels.
        const isRatio = maxCoordinate <= 1; //vaues are 0-1 (normalized format)
        const isPercent = maxCoordinate > 1 && maxCoordinate <= 100; //values are 0-100 (percentage format)
        //this is to detect how AI is giving coordinates.

        const scaleX = displayWidth / naturalWidth; 
        const scaleY = displayHeight / naturalHeight;
        //prepare scaling rules for image size differences.

        //converting AI data into screen positions. Taking the original coordinates from the API response and scale them to match the displayed image size. If the coordinates are in ratio format, we multiply them by the displayed image dimensions to get pixel values. If they are in percentage format, we first convert them to ratios by dividing by 100, and then multiply by the displayed image dimensions. If they are already in pixel format, we can use them directly without scaling.
        let leftPx = left * scaleX;
        let topPx = top * scaleY;
        let rightPx = xMax * scaleX;
        let bottomPx = yMax * scaleY;

        //Adjusts if AI uses normalized format. If the coordinates are in ratio format (0 to 1), we multiply them by the displayed image dimensions to get the pixel values. If they are in percentage format (0 to 100), we convert them to ratios by dividing by 100 and then multiplying by the displayed image dimensions. If they are already in pixel format, we can use them directly without scaling.
        if (isRatio) {
          leftPx = left * displayWidth;
          topPx = top * displayHeight;
          rightPx = xMax * displayWidth;
          bottomPx = yMax * displayHeight;
        }

        // Adjusts if AI uses percentage format. If the coordinates are in percentage format, we first convert them to ratios by dividing by 100, and then multiply by the displayed image dimensions to get the pixel values.
        if (isPercent) {
          leftPx = (left / 100) * displayWidth;
          topPx = (top / 100) * displayHeight;
          rightPx = (xMax / 100) * displayWidth;
          bottomPx = (yMax / 100) * displayHeight;
        }

        if (leftPx < 0 || topPx < 0 || rightPx > displayWidth || bottomPx > displayHeight) {
          return null;
        }

        //final return format for the face box coordinates that will be used to draw the boxes on the iamge. We return an object with the left, top, right, and bottom coordinates for the bounding box. The right and bottom coordinates are calculated as the distance from the right and bottom edges of the image, which is a common format used for CSS positioning of overlays. By returning these coordinates in a consistent format, we can ensure that the FaceRecognition component can use them to accurately draw the face boxes on the image regardless of the original format provided by the API.
        return {
          leftCol: leftPx,
          topRow: topPx,
          rightCol: displayWidth - rightPx,
          bottomRow: displayHeight - bottomPx,
        };
      })
      .filter(Boolean); //removes any null results again, which can occur if we had to skip any faces due to missing or invalid data during the processing steps. This ensures that the final array of boxes only includes valid bounding box coordinates that can be used to draw the face boxes on the image.
  };

  //this occurs when browser finishes rendering the image after user submits the image URL. This is important because the face box positions need to be calculated based on the actual displayed size of the image, which is only available after the image has loaded.
  onImageLoad = () => {// FaceRecognition calls this once the image loads so boxes match the actual rendered size.
    this.displayFaceBoxes(this.calculateFaceLocation(this.state.faces)); //By calling these, it's to ensure that the face boxes are accurately positioned on the image according to its rendered dimensions.
    //calculateFaceLocation processes the raw AI coordinate response (0-1) and convert it to pixel coordinates based on the actual displayed size of the image.
    //displayFaceBoxes then takes the calculated pixel coordinates and updates the 'boxes' state. When the 'boxes' state is updated, FaceRecognition re-renders and uses these coordinates to draw the face boxes on the image.
  };

  onButtonSubmit = async () => { // Called when the Detect button is clicked; it sends the image URL to the backend.
    if (!this.state.input.trim()) { // Prevents an empty request or only spaces from being sent to the backend API.
      // this -> current App component
      // state -> React memoryy
      // input -> image URl user typed in the input field, stored in state by onInputChange
      // .trim() -> removes spaces
      this.setState({ error: 'Please enter an image URL first.' });
      //setState -> updates React state
      return; //stops function immediately.
    }

    this.setState({ // Reset state for new detection. This clears out any previous image, faces, boxes, and errors, and sets isDetecting to true to indicate that a new detection process is underway.
      imageUrl: this.state.input, //locks submitted image
      faces: [], //clears previous AI results
      boxes: [], //clears old rectangles
      isDetecting: true, //shows loading state "detecting..."
      error: '', //clears old errors
    });

    try {
      const response = await fetch(`${API_URL}/imageurl`, {//face detection API endpoint.
        //await -> waits for backend response.
        //fetch -> sends HTTP request
        //${API_URL}/imageurl -> template string for https imageurl
        method: 'POST',// POST to send data (the image URL) in the body of the request. This is more appropriate than GET for this type of operation, and it also allows us to avoid potential issues with URL length limits that can arise when sending data in query parameters with a GET request.
        headers: {'Content-Type': 'application/json'}, //sending JSON data
        body: JSON.stringify({ // We send the image URL in the body of the request as JSON. The backend will parse this and use it to call the Eden AI face detection API.
          //turning JS object into JSON string "JSON.stringify"
          //example: { imageUrl: "abc" } → "{ \"imageUrl\": \"abc\" }"
          imageUrl: this.state.input,
        })
      })
      const result = await response.json(); // Converts response from JSON response to JS object, which should include the results from the Eden AI face detection API.
      const faces = result.output?.items || []; // The expected format is that the detected faces will be in result.output.items, but also handle cases where this might not be present by defaulting to an empty array (|| [])

      if (!response.ok || result.status === 'fail') {
        // If the response status is not OK or if the backend indicates a failure in the result,throw an error to be caught in the catch block below. Also attempt to extract a meaningful error message from the result, but if that's not available, we use a generic error message.
        throw new Error(result.error?.message || 'Face detection failed.');//stops everything and jumps to catch
      }

      if(response) { // If a successful response from the backend, want to update the user's entry count. We send a separate request to the backend to update the count for this user.
        fetch(`${API_URL}/image`, {//update user entries count API endpoint
          method: 'put', // We use PUT here because we're updating the user's entry count on the server.
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({// Sending user's ID in the body of the request as JSON so the backend knows which user's entry count to update. The backend will use this ID to find the user in the database, increment their entry count, and return the updated count.
              id: this.state.user.id //updating THIS user in database
          })
        })
        .then(response => response.json()) // We parse the JSON response from the backend, which should include the updated entry count for the user. The expected format is that the new count will be in response.count.
        .then(count => { // Updating the user's entry count in the state with the new count returned from the backend.
          this.setState(prevState => ({ //Using a functional state update here to ensure we're working with the most up-to-date state, especially since this update depends on the previous state of the user.
            user: {
              ...prevState.user, //keeps existing user data
              entries: count, //increase user's image submission count
            },
          }));
        });
      }

      if (faces.length === 0) {
        this.setState({ error: 'No faces were detected in this image.' }); // If the API response was successful but did not include any detected faces, we set an error message to inform the user.
      }

      this.setState({ faces }, () => { //callback function
        const boxes = this.calculateFaceLocation(faces); // After we update the state with the raw face detection results, we call calculateFaceLocation to process those results and extract the bounding box data needed to display the face boxes on the image.

        this.displayFaceBoxes(boxes); // We then call displayFaceBoxes to update the state with the calculated boxes, which will trigger a re-render of the FaceRecognition component to show the boxes on the image.

        if (faces.length > 0 && boxes.length === 0) {  // If we received face detection results from the API but were unable to calculate valid bounding boxes for those faces, we set an error message to inform the user. This can happen if the API response format is different than expected or if the bounding box data is missing or invalid. Providing this feedback helps users understand that while the API did return a result, there was an issue with processing that result to display the face boxes on the image.
          this.setState({ error: 'Eden AI returned a result, but it did not include valid face boxes for this image.' }); // This message indicates that the face detection API did return a response, but we were not able to extract valid bounding box data from that response to display on the image. This can help users understand that there was an issue with the API response format or the data it provided, rather than an issue with their input or the image itself.
        }
      });
    } catch (error) {
      this.setState({ error: error.message }); //if anything else crashes, like network error/badAPI/invalid response, show error to user
    } finally { // Regardless of whether the API call was successful or if an error occurred, we want to set isDetecting back to false to re-enable the Detect button and update the UI accordingly. This ensures that the user can attempt another detection after the current process completes, even if it fails.
      this.setState({ isDetecting: false });
    }
  };

  onRouteChange = (route) => { // To handle NAVIGATION between different pages.
    if (route === 'signout'){ // Sign out clears the user, image, and detection state.
      this.setState(initialState)
    } else if (route === 'home'){ // Home means a user has signed in or registered successfully.
      this.setState({ isSignedIn: true })
    }
    this.setState({route: route}); // route controls which branch render() displays.
  }

  render() {
    const { imageUrl, route, isSignedIn, boxes, isDetecting, error } = this.state; // Destructuring keeps the render logic shorter and shows which state values affect the UI.
    
    return ( // The main render function of the App component. It uses conditional rendering to display different components based on the current route (signin, register, or home). It also passes down necessary props to child components, such as event handlers and state values. The ParticlesBg component is used to render a background animation on the page.
      <div className="App">
        <ParticlesBg color="#faf2ff" num={50} type="cobweb" bg={true} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/> 
        {/*The Navigation component is rendered at the top of the page and receives the isSignedIn state and onRouteChange handler as props. This allows the Navigation component to display different navigation options based on whether the user is signed in or not, and to call onRouteChange when the user clicks on a navigation link to change the route in the App state. */}
        { route === 'home' //The home route is shown after Signin/Register loads a user and changes the route.
          ? <div>
            <Logo />
            <Rank name={this.state.user.name}
              entries={this.state.user.entries}
              />
            <ImageLinkForm
              isDetecting={isDetecting}
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
            />
            {error && <p className="error-message">{error}</p>}
            <FaceRecognition boxes={boxes} imageUrl={imageUrl} onImageLoad={this.onImageLoad} />
          </div>
          : (
            this.state.route === 'signin'
            ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          )
        }
      </div>
    );
  }

};

export default App