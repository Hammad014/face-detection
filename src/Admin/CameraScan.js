import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import Topbar from '../utilities/Topbar';

const CameraScan = () => {
  const webcamRef = useRef(null);
  const [alert, setAlert] = useState('');

  const capture = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();

      if (imageSrc) {
        // Convert image data URL to Blob
        const res = await fetch(imageSrc);
        const blob = await res.blob();

        const formData = new FormData();
        formData.append('photo', blob, 'capture.jpg');

        try {
          const response = await fetch('http://localhost:5000/recognize', {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();

          // Update the alert message with the recognized entity information
          if (data.message.includes('Person recognized')) {
            setAlert(`Recognized: ${data.message}`);
          } else {
            setAlert('Unrecognized entity: No match found in the database.');
          }
        } catch (error) {
          console.error('Error recognizing face:', error);
          setAlert('Error recognizing face.');
        }
      }
    }
  };

  return (
    <>
    <Topbar/>
   
    <div className="camera-container">
      <h1>Camera Scan</h1>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={640}
        height={480}
      />
      <button onClick={capture}>Scan Face</button>
      {alert && <div className="alert">{alert}</div>}
    </div>
    </>
  );
};

export default CameraScan;
