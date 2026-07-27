// React is needed because this component returns JSX.
import React from 'react';
// Component-specific CSS styles the patterned form container.
import './ImageLinkForm.css';

// App.jsx passes state and callbacks into this presentational form component.
const ImageLinkForm = ({ isDetecting, onInputChange, onButtonSubmit }) => {
    return (
        // This wrapper centers the form area in the home page view.
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            {/* User-facing instruction shown above the URL input. */}
            <p className='f3'>
                {'This Magic Brain will detect faces in your pictures. Give it a try.'}
            </p>
            {/* Centers the input and button row. */}
            <div className='center' style={{ display: 'flex', alignItems: 'center' }}>
                {/* The form class supplies the patterned background from ImageLinkForm.css. */}
                <div className='form center pa4 br3 shadow-5'>
                    {/* This input sends every typed image URL value upward to App.jsx. */}
                    <input
                        className='f4 pa2 w-70'
                        type='text'
                        placeholder='Paste an image URL'
                        onChange={onInputChange}
                    />
                    {/* This button asks App.jsx to submit the URL to the backend for detection. */}
                    <button
                        className='w-30 grow f4 link ph3 pv2 dib white bg-light-purple'
                        disabled={isDetecting}
                        onClick={onButtonSubmit}
                        style={{ border: '1px solid white' }}
                    >
                        {/* The label reflects the request state controlled by App.jsx. */}
                        {isDetecting ? 'Detecting...' : 'Detect'}
                    </button>
                </div>
            </div>
        </div>
    );
    };

export default ImageLinkForm;
