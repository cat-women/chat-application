import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import { getSender } from "../config/ChatLogics";
import { BaseAxios } from "../http/baseAxios";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { MdGroupAdd } from "react-icons/md";
import parse from "html-react-parser";
import { caesarDecipher, replaceWordsWithAsterisks } from "./encrypt/Encrypt";
import { Words } from "./words/Words";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState(null);

  const { selectedChat, setSelectedChat, trashTalk, setTrashTalk, user, chats, setChats } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await BaseAxios.get("api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo) {
      setLoggedUser(userInfo);
    }
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    loggedUser && (
      <Box
        display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
        flexDirection="column"
        alignItems="center"
        p={3}
        bg="#fff"
        w={{ base: "100%", md: "31%" }}
        borderWidth="1px"
      >
        <Box
          pb={3}
          px={3}
          fontSize={{ base: "28px", md: "30px" }}
          fontFamily="Work sans"
          display="flex"
          w="100%"
          justifyContent="space-between"
          alignItems="center"
        >
          My Chats
          <GroupChatModal>
            {/* New Group Chat */}
            <MdGroupAdd className="cursor-pointer" />
          </GroupChatModal>
        </Box>
        <Box
          display="flex"
          flexDir="column"
          p={3}
          bg="#F8F8F8"
          w="100%"
          h="100%"
          borderRadius="lg"
          overflowY="hidden"
        >
          {chats ? (
            <Stack overflowY="scroll">
              {chats.map((chat) => (
                <Box
                  onClick={() => setSelectedChat(chat)}
                  cursor="pointer"
                  bg={selectedChat === chat ? "#006AFF" : "#E8E8E8"}
                  color={selectedChat === chat ? "white" : "black"}
                  px={3}
                  py={2}
                  borderRadius="lg"
                  key={chat._id}
                >
                  <Text>
                    {!chat.isGroupChat
                      ? getSender(loggedUser, chat.users)
                      : chat.chatName}
                  </Text>
                  {chat.latestMessage && (
                    <Text fontSize="xs">
                      <b>{chat.latestMessage.sender.name}: </b>

                      {chat.latestMessage.content.includes("iframe") ? (
                        <b>video</b>
                      ) : chat.latestMessage.content.includes("img src") ? (
                        <b>photo</b>
                      ) : (
                        parse(!trashTalk
                          ? replaceWordsWithAsterisks(caesarDecipher(chat.latestMessage.content, 1234), Words)
                          : caesarDecipher(chat.latestMessage.content, 1234))
                      )}
                    </Text>
                  )}
                </Box>
              ))}
            </Stack>
          ) : (
            <ChatLoading />
          )}
        </Box>
      </Box>
    )
  );
};

export default MyChats;
