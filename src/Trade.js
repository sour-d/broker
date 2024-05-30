import { RestClientV5 } from "bybit-api";
import dotenv from "dotenv";
dotenv.config();

const testnet = process.env.USE_TESTNET === "true";
const symbol = process.env.DEFAULT_SYMBOL;

const client = (testnet) => {
  const args = {
    testnet: testnet,
    key: testnet ? process.env.TESTNET_API_KEY : process.env.API_KEY,
    secret: testnet ? process.env.TESTNET_API_SECRET : process.env.API_SECRET,
  };

  return new RestClientV5(args);
};

const currentOpenOrder = () => {
  // get the current order
  // return the order
};

const modifyOrder = async (sl) => {
  const clientInstance = client(testnet);
  return clientInstance
    .setTradingStop({
      category: "linear",
      stopLoss: sl,
      symbol: symbol,
    })
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch((error) => {
      console.error(error);
    });
};

const cancelOrder = async (orderId) => {
  const clientInstance = client(testnet);
  return clientInstance
    .cancelOrder({
      category: "linear",
      symbol: symbol,
      orderId: orderId,
    })
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch((error) => {
      console.error(error);
    });
};

const placeOrder = async (quantity, trigger, sl, side = "Buy") => {
  const clientInstance = client(testnet);

  return clientInstance
    .submitOrder({
      category: "linear",
      symbol: process.env.DEFAULT_SYMBOL,
      side: side,
      qty: quantity.toString(),
      orderType: "Market",
      timeInForce: "PostOnly",
      triggerPrice: trigger.toString(),
      triggerDirection: "1",
      stopLoss: sl.toString(),
      testnet: testnet,
      // orderLinkId: "system-trading4",
      // orderLinkId: "system-trading3",
    })
    .then((response) => {
      console.log(response);
      console.log(
        "Order placed successfully",
        JSON.stringify(response, null, 2)
      );
      return response;
    })
    .catch((error) => {
      console.error(error);
    });
};

const openPositions = (testnet) => {
  const clientInstance = client(testnet);

  clientInstance
    .getPositionInfo({
      category: "linear",
      symbol: "BTCUSDT",
    })
    .then((response) => {
      //   {
      //   "symbol": "BTCUSDT",
      //   "leverage": "10",
      //   "autoAddMargin": 0,
      //   "avgPrice": "0",
      //   "liqPrice": "",
      //   "riskLimitValue": "2000000",
      //   "takeProfit": "",
      //   "positionValue": "",
      //   "isReduceOnly": false,
      //   "tpslMode": "Full",
      //   "riskId": 1,
      //   "trailingStop": "0",
      //   "unrealisedPnl": "",
      //   "markPrice": "67662",
      //   "adlRankIndicator": 0,
      //   "cumRealisedPnl": "-3448.20943244",
      //   "positionMM": "0",
      //   "createdTime": "1716953289099",
      //   "positionIdx": 0,
      //   "positionIM": "0",
      //   "seq": 9242982939,
      //   "updatedTime": "1717003686728",
      //   "side": "",
      //   "bustPrice": "",
      //   "positionBalance": "0",
      //   "leverageSysUpdatedTime": "",
      //   "curRealisedPnl": "0",
      //   "size": "0",
      //   "positionStatus": "Normal",
      //   "mmrSysUpdatedTime": "",
      //   "stopLoss": "",
      //   "tradeMode": 0,
      //   "sessionAvgPrice": ""
      // }
      console.log(JSON.stringify(response.result, null, 2));
      const data = response.result.list[0];
      return {
        symbol: data.symbol,
        side: data.side,
        size: +data.size,
        entryPrice: +data.avgPrice,
        leverage: +data.leverage,
        // margin: data.position_margin,
        amount: +data.positionValue,
        unrealizedPnl: +data.unrealisedPnl,
        realizedPnl: +data.curRealisedPnl,
        // riskId: data.riskId,
        // positionId: data.position_idx,
        takeProfit: +data.takeProfit,
        stopLoss: +data.stopLoss,
        trailingStop: +data.trailingStop,
      };
    })
    .catch((error) => {
      console.error(error);
    });
};

const tradeHistory = async (testnet) => {
  const clientInstance = client(testnet);

  return await clientInstance
    .getHistoricOrders({
      category: "linear",
    })
    .then((response) => {
      console.log(JSON.stringify(response.result.list[0], null, 2));
      return response.result.list.map((order) => {
        return {
          symbol: order.symbol,
          side: order.side,
          orderType: order.orderType,
          orderId: order.orderId,
          orderStatus: order.orderStatus,
          takeProfit: order.takeProfit,
          createdTime: order.createdTime,
          updatedTime: order.updatedTime,
          triggerPrice: order.triggerPrice,
          tpTriggerBy: order.tpTriggerBy,
          positionIdx: order.positionIdx,
          quantity: +order.qty,
          stopLoss: order.stopLoss,
          slTriggerBy: order.slTriggerBy,
          price: order.avgPrice,
          orderStatus: order.orderStatus,
          cancelType: order.cancelType,
        };
      });
    })
    .catch((error) => {
      console.error(error);
    });
};

const activeOrders = (testnet) => {
  const clientInstance = client(testnet);

  clientInstance
    .getActiveOrders({
      category: "linear",
      symbol: "BTCUSDT",
      openOnly: 0,
      limit: 1,
    })
    .then((response) => {
      console.log(response);
      console.log(JSON.stringify(response.result.list[0], null, 2));
      return response.result.list;
    })
    .catch((error) => {
      console.error(error);
    });
};

// placeOrder(true);
// console.log(await placeOrder(0.1, 69200, 68900));

const trade = {
  activeOrders,
  tradeHistory,
  openPositions,
  placeOrder,
  cancelOrder,
  modifyOrder,
  currentOpenOrder,
};

export default trade;
