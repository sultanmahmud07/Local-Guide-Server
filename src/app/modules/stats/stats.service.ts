import { IsActive } from "../user/user.interface";
import { User } from "../user/user.model";

const now = new Date();
const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);

const getUserStats = async () => {
    const totalUsersPromise = User.countDocuments()

    const totalActiveUsersPromise = User.countDocuments({ isActive: IsActive.ACTIVE })
    const totalInActiveUsersPromise = User.countDocuments({ isActive: IsActive.INACTIVE })
    const totalBlockedUsersPromise = User.countDocuments({ isActive: IsActive.BLOCKED })

    const newUsersInLast7DaysPromise = User.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
    })
    const newUsersInLast30DaysPromise = User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
    })

    const usersByRolePromise = User.aggregate([

        {
            $group: {
                _id: "$role",
                count: { $sum: 1 }
            }
        }
    ])


    const [totalUsers, totalActiveUsers, totalInActiveUsers, totalBlockedUsers, newUsersInLast7Days, newUsersInLast30Days, usersByRole] = await Promise.all([
        totalUsersPromise,
        totalActiveUsersPromise,
        totalInActiveUsersPromise,
        totalBlockedUsersPromise,
        newUsersInLast7DaysPromise,
        newUsersInLast30DaysPromise,
        usersByRolePromise
    ])
    return {
        totalUsers,
        totalActiveUsers,
        totalInActiveUsers,
        totalBlockedUsers,
        newUsersInLast7Days,
        newUsersInLast30Days,
        usersByRole
    }
}

const getSenderStats = async (senderId: string) => {

    return {
        data: {
           senderId
        }
    }
}

export const getReceiverStats = async (receiverId: string) => {

  return {
    data: {
     receiverId
    },
  };
};



export const StatsService = {
    getSenderStats,
    getUserStats,
    getReceiverStats
}
