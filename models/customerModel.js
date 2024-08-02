import mongoose, { Schema, models } from 'mongoose';

const CustomerSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required']
    },
    phone: {
      type: String
      // required: [true, "Phone number is required"]
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other']
      // required: [true, "Gender is required"]
    }
  },
  { timestamps: true }
);

const CustomerModel =
  models.customer || mongoose.model('customer', CustomerSchema);

export default CustomerModel;
