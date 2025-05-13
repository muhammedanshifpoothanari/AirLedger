import { Schema, model, models } from "mongoose"

const BookingSchema = new Schema({
  bookingNumber: {
    type: String,
    required: [true, "Booking number is required"],
    unique: true,
  },
  customer: {
    name: {
      type: String,
      required: [true, "Customer name is required"],
    },
    email: {
      type: String,
      required: [true, "Customer email is required"],
    },
    phone: {
      type: String,
      required: [true, "Customer phone is required"],
    },
  },
  agent: {
    type: Schema.Types.ObjectId,
    ref: "Agent",
    required: [true, "Agent is required"],
  },
  user: {
  type: String, 
  required: true,
},
  destination: {
    type: String,
    required: [true, "Destination is required"],
  },
  departureDate: {
    type: Date,
    required: [true, "Departure date is required"],
  },
  returnDate: {
    type: Date,
  },
  ticketAmount: {
    type: Number,
    required: [true, "Ticket amount is required"],
  },
  commissionAmount: {
    type: Number,
    required: [true, "Commission amount is required"],
  },
  profitAmount: {
    type: Number,
    required: [true, "Profit amount is required"],
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
