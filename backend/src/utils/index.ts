const axios = require('axios');


function packReturn(result: any, message: string = '', success: boolean = false, txs: string[] = []) {
    return {
        result: result,
        message: message,
        success: success,
        txs: txs
    };
}

async function getPairInfo(baseAddress: string, quoteAddress: string, reversed=true) {
    try {
        let normalPrice = !reversed && await axios.get(`https://price.jup.ag/v1/price?id=${baseAddress}&vsToken=${quoteAddress}`) ;
        let reversePrice = reversed && await axios.get(`https://price.jup.ag/v1/price?id=${quoteAddress}&vsToken=${baseAddress}`);
        let price = reversed ? reversePrice : normalPrice;
        return packReturn({
            baseSymbol: price.data.data.mintSymbol,
            quoteSymbol: price.data.data.vsTokenSymbol,
            price: price.data.data.price,
            reversedPrice: 1/parseFloat(price.data.data.price)
        }, '', true);
    } catch (e) {
        return packReturn(-1, (e as Error).message);
    }
}

export {
    getPairInfo
}