import React from 'react';
import { Typography, AppBar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import VideoPlayer from '../components/VideoPlayer';
import SideBar from '../components/SideBar';
import Notifications from '../components/Notifications';

import { useNavigate } from 'react-router'

const useStyles = makeStyles((theme) => ({
  appBar: {
    borderRadius: 15,
    margin: '30px 100px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '600px',
    border: '2px solid black',

    [theme.breakpoints.down('xs')]: {
      width: '90%',
    },
  },
  image: {
    marginLeft: '15px',
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
}));

const VideoChat = () => {
  const classes = useStyles();
  const navigate = useNavigate()

  // const { name, callAccepted, myVideo, userVideo, callEnded, stream, call, setIsVideoCall, isVideoCall } = useContext(SocketContext);

  // useEffect(() => {
  //   if (callEnded) navigate('/chats')
  // }, [navigate])
  return (
    <div className={classes.wrapper}>

      <VideoPlayer />
      <SideBar>
        <Notifications />
      </SideBar>
    </div>
  );
};


export default VideoChat;
