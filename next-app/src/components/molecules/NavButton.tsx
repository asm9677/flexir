import { Button } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import React, { FC } from "react";

interface NavButtonProps {
  title: any;
  link: string;
  icon: any;
  isDisabled: boolean;
}

const NavButton: FC<NavButtonProps> = ({ title, link, isDisabled }) => {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      bg="transparent"
      alignItems="center"
      _hover={{ bg: "transaparent" }}
      _active={{ bg: "transaparent" }}
      _focus={{ bg: "transaparent" }}
      color={"white"}
      onClick={() => router.push(link)}
      isDisabled={isDisabled}
    >
      {title} 
    </Button>
  ); 
};

export default NavButton;
