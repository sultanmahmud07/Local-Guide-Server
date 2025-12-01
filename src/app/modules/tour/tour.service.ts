import { Tour } from "./tour.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { Types } from "mongoose";
import slugify from "slugify";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { ITour } from "./tour.interface";
import { tourSearchableFields } from "./tour.constant";
/**
 * Helper: generate a unique slug based on title
 */
async function generateUniqueSlugForModel(model: any, baseTitle: string, slugField = "slug") {
  const baseSlug = slugify(baseTitle || "", { lower: true, strict: true });
  if (!baseSlug) {
    // fallback to timestamp
    return `${Date.now()}`;
  }

  let slug = baseSlug;
  let counter = 1;

  // Loop until an unused slug is found
  while (await model.exists({ [slugField]: slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
}
/** --------------------------------------------------
 * CREATE TOUR (Slug must be unique)
 * -------------------------------------------------- */
const createTour = async (payload: any) => {
  // 1️⃣ Check slug already exists
  const exists = await Tour.findOne({ slug: payload.slug });
  if (exists) {
    throw new AppError(
      httpStatus.CONFLICT,
      "A tour with this slug already exists"
    );
  }

  const tour = await Tour.create(payload);
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
const getAllTours = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Tour.find(), query);

  const tours = await queryBuilder
    .search(tourSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([tours.build(), queryBuilder.getMeta()]);

  return {
    data,
    meta
  };
};

const getSingleTour = async (slug: string) => {
  const tour = await Tour.findOne({ slug });
  return {
    data: tour,
  };
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
      toDelete.map(async (url) => {
        try {
          await deleteImageFromCLoudinary(url);
        } catch (err) {
          // optionally log
        }
      })
    );
  }

  return deleted;
};

export const TourService = {
  createTour,
  getAllTours,
  getSingleTour,
  updateTour,
  deleteTour,
};