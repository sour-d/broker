import { RestClientV5 } from "bybit-api";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import _ from "lodash";

const restClient = new RestClientV5({
  key: process.env.TESTNET_API_KEY,
  secret: process.env.TESTNET_API_SECRET,
  parseAPIRateLimits: true,
  testnet: true,
  // demoTrading: true,
});

const HistoricalKline = async (symbol, interval, start, end) => {
  let allData = [];
  let lastIntervalFetched = end;

  while (lastIntervalFetched !== start) {
    console.log({ lastIntervalFetched, start, end });
    await restClient
      .getKline({ symbol, interval, start, end: lastIntervalFetched })
      .then((response) => {
        const data = response.result.list.map((kline) => {
          return {
            Date: kline[0],
            Open: kline[1],
            High: kline[2],
            Low: kline[3],
            Close: kline[4],
            Volume: kline[5],
          };
        });
        if (_.first(allData)?.Date === _.first(data).Date) {
          console.log("first data received is same as last data fetched");
          lastIntervalFetched = start;
          return;
        }
        console.log("last data received", _.first(data));
        allData = data.concat(allData);
        lastIntervalFetched = _.last(data).Date;
        console.log(lastIntervalFetched);
      })
      .catch((error) => {
        throw error;
      });
  }
  return new Promise((resolve, reject) => {
    resolve(allData);
  });
};

export default HistoricalKline;
