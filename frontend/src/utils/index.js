import { API_URL } from '../const';
import axios from 'axios';

async function getAsks(marketAddress, programAddress) {
    return await axios.get(API_URL+`/asks?marketAddress=${marketAddress}&programAddress=${programAddress}`);
}

async function getBids(marketAddress, programAddress) {
    return await axios.get(API_URL+`/bids?marketAddress=${marketAddress}&programAddress=${programAddress}`);
}

async function getOrderbook(marketAddress, programAddress) {
    return await axios.get(API_URL+`/orderbook?marketAddress=${marketAddress}&programAddress=${programAddress}`);
}

async function getPairInfo(baseAddress, quoteAddress) {
    return await axios.get(API_URL+`/info?baseAddress=${baseAddress}&quoteAddress=${quoteAddress}`);
}

async function placeOrder(marketAddress, programAddress, side, price, size, orderType) {
    return await axios.get(API_URL+`/placeorder?marketAddress=${marketAddress}&programAddress=${programAddress}&side=${side}&price=${price}&size=${size}&orderType=${orderType}`);
}

async function getOrders(marketAddress, programAddress) {
    return await axios.get(API_URL+`/orders?marketAddress=${marketAddress}&programAddress=${programAddress}`);
}

async function cancelAllOrders(marketAddress, programAddress) {
    return await axios.get(API_URL+`/cancelallorders?marketAddress=${marketAddress}&programAddress=${programAddress}`);
}

async function cancelOrder(marketAddress, programAddress, orderId) {
    return await axios.get(API_URL+`/cancelorder?marketAddress=${marketAddress}&programAddress=${programAddress}&orderId=${orderId}`);
}

async function getFills(marketAddress, programAddress) {
    return await axios.get(API_URL+`/fills?marketAddress=${marketAddress}&programAddress=${programAddress}`);
}

async function settleFunds(marketAddress, programAddress) {
    return await axios.get(API_URL+`/settlefunds?marketAddress=${marketAddress}&programAddress=${programAddress}`);
}


export {
    getAsks,
    getBids,
    getOrderbook,
    getPairInfo,
    placeOrder,
    getOrders,
    cancelAllOrders,
    cancelOrder,
    getFills,
    settleFunds
}