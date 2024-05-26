import WebSocket from "ws";
import EventEmitter from "events";

const getMessage = (symbol, timeFrame) => {
  return JSON.stringify({
    op: "subscribe",
    args: [`kline.${timeFrame}.${symbol}`],
  });
};

export default class LiveStream extends EventEmitter {
  constructor(symbols = []) {
    super();
    this.url = "wss://stream-testnet.bybit.com/v5/public/spot";
    this.ws = null;
    this.subscribed = {};

    this._connectWebsocket();
    this.#subscribeAll(symbols);
  }

  _connectWebsocket() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = this._onOpen.bind(this);
    this.ws.onmessage = this._onMessage.bind(this);
    this.ws.onerror = this._onError.bind(this);
  }

  _onOpen() {
    console.log("Websocket connection established");
  }

  _onMessage(message) {
    const data = JSON.parse(message.data);
    if (data.ret_msg === "subscribe") return;

    const topic = data.topic;
    const olhc = data.data[0];

    if (data.success === false && data.ret_msg.startsWith("Invalid symbol :")) {
      const topic = data.ret_msg
        .split(":")[1]
        .replace(/\[/g, "")
        .replace(/\]/g, "");
      return this.emit(topic, { type: "error", message: data.ret_msg, topic });
    }
    this.emit(topic, {
      type: "quote",
      data: {
        open: olhc.open,
        close: olhc.close,
        high: olhc.high,
        low: olhc.low,
        volume: olhc.volume,
      },
      topic,
    });
  }

  _onError(error) {
    console.error("Websocket error:", error);
  }

  #subscribeAll(symbols) {
    symbols.forEach(({ symbol, timeFrame }) => {
      this.subscribe(symbol, timeFrame);
    });
  }

  subscribe(symbol, timeFrame) {
    const topic = `kline.${timeFrame}.${symbol}`;
    const message = getMessage(symbol, timeFrame);

    if (this.subscribed[topic]) {
      return;
    }

    if (!this.ws.readyState) {
      return setTimeout(() => this.subscribe(symbol, timeFrame), 5000);
    }

    this.ws.send(message);
    this.subscribed[topic] = { symbol, timeFrame, retry: 0 };
  }

  unsubscribe(symbol, timeFrame) {
    if (!this.ws.readyState) {
      return setTimeout(() => this.unsubscribe(symbol, timeFrame), 5000);
    }

    const topic = `kline.${timeFrame}.${symbol}`;
    const message = JSON.stringify({ op: "unsubscribe", args: [topic] });
    this.ws.send(message);
  }
}
