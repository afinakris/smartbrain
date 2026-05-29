import React from 'react';
import './ImageLinkForm.css';

const ImageLinkForm = ({ isDetecting, onInputChange, onButtonSubmit }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <p className='f3'>
                {'This Magic Brain will detect faces in your pictures. Give it a try.'}
            </p>
            <div className='center' style={{ display: 'flex', alignItems: 'center' }}>
                <div className='form center pa4 br3 shadow-5'>
                    <input
                        className='f4 pa2 w-70'
                        type='text'
                        placeholder='Paste an image URL'
                        onChange={onInputChange}
                    />
                    <button
                        className='w-30 grow f4 link ph3 pv2 dib white bg-light-purple'
                        disabled={isDetecting}
                        onClick={onButtonSubmit}
                        style={{ border: '1px solid white' }}
                    >
                        {isDetecting ? 'Detecting...' : 'Detect'}
                    </button>
                </div>
            </div>
        </div>
    );
    };

export default ImageLinkForm;
