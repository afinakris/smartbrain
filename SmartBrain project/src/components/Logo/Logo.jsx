// React is needed because this component returns JSX.
import React from 'react';
// Tilt adds the hover/parallax animation around the logo image.
import Tilt from 'react-parallax-tilt';
// Imports the local brain image so Vite can bundle it correctly.
import brain from './brain.png';
// Component-specific CSS styles the Tilt wrapper.
import './Logo.css';

// Logo renders the visual brand mark shown on the signed-in home page.
const Logo = () => {
    return (
        // Tachyons classes add margin around the logo.
        <div className='ma4 mt0'>
            {/* Tilt wraps the logo and gives it a subtle interactive movement effect. */}
            <Tilt className="Tilt br2 shadow-2" options={{ max : 25 }} style={{ height: '150px', width: '150px'}}>
            {/* Inner container provides padding around the image. */}
            <div className="Tilt-inner pa3">
                {/* The image source comes from the imported brain.png asset. */}
                <img style={{paddingTop: '5px'}} alt='logo' src={brain}/>
            </div>
            </Tilt>
        </div>
        );
    };

export default Logo;
