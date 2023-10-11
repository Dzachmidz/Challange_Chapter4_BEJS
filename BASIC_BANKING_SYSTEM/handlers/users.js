const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getPagination } = require("../helpers/index");

module.exports = {
  createUser: async (req, res, next) => {
    try {
      let { name, email, password, profile } = req.body;
      let existUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existUser) {
        return res.status(400).json({
          status: false,
          message: "Email is already exist!",
          data: null
        })
      }

      let user = await prisma.user.create({
        data: {
          name,
          email,
          password,
          profile: {
            create: profile,
          },
        },
      });
      res.status(201).json({
        status: true,
        message: "User Created Successfully!",
        data: user,
      });
    } catch (err) {
      next(err);
    }
  },

  getAllUsers: async (req, res, next) => {
    try {
      let { limit = 2, page = 1 } = req.query;
      limit = Number(limit);
      page = Number(page);
      let users = await prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          profile: true,
          BankAccount: true,
        },
        orderBy: {
          id: "asc",
        },
      });
      const { _count } = await prisma.user.aggregate({
        _count: { id: true },
      });

      let pagination = getPagination(req, _count.id, page, limit);

      res.status(201).json({
        status: true,
        message: "All Users Data",
        data: { pagination, users },
      });
    } catch (err) {
      next(err);
    }
  },

  getDetailUser: async (req, res, next) => {
    try {
      let { userId } = req.params;

      let detailUser = await prisma.user.findUnique({
        where: {
          id: Number(userId),
        },
        include: {
          profile: true,
          BankAccount: true,
        },
      });

      if (!detailUser) {
        return res.status(400).json({
          status: false,
          message: "User Not Found",
          data: null,
        });
      }

      res.status(200).json({
        status: true,
        message: "User Found",
        data: detailUser,
      });
    } catch (err) {
      next(err);
    }
  },
};
