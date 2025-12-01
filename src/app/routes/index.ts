import { Router } from "express"
import { AuthRoutes } from "../modules/auth/auth.route"
import { UserRoutes } from "../modules/user/user.route"
import { StatsRoutes } from "../modules/stats/stats.route"
import { ContactRoutes } from "../modules/contact/contact.route"
import { TourRoutes } from "../modules/tour/tour.route"

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
        path: "/stats",
        route: StatsRoutes
    },
    {
        path: "/contact",
        route: ContactRoutes
    },
]

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})
