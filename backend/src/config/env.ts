const DB_CONN_STRING="mongodb://127.0.0.1:27017/"
const PORT="5000"
const PRIVATE_KEY = [ 112, 193, 211, 167, 13, 176, 191, 66, 106, 194, 144, 11, 154, 156, 158, 19, 165, 174, 53, 193, 146, 74, 147, 205, 153, 126, 160, 148, 4, 244, 176, 57, 234, 182, 221, 93, 0, 55, 59, 175, 156, 207, 42, 244, 82, 142, 187, 96, 1, 154, 223, 223, 107, 21, 103, 121, 116, 181, 110, 167, 158, 128, 251, 74]
// const PRIVATE_KEY = "36njNwkkAcQBMtc7gSThfbZhFAFMAZwgrEBofAz2cij6QPBsN8d7kuhv4dsYQXo4gVFS4QSDXYNBKbwdMkMb7yzs"
const RPCURL = 'https://weathered-burned-gas.solana-mainnet.quiknode.pro/42794a2bf8e0e4befb00e9d3fc769a7c8d186778/';
// const RPCURL = 'https://solana-api.projectserum.com'
// const MARKETADDRESS = 'EMFSwgaEeAp5rm6CXLyJLqgVX8hnfZEmTJdgQKvmwjUx';
const MARKETADDRESS = '2g3Fv1c1gWhWkzDxRSnRp3q2x7kvsF3HZDyXgpUFh58Q';
const PROGRAMADDRESS = '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin';
const PAIRNAME = 'MBBSOL';
const MAKEMARKETINTERVAL = 30000; // run market maker every MAKEMARKETINTERVAL milliseconds

export {
    DB_CONN_STRING,
    PORT,
    PRIVATE_KEY,
    RPCURL,
    MARKETADDRESS,
    PROGRAMADDRESS,
    PAIRNAME,
    MAKEMARKETINTERVAL
}