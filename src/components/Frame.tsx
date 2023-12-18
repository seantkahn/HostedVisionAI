import React from 'react';

const Frame = () => {
  const url = 'https://mpdemotest2.web.app/'; // Replace with the URL of your HTML page

  return (
    <iframe 
      src={url} 
      style={{ width: '100%', height: '100%', border: 'none' }}
      title="Embedded Page"
    ></iframe>
  );
};

export default Frame;
