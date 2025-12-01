import { Tour } from "./tour.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";

const createTour = async (payload: any) => {
  const tour = await Tour.create(payload);
  return { data: tour };
};

const updateTour = async (id: string, payload: any, userId: string, role: string) => {
  const tour = await Tour.findById(id);
  if (!tour) throw new AppError(httpStatus.NOT_FOUND, "Tour not found");

  if (role === "GUIDE" && tour.guide.toString() !== userId.toString()) {
    throw new AppError(httpStatus.FORBIDDEN, "Not authorized");
  }

  Object.assign(tour, payload);
  await tour.save();

  return { data: tour };
};

export const TourService = {
  createTour,
  updateTour
};
