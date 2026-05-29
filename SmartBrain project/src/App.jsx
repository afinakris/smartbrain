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

const initialState = {
  input: '',
  imageUrl: '',
  faces: [],
  boxes: [],
  isDetecting: false,
  error: '',
  route: 'signin',
  isSignedIn: false, // Set to 'false' by default to show the Signin component first. Change to 'true' if you want to show the home page first without signing in.
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  };


  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
    }})
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  };

  displayFaceBoxes = (boxes) => {
    this.setState({ boxes });
  };

  getFirstNumber = (...values) => {
    return values.find((value) => typeof value === 'number' && !Number.isNaN(value));
  };

  getFaceBoundingBox = (face) => {
    if (!face || typeof face !== 'object') {
      return null;
    }

    const kind = String(face.kind || face.label || face.category || '').toLowerCase();
    const isFaceItem = !kind || kind.includes('face');

    if (!isFaceItem) {
      return null;
    }

    return face.bounding_box || face.bounding_boxes || face.boundingBox || face.box || null;
  };

  calculateFaceLocation = (faces) => {
    const image = document.getElementById('inputimage');
    if (!image || !image.width || !image.height) {
      return [];
    }

    const displayWidth = Number(image.width);
    const displayHeight = Number(image.height);
    const naturalWidth = Number(image.naturalWidth || image.width);
    const naturalHeight = Number(image.naturalHeight || image.height);

    return faces
      .filter((face) => face.confidence === undefined || face.confidence >= 0.7)
      .map(this.getFaceBoundingBox)
      .filter(Boolean)
      .map((box) => {
        const left = this.getFirstNumber(box.x_min, box.xmin, box.left_col, box.leftCol, box.left, box.x);
        const top = this.getFirstNumber(box.y_min, box.ymin, box.top_row, box.topRow, box.top, box.y);
        const right = this.getFirstNumber(box.x_max, box.xmax, box.right_col, box.rightCol, box.right);
        const bottom = this.getFirstNumber(box.y_max, box.ymax, box.bottom_row, box.bottomRow, box.bottom);
        const boxWidth = this.getFirstNumber(box.width, box.w);
        const boxHeight = this.getFirstNumber(box.height, box.h);
        const xMax = right ?? (boxWidth !== undefined ? left + boxWidth : undefined);
        const yMax = bottom ?? (boxHeight !== undefined ? top + boxHeight : undefined);

        if ([left, top, xMax, yMax].some((value) => value === undefined)) {
          return null;
        }

        if (xMax <= left || yMax <= top) {
          return null;
        }

        const maxCoordinate = Math.max(left, top, xMax, yMax);
        const isRatio = maxCoordinate <= 1;
        const isPercent = maxCoordinate > 1 && maxCoordinate <= 100;
        const scaleX = displayWidth / naturalWidth;
        const scaleY = displayHeight / naturalHeight;

        let leftPx = left * scaleX;
        let topPx = top * scaleY;
        let rightPx = xMax * scaleX;
        let bottomPx = yMax * scaleY;

        if (isRatio) {
          leftPx = left * displayWidth;
          topPx = top * displayHeight;
          rightPx = xMax * displayWidth;
          bottomPx = yMax * displayHeight;
        }

        if (isPercent) {
          leftPx = (left / 100) * displayWidth;
          topPx = (top / 100) * displayHeight;
          rightPx = (xMax / 100) * displayWidth;
          bottomPx = (yMax / 100) * displayHeight;
        }

        if (leftPx < 0 || topPx < 0 || rightPx > displayWidth || bottomPx > displayHeight) {
          return null;
        }

        return {
          leftCol: leftPx,
          topRow: topPx,
          rightCol: displayWidth - rightPx,
          bottomRow: displayHeight - bottomPx,
        };
      })
      .filter(Boolean);
  };

  onImageLoad = () => {
    this.displayFaceBoxes(this.calculateFaceLocation(this.state.faces));
  };

  onButtonSubmit = async () => {
    if (!this.state.input.trim()) {
      this.setState({ error: 'Please enter an image URL first.' });
      return;
    }

    this.setState({
      imageUrl: this.state.input,
      faces: [],
      boxes: [],
      isDetecting: true,
      error: '',
    });

    try {
      const response = await fetch('https://smart-brain-server-jes8.onrender.com', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          imageUrl: this.state.input,
        })
      })
      const result = await response.json();
      const faces = result.output?.items || [];

      if (!response.ok || result.status === 'fail') {
        throw new Error(result.error?.message || 'Face detection failed.');
      }

      if(response) {
        fetch('https://smart-brain-server-jes8.onrender.com', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
              id: this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(prevState => ({
            user: {
              ...prevState.user,
              entries: count,
            },
          }));
        });
      }

      if (faces.length === 0) {
        this.setState({ error: 'No faces were detected in this image.' });
      }

      this.setState({ faces }, () => {
        const boxes = this.calculateFaceLocation(faces);

        this.displayFaceBoxes(boxes);

        if (faces.length > 0 && boxes.length === 0) {
          this.setState({ error: 'Eden AI returned a result, but it did not include valid face boxes for this image.' });
        }
      });
    } catch (error) {
      this.setState({ error: error.message });
    } finally {
      this.setState({ isDetecting: false });
    }
  };

  onRouteChange = (route) => {
    if (route === 'signout'){
      this.setState(initialState)
    } else if (route === 'home'){
      this.setState({ isSignedIn: true })
    }
    this.setState({route: route});
  }

  render() {
    const { imageUrl, route, isSignedIn, boxes, isDetecting, error } = this.state;

    return (
      <div className="App">
        <ParticlesBg color="#faf2ff" num={50} type="cobweb" bg={true} />
        <Navigation isSignedIn={isSignedIn}onRouteChange={this.onRouteChange}/>
        { route === 'home'
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