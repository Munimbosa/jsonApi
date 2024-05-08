const path = require("path");
const fs = require("fs-extra");
const { senderID } = event;
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
    author: "Sheikh" //no modify and if you modified then dont change credit
  },
  onStart: async function ({ args, message, event, api, usersData }) {
    const { getPrefix } = global.utils;
    const p = getPrefix(event.threadID);
    const user = parseInt(event.senderID);
    const bankDataPath = 'bank.json';
    
    if (!fs.existsSync(bankDataPath)) {
      const initialBankData = {};
      fs.writeFileSync(bankDataPath, JSON.stringify(initialBankData), "utf8");
    }
    
    const bankData = JSON.parse(fs.readFileSync(bankDataPath, "utf8"));
    
    const command = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);
