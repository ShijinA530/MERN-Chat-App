import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Signup = () => {
    const [name, setName] = useState()
    const [email, setEmail] = useState() 
    const [password, setPassword] = useState()
    const [confirmPassword, setConfirmPassword] = useState()
    const [pic, setPic] = useState()
    const [show, setShow] = useState(false)
    const [loading, setLoading] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()
  
    const postDetails = (pics) => {
      setLoading(true)
      if (pics === undefined) {
        toast({
          title: 'Please Select an Image!.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'bottom'
        })
      }

      if (pics.type === 'image/jpeg' || pics.type === 'image/png') {
        const data = new FormData()
        data.append('file', pics)
        data.append('upload_preset', 'chat-app')
        data.append('cloud_name', 'dljckonpz')
        fetch('https://api.cloudinary.com/v1_1/dljckonpz/image/upload', { // Correct URL
          method: 'POST',
          body: data,
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
            
            setPic(data.url.toString());
            setLoading(false);
          })
          .catch((err) => {
            console.error(err);
            toast({
              title: 'Image Upload Failed!',
              status: 'error',
              duration: 5000,
              isClosable: true,
              position: 'bottom'
            });
            setLoading(false);
          });
      } else {
        toast({
          title: 'Please Select an Image (jpeg/png format)!',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'bottom'
        });
        setLoading(false);
      }
    }

    const submitHandler = async () => {
      setLoading(true)
      if (!name || !email || !password || !confirmPassword) {
        toast({
          title: 'Please fill in all the fields!',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'bottom'
        });
        setLoading(false)
      }

      if (password !== confirmPassword) {
        toast({
          title: 'Passwords Do Not Match',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'bottom'
        });
      }

      try {
        const config = {
          headers: {
            'Content-type': 'application/json'
          }
        }
        const { data } = await axios.post(import.meta.env.VITE_BACKEND_BASE_URL+'/api/user/register', { name, email, password, pic }, config)

        toast({
          title: 'Registration Successful',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'bottom'
        });

        localStorage.setItem('userInfo', JSON.stringify(data))

        setLoading(false)

        navigate('/chats')
      } catch (error) {
        toast({
          title: 'Error Occured',
          description: error.data.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'bottom'
        });
        setLoading(false)
      }
    }

  return (
    <VStack spacing='5px'>
        <FormControl id='first-name' isRequired>
            <FormLabel>Name</FormLabel>
            <Input
            placeholder='Enter Your Name'
            onChange={(e) => setName(e.target.value)}
            />
        </FormControl>
        <FormControl id='email' isRequired>
            <FormLabel>Email</FormLabel>
            <Input
            placeholder='Enter Your Email'
            onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl id='password' isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
              <Input
                type={show ? 'text' : 'password'}
                placeholder='Enter Your Password'
                onChange={(e) => setPassword(e.target.value)}
                  /> 
                  <InputRightElement width='4.5rem'>
                      <Button h='1.75rem' size='sm' onClick={()=>setShow(!show)}>
                          {show ? "Hide" : "Show"}
                      </Button>
                  </InputRightElement>    
              </InputGroup>
          </FormControl>
          <FormControl id='confirm-password' isRequired>
              <FormLabel>Confirm Password</FormLabel>
              <InputGroup>
              <Input
                type={show ? 'text' : 'password'}
                placeholder='Confirm Password'
                onChange={(e) => setConfirmPassword(e.target.value)}
                  /> 
                  <InputRightElement width='4.5rem'>
                      <Button h='1.75rem' size='sm' onClick={()=>setShow(!show)}>
                          {show ? "Hide" : "Show"}
                      </Button>
                  </InputRightElement>    
              </InputGroup>
          </FormControl>
          <FormControl id='pic' isRequired>
            <FormLabel>Upload your Picture</FormLabel>
              <Input
                  type='file'
                  p='1.5'
                  accept='image/*'
            onChange={(e) => postDetails(e.target.files[0])}
            />
          </FormControl>
          
          <Button
            colorScheme='blue'
            width='100%'
            style={{marginTop: 15}}
            onClick={submitHandler}
            isLoading={loading}
          >
             Sign Up 
          </Button>
    </VStack>
  )
}

export default Signup
