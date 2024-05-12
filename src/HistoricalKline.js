import { RestClientV5 } from "bybit-api";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import _ from "lodash";
import dayjs from "dayjs";

const restClient = new RestClientV5({
  key: process.env.TESTNET_API_KEY,
  secret: process.env.TESTNET_API_SECRET,
  parseAPIRateLimits: true,
  testnet: true,
  // demoTrading: true,
});

const getNewEnd = (start, end, addOneSecond = false) => {
  let newStart = start;
  if (addOneSecond) {
    newStart = dayjs(start).add(1, "second").valueOf();
  }
  const newEnd = dayjs(newStart)
    .add(10, "hour")
    .subtract(1, "second")
    .valueOf();
  if (newEnd > end) {
    return end;
  }
  return newEnd;
};

const formatResponse = (response) => {
  return response.result.list
    .map((kline) => {
      return {
        Date: dayjs(+kline[0])
          .tz("Asia/Kolkata")
          .format("YYYY-MM-DD"),
        Time: dayjs(+kline[0])
          .tz("Asia/Kolkata")
          .format("HH:mm:ss"),
        DateUnix: +kline[0],
        Open: kline[1],
        High: kline[2],
        Low: kline[3],
        Close: kline[4],
        Volume: kline[5],
      };
    })
    .reverse();
};

const HistoricalKline = async (symbol, interval, start, end) => {
  let allData = [];
  let fetchTill = getNewEnd(start, end);

  while (end >= fetchTill) {
    await restClient
      .getKline({ symbol, interval, start, end: fetchTill, limit: 1000 })
      .then((response) => {
        const data = formatResponse(response);
        allData = allData.concat(data);
        start = fetchTill;
        fetchTill = getNewEnd(start, end, true);
        if (fetchTill === start) {
          fetchTill += 1;
          return;
        }
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

// const startMs = new Date("2024-05-09T00:00:00.000Z").getTime();
// const endMs = new Date("2024-05-09T23:59:59.999Z").getTime();

// console.log(startMs, endMs);

// const data = await HistoricalKline("BTCUSD", "1", startMs, endMs);
// fs.writeFileSync("data.json", JSON.stringify(data));
