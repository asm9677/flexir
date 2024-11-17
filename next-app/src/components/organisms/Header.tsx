"use client";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import React, { useEffect } from "react";
import NetworkButton from "../molecules/NetworkButton";
import WalletButton from "../molecules/WalletButton";
import { TbWallet } from "react-icons/tb";
import { useAccount } from "@/context/AccountProvider";
import { PiLetterCirclePBold } from "react-icons/pi";
import { MdSwapCalls } from "react-icons/md";
import { FaHandHoldingUsd } from "react-icons/fa";
import NavButton from "../molecules/NavButton";
import Image from "next/image";

const navLinks = [
  {
    name: <Text textColor={"white"}>Points Market</Text>,
    path: "?token=all",
    icon: <PiLetterCirclePBold size={24} />,
  },
  {
    name: <Text textColor={"#d2d2d2"}>Pre-Market</Text>,
    path: "/pre",
    icon: <MdSwapCalls size={24} />,
  },
  {
    name: <Text textColor={"#d2d2d2"}>OTC Market</Text>,
    path: "/otc",
    icon: <FaHandHoldingUsd size={24} />,
  },
];

export const Header = () => {
  const { signer, connectWallet, connectProvider } = useAccount();

  useEffect(() => {
    connectProvider();
    if (localStorage.getItem("loggedIn")) {
      connectWallet();
    }
  }, []);

  return (
    <Box
      display="flex"
      mx="auto"
      w="1280px"
      h="64px"
      justifyContent="space-between"
      color="white"
      letterSpacing="tight"
    >
      <Flex alignItems={"center"}>
        <Image src="/images/Flexir.png" alt="Flexir" width={52} height={30} />
        {navLinks.map((v, i) => (
          <NavButton
            key={i}
            title={v.name}
            link={v.path}
            icon={v.icon}
            isDisabled={i === 0 ? false : true}
          />
        ))}
      </Flex>
      <Box
        display="flex"
        w="450px"
        alignItems="center"
        pr="4"
        gap="4"
        justifyContent="flex-end"
      >
        <NetworkButton />
        {signer ? (
          <WalletButton />
        ) : (
          <Button
            display="flex"
            justifyContent="center"
            alignItems="center"
            rounded="4px"
            h="40px"
            px="12px"
            py="6px"
            w="150px"
            fontSize="14px"
            fontWeight="600"
            textColor="#15161B"
            bgColor={"green.200"}
            _hover={{ backgroundColor: "green.200" }}
            onClick={connectWallet}
          >
            <Box pr="1">
              <TbWallet size={24} />
            </Box>
            Connect Wallet
          </Button>
        )}
      </Box>
    </Box>
  );
};
