import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/myModal';
import html2pdf from 'html2pdf.js';
import { useToast } from './ui/use-toast';
import axios from '@/utils/network';
import Link from 'next/link';
import { IInvoice } from '@/types/invoice';

interface InvoicePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: IInvoice | null;
}

export const InvoicePreviewDialog: React.FC<InvoicePreviewDialogProps> = ({
  isOpen,
  onClose,
  invoiceData
}) => {
  const slidesRef = useRef(null);
  const { toast } = useToast();

  const handleGeneratePdf = () => {
    const opt = {
      marging: 1,
      filename: 'invoice.pdf',
      image: { type: 'jpeg', quality: 0.99 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(slidesRef.current).set(opt).save();
  };

  const handleSubmit = async () => {
    if (!invoiceData) return;
    try {
      const response = await axios.post('/api/invoices', invoiceData);
      toast({
        variant: 'default',
        title: 'Invoice Added Success',
        description: 'Your invoice has been added to your database.'
      });
      console.log('Invoice Posted');
      return true;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your request.'
      });
      console.error('Error creating invoice:', error);
      return false;
    }
  };

  const confirm = async () => {
    const success = await handleSubmit();
    if (success) {
      onClose(); // Close the dialog if the submission was successful
    }
    handleGeneratePdf();
  };
  // Get the current date
  const currentDate = new Date().toLocaleDateString();

  if (!invoiceData) return null; // Render nothing if invoiceData is null

  return (
    <div>
      <Modal
        title="Invoice Preview"
        isOpen={isOpen}
        onClose={onClose}
        description="Here you can view or print your Invoice"
      >
        <div
          ref={slidesRef}
          className="mx-auto my-6 max-w-3xl rounded bg-white p-6 shadow-sm"
          id="invoice"
        >
          <h1 className="my-8 text-center text-4xl font-bold text-black">
            Invoice
          </h1>

          <main className="text-right">
            <h2 className="text-2xl font-bold text-black">Moda Invoice</h2>
            <p className="text-sm text-black">vermoda.in</p>
            <p className="mt-1 text-sm text-black">+91 9773927417</p>
          </main>

          <div className="mt-10 grid grid-cols-2 items-center">
            <div>
              <p className="font-bold text-black">Bill to :</p>
              <p className="font-semibold text-black">
                {invoiceData.customer.name}
                <br />
                {invoiceData.customer.phone}
              </p>
            </div>
            <div className="text-right">
              <p>
                <span className="font-bold text-black">
                  Invoice Number: {invoiceData.invoiceNumber}
                </span>
              </p>
              <p>
                Invoice date:{' '}
                <span className="text-black">{currentDate.slice(0, 10)}</span>
              </p>
            </div>
          </div>
          <div className="-mx-4 mt-8 flow-root sm:mx-0">
            <table className="min-w-full">
              <colgroup>
                <col className="w-full sm:w-1/2" />
                <col className="sm:w-1/6" />
                <col className="sm:w-1/6" />
                <col className="sm:w-1/6" />
              </colgroup>
              <thead className="border-b border-gray-300 text-black">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-black sm:pl-0"
                  >
                    Items
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-3.5 text-right text-sm font-semibold text-black sm:table-cell"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="hidden px-3 py-3.5 text-right text-sm font-semibold text-black sm:table-cell"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-black sm:pr-0"
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.products.map((product) => (
                  <tr className="border-b border-gray-200" key={product._id}>
                    <td className="max-w-0 py-5 pl-4 pr-3 text-sm sm:pl-0">
                      <div className="font-medium text-black">
                        {product.productName}
                      </div>
                    </td>
                    <td className="hidden px-3 py-5 text-right text-sm text-black sm:table-cell">
                      {product.quantity}
                    </td>
                    <td className="hidden px-3 py-5 text-right text-sm text-black sm:table-cell">
                      ₹ {product.price}
                    </td>
                    <td className="py-5 pl-3 pr-4 text-right text-sm text-black sm:pr-0">
                      ₹ {product.quantity * product.price}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th
                    scope="row"
                    colSpan={3}
                    className="hidden pl-4 pr-3 pt-6 text-right text-sm font-normal text-black sm:table-cell sm:pl-0"
                  >
                    Subtotal
                  </th>
                  <th
                    scope="row"
                    className="pl-6 pr-3 pt-6 text-left text-sm font-bold text-black sm:hidden"
                  >
                    Subtotal
                  </th>
                  <td className="pl-3 pr-6 pt-6 text-right text-sm text-black sm:pr-0">
                    ₹ {invoiceData.totalAmount}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="mt-16 border-t-2 pt-4 text-center text-xs text-black">
            Please pay the invoice before the due date. You can pay the invoice
            by logging in to your account from the web.
            <br />
            Thank you for your business.
          </div>
        </div>
        <div className="flex w-full items-center justify-end space-x-2 pt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Link href={'/dashboard/invoice'}>
            <Button variant="default" onClick={confirm}>
              Save & Download
            </Button>
          </Link>
        </div>
      </Modal>
    </div>
  );
};

export default InvoicePreviewDialog;
