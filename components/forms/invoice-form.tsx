'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from '@/utils/network';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useToast } from '../ui/use-toast';
import { AddCustomerDialog } from '../AddCustomerDialogue';
import { Customer } from '@/constants/data';
import InvoicePage from '../invoice-page';
import { ScrollArea } from '../ui/scroll-area';
import { IInvoice, IPaymentMode } from '@/types/invoice';
import CircularLoader from '../loader/circular';
import { debounce } from '@/utils/helpers';
import { AiOutlineDelete } from 'react-icons/ai';

import { IProduct } from '@/types/product';
import { useBarcodeScan } from '@/hooks/useBarcodeScan';
import { Heading } from '../ui/heading';
import { Separator } from '../ui/separator';
import Image from 'next/image';
import { useReactToPrint } from 'react-to-print';

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
  const [paymentMode, setPaymentMode] = useState<IPaymentMode>(
    IPaymentMode.CASH
  );
  // const [invoiceData, setInvoiceData] = useState<IInvoice | null>(null);

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
      const scannedProduct = products.find(
        (p) => p.skuCode.toString() === skuCode?.toString()
      );
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
    try {
      setCustomers((prev) => ({ ...prev, isLoading: true }));
      const response = await axios.get(`/api/customers?q=${query}`);
      setCustomers({ data: response.data.data, isLoading: false });
    } catch (error) {
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

  const currentDateUTC = new Date();
  const ISTOffset = 330 * 60000;
  const currentDateIST = new Date(currentDateUTC.getTime() + ISTOffset);
  const issueDate = currentDateIST.toLocaleDateString('en-GB');

  const createInvoice = async () => {
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
      totalQuantity,
      paymentMode
    };

    try {
      const res = await axios.post('/api/invoices', invoiceData);
      toast({
        variant: 'default',
        title: 'Invoice Added Success',
        description: 'Your invoice has been added to your database.'
      });
      router.push('/dashboard/invoice');
      // Reset form
      setSelectedCustomer(null);
      setSelectedProducts([]);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your request.'
      });
    }
  };

  const filteredProducts = products.filter((product) =>
    searchProduct
      ? product.name.toLowerCase().includes(searchProduct.toLowerCase())
      : true
  );

  const slidesRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => slidesRef.current
  });

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
                <form className="space-y-4">
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
                              250
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
                    </>
                  ) : null}
                  <div className="flex items-center space-x-4">
                    <label className="block text-sm font-medium text-primary">
                      Payment Mode
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="paymentMode"
                          value={IPaymentMode.CASH}
                          checked={paymentMode === IPaymentMode.CASH}
                          onChange={(e: any) =>
                            setPaymentMode(e.target.value as IPaymentMode)
                          }
                          className="form-radio"
                        />
                        <span>Cash</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="paymentMode"
                          value={IPaymentMode.UPI}
                          checked={paymentMode === IPaymentMode.UPI}
                          onChange={(e: any) =>
                            setPaymentMode(e.target.value as IPaymentMode)
                          }
                          className="form-radio"
                        />
                        <span>UPI</span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-4">
                    <Button
                      variant="default"
                      disabled={!selectedCustomer || products.length === 0}
                      onClick={async () => {
                        createInvoice();
                        handlePrint(() => {
                          router.refresh();
                          router.push('/dashboard/invoice');
                        });
                      }}
                    >
                      Save & Print
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/dashboard/invoice')}
                    >
                      Cancel
                    </Button>
                    <div
                      ref={slidesRef}
                      style={{
                        visibility: 'hidden',
                        width: '39mm', // Slightly increased width
                        fontSize: '10px',
                        fontFamily: 'monospace' // Applying the VT323 font
                      }}
                      className="invoice-container mx-auto my-6 max-w-3xl rounded bg-white p-6 shadow-sm"
                      id="invoice"
                    >
                      <main className="flex items-center justify-between text-right">
                        <div className="text-left text-black">
                          <Image
                            src="/logo2.png"
                            alt="Logo"
                            width={80}
                            height={80}
                          />
                        </div>
                        <div>
                          <h1 className="font-bold text-black">Invoice</h1>
                          <p className="text-black">vermoda.in</p>
                          <p className="mt-1 text-black">+91 9773927417</p>
                        </div>
                      </main>

                      <div className="mt-3 grid grid-cols-2 items-center">
                        <div>
                          <p className="font-bold text-black">Bill to :</p>
                          <p className="font-semibold text-black">
                            {selectedCustomer?.name}
                            <br />
                            {selectedCustomer?.phone}
                          </p>
                        </div>
                        <div className="text-right">
                          <p>
                            <span className="text-black"> {invoiceNumber}</span>
                          </p>
                          <p>
                            <span className="text-black">{issueDate}</span>
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flow-root">
                        <table className="min-w-full">
                          <colgroup>
                            <col className="w-1/2" />
                            <col className="w-1/6" />
                            <col className="w-1/6" />
                            <col className="w-1/6" />
                          </colgroup>
                          <thead className="border-b border-dashed border-gray-700 text-black">
                            <tr>
                              <th
                                scope="col"
                                className="py-1 text-left text-sm font-semibold text-black"
                              >
                                Item
                              </th>
                              <th
                                scope="col"
                                className="px-1 py-1 text-right text-sm font-semibold text-black"
                              >
                                Qty
                              </th>
                              <th
                                scope="col"
                                className="px-1 py-1 text-right text-sm font-semibold text-black"
                              >
                                Rate
                              </th>
                              <th
                                scope="col"
                                className="py-1 text-right text-sm font-semibold text-black"
                              >
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedProducts?.map((product) => (
                              <tr key={product._id}>
                                <td className="overflow-ellipsis py-1 text-sm text-black">
                                  <div className="font-medium">
                                    {product.name}
                                  </div>
                                </td>
                                <td className="px-1 py-1 text-left text-sm text-black">
                                  {product.quantity}
                                </td>
                                <td className="px-1 py-1 text-sm text-black">
                                  {product.sellingPrice}
                                </td>
                                <td className="py-1 text-right text-sm text-black">
                                  {product.quantity * product.sellingPrice}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <th
                                scope="row"
                                colSpan={3}
                                className="pt-3 text-right text-sm font-normal text-black"
                              >
                                Subtotal
                              </th>
                              <td className="mr-3 pt-3 text-right text-sm text-black">
                                ₹{totalAmount}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      <div className="mt-2 border-t border-dashed border-gray-700 text-center text-[7px] text-black">
                        Thank you for your purchase.
                      </div>
                      <style jsx>{`
                        @media print {
                          body * {
                            visibility: hidden;
                          }
                          #invoice,
                          #invoice * {
                            visibility: visible;
                          }
                          #invoice {
                            width: 48mm; /* Adjusted width for better fit */
                            margin: 0;
                            padding: 0;
                            font-size: 10px; /* Adjust font size as needed */
                            color: #000;
                          }
                          #invoice h1,
                          #invoice h2,
                          #invoice h3,
                          #invoice p,
                          #invoice table,
                          #invoice th,
                          #invoice td {
                            margin: 0;
                            padding: 0;
                            line-height: 1.2;
                          }
                          #invoice table {
                            width: 100%;
                            border-collapse: collapse;
                          }
                          #invoice th,
                          #invoice td {
                            padding: 1px;
                            font-size: 9px; /* Smaller font size for table elements */
                          }
                          #invoice th {
                            text-align: left;
                          }
                        }
                      `}</style>
                    </div>
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
