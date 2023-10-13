const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  createTransaction: async (req, res, next) => {
    let { sourceAccountId, destinasiAccountId, amount } = req.body;
    try {
      // Validasi akun pengirim
      let sourceAccount = await prisma.bankAccount.findUnique({
        where: {
          id: sourceAccountId,
        },
      });

      if (!sourceAccount) {
        return res.status(404).json({
          status: false,
          message: "Source account Id Not Found",
          data: null,
        });
      }

      // Validasi akun penerima
      let destinasiAccount = await prisma.bankAccount.findUnique({
        where: {
          id: destinasiAccountId,
        },
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
      let createTransaction = await prisma.transaksi.create({
        data: {
          sourceAccountId,
          destinasiAccountId,
          amount,
        },
      });

      // Mengurangi saldo pengirim
      await prisma.bankAccount.update({
        where: {
          id: sourceAccountId,
        },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      // Menambahkan saldo penerima
      await prisma.bankAccount.update({
        where: {
          id: destinasiAccountId,
        },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      res.status(201).json({
        status: true,
        message: "Transaction Created Successfully!",
        data: createTransaction,
      });
    } catch (err) {
      next(err);
    }
  },

  getAllTransaction: async (req, res, next) => {
    try {
      let transactions = await prisma.transaksi.findMany();
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
      const transaction = await prisma.transaksi.findUnique({
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
      let sourceAccount = await prisma.bankAccount.findUnique({
        where: { id: transaction.sourceAccountId },
      });

      // Dapatkan detail akun penerima
      let destinasiAccount = await prisma.bankAccount.findUnique({
        where: { id: transaction.destinasiAccountId },
      });

      // Menggabungkan data transaksi dengan detail akun
      let transactionDetails = {
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
