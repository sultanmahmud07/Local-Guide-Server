import { Types } from "mongoose";

export type ParcelStatus =
  | "REQUESTED"
  | "APPROVED"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELED"
  | "BLOCKED"
  | "UNBLOCKED";

export interface IStatusLog {
  status: ParcelStatus;
  location?: string;
  note?: string;
  updatedBy: Types.ObjectId;
  timestamp: Date;
}

export interface IParcel {
  _id?: Types.ObjectId;
  trackingId: string;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  type: string;
  weight: number;
  address: string;
  fee?: number;
  deliveryDate?: Date;
  status: ParcelStatus;
  isBlocked?: boolean;
  statusLogs: IStatusLog[];
}
