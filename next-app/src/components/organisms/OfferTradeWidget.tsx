import { useAccount } from "@/context/AccountProvider";
import { useContract } from "@/hooks/useContract";
import { Box, Button, Flex, Image, Text } from "@chakra-ui/react";
import { formatUnits, parseUnits } from "ethers";
import Link from "next/link";
import React, { FC, useMemo, useState } from "react";
import { FaDiscord, FaHome, FaTelegramPlane, FaTwitter } from "react-icons/fa";
import { FaArrowDownLong } from "react-icons/fa6";
import { notify } from "../../lib";
import { Contract } from "ethers";
import { useRouter } from "next/navigation";
import OfferInputBox from "../molecules/OfferInputBox";
import { keyframes } from "@emotion/react";

interface NavButtonProps {
  offer: IOffer;
  offerId: string;
  order: IOrder | null;
  orderId: number;
  token: IToken;
  tokenAmount: string;
  fetchBase: () => void;
  onOpen: () => void;
  isSettled: boolean;
  isClaimed: boolean;
  isSelling: boolean;
}

const OfferTradeWidget: FC<NavButtonProps> = ({
  offer,
  offerId,
  order,
  orderId,
  token,
  tokenAmount,
  fetchBase,
  onOpen,
  isSettled,
  isClaimed,
  isSelling,
}) => {
  const router = useRouter();
  const { signer } = useAccount();
  const { flexirContract, tokenContract, usdtContract } = useContract();
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  const startingAt = useMemo(() => {
    if (token.status == 3) {
      return token.settleTime;
    } else {
      return 0;
    }
  }, [token]);
  const closingAt = useMemo(() => {
    if (token.status == 3) {
      return token.settleTime + token.settleDuration;
    } else {
      return 0;
    }
  }, [token]);

  const pulse = keyframes`
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
`;

  const onClickSettleFilled = async () => {
    if (signer && flexirContract && offer && order && token) {
      try {
        setIsActionLoading(true);

        const userBalance = await tokenContract.balanceOf(signer.address);
        if (userBalance < parseUnits(tokenAmount, 24)) {
          notify("Unsufficient user balance.", false);
          return;
        }

        try {
          notify("Checking Allowance...", true);
          const currentAllowance = await tokenContract.allowance(
            signer.address,
            flexirContract.getAddress()
          );

          if (currentAllowance < parseUnits(tokenAmount, 24)) {
            notify("Approving FLEXIR...", true);
            const approveTx = await (
              tokenContract.connect(signer) as Contract
            ).approve(flexirContract.getAddress(), parseUnits(tokenAmount, 24));
            await approveTx.wait();

            notify("Approval completed !", true);
          } else {
            notify("Checking completed !", true);
          }

          if (offer.originalOrderId == 0n) {
            const newOrderEvent = await flexirContract.queryFilter(
              flexirContract.filters.NewOrder(null, offerId),
              0,
              "latest"
            );

            if (newOrderEvent.length > 0) {
              const log = flexirContract.interface.parseLog(newOrderEvent[0]);
              if (log) {
                const settleFilledTx = await (
                  flexirContract.connect(signer) as Contract
                ).settleFilled(log.args[0]);
                await settleFilledTx.wait();
              }
            }
          } else {
            const settleFilledTx = await (
              flexirContract.connect(signer) as Contract
            ).settleFilled(offer.originalOrderId);
            await settleFilledTx.wait();
          }

          notify("Transaction confirmed successfully !", true);
        } catch (error: any) {
          console.error("Error allowance: ", error);
          notify(error.shortMessage, false);
        }

        fetchBase();
      } catch (error: any) {
        console.error(error);
        notify(error.shortMessage, false);
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  const onClickSettleCancelled = async () => {
    if (signer && flexirContract && offer) {
      try {
        setIsActionLoading(true);
        const settleCancelledTx = await (
          flexirContract.connect(signer) as Contract
        ).settleCancelled(orderId);
        await settleCancelledTx.wait();

        fetchBase();
      } catch (error) {
        console.error(error);
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  const onClickFillOffer = async () => {
    if (signer && flexirContract && offer) {
      try {
        setIsActionLoading(true);

        const userBalance = await usdtContract.balanceOf(signer.address);
        if (userBalance < offer.value) {
          notify("Unsufficient user balance.", false);
          return;
        }

        try {
          notify("Checking Allowance...", true);
          const currentAllowance = await usdtContract.allowance(
            signer.address,
            flexirContract.getAddress()
          );

          if (currentAllowance < offer.value) {
            notify("Approving USDT...", true);
            const approveTx = await (
              usdtContract.connect(signer) as Contract
            ).approve(flexirContract.getAddress(), offer.value);
            await approveTx.wait();
            notify("Approval completed !", true);
          } else {
            notify("Checking completed !", true);
          }
        } catch (error: any) {
          console.error("Error allowance: ", error);
          notify(error.shortMessage, false);
        }

        if (offer.originalOrderId == 0n) {
          const fillOfferTx = await (
            flexirContract.connect(signer) as Contract
          ).fillOffer(offerId, offer.amount);
          await fillOfferTx.wait();
        } else {
          const fillResaleOfferTx = await (
            flexirContract.connect(signer) as Contract
          ).fillResaleOffer(offerId);
          await fillResaleOfferTx.wait();
        }

        notify("Transaction confirmed successfully !", true);
        fetchBase();
      } catch (error: any) {
        console.error(error);
        notify(error.shortMessage, false);
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  const onClickCancelOffer = async () => {
    if (signer && flexirContract) {
      try {
        setIsActionLoading(true);
        notify("Canceling offer...", true);
        const cancelOfferTx = await (
          flexirContract.connect(signer) as Contract
        ).cancelOffer(offerId);
        await cancelOfferTx.wait();

        router.push("/");
        notify("Offer canceled !", true);
      } catch (error) {
        console.error(error);
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  return (
    <Flex maxW="60%" w="full" rounded="md">
      <Box
        w="full"
        border="1px solid"
        borderColor="green.700"
        px={6}
        pt={6}
        pb={2}
        rounded="lg"
        h="500px"
      >
        <Flex flexDir="column">
          <Flex alignItems={"center"} gap={4}>
            <Image
              src="/symbol/Ethereum.png"
              alt="logo"
              w="60px"
              h="60px"
              rounded="full"
            />
            <Flex flexDirection={"column"}>
              <Text fontWeight="bold" fontSize="18px" textColor="white">
                FLEXIR
              </Text>
              <Flex gap={1} alignItems="center">
                <Link href="https://x.com/getgrass_io" target="_blank">
                  <FaTelegramPlane color="white" />
                </Link>
                <Link href="https://t.me/fulltime_scam" target="_blank">
                  <FaTwitter color="white" />
                </Link>
                <Link href="https://discord.gg/jHKM36qC" target="_blank">
                  <FaDiscord color="white" />
                </Link>
                <Link href="https://app.getgrass.io/" target="_blank">
                  <FaHome color="white" />
                </Link>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <Flex flexDir="column" mt={5} gap={3}>
          <OfferInputBox
            src={
              offer?.offerType === 1n
                ? "/images/usdt.png"
                : "/symbol/Ethereum.png"
            }
            name={offer?.offerType === 1n ? "PRICE" : "POINTS"}
            value={offer?.offerType === 1n ? offer.value : offer.amount}
          />
          <Flex justifyContent={"center"}>
            <FaArrowDownLong color={"#ECECEC"} />
          </Flex>
          <OfferInputBox
            src={
              offer?.offerType === 1n
                ? "/symbol/Ethereum.png"
                : "/images/usdt.png"
            }
            name={offer?.offerType === 1n ? "POINTS" : "PRICE"}
            value={offer?.offerType === 1n ? offer.amount : offer.value}
          />
        </Flex>
        <Flex mt={8} flexDir="column" justifyContent={"flex-start"}>
          {signer ? (
            startingAt > 0 ? (
              order?.seller === signer?.address ? (
                // seller일 경우
                <Button
                  colorScheme="yellow"
                  onClick={onClickSettleFilled}
                  isDisabled={
                    isActionLoading ||
                    isSettled ||
                    Date.now() > Number(closingAt) * 1000
                  }
                  sx={{
                    animation: isActionLoading
                      ? `${pulse} 1.5s infinite`
                      : "none",
                  }}
                >
                  <Text color="black">
                    {isActionLoading ? "Loading..." : "Settle"}
                  </Text>
                </Button>
              ) : order?.buyer === signer?.address ? (
                // buyer일 경우
                <Button
                  colorScheme="yellow"
                  w="full"
                  onClick={onClickSettleCancelled}
                  isDisabled={
                    isActionLoading ||
                    Date.now() < Number(closingAt) * 1000 ||
                    isClaimed ||
                    isSettled
                  }
                  sx={{
                    animation: isActionLoading
                      ? `${pulse} 1.5s infinite`
                      : "none",
                  }}
                >
                  <Text color="black">
                    {isActionLoading ? "Loading..." : "Claim"}
                  </Text>
                </Button>
              ) : (
                // seller, buyer가 아닌 경우
                <Button
                  bgColor="#353535"
                  isDisabled={true}
                  _hover={{ bgColor: "#353535" }}
                >
                  <Text color="white">Not Authorized</Text>
                </Button>
              )
            ) : offer?.offeredBy !== signer?.address ? (
              // 타인의 오퍼일 경우 (체결이 안 되었을 경우)
              offer?.status == 1 ? (
                <Button
                  backgroundColor={"teal.800"}
                  border={"1px solid"}
                  borderColor={"green.200"}
                  color="green.200"
                  fontWeight={"bold"}
                  onClick={onClickFillOffer}
                  isDisabled={isActionLoading}
                  sx={{
                    animation: isActionLoading
                      ? `${pulse} 1.5s infinite`
                      : "none",
                  }}
                  _hover={{
                    bgColor: "teal.800",
                  }}
                >
                  <Text>
                    {isActionLoading
                      ? "Loading..."
                      : `Deposit ${formatUnits(offer.value, 6)} USDT`}
                  </Text>
                </Button>
              ) : // 타인의 오퍼일 경우 (체결이 되어 있을 경우)
              order?.seller === signer?.address ? (
                // 본인이 seller일 경우
                <Button
                  colorScheme="yellow"
                  w="full"
                  onClick={onOpen}
                  isDisabled={isSelling}
                  sx={{
                    animation: isActionLoading
                      ? `${pulse} 1.5s infinite`
                      : "none",
                  }}
                >
                  <Text color="black">
                    {isActionLoading ? "Loading..." : "Sell this contract"}
                  </Text>
                </Button>
              ) : order?.buyer === signer?.address ? (
                // 본인이 buyer일 경우
                <Button
                  colorScheme="yellow"
                  w="full"
                  onClick={onOpen}
                  isDisabled={isSelling}
                  sx={{
                    animation: isActionLoading
                      ? `${pulse} 1.5s infinite`
                      : "none",
                  }}
                >
                  <Text color="black">
                    {isActionLoading ? "Loading..." : "Sell this contract"}
                  </Text>
                </Button>
              ) : (
                // 본인이 seller, buyer가 아닌 경우
                <Button
                  bgColor="#353535"
                  w="full"
                  isDisabled={true}
                  _hover={{ bgColor: "#353535" }}
                >
                  <Text color="white">Finalized</Text>
                </Button>
              )
            ) : // 본인의 오퍼일 경우 (첫 거래)
            offer?.status == 1 ? (
              <Button
                bgColor="red.400"
                _hover={{ bgColor: "red.400" }}
                w="full"
                onClick={onClickCancelOffer}
                sx={{
                  animation: isActionLoading
                    ? `${pulse} 1.5s infinite`
                    : "none",
                }}
              >
                <Text color="black">
                  {isActionLoading ? "Loading..." : "Close Offer"}
                </Text>
              </Button>
            ) : // 본인의 오퍼일 경우 (첫 거래 체결 후)
            order?.seller === signer?.address ? (
              <Button
                colorScheme="green"
                w="full"
                onClick={onOpen}
                isDisabled={isSelling}
                sx={{
                  animation: isActionLoading
                    ? `${pulse} 1.5s infinite`
                    : "none",
                }}
              >
                <Text color="black">
                  {isActionLoading ? "Loading..." : "Sell this contract"}
                </Text>
              </Button>
            ) : (
              order?.buyer === signer?.address && (
                <Button
                  colorScheme="green.200"
                  w="full"
                  onClick={onOpen}
                  isDisabled={isSelling}
                  sx={{
                    animation: isActionLoading
                      ? `${pulse} 1.5s infinite`
                      : "none",
                  }}
                >
                  <Text color="black">
                    {isActionLoading ? "Loading..." : "Sell this contract"}
                  </Text>
                </Button>
              )
            )
          ) : (
            <Button
              bgColor="green.200"
              w="full"
              isDisabled={true}
              _hover={{ bgColor: "green.200" }}
            >
              <Text color="black">Connect Wallet</Text>
            </Button>
          )}
        </Flex>
        <Flex flexDir="column" mt={4} fontSize={"small"}>
          <Text textColor="white" fontWeight="bold">
            <Box
              as="span"
              color={offer?.offerType == 1n ? "green.100" : "red.400"}
            >
              {offer?.offerType == 1n ? "BUYING" : "SELLING"}
            </Box>{" "}
            {formatUnits(offer.amount, 6)} FLEXIR{" "}
            <Box as="span" color="#606064">
              for
            </Box>{" "}
            {formatUnits(offer.value, 6)} USDT.
          </Text>
          <Text fontWeight="bold" textColor="white">
            <Box as="span" color="#606064">
              You will automatically receive
            </Box>{" "}
            FLEXIR{" "}
            <Box as="span" color="#606064">
              token after settlement.
            </Box>
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
};

export default OfferTradeWidget;
