import { Schema, model } from "mongoose";
import { IParcel } from "./parcel.interface";

const statusLogSchema = new Schema({
  status: { type: String, required: true },
  location: { type: String },
  note: { type: String },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const parcelSchema = new Schema<IParcel>({
  trackingId: { type: String, required: true, unique: true },
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  weight: { type: Number, required: true },
  address: { type: String, required: true },
  fee: { type: Number },
  deliveryDate: { type: Date },
  status: {
    type: String,
    enum: ["REQUESTED", "APPROVED", "DISPATCHED", "IN_TRANSIT", "DELIVERED", "CANCELED", "BLOCKED", "UNBLOCKED"],
    default: "REQUESTED"
  },
  isBlocked: { type: Boolean, default: false },
  statusLogs: [statusLogSchema]
}, {
  timestamps: true,
  versionKey: false
});

export const Parcel = model<IParcel>("Parcel", parcelSchema);
