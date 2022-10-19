const axios = require('axios');


function packReturn(result: any, message: string = '', success: boolean = false, txs: string[] = []) {
    return {
        result: result,
        message: message,
        success: success,
        txs: txs
    };
}

async function getPairInfo(baseAddress: string, quoteAddress: string) {
    try {
        let info = await axios.get(`https://price.jup.ag/v1/price?id=${baseAddress}&vsToken=${quoteAddress}`);
        return packReturn({
            baseSymbol: info.data.data.mintSymbol,
            quoteSymbol: info.data.data.vsTokenSymbol,
            price: info.data.data.price
        }, '', true);
    } catch (e) {
        return packReturn(-1, (e as Error).message);
    }
}

export {
    getPairInfo
}