// React is needed because this component returns JSX.
import React from 'react';

// Rank receives the signed-in user's name and entry count from App.jsx.
const Rank = ({ entries, name }) => {
    return (
        // Positions the rank message slightly lower on the home page.
        <div style={{ position: 'relative', top: '40px' }}>
            {/* Shows the user whose account is currently loaded from the backend. */}
            <div className='Black f3'>
                {`${name}, your current entry count is...`}
            </div>
            {/* Displays the entries value that increases after successful image submissions. */}
            <div className='Black f1'>
                {entries}
            </div>
        </div>
    );
};

export default Rank;
