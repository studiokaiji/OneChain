import Web3 from "web3";
import * as crypto from "crypto";

const DIGIT = 6;

export const genBOTP = (key: Buffer, blockNumber: number) => {
  const hotp = genHOTP(key, blockNumber);
  return hotp;
}

export const genSecretKey = () => {
  const random = Math.random().toString();
  const date = new Date().getTime().toString();
  const hash = crypto.createHash("sha1");
  hash.update(random + date)

  return hash.digest();
};

export const getBlockNumber = async () => {
  const web3 = new Web3("wss://mainnet.infura.io/ws/v3/64ddd046885240cc8f336675de07125e");
  const eth = web3.eth;
  const blockNumber = await eth.getBlockNumber();

  return blockNumber;
};

const genHOTP = (key: Buffer, couter: number) => {
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(couter / 2 ** 32), 0);
  buf.writeInt32BE(couter, 4);

  const hmac = hmacsha1(key, buf);
  const val = truncate(hmac);

  return val.toString().padStart(DIGIT, "0")
};

const truncate = (hash: Buffer) => {
  const offset = hash[hash.length-1] & 0x0f; // 0 <= offset <= 15 (4bit)
  const code = hash.readUInt32LE(offset) & 0x7fffffff; // get last 31bit[offset]
  const decCode = code % 10 ** DIGIT; // code in decimal;

  return decCode;
};

const hmacsha1 = (key: Buffer, message: Buffer) => {
  const hmac = crypto.createHmac("sha1", key);
  hmac.update(message);

  return hmac.digest();
};

export default async function main() {
  const secret = genSecretKey();
  const blockNum = await getBlockNumber();
  const otp = genBOTP(secret, blockNum);

  console.log(secret);
  console.log(blockNum);
  console.log(otp);
}

main();