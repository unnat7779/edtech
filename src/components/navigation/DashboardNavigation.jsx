"use client"
import { useState, useEffect } from "react"
import {
  Box,
  Flex,
  Avatar,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  Stack,
  Text,
} from "@chakra-ui/react"
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons"
import NotificationBell from "@/components/notifications/NotificationBell"
import AdminReplyBell from "@/components/notifications/AdminReplyBell"

const Links = ["Dashboard", "Tests", "Analytics"]

const NavLink = ({ children, isActive = false }) => (
  <Box
    px={4}
    py={2}
    rounded={"lg"}
    color={isActive ? "white" : "slate.300"}
    bg={isActive ? "whiteAlpha.200" : "transparent"}
    _hover={{
      textDecoration: "none",
      bg: "whiteAlpha.200",
      color: "white",
      transform: "translateY(-1px)",
    }}
    transition="all 0.3s ease"
    cursor="pointer"
    fontWeight="medium"
    position="relative"
    _before={
      isActive
        ? {
            content: '""',
            position: "absolute",
            bottom: "-2px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "20px",
            height: "2px",
            bg: "teal.400",
            borderRadius: "full",
          }
        : {}
    }
  >
    {children}
  </Box>
)

export default function DashboardNavigation() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      setScrolled(isScrolled)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <Box
        position="sticky"
        top={0}
        zIndex={1000}
        bg={scrolled ? "blackAlpha.800" : "blackAlpha.900"}
        backdropFilter="blur(20px)"
        borderBottom="1px"
        borderColor={scrolled ? "whiteAlpha.200" : "whiteAlpha.100"}
        px={4}
        transition="all 0.3s ease"
        boxShadow={scrolled ? "0 8px 32px rgba(0, 0, 0, 0.3)" : "0 4px 16px rgba(0, 0, 0, 0.1)"}
        css={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          bgGradient: "linear(to-r, transparent, teal.500, transparent)",
          opacity: 0.5,
        }}
      >
        <Flex
          h={scrolled ? 14 : 16}
          alignItems={"center"}
          justifyContent={"space-between"}
          transition="height 0.3s ease"
        >
          <IconButton
            size={"md"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
            bg="whiteAlpha.200"
            color="slate.300"
            _hover={{
              bg: "whiteAlpha.300",
              color: "white",
              transform: "scale(1.05)",
            }}
            transition="all 0.2s ease"
          />

          <HStack spacing={8} alignItems={"center"}>
            <Box
              _hover={{
                transform: "scale(1.02)",
              }}
              transition="transform 0.2s ease"
            >
              <Text
                fontSize={scrolled ? "lg" : "xl"}
                fontWeight="bold"
                color="white"
                transition="font-size 0.3s ease"
                bgGradient="linear(to-r, white, teal.200)"
                bgClip="text"
              >
                JEEElevate
              </Text>
              <Text fontSize="xs" color="slate.400" opacity={scrolled ? 0.7 : 1} transition="opacity 0.3s ease">
                Let's Ace JEE Together
              </Text>
            </Box>

            <HStack as={"nav"} spacing={2} display={{ base: "none", md: "flex" }}>
              {Links.map((link, index) => (
                <NavLink key={link} isActive={index === 0}>
                  {link}
                </NavLink>
              ))}
            </HStack>
          </HStack>

          <Flex alignItems={"center"} gap={3}>
            <Box opacity={scrolled ? 0.9 : 1} transition="opacity 0.3s ease">
              <NotificationBell />
            </Box>
            <Box opacity={scrolled ? 0.9 : 1} transition="opacity 0.3s ease">
              <AdminReplyBell />
            </Box>

            {/* Glassmorphic Admin Button */}
            <Button
              size="sm"
              bg="blue.600"
              color="white"
              border="1px solid"
              borderColor="blue.500"
              _hover={{
                bg: "blue.700",
                transform: "translateY(-2px) scale(1.02)",
                boxShadow: "0 8px 25px rgba(59, 130, 246, 0.4)",
                borderColor: "blue.400",
              }}
              _active={{
                transform: "translateY(-1px) scale(1.01)",
              }}
              transition="all 0.3s ease"
              leftIcon={<Box as="span">🔧</Box>}
              fontWeight="medium"
              px={4}
              borderRadius="lg"
              css={{
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              Admin
            </Button>

            {/* Glassmorphic Dashboard Button */}
            <Button
              size="sm"
              variant="outline"
              borderColor="teal.500"
              color="teal.300"
              bg="whiteAlpha.100"
              _hover={{
                bg: "teal.500",
                color: "white",
                transform: "translateY(-2px) scale(1.02)",
                boxShadow: "0 8px 25px rgba(20, 184, 166, 0.4)",
                borderColor: "teal.400",
              }}
              _active={{
                transform: "translateY(-1px) scale(1.01)",
              }}
              transition="all 0.3s ease"
              leftIcon={<Box as="span">📊</Box>}
              fontWeight="medium"
              px={4}
              borderRadius="lg"
              css={{
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              Dashboard
            </Button>

            <Menu>
              <MenuButton
                as={Button}
                rounded={"full"}
                variant={"link"}
                cursor={"pointer"}
                minW={0}
                _hover={{
                  transform: "scale(1.05)",
                }}
                transition="transform 0.2s ease"
              >
                <Avatar
                  size={"sm"}
                  src={
                    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=dc03e7e6c3b3e0f9c80f6bbef4f2ba40"
                  }
                  border="2px solid"
                  borderColor="whiteAlpha.300"
                  _hover={{
                    borderColor: "teal.400",
                  }}
                  transition="border-color 0.2s ease"
                />
              </MenuButton>
              <MenuList
                alignItems={"center"}
                bg="blackAlpha.900"
                borderColor="whiteAlpha.200"
                boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.4)"
                css={{
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                }}
              >
                <MenuItem bg="transparent" _hover={{ bg: "whiteAlpha.200" }} color="white" transition="all 0.2s ease">
                  Profile
                </MenuItem>
                <MenuItem bg="transparent" _hover={{ bg: "whiteAlpha.200" }} color="white" transition="all 0.2s ease">
                  Settings
                </MenuItem>
                <MenuDivider borderColor="whiteAlpha.200" />
                <MenuItem bg="transparent" _hover={{ bg: "red.600" }} color="white" transition="all 0.2s ease">
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box
            pb={4}
            display={{ md: "none" }}
            bg="whiteAlpha.200"
            mt={2}
            borderRadius="lg"
            border="1px solid"
            borderColor="whiteAlpha.100"
            css={{
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <Stack as={"nav"} spacing={2} p={2}>
              {Links.map((link, index) => (
                <NavLink key={link} isActive={index === 0}>
                  {link}
                </NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  )
}
