import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider'
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { getSender, getSenderFull } from './../config/ChatLogics';
import ProfileModal from './miscellanious/ProfileModal';
import UpdateGroupChatModal from './miscellanious/UpdateGroupChatModal';
import ScrollableChat from './ScrollableChat';
import axios from 'axios';
import './styles.css'
import Lottie from 'react-lottie'
import animationData from "../animation/typing.json"

import io from 'socket.io-client'
const ENDPOINT = "http://localhost:5000"
var socket, selectedChatCompare

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [newMessage, setNewMessage] = useState()
  const [socketConnected, setSocketConnected] = useState(false)
  const [typing, setTyping] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const defaultOptions = {
    loop: true,
    autoPlay: true,
    animationData: animationData,
    renderSettings: {
      preserveAspectRatio: 'xMidyMid slice'
    }
  }

  const toast = useToast()

  const { user, selectedChat, setSelectedChat } = ChatState()
    
  const fetchMessages = async () => {
    if (!selectedChat) return

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }

      setLoading(true)

      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/message/${selectedChat._id}`, config)

      setMessages(data)
      setLoading(false)

      socket.emit("join chat", selectedChat._id)
    } catch (error) {
      toast({
        title: 'Error Occured!',
        description: 'Failed to Load the message',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'bottom'
      });
    }
  }


  useEffect(() => {
    socket = io(import.meta.env.VITE_BACKEND_BASE_URL)
    socket.emit("setup", user)
    socket.on('connected', () => setSocketConnected(true))
    socket.on('typing', () => setIsTyping(true))
    socket.on('stop typing', () => setIsTyping(false))
  }, [])

  useEffect(() => {
    fetchMessages() 
    selectedChatCompare = selectedChat
  }, [selectedChat])

  useEffect(() => {
    socket.on('message received', (newMessageReceived) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
        // give noti
      } else {
        setMessages([...messages, newMessageReceived])
      }
    })
  })


  const sendMessage = async (event) => {
    if (event.key === 'Enter' && newMessage) {
      socket.emit('stop typing', selectedChat._id)
      try {
        const config = {
          headers: {
            'Content-type': 'application/json',
            Authorization: `Bearer ${user.token}`
          }
        }

        setNewMessage('')
        const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/message`, {
          content: newMessage,
          chatId: selectedChat._id
        }, config)
        
        socket.emit('new message', data)
        setMessages([...messages, data])
      } catch (error) {
        toast({
          title: 'Error Occured!',
          description: 'Failed to send the message',
          status: 'error',
          duration: 4000,
          isClosable: true,
          position: 'bottom'
        });
      }
    }
  }

  const typingHandler = (e) => {
    setNewMessage(e.target.value)

    // typing indicator logic
    if (!socketConnected) return

    if (!typing) {
      setTyping(true)
      socket.emit('typing', selectedChat._id)
    }

    let lastTypingTime = new Date().getTime()
    setTimeout(() => {
      var timeNow = new Date().getTime()

      if (typing && timeNow - lastTypingTime >= 3000) {
        socket.emit('stop typing', selectedChat._id)
        setTyping(false)
      }
    }, 3000);
  }

  return (
    <>
          {selectedChat ? (
              <>
                  <Text
                      fontSize={{ base: '28px', md: '30px' }}
                      pb={3}
                      px={2}
                      w='100%'
                      fontFamily='Work sans'
                      display='flex'
                        justifyContent='space-between'
                      alignItems='center'
                    >
                      <IconButton
                      display={{base: 'flex', md: 'none'}}
                          icon={<ArrowBackIcon />}
                          onClick={() => setSelectedChat("")}
                      />   
                      {!selectedChat.isGroupChat ? (
                          <>
                              {getSender(user, selectedChat.users)}
                              <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                          </>
                      ) : (
                            <>
                            {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages} />
                            </>
                      )}
          </Text>
          <Box
            display='flex'
            flexDir='column'
            justifyContent='flex-end'
            p={3}
            bg='#E8E8E8'
            w='100%'
            h='100%'
            borderRadius='lg'
            overflowY='hidden'
          >
            {loading ?
              <Spinner
                size='xl'
                w={20}
                h={20}
                alignSelf='center'
                margin='auto'
              /> : (
                <div className='messages'>
                  <ScrollableChat messages={messages} /> 
                </div>
              )}
            
            <FormControl onKeyDown={(e) => sendMessage(e)} isRequired mt={3}>
              {isTyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }} />
                </div>
              ) : (<></>)}
              <Input
                bg='#E0E0E0'
                placeholder='Enter a message'
                onChange={(e) => typingHandler(e)}
              value={newMessage}/>
            </FormControl>
          </Box>
              </>
          ) : (
          <Box display='flex' alignItems='center' justifyContent='center' h='100%'>
              <Text fontSize='3xl' pb={3} fontFamily='Work sans'>
                  Click on a user to start chatting
              </Text>
          </Box>
      )}
    </>
  )
}

export default SingleChat
