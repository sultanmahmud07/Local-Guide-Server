import { Parcel } from "./parcel.model";
import { IParcel, ParcelStatus } from "./parcel.interface";
import AppError from "../../errorHelpers/AppError";
import { generateTrackingId } from "../../utils/generateTrackingId";
import httpStatus from "http-status-codes";
import { Types } from "mongoose";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { parcelSearchableFields } from "./parcel.constant";

const createParcel = async (data: Partial<IParcel>, userId: string) => {
  const trackingId = generateTrackingId();

  const initialStatusLog = {
    status: "REQUESTED",
    updatedBy: userId,
    timestamp: new Date()
  };

  const parcel = await Parcel.create({
    ...data,
    trackingId,
    sender: userId,
    statusLogs: [initialStatusLog]
  });

  return parcel;
};

const getParcelsBySender = async (senderId: string, query: Record<string, string>) => {

   const queryBuilder = new QueryBuilder(Parcel.find({ sender: senderId }), query)

  const parcels = await queryBuilder
    .search(parcelSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate()

  const [data, meta] = await Promise.all([
    parcels.build(),
    queryBuilder.getMeta()
  ])
  // console.log(meta)
  return {
    data,
    meta
  }
};
const getParcelsByAdmin = async (query: Record<string, string>) => {
 
  const queryBuilder = new QueryBuilder(Parcel.find(), query)

  const parcels = await queryBuilder
    .search(parcelSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate()

  const [data, meta] = await Promise.all([
    parcels.build(),
    queryBuilder.getMeta()
  ])
  return {
    data,
    meta
  }
};
const getParcelsByReceiver = async (receiverId: string, query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Parcel.find({ receiver: receiverId }), query)

  const parcels = await queryBuilder
    .search(parcelSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate()

  const [data, meta] = await Promise.all([
    parcels.build(),
    queryBuilder.getMeta()
  ])
  // console.log(meta)
  return {
    data,
    meta
  }
};
const getDeliveryHistory = async (receiverId: string) => {
  const parcel = await Parcel.find({
    receiver: receiverId,
    status: "DELIVERED",
  }).populate("sender", "name email");
  return {
    data: parcel
  }
};
const getParcelById = async (parcelId: string) => {
  const parcel = await Parcel.findById(parcelId)
    .populate("sender", "name email")
    .populate("receiver", "name email")
    // .populate({
    //   path: "statusLogs.updatedBy",
    //   select: "name",
    // });

  // Map statusLogs to extract only name
  // const statusLogs = parcel?.statusLogs.map((log) => ({
  //   status: log.status,
  //   updatedByName: log.updatedBy ? log.updatedBy.name : "Unknown",
  //   timestamp: log.timestamp,
  // }));

  return {
    data: parcel,
  };
};


const getParcelByTrackingId = async (trackingId: string) => {
  const parcel = await Parcel.findOne({trackingId})
    .populate("sender", "name email")
    .populate("receiver", "name email");
    
  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found with this tracking ID");
  }
  return {
    data: parcel
  }
};

const updateParcelStatus = async (parcelId: string, status: ParcelStatus, updatedBy: Types.ObjectId, location?: string, note?: string) => {
  const parcel = await Parcel.findById(parcelId);
  if (!parcel) throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");

  parcel.status = status;
  parcel.statusLogs.push({
    status,
    updatedBy,
    location,
    note,
    timestamp: new Date()
  });
  await parcel.save();
  return {
    data: parcel
  }
};

const assignDeliveryPersonnel = async (parcelId: string, personnelId: string) => {
  const parcel = await Parcel.findByIdAndUpdate(
    parcelId,
    { deliveryPersonnel: personnelId },
    { new: true }
  ).populate("deliveryPersonnel", "name email");

  if (!parcel) throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");

  await parcel.save();
  return {
    data: parcel
  }
};
const parcelBlockAndUnblock = async (
  parcelId: string,
  isBlocked: boolean,
  updatedBy: Types.ObjectId,
  location?: string,
  note?: string
) => {
  const parcel = await Parcel.findById(parcelId);
  if (!parcel) throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");

  parcel.isBlocked = isBlocked;

  parcel.statusLogs.push({
    status: isBlocked ? "BLOCKED" : "UNBLOCKED",
    updatedBy,
    location,
    note,
    timestamp: new Date(),
  });

  await parcel.save();

  return parcel;
};


const cancelParcel = async (parcelId: string, senderId: Types.ObjectId) => {
  const parcel = await Parcel.findOne({ _id: parcelId, sender: senderId });

  if (!parcel) throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
  if (["DISPATCHED", "IN_TRANSIT", "DELIVERED"].includes(parcel.status)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cannot cancel after dispatch");
  }

  parcel.status = "CANCELED";
  parcel.statusLogs.push({
    status: "CANCELED",
    updatedBy: senderId,
    timestamp: new Date()
  });

  await parcel.save();
  return {
    data: parcel
  };
};
const deliveryParcelByReceiver = async (parcelId: string, receiverId: Types.ObjectId) => {
  const parcel = await Parcel.findOne({ _id: parcelId, receiver: receiverId });

  if (!parcel) throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
  if (["DELIVERED"].includes(parcel.status)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Parcel already delivered");
  }

  parcel.status = "DELIVERED";
  parcel.statusLogs.push({
    status: "DELIVERED",
    updatedBy: receiverId,
    timestamp: new Date()
  });

  await parcel.save();
  return {
    data: parcel
  };
};
const deleteParcel = async (
  parcelId: string,
  userId: Types.ObjectId,
  role: string
) => {
  const parcel = await Parcel.findById(parcelId);
  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
  }

  //  If ADMIN or SUPER_ADMIN => Only can delete directly
  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    await Parcel.findByIdAndDelete(parcelId);
    return { data: parcelId };
  }

  //  If SENDER => must be the sender & status must be REQUESTED
  if (role === "SENDER") {
    if (parcel.sender.toString() !== userId.toString()) {
      // console.log("Sender ID mismatch:", parcel.sender.toString(), userId.toString());
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to delete this parcel"
      );
    }

    if (parcel.status !== "REQUESTED") {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Parcel cannot be deleted because its status is ${parcel.status}`
      );
    }

    await Parcel.findByIdAndDelete(parcelId);
    return { data: parcelId };
  }
  // If RECEIVER => Cannot delete
  throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to delete parcels");
};

export const ParcelService = {
  createParcel,
  getParcelsBySender,
  getParcelsByReceiver,
  getParcelById,
  getParcelsByAdmin,
  getDeliveryHistory,
  updateParcelStatus,
  parcelBlockAndUnblock,
  cancelParcel,
  deliveryParcelByReceiver,
  assignDeliveryPersonnel,
  getParcelByTrackingId,
  deleteParcel
};
