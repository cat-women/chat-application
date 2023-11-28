import { FormControl } from "@chakra-ui/form-control";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Editor } from "@tinymce/tinymce-react";

import { useRef, useContext } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { BsFillMicFill, BsFillMicMuteFill } from "react-icons/bs";
import { GrPowerReset } from "react-icons/gr";
import { Box, Text } from "@chakra-ui/layout";
import { Button, IconButton, Spinner, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ScrollableChat from "./ScrollableChat";
import ProfileModal from "./miscellaneous/ProfileModal";
import parse from "html-react-parser";
import { Words } from "./words/Words";
import "./styles.css";
import { MdRecordVoiceOver, MdVoiceOverOff } from "react-icons/md";

import io from "socket.io-client";
import { ChatState } from "../Context/ChatProvider";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { BaseAxios } from "../http/baseAxios";
import {
  caesarCipher,
  caesarDecipher,
  replaceWordsWithAsterisks,
} from "./encrypt/Encrypt";
import { SocketContext } from "../Context/videoContext";
import VideoPlayer from "./VideoPlayer";
import VideoChat from "../Pages/VideoChat";
const ENDPOINT = "http://localhost:4000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();
  const [speech, setSpeech] = useState(false);
  const [speak, setSpeak] = useState(false);

  const { name, callAccepted, myVideo, userVideo, callEnded, stream, call, setIsVideoCall, isVideoCall, setCallee, caller } = useContext(SocketContext);



  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true, language: "en-US" });
    setSpeech(!speech);
    setSpeak(!speak);
  };
  const stopListening = () => {
    SpeechRecognition.stopListening();
    setSpeech(!speech);
    setSpeak(!speak);
  };

  const { transcript, browserSupportsSpeechRecognition, resetTranscript } =
    useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  const editorRef = useRef(null);
  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const { selectedChat, trashTalk, setTrashTalk, setSelectedChat, user, notification, setNotification } =
    ChatState();

  const handleTrashTalk = () => {
    setTrashTalk(!trashTalk);
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await BaseAxios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const plainTextContent = editorRef.current.getContent();
        const { data } = await BaseAxios.post(
          "/api/message",
          {
            content: caesarCipher(plainTextContent, 1234),
            chatId: selectedChat,
          },
          config
        );
        // data.content = caesarCipher(data.content,1234)

        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });


  const handeCall = () => {
    const users = selectedChat.users
    const ids = users.filter((user) => user._id !== caller._id).map(user => user._id);

    setIsVideoCall(true)

    setCallee(ids[0])
  }


  return (
    <>
      {selectedChat ? (
        <>
          {isVideoCall && <VideoChat />}

          <Text
            fontSize={{ base: "28px", md: "30px" }}
            px={3}
            py={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Text>
          <hr className="bg-black border-black w-full my-2" />
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat
                  messages={messages.map((message) => ({
                    ...message,
                    content: parse(
                      !trashTalk
                        ? replaceWordsWithAsterisks(caesarDecipher(message.content, 1234), Words)
                        : caesarDecipher(message.content, 1234)
                    ),
                  }))}
                />

              </div>
            )}

            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    // height={50}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}

              <div
                style={{
                  height: "230px",
                  width: "100%",
                  marginBottom: "-6.8rem",
                  position: "relative",
                }}
              >
                <div className="z-10 top-3 absolute flex right-6">
                  <Button onClick={() => handeCall()}> Video call</Button>

                  {speak ? (
                    <BsFillMicFill
                      className="mx-2 text-2xl cursor-pointer"
                      onClick={stopListening}
                    />
                  ) : (
                    <BsFillMicMuteFill
                      className="mx-2 text-2xl cursor-pointer"
                      onClick={startListening}
                    />
                  )}

                  {!trashTalk ? (
                    <MdVoiceOverOff
                      onClick={handleTrashTalk}
                      className="text-2xl ml-4 cursor-pointer"
                    />
                  ) : (
                    <MdRecordVoiceOver
                      onClick={handleTrashTalk}
                      className="text-2xl ml-4 cursor-pointer"
                    />
                  )}
                </div>

                <Editor
                  apiKey="i5jxo89i3isqnperj0p3rz8q0yzlhib64z2s16jq26z2kxkc"
                  onInit={(evt, editor) => (editorRef.current = editor)}
                  onEditorChange={setNewMessage}
                  value={speech ? transcript : newMessage}
                  init={{
                    statusbar: "false",
                    height: 145,
                    menubar: false,
                    selector: "textarea",
                    plugins:
                      "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount",
                    toolbar:
                      "undo redo | fontsize | bold italic underline | link image media mergetags | addcomment showcomments | forecolor",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.shiftKey) {
                      const selection = editorRef.current.selection;
                      const container = selection.getNode();
                      if (container && container.nodeName === "LI") {
                        e.preventDefault();
                        const parentList = container.parentNode;
                        const listItemIndex = Array.from(
                          parentList.children
                        ).indexOf(container);
                        const newListItem = document.createElement("li");
                        newListItem.innerHTML = "<br>";
                        parentList.insertBefore(
                          newListItem,
                          parentList.children[listItemIndex + 1]
                        );
                        editorRef.current.selection.setCursorLocation(
                          newListItem,
                          0
                        );
                      }
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      sendMessage();
                      resetTranscript();
                    }
                  }}
                />
              </div>
            </FormControl>
          </Box>
        </>
      ) : (
        // to get socket.io on same page
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text
            fontSize="3xl"
            color={"gray.400"}
            fontWeight={"bold"}
            pb={3}
            fontFamily="Work sans"
          >
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
