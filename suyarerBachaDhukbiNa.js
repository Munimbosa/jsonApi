
const fs = require("fs");

function getBankBalance(userID, bankData) {
    return bankData[userID]?.bank || 0;
}

function depositMoney(user, amount, bankData, message, usersData, event) {
    const userMoney = usersData.get(event.senderID, "money");
    if (isNaN(amount) || amount <= 0) return message.reply("Please enter a valid amount to deposit.");
    if (userMoney < amount) return message.reply("You don't have enough money.");
    bankData[user].bank += amount;
    usersData.set(event.senderID, { money: userMoney - amount });
    fs.writeFile("bank.json", JSON.stringify(bankData), (err) => { if (err) throw err; });
    return message.reply(`${amount} $ has been deposited into your bank account.`);
}

function withdrawMoney(user, amount, bankData, message, usersData, event) {
    const balance = bankData[user].bank || 0;
    if (isNaN(amount) || amount <= 0) return message.reply("Please enter a valid amount to withdraw.");
    if (amount > balance) return message.reply("The amount you want to withdraw is not available in your bank account.");
    bankData[user].bank = balance - amount;
    const userMoney = usersData.get(event.senderID, "money");
    usersData.set(event.senderID, { money: userMoney + amount });
    fs.writeFile("bank.json", JSON.stringify(bankData), (err) => { if (err) throw err; });
    return message.reply(`${amount} $ has been withdrawn from your bank account.`);
}

function claimInterest(user, bankData, message) {
    const interestRate = 0.001; 
    const lastInterestClaimed = bankData[user].lastInterestClaimed || Date.now();
    const currentTime = Date.now();
    const timeDiffInSeconds = (currentTime - lastInterestClaimed) / 1000;
    const interestEarned = bankData[user].bank * (interestRate / 365) * timeDiffInSeconds;
    bankData[user].lastInterestClaimed = currentTime;
    bankData[user].bank += interestEarned;
    fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
        if (err) throw err;
    });
    return message.reply(`Interest has been added to your bank account balance. The interest earned is ${interestEarned.toFixed(2)} $.`);
}

function transferMoney(user, amount, recipientUID, bankData, message) {
    const balance = bankData[user].bank || 0;
    if (isNaN(amount) || amount <= 0) return message.reply("Please enter a valid amount to transfer.");
    if (balance < amount) return message.reply("The amount you wish to transfer is greater than your bank account balance.");
    if (isNaN(recipientUID)) return message.reply("Please enter the correct recipient ID.");
    if (!bankData[recipientUID]) {
        bankData[recipientUID] = { bank: 0, loan: 0, lastInterestClaimed: Date.now() };
        fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
            if (err) throw err;
        });
    }
    bankData[user].bank -= amount;
    bankData[recipientUID].bank += amount;
    fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
        if (err) throw err;
    });
    return message.reply(`${amount} $ has been transferred to the recipient with id ${recipientUID}.`);
}

module.exports = {
    config: {
        name: "bank",
        version: "2.0",
        author: "sheikh",
        countDown: 5,
        role: 0,
        shortDescription: {
            vi: "Hệ thống ngân hàng ảo",
            en: "Virtual bank system"
        },
        longDescription: {
            vi: "Hệ thống ngân hàng ảo, tôi sẽ nâng cấp nó sau",
            en: "Virtual bank system, I will upgrade it later"
        },
        category: "banking",
        guide: {
            vi: "{pn} [chuyển | rút | số dư | nạp | lãi suất | vay | trả nợ]\nbank chuyển (số tiền) (uid của người bạn muốn chuyển) không có dấu ()\nbank lãi suất: nhận lãi suất.\nbank số dư: hiển thị số tiền trong tài khoản của bạn.\nbank nạp (số tiền của bạn)\nbank rút (số tiền)\nbank vay (số tiền cần vay)\nbank trả nợ (số tiền cần trả)",
            en: "{pn} [transfer | withdraw | balance | deposit | interest | loan | repay]\nbank transfer (amount) (recipient's uid) without ()\nbank interest: get interest.\nbank balance: show the balance of your account.\nbank deposit (amount of your money)\nbank withdraw (amount of money)\nbank loan (amount to borrow)\nbank repay (amount to repay)"
        }
    },

    onStart: async function ({ args, message, event, usersData }) {
        const user = parseInt(event.senderID);
        const bankData = JSON.parse(fs.readFileSync("bank.json", "utf8"));

        switch (args[0]) {
    case "deposit":
        return depositMoney(user, parseInt(args[1]), bankData, message, usersData, event);
    case "withdraw":
        return withdrawMoney(user, parseInt(args[1]), bankData, message, usersData, event);
    case "balance":
        return checkBalance(user, bankData, message);
    case "interest":
        return claimInterest(user, bankData, message);
    case "transfer":
        return transferMoney(user, parseInt(args[1]), parseInt(args[2]), bankData, message);
    case "loan":
        return loanMoney(user, parseInt(args[1]), bankData, message);
    case "repay":
        return repayLoan(user, parseInt(args[1]), bankData, message);
    default:
        return message.reply("Octa Bank Services 🏦\n\nDeposit 💰: Add money to your account\nWithdraw 💸: Take money out of your account\nBalance 📊: Check your account balance\nInterest 💳: Claim interest on your balance\nTransfer 🔄: Send money to another account\nLoan 💸💼: Apply for a loan\nRepay 💰: Pay back your loan\n\nFor more details, use 'help octa bank'.");
	}
    }
};
