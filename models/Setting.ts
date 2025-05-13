import { Schema, model, models } from "mongoose"

const SettingSchema = new Schema({
  user: {
    type: Schema.Types.Mixed, // Changed from ObjectId to Mixed to support string IDs for demo user
    required: [true, "User is required"],
  },
  companyName: {
    type: String,
    default: "AirBooker",
  },
  defaultCurrency: {
    type: String,
    default: "USD",
  },
  defaultCommissionRate: {
    type: Number,
    default: 10,
  },
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  darkMode: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

export default models.Setting || model("Setting", SettingSchema)
