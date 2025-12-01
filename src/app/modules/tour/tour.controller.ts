import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { TourService } from "./tour.service";
import { JwtPayload } from "jsonwebtoken";

const createTour = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const thumbnail = req.files && (req.files as any).thumbnail
    ? (req.files as any).thumbnail[0].path
    : undefined;

  const images = req.files && (req.files as any).images
    ? (req.files as any).images.map((f: any) => f.path)
    : [];

  const payload = {
    ...req.body,
    guide: user.userId,
    thumbnail,
    images,
  };

  const result = await TourService.createTour(payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Tour created successfully",
    data: result.data
  });
});

const updateTour = catchAsync(async (req: Request, res: Response) => {
  // const user = req.user as JwtPayload;

  const thumbnail = req.files && (req.files as any).thumbnail
    ? (req.files as any).thumbnail[0].path
    : undefined;

  const images = req.files && (req.files as any).images
    ? (req.files as any).images.map((f: any) => f.path)
    : undefined; // undefined means skip replacing

  const payload = {
    ...req.body,
    ...(thumbnail && { thumbnail }),
    ...(images && { images }),
  };

  const result = await TourService.updateTour(
    req.params.id,
    payload
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tour updated successfully",
    data: result.data
  });
});

export const TourController = {
  createTour,
  updateTour
};
