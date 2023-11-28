
import './init'

import 'regenerator-runtime/runtime'
import React from "react";
import ReactDOM from "react-dom/client";


import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import ChatProvider from "./Context/ChatProvider";
import { ContextProvider } from './Context/videoContext';


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
        <ChatProvider>
          <ContextProvider>

            <App />
          </ContextProvider>

        </ChatProvider>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);
