import { NextFunction, Request, Response } from 'express';
import httpStatus from "http-status-codes";
import { catchAsync } from '../../utils/catchAsync';
import { ParcelService } from './parcel.service';
import { sendResponse } from '../../utils/sendResponse';
import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { ParcelStatus } from './parcel.interface';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const decodeToken = req.user as JwtPayload
  const parcelData = req.body;
  // console.log(decodeToken)
  const parcel = await ParcelService.createParcel(parcelData, decodeToken.userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Parcel created successfully',
    data: parcel,
  });
})

const getParcelsByAdmin = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await ParcelService.getParcelsByAdmin(query as Record<string, string>);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Parcel Retrieved Successfully By Admin",
    data: result.data,
    meta: result.meta
  })
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getSenderParcels = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
 const query = req.query;
  const decodeToken = req.user as JwtPayload
  const result = await ParcelService.getParcelsBySender(decodeToken.userId, query as Record<string, string>);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Parcel Retrieved Successfully By Sender",
    data: result.data,
    meta: result.meta
  })
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getReceiverParcels = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const query = req.query;
  const decodeToken = req.user as JwtPayload
  const result = await ParcelService.getParcelsByReceiver(decodeToken.userId, query as Record<string, string>);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Parcel Retrieved Successfully By Receiver",
    data: result.data
  })
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cancelParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const parcelId = req.params.id;
  // console.log(parcelId)
  const decodeToken = req.user as JwtPayload
  const result = await ParcelService.cancelParcel(parcelId, decodeToken.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Parcel Cancel Successfully",
    data: result.data
  })
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const deliveryParcelByReceiver = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const parcelId = req.params.id;
  // console.log(parcelId)
  const decodeToken = req.user as JwtPayload
  const result = await ParcelService.deliveryParcelByReceiver(parcelId, decodeToken.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Parcel Delivery Successfully",
    data: result.data
  })
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getDeliveryHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const decodeToken = req.user as JwtPayload
  const result = await ParcelService.getDeliveryHistory(decodeToken.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Delivery history retrieved successfully",
    data: result.data
  })
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const parcelBlockAndUnblock = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { isBlocked, location, note } = req.body;
  const { id: parcelId } = req.params;
  const decoded = req.user as JwtPayload;
  const updatedBy = new Types.ObjectId(decoded._id);

  const result = await ParcelService.parcelBlockAndUnblock(
    parcelId,
    isBlocked,
    updatedBy,
    location,
    note
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `Parcel ${isBlocked ? "blocked" : "unblocked"} successfully`,
    data: result,
  });
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const assignDeliveryPersonnel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { parcelId } = req.params;
  const { personnelId } = req.body;

  const result = await ParcelService.assignDeliveryPersonnel(parcelId, personnelId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Delivery personnel assigned successfully",
    data: result.data
  })
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updateParcelStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { status, location, note } = req.body;
  const parcelId = req.params.id;
  const decodeToken = req.user as JwtPayload
  const updatedBy = new Types.ObjectId(decodeToken._id);

  const result = await ParcelService.updateParcelStatus(
    parcelId,
    status as ParcelStatus,
    updatedBy,
    location,
    note
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Parcel Cancel Successfully",
    data: result.data
  })
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const deleteParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const parcelId = req.params.id;
  const user = req.user as JwtPayload;
  const result = await ParcelService.deleteParcel(
    parcelId,
    new Types.ObjectId(user.userId),
    user.role
  );


  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Parcel deleted successfully",
    data: result.data
  })
})
export const getParcelById = catchAsync(async (req: Request, res: Response) => {
  const parcelId = req.params.id;

  const parcel = await ParcelService.getParcelById(parcelId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Parcel details retrieved',
    data: parcel,
  });
});
export const getParcelByTrackingId = catchAsync(async (req: Request, res: Response) => {
  const trackingId = req.params.id;

  const parcel = await ParcelService.getParcelByTrackingId(trackingId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Parcel details retrieved with tracking ID',
    data: parcel,
  });
});
export const ParcelController = {
  createParcel,
  getSenderParcels,
  getReceiverParcels,
  getParcelsByAdmin,
  getParcelById,
  getDeliveryHistory,
  cancelParcel,
  deliveryParcelByReceiver,
  updateParcelStatus,
  assignDeliveryPersonnel,
  parcelBlockAndUnblock,
  deleteParcel,
  getParcelByTrackingId
}