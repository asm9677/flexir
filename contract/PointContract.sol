// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PointMarket is Ownable(msg.sender),ReentrancyGuard{
    using SafeERC20 for IERC20;

    //////////////////////////
    ////////VARIABLES/////////
    //////////////////////////
    uint256 private constant WEI6 = 10 ** 6;
    uint48 public constant oneDay = 86400; // 1 day

    enum OfferType {
        NONE,
        BUY,
        SELL
        }

    enum OfferStatus { 
        NONE, 
        OPEN, 
        FILLED, 
        CANCELLED 
        }

    enum OrderStatus { 
        NONE, 
        OPEN, 
        SETTLE_FILLED, 
        SETTLE_CANCELLED, 
        CANCELLED 
        }

    enum TokenStatus { 
        NONE, 
        ACTIVE, 
        INACTIVE, 
        SETTLE 
        }

    //////////////////////////
    /////////STRUCTS//////////
    //////////////////////////
    struct Token {
        address tokenAddr; // 토큰 주소
        uint48 settleTime; // settle 시작 시간
        uint48 settleDuration; // 초기값 24시간
        uint152 settleRate; // 포인트당 토큰 개수
        TokenStatus status; // active(1), inactive(2), or settle(3)
    }

    struct Offer {
        OfferType offerType; // buy(1) or sell(2)
        bytes32 tokenId; // 토큰 ID
        address exchangeToken; // deposit에 활용할 토큰의 주소
        uint256 amount; // 포인트 amount (point 개수 * WEI6)
        uint256 value; // 총 금액
        uint256 collateral; // 담보금 = 총 금액 (pledge Rate이 1:1인 경우)
        uint256 filledAmount; // 채워진 포인트 개수
        OfferStatus status; // Open(1), Filled(2), or Cancelled(3)
        address offeredBy; // offer한 유저
        bool fullMatch; // partial fill = false, single fill = true
        uint256 originalOrderId; // 원래 주문 ID (재판매 시 사용, 첫 offer에서는 0)
        uint8 reofferStatus; // 기존 order을 누가 판매하는지 - 0(첫 Offer일 경우), 1(기존 계약의 seller가 판매할 경우), 2(기존 계약의 buyer가 판매할 경우)
    }

    struct Order {
        uint256 offerId;
        uint256 amount; // 계약 체결 금액
        address seller; // 판매자 지갑 주소
        address buyer; // 구매자 지갑 주소
        OrderStatus status; // OPEN(1), SETTLE_FILLED(2), SETTLE_CANCELLED(3), CANCELLED(4)
    }

    struct Config {
        uint256 pledgeRate; // 거래에서 담보비율
        uint256 feeRefund; // Offer 취소할 시 부과되는 수수료율
        uint256 feeSettle; // 거래가 완료되고 정산이 이루어질 때 부과되는 수수료율
        address feeWallet; // 수수료가 발생할 때 수수료를 수령할 지갑 주소
    }

    struct PointMarketStorage {
        mapping(address => bool) acceptedTokens; // 거래에 사용할 수 있는 ERC 20 토큰 리스트 (예. USDC, USDT, DAI 등)
        mapping(bytes32 => Token) tokens; // 토큰 정보 저장
        mapping(uint256 => Offer) offers; // 현재 진행중인 거래 정보 저장
        uint256 lastOfferId; // 마지막 거래 ID  
        mapping(uint256 => Order) orders; // 체결된 거래 정보 저장
        uint256 lastOrderId; // 마지막 체결된 거래 ID
        Config config; // 거래 설정 정보 저장 (pledgeRate, feeRefund, feeSettle, feeWallet)
    }

    //////////////////////////
    //////////EVENTS//////////
    //////////////////////////
    event NewOffer(
        uint256 id,
        OfferType offerType,
        bytes32 tokenId,
        address exchangeToken,
        uint256 amount,
        uint256 value,
        uint256 collateral,
        bool fullMatch,
        address doer
    );

    event NewToken(bytes32 tokenId, uint256 settleDuration);

    event NewOrder(
        uint256 id,
        uint256 offerId,
        uint256 amount,
        address seller,
        address buyer
    );

    event SettleFilled(
        uint256 orderId,
        uint256 value,
        uint256 fee,
        address doer
    );

    event SettleCancelled(
        uint256 orderId,
        uint256 value,
        uint256 fee,
        address doer
    );

    event CancelOrder(uint256 orderId, address doer);

    event CancelOffer(
        uint256 offerId,
        uint256 refundValue,
        uint256 refundFee,
        address doer
    );

    event UpdateAcceptedTokens(address[] tokens, bool isAccepted);

    event CloseOffer(uint256 offerId, uint256 refundAmount);

    event UpdateConfig(
        address oldFeeWallet,
        uint256 oldFeeSettle,
        uint256 oldFeeRefund,
        uint256 oldPledgeRate,
        address newFeeWallet,
        uint256 newFeeSettle,
        uint256 newFeeRefund,
        uint256 newPledgeRate
    );

    event TokenToSettlePhase(
        bytes32 tokenId,
        address token,
        uint256 settleRate,
        uint256 settleTime
    );

    event UpdateTokenStatus(bytes32 tokenId, TokenStatus oldValue, TokenStatus newValue);

    event TokenForceCancelSettlePhase(bytes32 tokenId);

    event Settle2Steps(uint256 orderId, bytes32 hash, address doer);

    event UpdateTokenSettleDuration(
        bytes32 tokenId,
        uint48 oldValue,
        uint48 newValue
    );

    event NewResaleOffer(
        uint256 offerId,
        uint256 originalOrderId,
        uint256 amount,
        uint256 value,
        uint8 reofferStatus,
        address seller
    );

    event ResaleOfferFilled(uint256 indexed resaleOfferId, address buyer);


    //////////////////////////
    ////////CONSTRUCTOR///////
    //////////////////////////

    PointMarketStorage pointMarket;

    constructor () {
        pointMarket.config.pledgeRate = WEI6; // 1:1
        pointMarket.config.feeWallet = owner(); // 컨트랙트 소유자 지갑 주소
        pointMarket.config.feeSettle = WEI6 / 50; // 2.0% (웨일즈 마켓은 2.5%)
        pointMarket.config.feeRefund = WEI6 / 400; // 0.25% (웨일즈 마켓은 0.5%)
    }

    //////////////////////////
    ///////SYSTEM ACTION//////
    //////Owner만 사용 가능 /////
    //////////////////////////

    //토큰(포인트) 생성 함수 - 해당 함수로 생성된 토큰만 거래 
    function createPoints(
        bytes32 tokenId
    ) external onlyOwner {
        Token storage _token = pointMarket.tokens[tokenId];

        require(
            _token.status == TokenStatus.NONE && 
            _token.settleDuration == 0 && 
            _token.tokenAddr == address(0),
            "Token Already Exists");

        _token.settleDuration = oneDay;
        _token.status = TokenStatus.ACTIVE;
        emit NewToken(tokenId, oneDay);
    }

    // Token(point) Status Active <-> Inactive 토글 함수 - Active해야 Offer을 생성할 수 있음
    function tokenToggleActivation(
        bytes32 tokenId
    ) external onlyOwner {
        Token storage _token = pointMarket.tokens[tokenId];

        TokenStatus fromStatus = _token.status;

        require(fromStatus == TokenStatus.ACTIVE || fromStatus == TokenStatus.INACTIVE, "Cannot Change Token Status");
        TokenStatus toStatus = fromStatus == TokenStatus.ACTIVE
            ? TokenStatus.INACTIVE
            : TokenStatus.ACTIVE;

        _token.status = toStatus;
        emit UpdateTokenStatus(tokenId, fromStatus, toStatus);
    }

    // Token(point) status를 Settle로 변경하는 함수 - TGE 이후 settle 시작
    function tokenToSettlePhase(
        bytes32 tokenId,
        address tokenAddress, // 토큰 지갑 주소
        uint152 settleRate // 1M point당 토큰 개수
    ) external onlyOwner {
        Token storage _token = pointMarket.tokens[tokenId];

        require(tokenAddress != address(0), "Invalid Token Address");
        require(settleRate > 0, "Invalid Settle Rate");
        require(
            _token.status == TokenStatus.ACTIVE ||
                _token.status == TokenStatus.INACTIVE, 
            "Invalid Token Status"
        );

        _token.tokenAddr = tokenAddress;
        _token.settleRate = settleRate;
        // 토큰 status, settle 타임 설정
        _token.status = TokenStatus.SETTLE;
        _token.settleTime = uint48(block.timestamp);

        emit TokenToSettlePhase(
            tokenId,
            tokenAddress,
            settleRate,
            block.timestamp
        );
    }


   // Settle을 잘못 설정했을 경우 Token(point) status를 'Inactive'로 전환하는 함수
    function tokenForceCancelSettlePhase(
        bytes32 tokenId
    ) external onlyOwner {
        Token storage _token = pointMarket.tokens[tokenId];

        require(_token.status == TokenStatus.SETTLE, "Invalid Token Status");
        _token.status = TokenStatus.INACTIVE;
        emit TokenForceCancelSettlePhase(tokenId);
    }

    // Settle Duration 재설정 함수 - Settle Duration 의 초기값은 24시간이지만 변경이 필요할 때 사용
    function updateSettleDuration(
        bytes32 tokenId,
        uint48 newValue
    ) external onlyOwner {

        Token storage _token = pointMarket.tokens[tokenId];

        uint48 oldValue = _token.settleDuration;
        _token.settleDuration = newValue;

        emit UpdateTokenSettleDuration(tokenId, oldValue, newValue);
    }

    // 오너의 권한으로 계약 취소하는 함수 - 판매자, 구매자에게 담보금 환불
    function forceCancelOrder(
        uint256 orderId
    ) public nonReentrant onlyOwner {
        Order storage order = pointMarket.orders[orderId];
        Offer storage offer = pointMarket.offers[order.offerId];

        require(order.status == OrderStatus.OPEN, "Invalid Order Status");

        // 환불액 계산
        uint256 buyerRefundValue = (order.amount * offer.value) / offer.amount; // value
        uint256 sellerRefundValue = (order.amount * offer.collateral) / offer.amount; // collateral
        address buyer = order.buyer;
        address seller = order.seller;

        // 환불
        if (offer.exchangeToken == address(0)) {
            // ETHER을 환불할 경우
            if (buyerRefundValue > 0 && buyer != address(0)) {
                (bool success, ) = buyer.call{value: buyerRefundValue}("");
                require(success, "Transfer Funds to Buyer Fail");
            }
            if (sellerRefundValue > 0 && seller != address(0)) {
                (bool success, ) = seller.call{value: sellerRefundValue}("");
                require(success, "Transfer Funds to Seller Fail");
            }
        } else {
            IERC20 iexchangeToken = IERC20(offer.exchangeToken);
            if (buyerRefundValue > 0 && buyer != address(0)) {
                iexchangeToken.safeTransfer(buyer, buyerRefundValue);
            }
            if (sellerRefundValue > 0 && seller != address(0)) {
                iexchangeToken.safeTransfer(seller, sellerRefundValue);
            }
        }

        order.status = OrderStatus.CANCELLED;
        emit CancelOrder(orderId, msg.sender);
    }

    /////////////////////////
    ////// USER ACTION //////
    /////////////////////////

    // 새로운 Offer 만들기 - 토큰 전송 전 approve 필요
    function newOffer(
        OfferType offerType, //buy(1) or sell(2)
        bytes32 tokenId, //토큰ID
        uint256 amount, // 포인트 amount (point 개수 * WEI6)
        uint256 value, // 총 금액 (거래에 활용하는 토큰 또는 코인의 금액) 
        address exchangeToken // 거래에 활용하는 토큰의 주소 (예. USDC 주소)
    ) external nonReentrant {
        Token storage token = pointMarket.tokens[tokenId];

        require(token.status == TokenStatus.ACTIVE, "Invalid token status. It must be active");
        require(
            exchangeToken != address(0) && pointMarket.acceptedTokens[exchangeToken],
            "Invalid exchange token"
        );
        require(amount > 0 && value > 0, "Invalid Amount or Value");

        IERC20 iexchangeToken = IERC20(exchangeToken);
        
        // 담보금 (담보비율 1:1임으로 value와 동일)
        uint256 collateral = (value * pointMarket.config.pledgeRate) / WEI6;

        // offer buy일 경우 value, offer sell일 경우 collateral 전송 
        uint256 _transferAmount = offerType == OfferType.BUY ? value : collateral;
        iexchangeToken.safeTransferFrom(msg.sender, address(this), _transferAmount);

        // 새로운 offer 생성
        _newOffer(
            offerType,
            tokenId,
            exchangeToken,
            amount,
            value,
            collateral,
            true,
            0,
            0
        );
    }

    // Fill Offer 함수(amount = offer.amount이어야 함) - 추후 partial fill 구현 필요, 토큰 전송 전 approve 필요
    function fillOffer(uint256 offerId, uint256 amount) external nonReentrant {
        Offer storage offer = pointMarket.offers[offerId];
        Token storage token = pointMarket.tokens[offer.tokenId];

        require(offer.status == OfferStatus.OPEN, "Invalid Offer Status");
        require(token.status == TokenStatus.ACTIVE, "Invalid token Status");
        require(offer.amount == amount, "Invalid Amount"); // 추후 partial fill 구현 시 amount > 0 로 변경 필요
        require(
            offer.amount - offer.filledAmount >= amount,
            "Insufficient Allocations"
        );
        // require(
        //     offer.fullMatch == false || offer.amount == amount,
        //     "FullMatch required"
        // );
        require(offer.exchangeToken != address(0), "Invalid Offer Token");

        // 담보금 전송
        IERC20 iexchangeToken = IERC20(offer.exchangeToken);
        uint256 _transferAmount;
        address buyer;
        address seller;
        if (offer.offerType == OfferType.BUY) {
            _transferAmount = (offer.collateral * amount) / offer.amount;
            buyer = offer.offeredBy;
            seller = msg.sender;
        } else {
            _transferAmount = (offer.value * amount) / offer.amount;
            buyer = msg.sender;
            seller = offer.offeredBy;
        }
        iexchangeToken.safeTransferFrom(msg.sender, address(this), _transferAmount);

        // internal fillOffer 함수를 통해 Order 생성
        _fillOffer(offerId, amount, buyer, seller);
    }

    // 재판매 Offer 생성 함수 
    function createResaleOffer(
        uint256 originalOrderId,
        uint256 value,
        uint8 reofferStatus // 구매자가 판매하는지 여부 - 0(첫 Offer), 1(Seller selling), 2(Buyer selling)
    ) external nonReentrant {
        Order storage order = pointMarket.orders[originalOrderId];
        Offer storage originalOffer = pointMarket.offers[order.offerId];
        
        require(order.status == OrderStatus.OPEN, "Invalid order status");
        require(
            (reofferStatus == 2 && msg.sender == order.buyer) ||
            (reofferStatus == 1 && msg.sender == order.seller),
            "Not authorized"
        );

        // 새로운 재판매 Offer 생성 - 2차, 3차 ... 재판매 주문 생성 시 originalOrderId는 동일
        _newOffer(
            OfferType.SELL,
            originalOffer.tokenId,
            originalOffer.exchangeToken,
            order.amount,
            value,
            0,
            true,
            originalOrderId,
            reofferStatus
        );
    }

    // 재판매 Offer 구매 함수 - 토큰 전송 전 approve 필요
    function fillResaleOffer(uint256 resaleOfferId) external nonReentrant {
        Offer storage resaleOffer = pointMarket.offers[resaleOfferId];
        require(resaleOffer.status == OfferStatus.OPEN, "Invalid offer status");
        require(resaleOffer.originalOrderId > 0, "Not a resale offer");

        Order storage originalOrder = pointMarket.orders[resaleOffer.originalOrderId];
        require(originalOrder.status == OrderStatus.OPEN, "Invalid original order status");

        // 구매 금액 전송
        IERC20 iexchangeToken = IERC20(resaleOffer.exchangeToken);
        iexchangeToken.safeTransferFrom(msg.sender, resaleOffer.offeredBy, resaleOffer.value);

        // 원래 주문 업데이트
        if (resaleOffer.reofferStatus == 2) {
            originalOrder.buyer = msg.sender;
        } else {
            originalOrder.seller = msg.sender;
        }

        resaleOffer.status = OfferStatus.FILLED;
        emit ResaleOfferFilled(resaleOfferId, msg.sender);
    }


    // Offer 취소하기
    function cancelOffer(uint256 offerId) public nonReentrant {
        Offer storage offer = pointMarket.offers[offerId];

        require(offer.offeredBy == msg.sender, "Offer Owner Only");
        require(offer.status == OfferStatus.OPEN, "Invalid Offer Status");
        require(offer.exchangeToken != address(0), "Invalid ExchangeToken");

        uint256 refundAmount = offer.amount - offer.filledAmount;
        require(refundAmount > 0, "Insufficient Allocations");

        // 환불금 계산
        uint256 refundValue;
        if (offer.offerType == OfferType.BUY) {
            refundValue = (refundAmount * offer.value) / offer.amount;
        } else {
            refundValue = (refundAmount * offer.collateral) / offer.amount;
        }
        uint256 refundFee = (refundValue * pointMarket.config.feeRefund) / WEI6;
        refundValue -= refundFee;

        // refund
        IERC20 iexchangeToken = IERC20(offer.exchangeToken);
        iexchangeToken.safeTransfer(offer.offeredBy, refundValue);
        iexchangeToken.safeTransfer(pointMarket.config.feeWallet, refundFee);
        

        offer.status = OfferStatus.CANCELLED;
        emit CancelOffer(offerId, refundValue, refundFee, msg.sender);
    }

    // 체결된 계약 이행하는 함수
    function settleFilled(uint256 orderId) public nonReentrant {
        Order storage order = pointMarket.orders[orderId];
        Offer storage offer = pointMarket.offers[order.offerId];
        Token storage token = pointMarket.tokens[offer.tokenId];

        require(token.status == TokenStatus.SETTLE, "Invalid Status");
        require(
            token.tokenAddr != address(0) && token.settleRate > 0,
            "Token Not Set"
        );
        require(
            block.timestamp > token.settleTime,
            "Settling Time Not Started"
        );
        require(order.seller == msg.sender, "Seller Only");
        require(order.status == OrderStatus.OPEN, "Invalid Order Status");

        uint256 collateral = (order.amount * offer.collateral) / offer.amount;
        uint256 value = (order.amount * offer.value) / offer.amount;

        // 구매자에게 토큰 전송
        IERC20 iToken = IERC20(token.tokenAddr);
        uint256 tokenAmount = (order.amount * token.settleRate) / WEI6;
        uint256 tokenAmountFee = (tokenAmount * pointMarket.config.feeSettle) / WEI6;
        // fee wallet에 수수료 전송
        iToken.safeTransferFrom(
            order.seller,
            pointMarket.config.feeWallet,
            tokenAmountFee
        );
        // 구매자에게 토큰 전송
        iToken.safeTransferFrom(
            order.seller,
            order.buyer,
            tokenAmount - tokenAmountFee
        );

        // 판매자에게 담보금 전송
        uint256 settleFee = (value * pointMarket.config.feeSettle) / WEI6;
        uint256 totalValue = value + collateral - settleFee;
        if (offer.exchangeToken == address(0)) {
            // ETH(Native Token) 으로 담보금을 낸 경우
            (bool success1, ) = order.seller.call{value: totalValue}("");
            (bool success2, ) = pointMarket.config.feeWallet.call{value: settleFee}("");
            require(success1 && success2, "Transfer Funds Fail");
        } else {
            // ETH 외 토큰으로 담보금을 낸 경우
            IERC20 iexchangeToken = IERC20(offer.exchangeToken);
            iexchangeToken.safeTransfer(order.seller, totalValue);
            iexchangeToken.safeTransfer(pointMarket.config.feeWallet, settleFee);
        }

        // Order Status Settle Filled(정상적으로 계약 이행)로 상태 변경
        order.status = OrderStatus.SETTLE_FILLED;

        emit SettleFilled(orderId, totalValue, settleFee, msg.sender);
    }

    // 계약 이행 못할 시 실행되는 함수 (구매자에게 담보금 전액 전송)
    function settleCancelled(uint256 orderId) public nonReentrant {
        Order storage order = pointMarket.orders[orderId];
        Offer storage offer = pointMarket.offers[order.offerId];
        Token storage token = pointMarket.tokens[offer.tokenId];

        require(token.status == TokenStatus.SETTLE, "Invalid Status");
        require(
            block.timestamp > token.settleTime + token.settleDuration,
            "Settling Time Not Ended Yet"
        );
        require(order.status == OrderStatus.OPEN, "Invalid Order Status");
        require(
            order.buyer == msg.sender || owner() == msg.sender,
            "Buyer or Operator Only"
        );

        uint256 collateral = (order.amount * offer.collateral) / offer.amount;
        uint256 value = (order.amount * offer.value) / offer.amount;

        // 구매자에게 담보금 전송
        uint256 settleFee = (collateral * pointMarket.config.feeSettle * 2) / WEI6;
        uint256 totalValue = value + collateral - settleFee;
        if (offer.exchangeToken == address(0)) {
            // 담보금이 ETH일 경우
            (bool success1, ) = order.buyer.call{value: totalValue}("");
            (bool success2, ) = pointMarket.config.feeWallet.call{value: settleFee}("");
            require(success1 && success2, "Transfer Funds Fail");
        } else {
            // 담보금이 ETH를 제외한 토큰일 경우
            IERC20 iexchangeToken = IERC20(offer.exchangeToken);
            iexchangeToken.safeTransfer(order.buyer, totalValue);
            iexchangeToken.safeTransfer(pointMarket.config.feeWallet, settleFee);
        }

        order.status = OrderStatus.SETTLE_CANCELLED;

        emit SettleCancelled(orderId, totalValue, settleFee, msg.sender);
    }

    ///////////////////////////
    ///////// SETTER //////////
    ///////////////////////////

    // 수수료 받는 지갑 주소, 수수료, 담보비율 변경하는 함수
    function updateConfig(
        address feeWallet_,
        uint256 feeSettle_,
        uint256 feeRefund_,
        uint256 pledgeRate_
    ) external onlyOwner {

        require(feeWallet_ != address(0), "Invalid Address");
        require(feeSettle_ <= WEI6 / 5, "Settle Fee <= 5%");
        require(feeRefund_ <= WEI6 / 5, "Cancel Fee <= 5%");

        // update
        pointMarket.config.feeWallet = feeWallet_;
        pointMarket.config.feeSettle = feeSettle_;
        pointMarket.config.feeRefund = feeRefund_;
        pointMarket.config.pledgeRate = pledgeRate_;

        emit UpdateConfig(
            pointMarket.config.feeWallet,
            pointMarket.config.feeSettle,
            pointMarket.config.feeRefund,
            pointMarket.config.pledgeRate,
            feeWallet_,
            feeSettle_,
            feeRefund_,
            pledgeRate_
        );
    }

    // 거래에 활용할 수 있는 토큰을 추가하는 함수 (예. USDC, USDT, DAI 등)
    function setAcceptedTokens(
        address[] memory tokenAddresses,
        bool isAccepted
    ) external onlyOwner {

        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            pointMarket.acceptedTokens[tokenAddresses[i]] = isAccepted;
        }
        emit UpdateAcceptedTokens(tokenAddresses, isAccepted);
    }

    ///////////////////////////
    ///////// GETTER //////////
    ///////////////////////////

    function getOffer(uint256 offerId) external view returns (Offer memory) {
        return pointMarket.offers[offerId];
    }

    function offerAmount(uint256 offerId) external view returns (uint256) {
        return pointMarket.offers[offerId].amount;
    }

    function offerOfferedBy(uint256 offerId) external view returns (address) {
        return pointMarket.offers[offerId].offeredBy;
    }

    function offerType(uint256 offerId) external view returns (OfferType) {
        return pointMarket.offers[offerId].offerType;
    }

    function offerStatus(uint256 offerId) external view returns (OfferStatus) {
        return pointMarket.offers[offerId].status;
    }

    function offerOriginalOrderId(uint256 offerId) external view returns (uint256) {
        return pointMarket.offers[offerId].originalOrderId;
    }

    function getOrder(uint256 orderId) external view returns (Order memory) {
        return pointMarket.orders[orderId];
    }

    function orderBuyer(uint256 orderId) external view returns (address) {
        return pointMarket.orders[orderId].buyer;
    }

    function orderSeller(uint256 orderId) external view returns (address) {
        return pointMarket.orders[orderId].seller;
    }

    function orderStatus(uint256 orderId) external view returns (OrderStatus) {
        return pointMarket.orders[orderId].status;
    }

    ///////////////////////////
    //////// INTERNAL /////////
    ///////////////////////////
    function _newOffer(
        OfferType offerType,
        bytes32 tokenId,
        address exchangeToken,
        uint256 amount,
        uint256 value,
        uint256 collateral,
        bool fullMatch,
        uint256 originalOrderId,
        uint8 reofferStatus
    ) internal {
        // create new offer
        uint256 lastOfferId = ++pointMarket.lastOfferId;
        pointMarket.offers[lastOfferId] = Offer(
            offerType,
            tokenId,
            exchangeToken,
            amount,
            value,
            collateral,
            0,
            OfferStatus.OPEN,
            msg.sender,
            fullMatch,
            originalOrderId,
            reofferStatus
        );

        if (reofferStatus == 0) {
            emit NewOffer(
                lastOfferId,
                offerType,
                tokenId,
                exchangeToken,
                amount,
                value,
                collateral,
                fullMatch,
                msg.sender
            );
        } else {
            emit NewResaleOffer(lastOfferId, originalOrderId, amount, value, reofferStatus, msg.sender);
        }
    }

    function _fillOffer(
        uint256 offerId,
        uint256 amount,
        address buyer,
        address seller
    ) internal {

        Offer storage offer = pointMarket.offers[offerId];
        // new order
        uint256 lastOrderId = ++pointMarket.lastOrderId;
        pointMarket.orders[lastOrderId] = Order(
            offerId,
            amount,
            seller,
            buyer,
            OrderStatus.OPEN
        );

        // check if offer is fullfilled
        offer.filledAmount += amount;
        if (offer.filledAmount == offer.amount) {
            offer.status = OfferStatus.FILLED;
            emit CloseOffer(offerId, 0);
        }

        emit NewOrder(lastOrderId, offerId, amount, seller, buyer);
    }

    // 컨트랙트에 머물러 있는 토큰 추출 함수
    function withdrawStuckToken(
        address _token,
        address _to
    ) external onlyOwner {

        require(
            _token != address(0) && !pointMarket.acceptedTokens[_token],
            "Invalid Token Address"
        );
        uint256 _contractBalance = IERC20(_token).balanceOf(address(this));
        IERC20(_token).safeTransfer(_to, _contractBalance);
    }

    receive() external payable {}

    fallback() external payable {}
}