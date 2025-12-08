"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourService = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const tour_model_1 = require("./tour.model");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const cloudinary_config_1 = require("../../config/cloudinary.config");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const tour_constant_1 = require("./tour.constant");
const review_model_1 = require("../review/review.model");
const mongoose_1 = __importDefault(require("mongoose"));
const createTour = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield tour_model_1.Tour.findOne({ slug: data.slug });
    if (exists) {
        throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "A tour with this slug already exists");
    }
    const tour = yield tour_model_1.Tour.create(data);
    return { data: tour };
});
const updateTour = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTour = yield tour_model_1.Tour.findById(id);
    if (!existingTour) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Tour not found.");
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
        const slugExists = yield tour_model_1.Tour.findOne({ slug: payload.slug, _id: { $ne: id } });
        if (slugExists) {
            throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "Another tour already uses this slug");
        }
    }
    // Update doc
    const updatedTour = yield tour_model_1.Tour.findByIdAndUpdate(id, payload, { new: true });
    // After successful update, delete images from Cloudinary if requested
    if (payload.deleteImages && payload.deleteImages.length > 0 && existingTour.images && existingTour.images.length > 0) {
        // attempt to delete each image, but don't crash the update if deletion fails — log instead
        yield Promise.all(payload.deleteImages.map((url) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield (0, cloudinary_config_1.deleteImageFromCLoudinary)(url);
            }
            catch (err) {
                // optionally log: console.error("Failed to delete image:", url, err);
            }
        })));
    }
    return { data: updatedTour };
});
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
const getAllTours = (query) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Initial Find and Pagination
    // Populate the author data first to get the guide IDs
    const queryBuilder = new QueryBuilder_1.QueryBuilder(tour_model_1.Tour.find().populate("author"), query);
    const toursQuery = yield queryBuilder
        .search(tour_constant_1.tourSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [tours, meta] = yield Promise.all([toursQuery.build(), queryBuilder.getMeta()]);
    // 2. Extract unique Author IDs from the fetched tours
    const authorIds = [
        ...new Set(tours
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map(tour => { var _a, _b; return (_b = (_a = tour.author) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString(); })
            .filter(id => id) // Filter out null/undefined/unpopulated authors
        )
    ];
    // If no tours or no authors found, return early
    if (authorIds.length === 0) {
        return { data: tours, meta };
    }
    // 3. Aggregate Review Data for the fetched Authors
    // Note: This requires the Review model to be imported.
    const reviewStats = yield review_model_1.Review.aggregate([
        // Filter reviews only for the authors currently present in the tours
        { $match: { guide: { $in: authorIds.map(id => new mongoose_1.default.Types.ObjectId(id)) } } },
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
            tourObj.author = Object.assign(Object.assign({}, author), { review_count: stats ? stats.review_count : 0, avg_rating: stats ? stats.avg_rating : 0.0 });
        }
        return tourObj;
    });
    return {
        data: dataWithStats,
        meta
    };
});
const getSingleTour = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const tour = yield tour_model_1.Tour.findOne({ slug })
        .populate("author", "name email");
    if (!tour) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Tour not found with this slug.");
    }
    return {
        data: tour,
    };
});
const getToursByGuide = (guideId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(tour_model_1.Tour.find({ author: guideId }), query);
    const tours = yield queryBuilder
        .search(tour_constant_1.tourSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([tours.build(), queryBuilder.getMeta()]);
    return { data, meta };
});
const deleteTour = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingTour = yield tour_model_1.Tour.findById(id);
    if (!existingTour) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Tour not found.");
    }
    // Delete all images (thumbnail + images) from cloudinary if present
    const toDelete = [];
    if (existingTour.thumbnail)
        toDelete.push(existingTour.thumbnail);
    if (Array.isArray(existingTour.images) && existingTour.images.length > 0) {
        toDelete.push(...existingTour.images);
    }
    // Delete DB record
    const deleted = yield tour_model_1.Tour.findByIdAndDelete(id);
    // Attempt cloudinary deletes (best-effort)
    if (toDelete.length > 0) {
        yield Promise.all(toDelete.map((url) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, cloudinary_config_1.deleteImageFromCLoudinary)(url); })));
    }
    return deleted;
});
exports.TourService = {
    createTour,
    getAllTours,
    getSingleTour,
    updateTour,
    deleteTour,
    getToursByGuide
};
