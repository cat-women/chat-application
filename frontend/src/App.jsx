import React from "react";
import Homepage from "./Pages/HomePage";
import { Route, Routes } from "react-router-dom";
import Chatpage from "./Pages/Chatpage";
import "./App.css";
import VideoChat from "./Pages/VideoChat";

const App = () => {
  return (
    <div className='App'>
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/chats' element={<Chatpage />} />
        <Route path='/video' element={<VideoChat />} />

      </Routes>
    </div>
  );
};

export default App;
