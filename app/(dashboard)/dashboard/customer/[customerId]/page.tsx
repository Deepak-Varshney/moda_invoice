'use client';
import BreadCrumb from '@/components/breadcrumb';
import { CustomerForm } from '@/components/forms/customer-form';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import axios from '@/utils/network';
import Loader from '@/components/loader';

export default function Page() {
  const { customerId } = useParams(); // Get the customerId from the dynamic route
  const [customer, setCustomer] = useState({
    data: undefined,
    isLoading: true
  });

  const { data: customerData, isLoading } = customer;

  useEffect(() => {
    if (customerId) {
      // Fetch customer details by customerId
      axios
        .get(`/api/customers/${customerId}`)
        .then((response) => {
          setCustomer({ data: response.data?.data, isLoading: false }); // Set the fetched customer data as initialData
        })
        .catch((error) => {
          console.error('Error fetching customer data:', error);
          setCustomer((prev) => ({ ...prev, isLoading: false })); // Set the fetched customer data as initialData
        });
    }
  }, [customerId]);

  const breadcrumbItems = [
    { title: 'Customers', link: '/dashboard/customer' },
    {
      title: customerData ? 'Edit Customer' : 'Create Customer',
      link: `/dashboard/customer/${customerId}`
    }
  ];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex-1 space-y-4 p-8">
      <BreadCrumb items={breadcrumbItems} />
      <CustomerForm initialData={customerData} />
    </div>
  );
}
