import { Router } from "express"
import { AuthRoutes } from "../modules/auth/auth.route"
import { UserRoutes } from "../modules/user/user.route"
import { StatsRoutes } from "../modules/stats/stats.route"
import { ContactRoutes } from "../modules/contact/contact.route"
import { TourRoutes } from "../modules/tour/tour.route"
import { BookingRoutes } from "../modules/booking/booking.route"
import { PaymentRoutes } from "../modules/payment/payment.route"
import { OtpRoutes } from "../modules/otp/otp.route"
import { ReviewRoutes } from "../modules/review/review.route"
import { MessageRoutes } from "../modules/message/message.route"

export const router = Router()

const moduleRoutes = [
    {
        path: "/user",
        route: UserRoutes
    },
    {
        path: "/auth",
        route: AuthRoutes
    },
    {
        path: "/listing",
        route: TourRoutes
    },
    {
        path: "/booking",
        route: BookingRoutes
    },
    {
        path: "/review",
        route: ReviewRoutes
    },
    {
        path: "/payment",
        route: PaymentRoutes
    },
    {
        path: "/otp",
        route: OtpRoutes
    },
    {
        path: "/stats",
        route: StatsRoutes
    },
    {
        path: "/contact",
        route: ContactRoutes
    },
    {
        path: "/message",
        route: MessageRoutes
    },
]

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})
