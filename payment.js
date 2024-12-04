let data = []
const gamePakage = {
    pkg1 : {
        price: 10000,
        agribank_price: '10,000VND',
        momo_price: '10.000đ',
        mora: 3000,
    }
}

const checkTransaction = {
    agribank : (param, transaction) => {
        const username = param.username.toLowerCase();
        const email = param.email.toLowerCase();
        const gamepkg = param.package.toLowerCase();
        const handle = transaction.toLowerCase();
        return handle.includes(username) && handle.includes(gamepkg);
    },
    momo: (param, transaction) => {
        const username = param.username.toLowerCase();
        const key = param.package;
        const price = gamePakage[key].momo_price;
        const handle = transaction.toLowerCase();
        return handle.includes(username) && handle.includes(price);
    }
}

const addData = (param) => {
    const element = `${param.title} ${param.text}`;
    if (data.includes(element)) return false;
    data.push(element);
    return true;
}

const confirmPayment = (param) => {
    const originalDataLength = data.length;
    data = data.filter(transaction => {
        return !checkTransaction[param.bank](param, transaction);
    });    
    return data.length < originalDataLength;
}

module.exports = {
    gamePakage,
    addData,
    confirmPayment,
}