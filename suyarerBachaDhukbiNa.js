const fs = require("fs");
function formatNumberWithFullForm(number) {
  const fullForms = [
    "",
    "Thousand",
    "Million",
    "Billion",
    "Trillion",
    "Quadrillion",
    "Quintillion",
    "Sextillion",
    "Septillion",
    "Octillion",
    "Nonillion",
    "Decillion",
    "Undecillion",
    "Duodecillion",
    "Tredecillion",
    "Quattuordecillion",
    "Quindecillion",
    "Sexdecillion",
    "Septendecillion",
    "Octodecillion",
    "Novemdecillion",
    "Vigintillion",
    "Unvigintillion",
    "Duovigintillion",
    "Tresvigintillion",
    "Quattuorvigintillion",
    "Quinvigintillion",
    "Sesvigintillion",
    "Septemvigintillion",
    "Octovigintillion",
    "Novemvigintillion",
    "Trigintillion",
    "Untrigintillion",
    "Duotrigintillion",
    "Googol",
  ];

  let fullFormIndex = 0;
  while (number >= 1000 && fullFormIndex < fullForms.length - 1) {
    number /= 1000;
    fullFormIndex++;
  }
  const formattedNumber = number.toFixed(2);

  return `${formattedNumber} ${fullForms[fullFormIndex]}`;
}
module.exports = {
    config: {
        name: "octa bank",
        version: "2.0",
        author: "LøüFï/alrulex",
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
    const userMoney = await usersData.get(event.senderID, "money");
    const user = parseInt(event.senderID);
    const bankData = JSON.parse(fs.readFileSync("bank.json", "utf8"));

    if (!bankData[user]) {
        bankData[user] = { bank: 0, loan: 0, lastInterestClaimed: Date.now() };
        fs.writeFile("bank.json", JSON.stringify(bankData), (err) => {
            if (err) throw err;
        });
    }

    const command = args[0];
    const amount = parseInt(args[1]);
    const recipientUID = parseInt(args[2]);

    if (command === "deposit") {
        if (isNaN(amount) || amount <= 0) return message.reply("Please enter the amount you wish to deposit in the bank.");
        if (userMoney < amount) return message.reply("You don't have enough money.");
        bankData[user].bank += amount;
        await usersData.set(event.senderID, { money: userMoney - amount });
        fs.writeFile("bank.json", JSON.stringify(bankData), (err) => { if (err) throw err; });
        return message.reply(`${amount} $ has been deposited into your bank account.`);
    } else if (command === "balance" && command === "bal") {
const formattedBankBalance = parseFloat(bankBalance);
  if (!isNaN(formattedBankBalance)) {
    return message.reply(`Your bank account balance is ${balanceInFullForm} $.`);
		}
    } else if (command === "withdraw") {
        const balance = bankData[user].bank || 0;
        if (isNaN(amount) || amount <= 0) return message.reply("Please enter the amount you wish to withdraw from your bank account.");
        if (amount > balance) return message.reply("The amount you want to withdraw is not available in your bank account.");
        bankData[user].bank = balance - amount;
        const userMoney = await usersData.get(event.senderID, "money");
        await usersData.set(event.senderID, { money: userMoney + amount });
        fs.writeFile("bank.json", JSON.stringify(bankData), (err) => { if (err) throw err; });
        return message.reply(`${amount} $ has been withdrawn from your bank account.`);
    } else if (command === "interest") {
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
} else if (command === "transfer") {
    const balance = bankData[user].bank || 0;
    if (isNaN(amount) || amount <= 0) return message.reply("Please enter the amount you wish to transfer to the recipient.");
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
    return message.reply(`${amount} converted to the recipient with id ${recipientUID}.`);
} else {
        return message.reply("Octa Bank Services 🏦\n\nDeposit 💰: Add money to your account\nWithdraw 💸: Take money out of your account\nBalance 📊: Check your account balance\nInterest 💳: Claim interest on your balance\nTransfer 🔄: Send money to another account\nLoan 💸💼: Apply for a loan\nRepay 💰: Pay back your loan\n\nFor more details, use 'help octa bank'.");
    }
		}
          }
