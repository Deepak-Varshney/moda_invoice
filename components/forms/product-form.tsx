'use client';
import * as z from 'zod';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Trash } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '../ui/use-toast';
import axios from '@/utils/network';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { AlertModal } from '../modal/alert-modal';
import { Heading } from '@/components/ui/heading';
import { config } from '@/config';
const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Product Name must be at least 3 characters' }),
  costPrice: z.coerce.number(),
  sellingPrice: z.coerce.number(),
  skuCode: z.coerce.number()
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData: any | null;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData }) => {
  console.log('initialData', initialData);
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const title = initialData ? 'Edit product' : 'Create product';
  const description = initialData ? 'Edit a product.' : 'Add a new product';
  const toastMessage = initialData ? 'Product updated.' : 'Product created.';
  const action = initialData ? 'Save changes' : 'Create';
  const defaultValues = initialData
    ? initialData
    : {
        name: '',
        costPrice: 0,
        sellingPrice: 0,
        skuCode: ''
      };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: ProductFormValues) => {
    if (action == 'Save changes') {
      console.log('this is a updated case');
      try {
        await axios.put(`/api/products/${defaultValues._id}`, data);
        toast({
          variant: 'default',
          title: 'Product Update Success',
          description: 'Your product has been update to your database.'
        });
        router.push(`/dashboard/product`);
        router.refresh();
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'There was a problem with your request.'
        });
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        await axios.post(`/api/products/`, data);
        toast({
          variant: 'default',
          title: 'Product Added Success',
          description: 'Your product has been added to your database.'
        });
        router.push(`/dashboard/product`);
        router.refresh();
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'There was a problem with your request.'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const onConfirm = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${config.deployedUrl}/api/products?id=${defaultValues._id}`,
        {
          method: 'DELETE'
        }
      );

      if (res.ok) {
        router.push('/dashboard/product');
        router.refresh();
        toast({
          variant: 'default',
          title: 'Product Deleted Success',
          description: 'Your product has been deleted from your database.'
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'There was a problem with your request.'
        });
      }
      console.log(defaultValues._id);
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-8"
        >
          <div className="gap-8 md:grid md:grid-cols-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Product name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="costPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost Price</FormLabel>
                  <FormControl>
                    <Input type="number" disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sellingPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selling Price</FormLabel>
                  <FormControl>
                    <Input type="number" disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="skuCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU Code</FormLabel>
                  <FormControl>
                    <Input disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
