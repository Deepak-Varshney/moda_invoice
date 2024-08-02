import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true },
  customer: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'customer',
      required: true
    },
    name: { type: String, required: true },
    phone: { type: String }
  },
  products: [
    {
      productName: { type: String, required: true },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  totalQuantity: { type: Number, required: true },
  issueDate: { type: Date, default: Date.now }
});

const InvoiceModel =
  mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);

export default InvoiceModel;
