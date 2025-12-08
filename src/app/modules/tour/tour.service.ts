/* eslint-disable @typescript-eslint/no-unused-vars */
import { Tour } from "./tour.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { ITour } from "./tour.interface";
import { tourSearchableFields } from "./tour.constant";
import { Review } from "../review/review.model";
import mongoose from "mongoose";

const createTour = async (data: Partial<ITour>) => {
  const exists = await Tour.findOne({ slug: data.slug });
  if (exists) {
    throw new AppError(
      httpStatus.CONFLICT,
      "A tour with this slug already exists"
    );
  }

  const tour = await Tour.create(data);
  return { data: tour };
};

const updateTour = async (id: string, payload: Partial<ITour> ) => {
  const existingTour = await Tour.findById(id);

  if (!existingTour) {
    throw new AppError(httpStatus.NOT_FOUND, "Tour not found.");
  }

  // If images provided, merge with existing; new images are expected to be first in payload.images
  if (payload.images && payload.images.length > 0 && existingTour.images && existingTour.images.length > 0) {
    payload.images = [...payload.images, ...existingTour.images];
  }

  // If deleteImages provided, remove them from DB images and also ensure we don't re-add them from payload.images
  if (payload.deleteImages && payload.deleteImages.length > 0 && existingTour.images && existingTour.images.length > 0) {
    const deleteSet = new Set(payload.deleteImages);

    // Images that remain in DB after deletion
    const restDBImages = existingTour.images.filter(imageUrl => !deleteSet.has(imageUrl));

    // From incoming payload.images remove urls that were marked for deletion and also remove duplicates that are already in restDBImages
    const updatedPayloadImages = (payload.images || [])
      .filter(imageUrl => !deleteSet.has(imageUrl))
      .filter(imageUrl => !restDBImages.includes(imageUrl));

    payload.images = [...restDBImages, ...updatedPayloadImages];
  }

  // If slug is being changed, ensure uniqueness
  if (payload.slug && payload.slug !== existingTour.slug) {
    const slugExists = await Tour.findOne({ slug: payload.slug, _id: { $ne: id } });
    if (slugExists) {
      throw new AppError(httpStatus.CONFLICT, "Another tour already uses this slug");
    }
  }

  // Update doc
  const updatedTour = await Tour.findByIdAndUpdate(id, payload, { new: true });

  // After successful update, delete images from Cloudinary if requested
  if (payload.deleteImages && payload.deleteImages.length > 0 && existingTour.images && existingTour.images.length > 0) {
    // attempt to delete each image, but don't crash the update if deletion fails — log instead
    await Promise.all(
      payload.deleteImages.map(async (url) => {
        try {
          await deleteImageFromCLoudinary(url);
        } catch (err) {
          // optionally log: console.error("Failed to delete image:", url, err);
        }
      })
    );
  }
  return { data: updatedTour };
};
// const getAllTours = async (query: Record<string, string>) => {
//   const queryBuilder = new QueryBuilder(Tour.find().populate("author"), query);

//   const tours = await queryBuilder
//     .search(tourSearchableFields)
//     .filter()
//     .sort()
//     .fields()
//     .paginate();

//   const [data, meta] = await Promise.all([tours.build(), queryBuilder.getMeta()]);

//   return {
//     data,
//     meta
//   };
// };
// Assuming Tour, User, and Review models are imported

const getAllTours = async (query: Record<string, string>) => {
  
  // 1. Initial Find and Pagination
  // Populate the author data first to get the guide IDs
  const queryBuilder = new QueryBuilder(Tour.find().populate("author"), query);

  const toursQuery = await queryBuilder
    .search(tourSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [tours, meta] = await Promise.all([toursQuery.build(), queryBuilder.getMeta()]);

  // 2. Extract unique Author IDs from the fetched tours
  const authorIds = [
    ...new Set(
      tours
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map(tour => (tour.author as any)?._id?.toString())
        .filter(id => id) // Filter out null/undefined/unpopulated authors
    )
  ];

  // If no tours or no authors found, return early
  if (authorIds.length === 0) {
    return { data: tours, meta };
  }

  // 3. Aggregate Review Data for the fetched Authors
  // Note: This requires the Review model to be imported.
  const reviewStats = await Review.aggregate([
    // Filter reviews only for the authors currently present in the tours
    { $match: { guide: { $in: authorIds.map(id => new mongoose.Types.ObjectId(id)) } } },
    
    // Group by guide ID to calculate statistics
    {
      $group: {
        _id: "$guide", // Group by the guide ID in the Review document
        review_count: { $sum: 1 }, // Count the number of reviews
        avg_rating: { $avg: "$rating" }, // Calculate the average rating
      }
    },
    // Project to format the output
    {
        $project: {
            _id: 0,
            guideId: "$_id",
            review_count: 1,
            avg_rating: { $round: ["$avg_rating", 2] } // Round to 2 decimal places
        }
    }
  ]);
  
  // 4. Merge Review Stats back into Author Data within the Tour object
  const statsMap = new Map(reviewStats.map(stat => [stat.guideId.toString(), stat]));

  const dataWithStats = tours.map(tour => {
    const tourObj = tour.toObject ? tour.toObject() : tour; // Convert Mongoose document to plain object
    const author = tourObj.author;

    if (author && author._id) {
      const stats = statsMap.get(author._id.toString());
      
      // Merge stats into the author object
      tourObj.author = {
        ...author,
        review_count: stats ? stats.review_count : 0,
        avg_rating: stats ? stats.avg_rating : 0.0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    }

    return tourObj;
  });


  return {
    data: dataWithStats,
    meta
  };
};

const getSingleTour = async (slug: string) => {
  const tour = await Tour.findOne({ slug })
    .populate("author", "name email")

     if (!tour) {
    throw new AppError(httpStatus.NOT_FOUND, "Tour not found with this slug.");
  }
  return {
    data: tour,
  };
};

const getToursByGuide = async (guideId: string, query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Tour.find({ author: guideId }), query);

  const tours = await queryBuilder
    .search(tourSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([tours.build(), queryBuilder.getMeta()]);

  return { data, meta };
};
const deleteTour = async (id: string) => {
  const existingTour = await Tour.findById(id);
  if (!existingTour) {
    throw new AppError(httpStatus.NOT_FOUND, "Tour not found.");
  }

  // Delete all images (thumbnail + images) from cloudinary if present
  const toDelete: string[] = [];
  if (existingTour.thumbnail) toDelete.push(existingTour.thumbnail);
  if (Array.isArray(existingTour.images) && existingTour.images.length > 0) {
    toDelete.push(...existingTour.images);
  }

  // Delete DB record
  const deleted = await Tour.findByIdAndDelete(id);

  // Attempt cloudinary deletes (best-effort)
  if (toDelete.length > 0) {
    await Promise.all(
      toDelete.map(async (url) => await deleteImageFromCLoudinary(url)
    ));
  }

  return deleted;
};

export const TourService = {
  createTour,
  getAllTours,
  getSingleTour,
  updateTour,
  deleteTour,
  getToursByGuide
};