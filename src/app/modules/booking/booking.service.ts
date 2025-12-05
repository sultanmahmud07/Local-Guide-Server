/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { Tour } from "../tour/tour.model";
import { User } from "../user/user.model";
import { BOOKING_STATUS, IBooking } from "./booking.interface";
import { Booking } from "./booking.model";
import { getTransactionId } from "../../utils/getTransactionId";



const createBooking = async (payload: Partial<IBooking>, userId: string) => {
    const transactionId = getTransactionId()

    const session = await Booking.startSession();
    session.startTransaction()

    try {
        const user = await User.findById(userId);

        if (!user?.phone || !user.address) {
            throw new AppError(httpStatus.BAD_REQUEST, "Please Update Your Profile to Book a Tour.")
        }

        const tour = await Tour.findById(payload.tour).select("fee title").session(session);

        if (!tour?.fee) {
            throw new AppError(httpStatus.BAD_REQUEST, "No Tour Found with fee!")
        }

        const feeNumber = Number(tour.fee || 0);
        if (!Number.isFinite(feeNumber) || feeNumber <= 0) {
            throw new AppError(httpStatus.BAD_REQUEST, "Invalid tour fee");
        }

        const groupSize = payload.groupSize ?? 1;
        const amount = feeNumber * Number(groupSize);

        const booking = await Booking.create([{
            ...payload,
            user: userId,
            totalPrice:amount,
            paymentStatus: PAYMENT_STATUS.UNPAID,
            status: BOOKING_STATUS.PENDING,
            statusLogs: [
                {
                    status: BOOKING_STATUS.PENDING,
                    updatedBy: userId,
                    timestamp: new Date(),
                },
            ]
        }], { session })

        const payment = await Payment.create([{
            booking: booking[0]._id,
            status: PAYMENT_STATUS.UNPAID,
            transactionId: transactionId,
            amount: amount
        }], { session })

        const updatedBooking = await Booking
            .findByIdAndUpdate(
                booking[0]._id,
                { payment: payment[0]._id },
                { new: true, runValidators: true, session }
            )
            .populate("user", "name email phone address")
            .populate("tour", "title fee")
            .populate("payment");

        const userAddress = (updatedBooking?.user as any).address
        const userEmail = (updatedBooking?.user as any).email
        const userPhoneNumber = (updatedBooking?.user as any).phone
        const userName = (updatedBooking?.user as any).name

        const sslPayload: ISSLCommerz = {
            address: userAddress,
            email: userEmail,
            phoneNumber: userPhoneNumber,
            name: userName,
            amount: amount,
            transactionId: transactionId
        }

        const sslPayment = await SSLService.sslPaymentInit(sslPayload)

        // eslint-disable-next-line no-console
        console.log(sslPayment);

        await session.commitTransaction(); //transaction
        session.endSession()
        return {
            paymentUrl: sslPayment.GatewayPageURL,
            booking: updatedBooking
        }
    } catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession()
        throw error
    }
};

const getUserBookings = async () => {

    return {}
};

const getBookingById = async () => {
    return {}
};

const updateBookingStatus = async (

) => {

    return {}
};

const getAllBookings = async () => {

    return {}
};

export const BookingService = {
    createBooking,
    getUserBookings,
    getBookingById,
    updateBookingStatus,
    getAllBookings,
};
