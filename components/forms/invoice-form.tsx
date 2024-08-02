'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from '@/utils/network';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useToast } from '../ui/use-toast';
import { AddCustomerDialog } from '../AddCustomerDialogue';
import InvoicePreviewDialog from '../invoicepreviewDialogue';
import { Customer } from '@/constants/data';
import InvoicePage from '../invoice-page';
import { ScrollArea } from '../ui/scroll-area';
import { IInvoice } from '@/types/invoice';
import CircularLoader from '../loader/circular';
import { debounce } from '@/utils/helpers';
import { AiOutlineDelete } from 'react-icons/ai';

import { IProduct } from '@/types/product';
import { useBarcodeScan } from '@/hooks/useBarcodeScan';
import { Heading } from '../ui/heading';
import { Separator } from '../ui/separator';

interface SelectedProduct extends IProduct {
  quantity: number;
}

interface InvoiceFormProps {
  initialData: any | null;
}

export const AddInvoiceForm: React.FC<InvoiceFormProps> = ({ initialData }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [customers, setCustomers] = useState<{
    data: Customer[];
    isLoading: boolean;
    error?: string;
  }>({
    data: [],
    isLoading: false
  });
  const [searchProduct, setSearchProduct] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<IInvoice | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const title = initialData ? 'View Invoice' : 'Create Invoice';
  const description = initialData
    ? `
          Welcome Admin! Here are the details for
          ${initialData.customer.name} whose sub total amount is
          ${initialData.totalAmount}. See the Detailed Invoice below.You can
          Download, and Delete this Invoice from here.
        `
    : 'Add a new Invoice';

  // Function to fetch the invoice number
  const fetchInvoiceNumber = async () => {
    try {
      const response = await axios.get('/api/myData');
      setInvoiceNumber(response.data.invoiceNumber);
    } catch (error) {
      console.error('Error fetching invoice number:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem fetching the invoice number.'
      });
    }
  };
  const [shouldShowProductDropdown, setShouldShowProductDropdown] =
    useState(false);

  const totalAmount = selectedProducts.reduce(
    (acc, product) => acc + product.sellingPrice * product.quantity,
    0
  );

  const totalQuantity = selectedProducts.reduce(
    (acc, product) => acc + product.quantity,
    0
  );

  const handleBarcodeScan = useCallback(
    (skuCode: string) => {
      const scannedProduct = products.find((p) => p.skuCode === p.skuCode);
      if (!scannedProduct) {
        toast({
          variant: 'destructive',
          title: 'Product not found!',
          description: `Product with code : ${skuCode} not found.`
        });
        return;
      }
      handleProductSelect(scannedProduct);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products, toast, selectedProducts]
  );

  useBarcodeScan(handleBarcodeScan);

  // Warning : Moved product filtering to FE, as i think we won't be hacing that many products anytime soon, compromising scalability for UX here
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`/api/products`);
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem fetching products.'
      });
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchInvoiceNumber();
  }, []);

  const fetchCustomers = async (query: string) => {
    console.log(`Fetching customers for query: ${query}`);

    try {
      setCustomers((prev) => ({ ...prev, isLoading: true }));
      const response = await axios.get(`/api/customers?q=${query}`);
      setCustomers({ data: response.data.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem fetching customers.'
      });
      setCustomers((prev) => ({
        ...prev,
        isLoading: false,
        error: JSON.stringify(error)
      }));
    }
  };

  const debouncedFetchCustomers = useCallback(
    debounce((query: string) => fetchCustomers(query), 500),
    []
  );

  const handleSearchCustomerChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const query = e.target.value;
    setCustomers({ isLoading: true, data: [] });
    setSelectedCustomer(null);
    setSearchCustomer(e.target.value);
    debouncedFetchCustomers(query);
  };

  const handleSearchProductChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const query = e.target.value;
    setSearchProduct(query);
  };

  const handleProductSelect = (product: IProduct) => {
    const isAlreadyPresent = selectedProducts.find(
      (p) => p._id === product._id
    );

    if (isAlreadyPresent) {
      setSelectedProducts((prev) => {
        const updatedSelectedProducts = prev.map((p) =>
          p._id === product._id ? { ...p, quantity: p.quantity + 1 } : p
        );
        return updatedSelectedProducts;
      });
    } else {
      setSelectedProducts((prev) => {
        const updatedSelectedProducts = [...prev, { ...product, quantity: 1 }];
        return updatedSelectedProducts;
      });
    }
    setSearchProduct('');
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSearchCustomer('');
  };

  const handleDeleteProduct = (productId: string) => {
    const updatedProducts = selectedProducts.filter(
      (product) => product._id !== productId
    );
    setSelectedProducts(updatedProducts);
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    const updatedProducts = selectedProducts.map((product) =>
      product._id === productId ? { ...product, quantity } : product
    );
    setSelectedProducts(updatedProducts);
  };

  const handlePreview = async () => {
    if (!selectedCustomer) {
      toast({
        variant: 'destructive',
        title: 'Customer Not Found ',
        description: 'You have not selected any customer'
      });
      setIsPreviewOpen(true);
      return;
    }
    const generatedInvoiceData: IInvoice = {
      _id: '',
      invoiceNumber: invoiceNumber || '',
      customer: {
        id: selectedCustomer?._id,
        name: selectedCustomer?.name,
        phone: selectedCustomer?.phone,
        gender: selectedCustomer?.gender
      },
      products: selectedProducts.map((product) => ({
        productName: product.name,
        productId: product._id,
        quantity: product.quantity,
        price: product.sellingPrice,
        _id: product._id
      })),
      totalAmount,
      totalQuantity,
      issueDate: ''
    };
    setInvoiceData(generatedInvoiceData);
    setIsPreviewOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (open || isPreviewOpen) {
      return;
    }

    const invoiceData = {
      invoiceNumber,
      customer: {
        id: selectedCustomer?._id,
        name: selectedCustomer?.name,
        phone: selectedCustomer?.phone
      },
      products: selectedProducts.map((product) => ({
        productName: product.name,
        productId: product._id,
        quantity: product.quantity,
        price: product.sellingPrice
      })),
      totalAmount,
      totalQuantity
    };

    try {
      await axios.post('/api/invoices', invoiceData);
      toast({
        variant: 'default',
        title: 'Invoice Added Success',
        description: 'Your invoice has been added to your database.'
      });
      // Reset form
      setSelectedCustomer(null);
      setSelectedProducts([]);
      router.push(`/dashboard/invoice`);
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your request.'
      });
      console.error('Error creating invoice:', error);
    }
  };

  const filteredProducts = products.filter((product) =>
    searchProduct
      ? product.name.toLowerCase().includes(searchProduct.toLowerCase())
      : true
  );

  return (
    <ScrollArea className="h-[80vh]">
      <div>
        <Heading title={title} description={description} />
        <br />
        <Separator />
        {initialData ? (
          <ScrollArea className="">
            <div className="flex flex-col items-center justify-center gap-4 p-2">
              <InvoicePage invoiceData={initialData} />
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="h-[80vh] rounded-md border">
            <div className="p-2">
              <div className="mx-auto max-w-2xl p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-primary">
                      Customer
                    </label>
                    <div className="relative flex">
                      <Input
                        type="text"
                        placeholder="Search customers..."
                        value={selectedCustomer?.name ?? searchCustomer}
                        onChange={handleSearchCustomerChange}
                        className="mt-1 block w-full rounded-md border border-border p-2"
                      />
                      {searchCustomer && (
                        <ul className="absolute top-10 z-10 mt-2 w-full rounded-md border border-border bg-background shadow-sm shadow-white ">
                          {customers.isLoading ? (
                            <CircularLoader
                              size={30}
                              className="flex h-32 w-full items-center justify-center"
                            />
                          ) : (
                            <>
                              {customers.data.length > 0 ? (
                                customers.data.map((customer) => (
                                  <li
                                    key={customer._id}
                                    className="cursor-pointer px-4 py-2 hover:bg-input"
                                    onClick={() =>
                                      handleCustomerSelect(customer)
                                    }
                                  >
                                    {customer.name}
                                    {customer.phone
                                      ? ` : ${customer.phone}`
                                      : null}
                                  </li>
                                ))
                              ) : (
                                <li className="cursor-pointer px-4 py-2 text-red-600">
                                  No data found
                                </li>
                              )}
                              <div className="p-2">
                                <AddCustomerDialog
                                  open={open}
                                  setOpen={setOpen}
                                  searchString={searchCustomer}
                                  onCustomerCreated={(c) => {
                                    setSearchCustomer('');
                                    setSelectedCustomer(c);
                                  }}
                                />
                              </div>
                            </>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary">
                      Products
                    </label>
                    <div className="relative flex">
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchProduct}
                        onChange={handleSearchProductChange}
                        onFocus={() => setShouldShowProductDropdown(true)}
                        onBlur={
                          () =>
                            setTimeout(
                              () => setShouldShowProductDropdown(false),
                              500
                            ) // Ui hack
                        }
                        className="mt-1 block w-full rounded-md border border-border p-2"
                      />
                      {shouldShowProductDropdown ? (
                        <ul className="absolute top-10 z-20 mt-2 w-full rounded-md border border-border bg-background shadow-sm shadow-white">
                          {filteredProducts.map((product, index) => (
                            <li
                              key={product._id}
                              className="cursor-pointer px-4 py-2 hover:bg-input"
                              onClick={() => handleProductSelect(product)}
                            >
                              {product.name} - ₹{product.sellingPrice}
                            </li>
                          ))}
                          {filteredProducts.length === 0 && (
                            <li className="cursor-pointer px-4 py-2 text-red-600">
                              No data found
                            </li>
                          )}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                  {selectedProducts.length > 0 ? (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-primary">
                          Selected Products
                        </label>
                        <table className="min-w-full divide-y divide-gray-200 border-border">
                          <thead>
                            <tr>
                              <th className="bg-background px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary">
                                Product Name
                              </th>
                              <th className="bg-background px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary">
                                Quantity
                              </th>
                              <th className="bg-background px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary">
                                Price
                              </th>
                              <th className="bg-background px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-primary">
                                Total
                              </th>
                              <th className="bg-background px-3 py-3"></th>
                            </tr>
                          </thead>
                          <tbody className=" bg-background">
                            {selectedProducts.map((product) => (
                              <tr key={product._id}>
                                <td className="whitespace-nowrap px-3 py-2 text-sm font-medium text-primary">
                                  {product.name}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 text-sm text-primary">
                                  <Input
                                    type="number"
                                    value={product.quantity}
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        product._id,
                                        parseInt(e.target.value, 10)
                                      )
                                    }
                                    className="w-20"
                                    min="1"
                                  />
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 text-sm text-primary ">
                                  ₹ {product.sellingPrice}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 text-sm text-primary">
                                  ₹ {product.sellingPrice * product.quantity}
                                </td>
                                <td className="cursor-pointer whitespace-nowrap px-3 py-2 text-right text-sm font-medium">
                                  <AiOutlineDelete
                                    size={16}
                                    onClick={() =>
                                      handleDeleteProduct(product._id)
                                    }
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="flex items-center gap-1 text-lg font-semibold text-primary">
                          <span className="text-sm text-slate-400">
                            Total :{' '}
                          </span>{' '}
                          ₹{totalAmount}
                        </p>
                        <p className="flex items-center gap-1 align-middle text-lg font-semibold text-primary">
                          <span className="text-sm text-slate-400">
                            Count :{' '}
                          </span>
                          {totalQuantity}
                        </p>
                      </div>
                      <Button
                        onClick={handlePreview}
                        disabled={!selectedCustomer}
                      >
                        Preview Invoice
                      </Button>
                    </>
                  ) : null}

                  {isPreviewOpen && (
                    <InvoicePreviewDialog
                      isOpen={isPreviewOpen}
                      onClose={() => setIsPreviewOpen(false)}
                      invoiceData={invoiceData}
                    />
                  )}
                  <div className="mt-4 flex justify-end space-x-4">
                    <Button
                      type="submit"
                      variant="default"
                      disabled={!selectedCustomer || products.length === 0}
                    >
                      Save Invoice
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/dashboard/invoice')}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </ScrollArea>
        )}
      </div>
    </ScrollArea>
  );
};
