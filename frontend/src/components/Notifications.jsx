import React, { useContext } from 'react';
import { Button } from '@material-ui/core';
import { SocketContext } from '../Context/videoContext';

const Notifications = () => {
  const { answerCall, call, callAccepted, setIsVideoCall, isVideoCA } = useContext(SocketContext);

  const handleAnswere = () => {
    answerCall()
  }
  return (
    <>
      {call.isReceivingCall && !callAccepted && (
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <h1>{call.name} is calling:</h1>
          <Button variant="contained" color="primary" onClick={() => handleAnswere()}>
            Answer
          </Button>
        </div>
      )}
    </>
  );
};

export default Notifications;
