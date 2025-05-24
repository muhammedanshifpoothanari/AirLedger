import { Schema, model, models } from "mongoose"

const CreditSchema = new Schema({
  totalAmount: {
    type: Number,
    required: [true, "Total credit amount is required"],
    min: [0, "Total credit amount cannot be negative"],
  },
  usedAmount: {
    type: Number,
    default: 0,
    min: [0, "Used credit amount cannot be negative"],
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
  },
  history: [
    {
      amount: Number,
      type: {
        type: String,
        enum: ["increase", "decrease", "booking"],
      },
      bookingId: {
        type: Schema.Types.ObjectId,
        ref: "Booking",
      },
      date: {
        type: Date,
        default: Date.now,
      },
      notes: String,
    },
  ],
})

CreditSchema.virtual("availableAmount").get(function () {
  return this.totalAmount - this.usedAmount
})

CreditSchema.set("toJSON", { virtuals: true })
CreditSchema.set("toObject", { virtuals: true })

// ✅ Correct model name match:
export default models.DueAmount || model("DueAmount", CreditSchema)
