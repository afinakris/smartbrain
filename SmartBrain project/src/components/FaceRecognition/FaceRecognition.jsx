import React from 'react';
import './FaceRecognition.css';

const FaceRecognition = ({ boxes, imageUrl, onImageLoad }) => {
  if (!imageUrl) {
    return null;
  }

  return (
    <div className="center ma">
      <div className="absolute mt2">
        <img
          id="inputimage"
          alt="faces to detect"
          src={imageUrl}
          width="500px"
          height="auto"
          onLoad={onImageLoad}
        />
        {boxes.map((box, index) => (
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
