const path = require("path");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "bank",
    version: "1.0",
    description: "Deposit or withdraw money from the bank and earn interest",
    guide: {
      vi: "",
      en: "{pn}Bank:\nInterest - Balance\n - Withdraw \n- Deposit \n- Transfer \n- Richest"
    },
    category: "BANK",
    countDown: 6,
    role: 0,
    author: "Sheikh" // no modify and if you modified then don't change credit
  },
  onStart: async function ({ args, message, event, api, usersData }) {
        const { senderID } = event;
    const { getPrefix, formatNumberWithFullForm } = global.utils;
    const p = getPrefix(event.threadID);
    const user = parseInt(event.senderID);
    const bankDataPath = 'scripts/cmds/bank.json';

    let bankData = {}; // Initialize bank data
    if (fs.existsSync(bankDataPath)) {
      bankData = JSON.parse(fs.readFileSync(bankDataPath, "utf8"));
    } else {
      fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");
    }

    const command = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);
    const recipientUID = parseInt(args[2]);
    const userMoney = await usersData.get(senderID, "money");
    const bankBalance = bankData[user]?.bank || 0;
    switch (command) {
      case "deposit":
        if (isNaN(amount) || amount <= 0) {
          return message.reply("[ Octa Via's Bank ]\n\nPlease enter a valid amount to deposit 💰");
        }

        if (bankBalance >= 1e104) {
          return message.reply("[ Octa Via's Bank ]\n\nYou cannot deposit money when your bank balance is already at $1e104 ❌");
        }

        if (userMoney < amount) {
          return message.reply("[ Octa Via's Bank ]\n\nYou don't have the required amount to deposit ❌");
        }

        bankData[user].bank = (bankData[user].bank || 0) + amount;
        await usersData.set(senderID, { money: userMoney - amount });
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");

        message.reply(`[ Octa Via's Bank ]\n\nSuccessfully deposited $${amount} into your bank account ✅`);
        break;

      case "withdraw":
        if (isNaN(amount) || amount <= 0) {
          return message.reply("[ Octa Via's Bank ]\n\nPlease enter the correct amount to withdraw 💸");
        }

        if (userMoney >= 1e104) {
          return message.reply("[ Octa Via's Bank ]\n\nYou cannot withdraw money when your balance is already at 1e104 😒");
        }

        if (amount > bankBalance) {
          return message.reply("[ Octa Via's Bank ]\n\nThe requested amount is greater than the available balance in your bank account 🗿");
        }

        bankData[user].bank = bankBalance - amount;
        await usersData.set(senderID, { money: userMoney + amount });
        fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");

        message.reply(`[ Octa Via's Bank ]\n\nSuccessfully withdrew $${amount} from your bank account ✅`);
        break;

      case "balance":
        if (!isNaN(bankBalance)) {
          message.reply(`[ Octa Via's Bank ]\n\nYour bank balance is: $${formatNumberWithFullForm(bankBalance)}\nTo withdraw money, type:\n-Bank Withdraw 'your withdrawal amount'\nTo earn interest, type:\n-Bank Interest`);
        } else {
          message.reply("[ Octa Via's Bank ]\n\nError: Your bank balance is not a valid number 😿");
        }
        break;

      case "interest":
        const interestRate = 0.001; // 0.1% daily interest rate
        const lastInterestClaimed = bankData[user]?.lastInterestClaimed || 0;
        const currentTime = Date.now();
        const timeDiffInSeconds = (currentTime - lastInterestClaimed) / 1000;

        if (timeDiffInSeconds < 43200) {
          const remainingTime = Math.ceil(43200 - timeDiffInSeconds);
          const remainingHours = Math.floor(remainingTime / 3600);
          const remainingMinutes = Math.floor((remainingTime % 3600) / 60);

          message.reply(`[ Octa Via's Bank ]\n\nYou have already claimed your interest. You can claim interest again within ${remainingHours} hours and ${remainingMinutes} minutes 😺`);
        } else {
          const interestEarned = bankBalance * (interestRate / 970) * timeDiffInSeconds;

          if (bankBalance <= 0) {
            message.reply("[ Octa Via's Bank ]\n\nYou don't have any money in your bank account to earn interest 💸🥱");
          } else {
            bankData[user].lastInterestClaimed = currentTime;
            bankData[user].bank += interestEarned;

            fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");

            message.reply(`[ Octa Via's Bank ]\n\nYou have earned interest of $${formatNumberWithFullForm(interestEarned)}\nIt has been successfully added to your account balance ✅`);
          }
        }
        break;


      case "transfer":
  if (isNaN(amount) || amount <= 0) {
    return message.reply("[ Octa Via's Bank ]\n\nPlease enter a valid amount to transfer 🔁");
  }

  if (!recipientUID || !bankData[recipientUID]) {
    return message.reply("[ Octa Via's Bank ]\n\nRecipient not found in the bank database. Please check the recipient's ID ✖️");
  }

  if (recipientUID === user) {
    return message.reply("[ Octa Via's Bank ]\n\nYou cannot transfer money to yourself 😹");
  }

  const senderBankBalance = parseFloat(bankData[user]?.bank) || 0;
  const recipientBankBalance = parseFloat(bankData[recipientUID]?.bank) || 0;

  if (recipientBankBalance >= 1e104) {
    return message.reply("[ Octa Via's Bank ]\n\nThe recipient's bank balance is already $1e104. You cannot transfer money to them 🗿");
  }

  if (amount > senderBankBalance) {
    return message.reply("[ Octa Via's Bank ]\n\nYou don't have enough money in your bank account for this transfer ✖️");
  }

  bankData[user].bank = senderBankBalance - amount;
  bankData[recipientUID].bank = recipientBankBalance + amount;

  fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");

  message.reply(`[ Octa Via's Bank ]\n\nSuccessfully transferred $${amount} to the recipient with UID: ${recipientUID} ✅`);
  break;

case "richest":
  const topUsers = Object.entries(bankData)
    .sort(([, a], [, b]) => b.bank - a.bank)
    .slice(0, 10);

  const output = (await Promise.all(topUsers.map(async ([userID, userData], index) => {
    const userName = await usersData.getName(userID);
    const formattedBalance = formatNumberWithFullForm(userData.bank); // Format the bank balance
    return `${index + 1}. ${userName} - $${formattedBalance}`;
  }))).join('\n\n');

  message.reply("[ Octa Via's Bank richest ]\n\nTop 10 Richest people according to their bank balance 👑😺:\n\n" + output + "\n\n");
  break;

case "loan":
  const maxLoanAmount = 4000; //increase or decrease this
  const userLoan = bankData[user]?.loan || 0;
  const loanPayed = bankData[user]?.loanPayed !== undefined ? bankData[user]?.loanPayed : true;

  if (!amount) {
    return message.reply("[ Octa Via's Bank ]\n\nPlease enter a valid loan amount ✖️");
  }

  if (amount > maxLoanAmount) {
    return message.reply("[ Octa Via's Bank ]\n\nThe maximum loan amount is $4000 ❗");
  }

  if (!loanPayed && userLoan > 0) {
    return message.reply(`[ Octa Via's Bank ]\n\nYou cannot take a new loan until you pay off your current loan.\nYour current loan to pay: $${userLoan} 😑`);
  }

  bankData[user].loan = userLoan + amount;
  bankData[user].loanPayed = false;
  bankData[user].bank += amount;

  fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");

  message.reply("[ Octa Via's Bank ]\n\nYou have successfully taken a loan of $${amount}. Please note that loans must be repaid within a certain period 😉");
  break;

case "payloan":
  const loanBalance = bankData[user]?.loan || 0;

  if (isNaN(amount) || amount <= 0) {
    return message.reply("[ Octa Via's Bank ]\n\nPlease enter a valid amount to repay your loan ✖️");
  }

  if (loanBalance <= 0) {
    message.reply("[ Octa Via's Bank ]\n\nYou don't have any pending loan payments");
    return;
  }

  if (amount > loanBalance) {
    return message.reply(`[ Octa Via's Bank ]\n\nThe amount required to pay off the loan is greater than your due amount. Please pay the exact amount 😊\nYour total loan: $${loanBalance}`);
  }

  if (amount > userMoney) {
    return message.reply(`[ Octa Via's Bank ]\n\nYou do not have $${amount} in your balance to repay the loan 😿`);
  }

  bankData[user].loan = loanBalance - amount;

  if (loanBalance - amount === 0) {
    bankData[user].loanPayed = true;
  }
  await usersData.set(senderID, {
    money: userMoney - amount
  });
  fs.writeFileSync(bankDataPath, JSON.stringify(bankData), "utf8");

  message.reply(`[ Octa Via's Bank ]\n\nSuccessfully repaid $${amount} towards your loan. Your current loan to pay: $${bankData[user].loan} ✅`);
  break;
default:
    message.reply("[ Octa Via's Bank ]\n\nPlease use one of the following valid commands:\n-Bank Deposit\n-Bank Withdraw\n-Bank Balance\n-Bank Interest\n-Bank Transfer\n-Bank Richest\n-Bank Loan\n-Bank PayLoan");
    break;
    }
  }
};
