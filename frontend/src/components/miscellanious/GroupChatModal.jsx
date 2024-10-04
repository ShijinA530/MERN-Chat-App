import { Box, Button, FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useSafeLayoutEffect, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import { ChatState } from './../../Context/ChatProvider';
import axios from 'axios';
import UserListItem from './../User Avatar/UserListItem';
import UserBadgeItem from './../User Avatar/UserBadgeItem';


const GroupChatModal = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [groupChatName, setGroupChatName] = useState()
    const [selectedUsers, setSelectedUsers] = useState([])
    const [search, setSearch] = useState("")
    const [searchResult, setSearchResult] = useState([])
    const [loading, setLoading] = useState(false)

  const toast = useToast()
  
  const { user, chats, setChats } = ChatState()

  const handleSearch = async (query) => {
    setSearch(query)
    if (!query) return

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }

      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/user?search=${search}`, config)
      
      setLoading(false)
      setSearchResult(data)

    } catch (error) {
      toast({
        title: 'Error Occured!',
        description: 'Failed to Load the Search results',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'bottom-left'
      });
    }
  }

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      toast({
        title: 'Please fill all the fields!',
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'top'
      });
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }

      const { data } = await axios.post (`${import.meta.env.VITE_BACKEND_BASE_URL}/api/chat/group`, {
        name: groupChatName,
        users: JSON.stringify(selectedUsers.map((u) => u._id ))
      }, config)
      
      setChats([data, ...chats])
      onClose()
      toast({
        title: 'New Group Created!',
        status: 'success',
        duration: 4000,
        isClosable: true,
        position: 'bottom'
      });

    } catch (error) {
      toast({
        title: 'Failed to Create the Chat!',
        description: error.response.data,
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'bottom'
      });
    }
  }

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: 'User already added',
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'top'
      });
    }

    setSelectedUsers([...selectedUsers, userToAdd])
  }

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter(s => s._id !== delUser._id))
  }
    return (
        <>
          <span onClick={onOpen}>{ children }</span>
    
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
            <ModalHeader
              fontSize='35px'
              fontFamily='Wrok sans'
              display='flex'
              justifyContent='center'
            >
              Create Group Chat
            </ModalHeader>
              <ModalCloseButton />
              <ModalBody display='flex' flexDir='column' alignItems='center' >
              <FormControl>
                <Input
                placeholder='Chat Name'
                  mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}/>
              </FormControl>
              <FormControl>
                <Input
                placeholder='Add Users eg: John, Jane'
                  mb={1}
                onChange={(e) => handleSearch(e.target.value)}/>
              </FormControl>

              <Box w='100%' display='flex' flexDir='wrap'>
              {selectedUsers?.map((u) => (
                <UserBadgeItem key={u._id} user={u} handleFunction={() => handleDelete(u)} />
              ))}
              </Box>

              {loading ? (
                <div>Loading</div>
              ) : (
                  searchResult?.slice(0,4).map((user) => (
                    <UserListItem key={user._id} user={user} handleFunction={() => handleGroup(user)} />
                  ))
              )}
              </ModalBody>
    
              <ModalFooter>
                <Button colorScheme='blue' onClick={handleSubmit}>
                  Create Chat
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )
}

export default GroupChatModal
