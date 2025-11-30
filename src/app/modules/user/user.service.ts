import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constant";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isExist = await User.findOne({ email });
  if (isExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
  }

  const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND));
  const auth: IAuthProvider = { provider: "credentials", providerId: email as string };

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [auth],
    ...rest
  });

  return user;
};

const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  if (payload.role) {
    if ([Role.SENDER, Role.RECEIVER].includes(decodedToken.role)) {
      throw new AppError(httpStatus.FORBIDDEN, "Insufficient role");
    }

    if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
      throw new AppError(httpStatus.FORBIDDEN, "Only super admin can assign super admin");
    }
  }

  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if ([Role.SENDER, Role.RECEIVER].includes(decodedToken.role)) {
      throw new AppError(httpStatus.FORBIDDEN, "Insufficient role");
    }
  }

  if (payload.password) {
    payload.password = await bcryptjs.hash(payload.password, Number(envVars.BCRYPT_SALT_ROUND));
  }

  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true
  });

  return updatedUser;
};

const getAllUsers = async (query: Record<string, string>) => {
  
 const queryBuilder = new QueryBuilder(User.find({isDeleted: false}), query)

  const users = await queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate()

  const [data, meta] = await Promise.all([
    users.build(),
    queryBuilder.getMeta()
  ])
  return {
    data,
    meta
  }
};
const getAllAdmin = async (query: Record<string, string>) => {
  
 const queryBuilder = new QueryBuilder(User.find({role: "ADMIN"}), query)

  const users = await queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate()

  const [data, meta] = await Promise.all([
    users.build(),
    queryBuilder.getMeta()
  ])
  return {
    data,
    meta
  }
};
const getAllDeletedUsers = async (query: Record<string, string>) => {
  
 const queryBuilder = new QueryBuilder(User.find({isDeleted: true}), query)

  const users = await queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate()

  const [data, meta] = await Promise.all([
    users.build(),
    queryBuilder.getMeta()
  ])
  return {
    data,
    meta
  }
};
const getAllUnauthorizedUsers = async (query: Record<string, string>) => {
  
 const queryBuilder = new QueryBuilder(User.find({isVerified: false}), query)

  const users = await queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate()

  const [data, meta] = await Promise.all([
    users.build(),
    queryBuilder.getMeta()
  ])
  return {
    data,
    meta
  }
};
const getAllSender = async () => {
  const users = await User.find({ role: "SENDER" });
  const totalSender = await User.countDocuments({ role: "SENDER" });
  return {
    data: users,
    meta: {
      total: totalSender,
    },
  };
};
const getAllReceiver = async () => {
  const users = await User.find({ role: "RECEIVER" });
  const totalReceiver = await User.countDocuments({ role: "RECEIVER" });
  return {
    data: users,
    meta: {
      total: totalReceiver,
    },
  };
};
const getSingleUser = async (id: string) => {
    const user = await User.findById(id).select("-password");
    return {
        data: user
    }
};
const getMe = async (userId: string) => {
    const user = await User.findById(userId).select("-password");
    return {
        data: user
    }
};
export const UserServices = {
    createUser,
    getAllUsers,
    getAllAdmin,
    getAllDeletedUsers,
    getAllUnauthorizedUsers,
    getAllSender,
    getAllReceiver,
    updateUser,
    getMe,
    getSingleUser
}