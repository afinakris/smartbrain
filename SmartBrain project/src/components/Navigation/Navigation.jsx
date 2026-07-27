// React is needed because this component returns JSX.
import React from 'react';

// Navigation receives login status and a route-changing function from App.jsx.
const Navigation = ({onRouteChange, isSignedIn}) => {
    // Signed-in users only need the option to sign out.
    if (isSignedIn) {
        return (
            // The nav is aligned to the right side of the page.
            <nav style={{display: 'flex', justifyContent: 'flex-end'}}>
                {/* Clicking Sign out tells App.jsx to reset state and return to the sign-in route. */}
                <p onClick={() => onRouteChange('signout')} className='f3 link dim black underline pa3 pointer'>Sign out</p>
            </nav>
        );
    } else {
        return (
            // Signed-out users can switch between the Signin and Register components.
            <nav style={{display: 'flex', justifyContent: 'flex-end'}}>
                {/* App.jsx receives "signin" and renders the Signin component. */}
                <p onClick={() => onRouteChange('signin')} className='f3 link dim black underline pa3 pointer'>Sign in</p>
                {/* App.jsx receives "register" and renders the Register component. */}
                <p onClick={() => onRouteChange('register')} className='f3 link dim black underline pa3 pointer'>Register</p>
            </nav>
        );
    }
}

export default Navigation;
