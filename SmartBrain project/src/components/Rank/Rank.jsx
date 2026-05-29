import React from 'react';

const Rank = ({ entries, name }) => {
    return (
        <div style={{ position: 'relative', top: '40px' }}>
            <div className='Black f3'>
                {`${name}, your current entry count is...`}
            </div>
            <div className='Black f1'>
                {entries}
            </div>
        </div>
    );
};

export default Rank;