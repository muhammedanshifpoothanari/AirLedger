import { Schema, model, models } from "mongoose"

const BookingSchema = new Schema({
  bookingNumber: {
    type: String,
    unique: true,
  },
  customer: {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
  },
  agent: {
    type: Schema.Types.ObjectId,
    ref: "Agent",
  },
  user: {
    type: String,
        ref: "User",
  },
  destination: {
    type: String,
  },
  departurePlace: {
    type: String,
  },
  departureDate: {
    type: Date,
  },
  returnDate: {
    type: Date,
  },
  ticketAmount: {
    type: Number,
  },
  commissionAmount: {
    type: Number,
  },
  profitAmount: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["Confirmed", "Pending", "Cancelled"],
    default: "Pending",
  },
  paymentStatus: {
    type: String,
    enum: ["Paid", "Partial", "Unpaid"],
    default: "Unpaid",
  },
  notes: {
    type: String,
  },
  payments: [
    {
      amount: Number,
      paymentDate: Date,
      paymentMethod: String,
      referenceNumber: String,
      notes: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

export default models.Booking || model("Booking", BookingSchema)
