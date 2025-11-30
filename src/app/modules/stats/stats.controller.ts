// controllers/stats.controller.ts
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatsService } from "./stats.service";
import { JwtPayload } from "jsonwebtoken";

const getSenderStats = catchAsync(async (req: Request, res: Response) => {
    const decodeToken = req.user as JwtPayload
    const stats = await StatsService.getSenderStats(decodeToken.userId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Sender stats fetched successfully",
        data: stats,
    });
});
const getReceiverStats = catchAsync(async (req: Request, res: Response) => {
    const decodeToken = req.user as JwtPayload
    const stats = await StatsService.getReceiverStats(decodeToken.userId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Receiver stats fetched successfully",
        data: stats,
    });
});



const getUserStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await StatsService.getUserStats();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User stats fetched successfully",
        data: stats,
    });
});


export const StatsController = {
    getSenderStats,
    getReceiverStats,
    getUserStats,
};
