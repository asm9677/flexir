"use client";
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Grid,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Switch,
  Tag,
  Text,
} from "@chakra-ui/react";
import { FaAngleDown } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "@/context/AccountProvider";
import { Contract, ethers } from "ethers";
import { FaArrowDownWideShort, FaArrowUpShortWide } from "react-icons/fa6";
import { useContract } from "@/hooks/useContract";
import OfferCard from "@/components/OfferCard";

interface NewOffer {
  offerId: number;
  offerType: number;
  tokenId: string;
  exchangeToken: string;
  amount: bigint;
  value: bigint;
  collateral: number;
  fullMatch: boolean;
  doer: string;
  blockNumber: number;
  reofferStatus: number;
}

interface NewResaleOffer {
  offerId: number;
  originalOrderId: number;
  amount: bigint;
  value: bigint;
  reofferStatus: number;
  seller: string;
  blockNumber: number;
  offerType: number;
}

interface OfferData {
  offerId: number;
  symbol: string;
  name: string;
  amount: string;
  price: number;
  point: number;
  usd: string;
  offerType: number;
  reofferStatus: number;
  originalOrderId: number;
  blockNumber: number;
  status: number;
}

export default function Page() {
  const { provider } = useAccount();
  const { flexirContract } = useContract();
  const searchParams = useSearchParams();

  const [contract, setContract] = useState<Contract | null>(null);
  const [selected, setSelected] = useState(1);
  const [selectedToken, setSelectedToken] = useState("ALL");
  const [cardData, setCardData] = useState<(NewOffer | NewResaleOffer)[]>([]);
  const [data, setData] = useState<OfferData[]>([]);
  const [activeSorting, setActiveSorting] = useState<string>("created_desc");
  const [showSoldOut, setShowSoldOut] = useState<boolean>(true);

  const handleSortingClick = (sortingOption: string) => {
    setActiveSorting(sortingOption);

    switch (sortingOption) {
      case "created_asc":
        setData((prevData) =>
          [...prevData].sort((a, b) => a.blockNumber - b.blockNumber)
        );
        break;
      case "created_desc":
        setData((prevData) =>
          [...prevData].sort((a, b) => b.blockNumber - a.blockNumber)
        );
        break;
      case "point_asc":
        setData((prevData) => [...prevData].sort((a, b) => a.point - b.point));
        break;
      case "point_desc":
        setData((prevData) => [...prevData].sort((a, b) => b.point - a.point));
        break;
      case "price_asc":
        setData((prevData) => [...prevData].sort((a, b) => a.price - b.price));
        break;
      case "price_desc":
        setData((prevData) => [...prevData].sort((a, b) => b.price - a.price));
        break;
      default:
        break;
    }
  };

  const getOffers = async () => {
    const offerEvents = await contract!.queryFilter("NewOffer", 0, "latest");
    const resaleOfferEvents = await contract!.queryFilter(
      "NewResaleOffer",
      0,
      "latest"
    );

    const offerData = offerEvents.map((event: any) => {
      return {
        offerId: event.args.id,
        offerType: Number(event.args.offerType),
        tokenId: event.args.tokenId,
        exchangeToken: event.args.exexchangeToken,
        amount: event.args.amount,
        value: event.args.value,
        collateral: event.args.collateral,
        fullMatch: event.args.fullMatch,
        doer: event.args.doer,
        blockNumber: event.blockNumber,
        reofferStatus: 0,
      };
    });
    const resaleData = resaleOfferEvents.map((event: any) => {
      return {
        offerId: event.args.offerId,
        originalOrderId: event.args.originalOrderId,
        amount: event.args.amount,
        value: event.args.value,
        reofferStatus: Number(event.args.reofferStatus),
        seller: event.args.seller,
        blockNumber: event.blockNumber,
        offerType: 1,
      };
    });

    const data: (NewOffer | NewResaleOffer)[] = [...resaleData, ...offerData];
    data.sort((a, b) => b.blockNumber - a.blockNumber);

    setCardData(data);
  };

  useEffect(() => {
    if (contract !== null || !provider) return;
    setContract(flexirContract);
  }, [provider]);

  useEffect(() => {
    if (contract === null) return;
    getOffers();
  }, [contract]);

  useEffect(() => {
    if (cardData.length === 0) return;
    const fetchData = async () => {
      const data: OfferData[] = await Promise.all(
        cardData.map(async (offer: NewOffer | NewResaleOffer) => {
          const offerInfo = await flexirContract.getOffer(offer.offerId);
          return {
            offerId: offer.offerId,
            symbol: "Morph",
            name: "GRASS",
            amount: ethers.formatUnits(offer.amount, 6),
            price: Number(offer.value) / 10 ** 6,
            point:
              offer.reofferStatus === 1
                ? (Number(offerInfo[5]) * 2 - Number(offer.value)) /
                  Number(offer.amount)
                : Number(offer.value) / Number(offer.amount),
            usd: "",
            reofferStatus: offer.reofferStatus,
            offerType: !offer.offerType ? 1 : offer.offerType,
            originalOrderId:
              offer.reofferStatus === 0 && "originalOrderId" in offer
                ? Number(offer.originalOrderId)
                : 0,
            blockNumber: offer.blockNumber,
            status: Number(offerInfo.status),
          };
        })
      );
      const filterData = data.filter((offer) => offer.status !== 3);
      setData(filterData);
    };

    fetchData();
  }, [cardData]);

  const filteredCards = data
    .filter((card) =>
      card.reofferStatus === 0
        ? card.offerType === 3 - selected
        : card.reofferStatus === 3 - selected
    )
    .filter((card) =>
      selectedToken === "all" ? true : card.symbol === selectedToken
    )
    .filter((card) => (showSoldOut ? true : card.status === 1));

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setSelectedToken(token);
    }
  }, [searchParams]);

  return (
    <Flex color="white" flexDir="column" alignItems="center">
      <Flex
        justifyContent="space-between"
        w="100%"
        maxW="1280px"
        px={10}
        mt={2}
      >
        {/* Buy/Sell 토글 */}
        <Box borderRadius="md" boxShadow="md" h={10}>
          <ButtonGroup isAttached>
            <Button
              onClick={() => setSelected(1)}
              bg={selected === 1 ? "green.200" : "gray.700"}
              color={selected === 1 ? "black" : "white"}
              borderRightRadius="none"
              borderLeftRadius="md"
              px={6}
              _hover={{
                bg: selected === 1 ? "green.200" : "gray.700",
              }}
              _focus={{ boxShadow: "none" }}
              h={8}
              fontSize="14px"
            >
              <Box>Buy</Box>
            </Button>

            <Button
              onClick={() => setSelected(2)}
              bg={selected === 2 ? "green.200" : "gray.700"}
              color={selected === 1 ? "white" : "black"}
              borderLeftRadius="none"
              borderRightRadius="md"
              px={6}
              _hover={{
                bg: selected === 2 ? "green.200" : "gray.700",
              }}
              _focus={{ boxShadow: "none" }}
              h={8}
              fontSize="14px"
            >
              Sell
            </Button>
          </ButtonGroup>
        </Box>

        <Flex>
          <Flex alignItems="center" gap={2} mr={4}>
            <Text fontSize="sm">Show Sold Out</Text>
            <Switch
              isChecked={showSoldOut}
              onChange={() => setShowSoldOut(!showSoldOut)}
              sx={{
                "span.chakra-switch__track": {
                  bg: showSoldOut ? "green.200" : "gray.700",
                },
              }}
            />
          </Flex>

          {/* 정렬 드롭다운 */}
          <Flex gap={2}>
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<FaAngleDown />}
                bg="gray.700"
                color="white"
                _hover={{ bg: "gray.700" }}
                _active={{ bg: "gray.700" }}
                fontSize="sm"
                fontWeight="medium"
                px={3}
                h={9}
              >
                Sorting Type
              </MenuButton>
              <MenuList bg="gray.700" border="none" zIndex={2}>
                <MenuItem
                  bg="gray.700"
                  color={activeSorting === "created_desc" ? "white" : "dark"}
                  onClick={() => handleSortingClick("created_desc")}
                >
                  <Flex mr={2}>Created</Flex>
                  <FaArrowDownWideShort size={16} />
                </MenuItem>
                <MenuItem
                  bg="gray.700"
                  color={activeSorting === "created_asc" ? "white" : "gray.700"}
                  onClick={() => handleSortingClick("created_asc")}
                >
                  <Flex mr={2}>Created</Flex>
                  <FaArrowUpShortWide size={16} />
                </MenuItem>

                <MenuItem
                  bg="gray.700"
                  color={activeSorting === "point_desc" ? "white" : "gray.700"}
                  onClick={() => handleSortingClick("point_desc")}
                >
                  <Flex mr={2}>Point</Flex>
                  <FaArrowDownWideShort size={16} />
                </MenuItem>
                <MenuItem
                  bg="gray.700"
                  color={activeSorting === "point_asc" ? "white" : "gray.700"}
                  onClick={() => handleSortingClick("point_asc")}
                >
                  <Flex mr={2}>Point</Flex>
                  <FaArrowUpShortWide size={16} />
                </MenuItem>

                <MenuItem
                  bg="gray.700"
                  color={activeSorting === "price_desc" ? "white" : "gray.700"}
                  onClick={() => handleSortingClick("price_desc")}
                >
                  <Flex mr={2}>Price</Flex>
                  <FaArrowDownWideShort size={16} />
                </MenuItem>
                <MenuItem
                  bg="gray.700"
                  color={activeSorting === "price_asc" ? "white" : "gray.700"}
                  onClick={() => handleSortingClick("price_asc")}
                >
                  <Flex mr={2}>Price</Flex>
                  <FaArrowUpShortWide size={16} />
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>
      </Flex>
      {/* 카드 */}
      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)",
          md: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={6}
        w="100%"
        maxW="1280px"
        px={10}
        py={8}
      >
        {filteredCards.map((card) => (
          <OfferCard key={card.offerId} offer={card} />
        ))}
      </Grid>
    </Flex>
  );
}
