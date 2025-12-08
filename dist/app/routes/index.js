"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const auth_route_1 = require("../modules/auth/auth.route");
const user_route_1 = require("../modules/user/user.route");
const stats_route_1 = require("../modules/stats/stats.route");
const contact_route_1 = require("../modules/contact/contact.route");
const tour_route_1 = require("../modules/tour/tour.route");
const booking_route_1 = require("../modules/booking/booking.route");
const payment_route_1 = require("../modules/payment/payment.route");
const otp_route_1 = require("../modules/otp/otp.route");
const review_route_1 = require("../modules/review/review.route");
exports.router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/user",
        route: user_route_1.UserRoutes
    },
    {
        path: "/auth",
        route: auth_route_1.AuthRoutes
    },
    {
        path: "/listing",
        route: tour_route_1.TourRoutes
    },
    {
        path: "/booking",
        route: booking_route_1.BookingRoutes
    },
    {
        path: "/review",
        route: review_route_1.ReviewRoutes
    },
    {
        path: "/payment",
        route: payment_route_1.PaymentRoutes
    },
    {
        path: "/otp",
        route: otp_route_1.OtpRoutes
    },
    {
        path: "/stats",
        route: stats_route_1.StatsRoutes
    },
    {
        path: "/contact",
        route: contact_route_1.ContactRoutes
    },
];
moduleRoutes.forEach((route) => {
    exports.router.use(route.path, route.route);
});
