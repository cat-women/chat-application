import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement, InputLeftElement } from "@chakra-ui/input";import { VStack } from "@chakra-ui/layout";
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { BaseAxios } from "../../http/baseAxios";

import { CiUser } from "react-icons/ci";
import { AiOutlineLock } from "react-icons/ai";
import { AiFillEye } from "react-icons/ai";
import { AiFillEyeInvisible } from "react-icons/ai";

const Login = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await BaseAxios.post("/api/user/login", { email, password }, config);

      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <VStack spacing='20px'>
      <FormControl id='email' isRequired>
        <FormLabel>Email</FormLabel>
      <InputGroup>
        <InputLeftElement pointerEvents="none" children={<CiUser style={{fontSize:"20px" }} />} />
        <Input variant={"flushed"} value={email} type='email' placeholder='Enter Your Email Address' onChange={(e) => setEmail(e.target.value)} />
        
        </InputGroup>
      </FormControl>
      <FormControl id='password' isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup size='md'>
        <InputLeftElement pointerEvents="none" children={<AiOutlineLock style={{fontSize:"20px" }} />} />

          <Input variant={"flushed"} value={password} onChange={(e) => setPassword(e.target.value)} type={show ? "text" : "password"} placeholder='Enter password' />
          <InputRightElement onClick={handleClick} width='4.5rem' style={{fontSize:"20px"}}>
            {
              show ? <AiFillEye /> :   <AiFillEyeInvisible/>
            }
           
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <Button bgGradient={"linear(to-r, cyan.600,pink.500)"} color={"#fff"}  width='100%' borderRadius='50px' _hover={{ bgGradient:"linear(to-r,pink.500,cyan.600)" }} style={{marginTop:"50px"}} onClick={submitHandler} isLoading={loading}>
        Login
      </Button>
      <Button
        variant='solid'
        colorScheme='red'
        width='100%'
        borderRadius='50px'
        onClick={() => {
          setEmail("guest@example.com");
          setPassword("123456");
        }}
      >
        Get Guest User Credentials
      </Button>
    </VStack>
  );
};

export default Login;
