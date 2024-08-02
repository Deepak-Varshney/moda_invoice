'use client';
import BreadCrumb from '@/components/breadcrumb';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import axios from '@/utils/network';
import { AddInvoiceForm } from '@/components/forms/invoice-form';
import Loader from '@/components/loader';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Page() {
  const { invoiceId } = useParams(); // Get the invoiceId from the dynamic route
  const [invoice, setInvoice] = useState({ data: undefined, isLoading: true });

  const { data: invoiceData, isLoading } = invoice;

  useEffect(() => {
    if (invoiceId) {
      // Fetch invoice details by invoiceId
      axios
        .get(`/api/invoices/${invoiceId}`)
        .then((response) => {
          setInvoice({ data: response.data?.data, isLoading: false }); // Set the fetched invoice data as initialData
        })
        .catch((error) => {
          console.error('Error fetching invoice data:', error);
          setInvoice((prev) => ({ ...prev, isLoading: false })); // Set the fetched invoice data as initialData
        });
    }
  }, [invoiceId]);
  console.log(invoiceData);

  const breadcrumbItems = [
    { title: 'Invoices', link: '/dashboard/invoice' },
    {
      title: invoiceData ? 'View Invoice' : 'Create Invoice',
      link: `/dashboard/invoice/${invoiceId}`
    }
  ];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex-1 space-y-4 p-8">
      <BreadCrumb items={breadcrumbItems} />
      <AddInvoiceForm initialData={invoiceData} />
    </div>
  );
}
