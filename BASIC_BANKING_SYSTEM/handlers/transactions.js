const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  createTransaction: async (req, res, next) => {
    let { sourceAccountId, destinasiAccountId, amount } = req.body;
    try {
      // Validasi akun pengirim
      const sourceAccount = await prisma.bankAccount.findUnique({
        where: { id: Number(sourceAccountId) },
      });

      if (!sourceAccount) {
        return res.status(404).json({
          status: false,
          message: "Source account Id Not Found",
          data: null,
        });
      }

      // Validasi akun penerima
      const destinasiAccount = await prisma.bankAccount.findUnique({
        where: { id: Number(destinasiAccountId) },
      });

      if (!destinasiAccount) {
        return res.status(404).json({
          status: false,
          message: "Destinasi account Id Not Found",
          data: null,
        });
      }

      // Validasi apakah saldo cukup
      if (sourceAccount.balance < amount) {
        return res.status(400).json({
          status: false,
          message: "Balance Reduced",
          data: null,
        });
      }

      // Membuat transaksi
      const transaction = await prisma.transaction.create({
        data: {
          sourceAccountId: Number(sourceAccountId),
          destinasiAccountId: Number(destinasiAccountId),
          amount: amount,
        },
      });

      // Mengurangi saldo pengirim
      await prisma.bankAccount.update({
        where: { id: sourceAccount.id },
        data: { balance: sourceAccount.balance - amount },
      });

      // Menambahkan saldo penerima
      await prisma.bankAccount.update({
        where: { id: destinasiAccount.id },
        data: { balance: destinasiAccount.balance + amount },
      });

      res.status(201).json({
        status: true,
        message: "Transaction Created Successfully!",
        data: transaction,
      });
    } catch (err) {
      next(err);
    }
  },

  getAllTransactions: async (req, res, next) => {
    try {
      const transactions = await prisma.transaction.findMany();
      res.status(200).json({
        status: true,
        message: "All Transactions Data",
        data: transactions,
      });
    } catch (err) {
      next(err);
    }
  },

  getDetailTransaction: async (req, res, next) => {
    try {
      let { transactionId } = req.params;
      const transaction = await prisma.transaction.findUnique({
        where: { id: Number(transactionId) },
      });

      if (!transaction) {
        return res.status(400).json({
          status: false,
          message: "Transaction Not Found",
          data: null,
        });
      }

      // Dapatkan detail akun pengirim
      const sourceAccount = await prisma.bankAccount.findUnique({
        where: { id: transaction.sourceAccountId },
      });

      // Dapatkan detail akun penerima
      const destinasiAccount = await prisma.bankAccount.findUnique({
        where: { id: transaction.destinasiAccountId },
      });

      // Menggabungkan data transaksi dengan detail akun
      const transactionDetails = {
        ...transaction,
        sourceAccount: sourceAccount,
        destinasiAccount: destinasiAccount,
      };

      res.status(200).json({
        status: true,
        message: "Transaction Found",
        data: transactionDetails,
      });
    } catch (err) {
      next(err);
    }
  },
};
