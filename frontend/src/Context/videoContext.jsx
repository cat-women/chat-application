import React, { createContext, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import SimplePeer from 'simple-peer';


const SocketContext = createContext();

const socket = io('http://localhost:4000');
// const socket = io('https://warm-wildwood-81069.herokuapp.com');

const ContextProvider = ({ children }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [name, setName] = useState('');
  const [call, setCall] = useState({});
  const [me, setMe] = useState('');
  const [isVideoCall, setIsVideoCall] = useState(false)
  const [callee, setCallee] = useState(null)
  const [caller, setCaller] = useState(JSON.parse(localStorage.getItem('userInfo')))

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  console.log("user to call ", callee)
  // sent your socket id
  useEffect(() => {
    if (caller) socket.emit('newUser', caller._id);
  })

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);

        myVideo.current.srcObject = currentStream;
      });
    socket.on('me', (id) => setMe(id));

    socket.on('callUser', ({ from, name, signal, isVideoCall, callerId }) => {
      setIsVideoCall(isVideoCall)
      setCall({ isReceivingCall: true, from, name, signal, isCaller: false, callerId });
    });

    socket.on('leaveCall', () => {
      setCallEnded(true);
      connectionRef.current.destroy();
      setIsVideoCall(false)

      window.location.reload();
    });
    socket.on('cancelCall', () => {
      setCallEnded(true);
      setIsVideoCall(false)
      window.location.reload();
    });
  }, [isVideoCall]);

  const answerCall = () => {
    console.log("inside answere call")
    setCallAccepted(true);
    const peer = new SimplePeer({ initiator: false, trickle: false, stream });

    peer.on('signal', (data) => {
      console.log("what is call", call)
      socket.emit('answerCall', { signal: data, to: call.from });
    });

    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    peer.signal(call.signal);

    connectionRef.current = peer;
  };

  const callUser = (id) => {
    const peer = new SimplePeer({ initiator: true, trickle: false, stream });
    setCall({ isCaller: true })

    peer.on('signal', (data) => {
      socket.emit('callUser', { userToCall: id, signalData: data, from: caller._id, name: caller.name, isVideoCall });
    });

    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);

      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
    setIsVideoCall(false)
    socket.emit('leaveCall', { userToCall: call.isCaller ? callee._id : call.callerId, isVideoCall });

    window.location.reload();
  };

  const cancelCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
    setIsVideoCall(false)
    socket.emit('cancelCall', { userToCall: callee._id, isVideoCall });

    window.location.reload();
  };


  return (
    <SocketContext.Provider value={{
      call,
      callAccepted,
      myVideo,
      userVideo,
      stream,
      name,
      setName,
      callEnded,
      me,
      setMe,
      callUser,
      leaveCall,
      answerCall,
      isVideoCall,
      setIsVideoCall,
      setCallee,
      callee,
      caller, setCaller,
      cancelCall
    }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
