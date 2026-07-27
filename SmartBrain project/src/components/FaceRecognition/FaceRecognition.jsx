// React is needed because this file returns JSX.
import React from 'react';
// Component-specific CSS contains the absolute-positioned bounding box style.
import './FaceRecognition.css';

// FaceRecognition receives the image URL and calculated boxes from App.jsx.
const FaceRecognition = ({ boxes, imageUrl, onImageLoad }) => {
  // If the user has not submitted an image yet, nothing is shown on the page.
  if (!imageUrl) {
    return null;
  }

  return (
    // The outer wrapper centers the image area on the page.
    <div className="center ma">
      {/* This relative visual area holds the image and the face overlays. */}
      <div className="absolute mt2">
        {/* App.jsx uses this id and image size to calculate overlay positions. */}
        <img
          id="inputimage"
          alt="faces to detect"
          src={imageUrl}
          width="500px"
          height="auto"
          onLoad={onImageLoad}
        />
        {/* Each box returned from App.jsx becomes a positioned overlay on top of the image. */}
        {boxes.map((box, index) => (
          /* The key tracks each overlay; style receives calculated backend-derived coordinates. */
          <div
            key={`${box.leftCol}-${box.topRow}-${index}`}
            className="bounding-box"
            style={{
              top: box.topRow,
              right: box.rightCol,
              bottom: box.bottomRow,
              left: box.leftCol,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default FaceRecognition;
