import { ICustomer } from './customer';
import { IPaymentOption } from './paymentOption';
import { IProduct } from './product';

export type IInvoice = {
  customer: ICustomer;
  _id: string;
  invoiceNumber: string;
  products: InvoiceProduct[];
  totalAmount: number;
  totalQuantity: number;
  issueDate: string;
};

export type IPopulatedInvoice = {
  id: number;
  customer: ICustomer;
  items: {
    productId: IProduct;
    count: number;
  }[];
  created_at: number;
  payment_option: IPaymentOption;
};

export type InvoiceProduct = {
  productName: string;
  productId: string;
  quantity: number;
  price: number;
  _id: string;
};
