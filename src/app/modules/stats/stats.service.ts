/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { Booking } from "../booking/booking.model";
import { User } from "../user/user.model";
import { Review } from "../review/review.model";
import { Tour } from "../tour/tour.model";
import { Payment } from "../payment/payment.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";

export const getTouristStats = async (touristId: string) => {
  // Basic counts
  const totalBookings = await Booking.countDocuments({ user: touristId });
  const completedCount = await Booking.countDocuments({ user: touristId, status: "COMPLETED" });
  const upcomingCount = await Booking.countDocuments({
    user: touristId,
    status: "CONFIRMED",
    date: { $gte: new Date() },
  });
  const cancelledCount = await Booking.countDocuments({ user: touristId, status: "CANCELLED" });

  // Total paid amount (joined from payments)
  const paidAgg = await Booking.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(touristId) } },
    {
      $lookup: {
        from: "payments",
        localField: "payment",
        foreignField: "_id",
        as: "paymentData",
      },
    },
    { $unwind: { path: "$paymentData", preserveNullAndEmptyArrays: true } },
    { $match: { "paymentData.status": "PAID" } },
    { $group: { _id: null, totalPaid: { $sum: "$paymentData.amount" } } },
  ]);
  const totalPaid = (paidAgg[0] && paidAgg[0].totalPaid) || 0;

  // Total reviews by tourist
  const totalReviews = await Review.countDocuments({ user: touristId });

  // Recent bookings (last 5) with populated tour/guide/payment
  const recentBookings = await Booking.find({ user: touristId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("tour", "title fee destinationCity")
    .populate("guide", "name email picture")
    .populate("payment", "status amount transactionId createdAt");

  // Gather booking ids to fetch recent payments (if any)
  const bookingIds = recentBookings.map((b) => b._id);
  const recentPayments = bookingIds.length
    ? await Payment.find({ booking: { $in: bookingIds } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({
          path: "booking",
          select: "tour user guide date time totalPrice",
          populate: [
            { path: "tour", select: "title fee" },
            { path: "guide", select: "name" },
            { path: "user", select: "name email" },
          ],
        })
    : [];

  return {
    data: {
      touristId,
      totalBookings,
      completedCount,
      upcomingCount,
      cancelledCount,
      totalPaid,
      totalReviews,
      recentBookings, // array of Booking documents (populated)
      recentPayments, // array of Payment documents (populated)
    },
  };
};

export const getGuideStats = async (guideId: string) => {
  // Tours count
  const totalTours = await Tour.countDocuments({ author: guideId });

  // Bookings counts
  const totalBookings = await Booking.countDocuments({ guide: guideId });
  const completedBookings = await Booking.countDocuments({ guide: guideId, status: "COMPLETED" });
  const upcomingBookings = await Booking.countDocuments({
    guide: guideId,
    status: "CONFIRMED",
    date: { $gte: new Date() },
  });

  // Earnings from paid payments (aggregate)
  const earningsAgg = await Booking.aggregate([
    { $match: { guide: new mongoose.Types.ObjectId(guideId) } },
    {
      $lookup: {
        from: "payments",
        localField: "payment",
        foreignField: "_id",
        as: "paymentData",
      },
    },
    { $unwind: { path: "$paymentData", preserveNullAndEmptyArrays: true } },
    { $match: { "paymentData.status": "PAID" } },
    { $group: { _id: null, earnings: { $sum: "$paymentData.amount" } } },
  ]);
  const earnings = (earningsAgg[0] && earningsAgg[0].earnings) || 0;

  // Reviews stats for guide
  const reviewStats = await Review.aggregate([
    { $match: { guide: new mongoose.Types.ObjectId(guideId) } },
    {
      $group: {
        _id: null,
        reviewCount: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  const reviewCount = reviewStats.length ? reviewStats[0].reviewCount : 0;
  const avgRating = reviewStats.length ? Number(reviewStats[0].avgRating.toFixed(2)) : 0;

  // Recent bookings (last 5) for guide
  const recentBookings = await Booking.find({ guide: guideId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("tour", "title fee destinationCity")
    .populate("user", "name email phone")
    .populate("payment", "status amount transactionId createdAt");

  // Recent payments related to guide's recent bookings
  const bookingIds = recentBookings.map((b) => b._id);
  const recentPayments = bookingIds.length
    ? await Payment.find({ booking: { $in: bookingIds } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({
          path: "booking",
          select: "tour user date time totalPrice",
          populate: [
            { path: "tour", select: "title fee" },
            { path: "user", select: "name email" },
          ],
        })
    : [];

  return {
    data: {
      guideId,
      totalTours,
      totalBookings,
      completedBookings,
      upcomingBookings,
      earnings,
      reviewCount,
      avgRating,
      recentBookings,
      recentPayments,
    },
  };
};

export const getAdminStats = async () => {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const yearAgo = new Date(now);
  yearAgo.setFullYear(now.getFullYear() - 1);

  // Basic counts (run in parallel)
  const totalUsersP = User.countDocuments();
  const totalToursP = Tour.countDocuments();
  const totalBookingsP = Booking.countDocuments();
  const totalPaymentsP = Payment.countDocuments();
  const totalReviewsP = Review.countDocuments();

  const bookingsConfirmedP = Booking.countDocuments({ status: "CONFIRMED" });
  const bookingsPendingP = Booking.countDocuments({ status: "PENDING" });
  const bookingsCompletedP = Booking.countDocuments({ status: "COMPLETED" });
  const bookingsCancelledP = Booking.countDocuments({ status: "CANCELLED" });

  const newUsersLast7P = User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
  const newUsersLast30P = User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
  const newToursLast30P = Tour.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

  // Recent items (last 5)
  const recentBookingsP = Booking.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("tour", "title fee")
    .populate("user", "name email")
    .populate("guide", "name email")
    .populate("payment", "status amount transactionId")
    .lean();

  const recentPaymentsP = Payment.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate({
      path: "booking",
      select: "tour user guide date time totalPrice status",
      populate: [
        { path: "tour", select: "title fee" },
        { path: "user", select: "name email" },
        { path: "guide", select: "name email" },
      ],
    })
    .lean();

  // Total revenue (sum of PAID payments)
  const revenueAggP = Payment.aggregate([
    { $match: { status: PAYMENT_STATUS.PAID } },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
  ]);

  // Revenue time-series for last 30 days (daily)
  const revenueTimeSeriesP = Payment.aggregate([
    { $match: { status: PAYMENT_STATUS.PAID, createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        total: { $sum: "$amount" },
      },
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateFromParts: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day",
          },
        },
        total: 1,
      },
    },
    { $sort: { date: 1 } },
  ]);

  // Bookings per status (group)
  const bookingsByStatusP = Booking.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Top guides by earnings (sum of PAID payments for bookings where booking.guide == guide)
  const topGuidesByEarningsP = Booking.aggregate([
    // join payments
    {
      $lookup: {
        from: "payments",
        localField: "payment",
        foreignField: "_id",
        as: "paymentData",
      },
    },
    { $unwind: { path: "$paymentData", preserveNullAndEmptyArrays: true } },
    { $match: { "paymentData.status": PAYMENT_STATUS.PAID } },
    {
      $group: {
        _id: "$guide",
        earnings: { $sum: "$paymentData.amount" },
        bookingsCount: { $sum: 1 },
      },
    },
    { $sort: { earnings: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "guide",
      },
    },
    { $unwind: { path: "$guide", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        guideId: "$_id",
        earnings: 1,
        bookingsCount: 1,
        guide: { name: "$guide.name", email: "$guide.email", _id: "$guide._id", picture: "$guide.picture" },
      },
    },
  ]);

  // Top tours by bookings count
  const topToursByBookingsP = Booking.aggregate([
    {
      $group: {
        _id: "$tour",
        bookingsCount: { $sum: 1 },
      },
    },
    { $sort: { bookingsCount: -1 } },
    { $limit: 6 },
    {
      $lookup: {
        from: "tours",
        localField: "_id",
        foreignField: "_id",
        as: "tour",
      },
    },
    { $unwind: { path: "$tour", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        tourId: "$_id",
        bookingsCount: 1,
        tour: { title: "$tour.title", fee: "$tour.fee", destinationCity: "$tour.destinationCity", _id: "$tour._id", thumbnail: "$tour.thumbnail" },
      },
    },
  ]);

  // Run all promises in parallel
  const [
    totalUsers,
    totalTours,
    totalBookings,
    totalPayments,
    totalReviews,
    bookingsConfirmed,
    bookingsPending,
    bookingsCompleted,
    bookingsCancelled,
    newUsersLast7,
    newUsersLast30,
    newToursLast30,
    recentBookings,
    recentPayments,
    revenueAgg,
    revenueTimeSeries,
    bookingsByStatus,
    topGuidesByEarnings,
    topToursByBookings,
  ] = await Promise.all([
    totalUsersP,
    totalToursP,
    totalBookingsP,
    totalPaymentsP,
    totalReviewsP,
    bookingsConfirmedP,
    bookingsPendingP,
    bookingsCompletedP,
    bookingsCancelledP,
    newUsersLast7P,
    newUsersLast30P,
    newToursLast30P,
    recentBookingsP,
    recentPaymentsP,
    revenueAggP,
    revenueTimeSeriesP,
    bookingsByStatusP,
    topGuidesByEarningsP,
    topToursByBookingsP,
  ]);

  const totalRevenue = (revenueAgg && revenueAgg[0] && revenueAgg[0].totalRevenue) || 0;

  // Normalize bookingsByStatus to key:value map
  const bookingsByStatusMap: Record<string, number> = {};
  bookingsByStatus.forEach((b: any) => {
    bookingsByStatusMap[String(b._id || "UNKNOWN")] = b.count || 0;
  });

  // Prepare revenue time-series for charting (fill missing days)
  const days: { date: string; total: number }[] = [];
  const start = new Date(thirtyDaysAgo);
  for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
    days.push({
      date: new Date(d).toISOString().slice(0, 10),
      total: 0,
    });
  }
  // map results
  const revenueMap = new Map<string, number>();
  (revenueTimeSeries || []).forEach((r: any) => {
    const key = new Date(r.date).toISOString().slice(0, 10);
    revenueMap.set(key, r.total || 0);
  });
  const revenueSeries = days.map((day) => ({ date: day.date, total: revenueMap.get(day.date) || 0 }));

  return {
    data: {
      summary: {
        totalUsers,
        totalTours,
        totalBookings,
        totalPayments,
        totalReviews,
        totalRevenue,
      },
      counts: {
        bookings: {
          confirmed: bookingsConfirmed,
          pending: bookingsPending,
          completed: bookingsCompleted,
          cancelled: bookingsCancelled,
        },
        newUsersLast7,
        newUsersLast30,
        newToursLast30,
      },
      recent: {
        bookings: recentBookings,
        payments: recentPayments,
      },
      bookingsByStatus: bookingsByStatusMap,
      revenueSeries, // [{date: '2025-12-01', total: 123}, ...] (last 30 days)
      topGuidesByEarnings,
      topToursByBookings,
    },
  };
};



export const StatsService = {
    getTouristStats,
    getAdminStats,
    getGuideStats
}
