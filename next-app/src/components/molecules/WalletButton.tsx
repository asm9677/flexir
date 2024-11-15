import { FC } from "react";
import { FiExternalLink } from "react-icons/fi";
import {
  MdArrowDropDown,
  MdOutlineAccountBalanceWallet,
  MdOutlineContentCopy,
} from "react-icons/md";
import { RxExit } from "react-icons/rx";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Text,
  Button,
  Icon,
  Flex,
} from "@chakra-ui/react";
// import { useAccountProvider } from "@/hooks/useAccountProvider";
import { useAccount } from "@/context/AccountProvider";
import { useRouter } from "next/navigation";

const WalletMenu: FC = () => {
  const { signer, account, disconnectWallet } = useAccount();

  const router = useRouter();

  const onClickCopyClipBoard = () => {
    if (signer) {
      navigator.clipboard.writeText(signer.address);
    }
  };

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<MdArrowDropDown />}
        bg="gray.700"
        color="white"
        _hover={{ bg: "gray.700" }}
        _active={{ bg: "gray.700" }}
        w="160px"
        h="40px"
        fontSize={"14"}
      >
        {account?.slice(0, 6)}...
        {account?.slice(account.length - 4)}
      </MenuButton>
      <MenuList bg="gray.700" color="white" _hover={{ bg: "gray.700" }}>
        <MenuItem
          onClick={onClickCopyClipBoard}
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          px="4"
          bg="gray.700"
          color="white"
          _hover={{ bg: "gray.700" }}
        >
          <Flex alignItems="center" gap="2">
            <Text fontSize="14px" fontWeight="semibold" color="white">
              {account?.slice(0, 6)}...
              {account?.slice(account?.length - 4)}
            </Text>
            <Icon as={MdOutlineContentCopy} boxSize={4} mt={0} />
          </Flex>
        </MenuItem>
        <MenuDivider />

        <MenuItem
          display="flex"
          alignItems="center"
          gap="2"
          p="4"
          bg="gray.700"
          color="white"
          _hover={{ bg: "gray.700" }}
          onClick={() => router.push("/myoffer")}
        >
          <Icon as={MdOutlineAccountBalanceWallet} boxSize={5} />
          <Text fontSize="14px" fontWeight="semibold" color="white">
            My Offers
          </Text>
        </MenuItem>

        <MenuItem
          onClick={() => {
            window.open(`https://sepolia.etherscan.io/address/${account}`);
          }}
          display="flex"
          alignItems="center"
          gap="2"
          p="4"
          bg="gray.700"
          color="white"
          _hover={{ bg: "gray.700" }}
        >
          <Icon as={FiExternalLink} boxSize={5} />
          <Text fontSize="14px" fontWeight="semibold" color="white">
            View on explorer
          </Text>
        </MenuItem>

        <MenuDivider />

        <MenuItem
          onClick={disconnectWallet}
          display="flex"
          alignItems="center"
          gap="2"
          p="4"
          bg="gray.700"
          color="white"
          _hover={{ bg: "gray.700" }}
        >
          <Icon as={RxExit} boxSize={5} />
          <Text fontSize="14px" fontWeight="semibold" color="white">
            Disconnect
          </Text>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default WalletMenu;
