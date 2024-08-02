'use client';
import BreadCrumb from '@/components/breadcrumb';
import { ProductForm } from '@/components/forms/product-form';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import axios from '@/utils/network';
import Loader from '@/components/loader';

export default function Page() {
  const { productId } = useParams(); // Get the productId from the dynamic route
  const [product, setProduct] = useState({ data: undefined, isLoading: true });

  const { data: productData, isLoading } = product;

  useEffect(() => {
    if (productId) {
      // Fetch product details by productId
      axios
        .get(`/api/products/${productId}`)
        .then((response) => {
          setProduct({ data: response.data?.data, isLoading: false }); // Set the fetched product data as initialData
        })
        .catch((error) => {
          console.error('Error fetching product data:', error);
          setProduct((prev) => ({ ...prev, isLoading: false })); // Set the fetched product data as initialData
        });
    }
  }, [productId]);

  const breadcrumbItems = [
    { title: 'Products', link: '/dashboard/product' },
    {
      title: productData ? 'Edit Product' : 'Create Product',
      link: `/dashboard/product/${productId}`
    }
  ];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex-1 space-y-4 p-8">
      <BreadCrumb items={breadcrumbItems} />
      <ProductForm initialData={productData} />
    </div>
  );
}
