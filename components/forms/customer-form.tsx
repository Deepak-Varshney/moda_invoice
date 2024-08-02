'use client';
import * as z from 'zod';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Trash } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertModal } from '../modal/alert-modal';
import axios from '@/utils/network';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '../ui/use-toast';
import { config } from '@/config';

const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Customer Name must be at least 3 characters' })
    .regex(/^[a-zA-Z\s]*$/, {
      message: 'Name can only contain letters and spaces'
    }),
  phone: z
    .string()
    .length(10, { message: 'Phone number must be exactly 10 digits' })
    .regex(/^\d+$/, { message: 'Phone number must contain only digits' }),
  gender: z.enum(['Female', 'Male', 'Other'], {
    required_error: 'Gender is required'
  })
});

type CustomerFormValues = z.infer<typeof formSchema>;

interface CustomerFormProps {
  initialData: any | null;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ initialData }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const title = initialData ? 'Edit customer' : 'Create customer';
  const description = initialData ? 'Edit a customer.' : 'Add a new customer';
  const toastMessage = initialData ? 'Customer updated.' : 'Customer created.';
  const action = initialData ? 'Save changes' : 'Create';

  const defaultValues = initialData
    ? initialData
    : {
        name: '',
        phone: '',
        gender: ''
      };

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (/^\d*$/.test(input) && input.length <= 10) {
      form.setValue('phone', input);
    }
  };

  const onSubmit = async (data: CustomerFormValues) => {
    // const formattedData = {
    //   ...data,
    //   phone: formatPhoneNumber(data.phone)
    // };

    if (action == 'Save changes') {
      console.log('this is a updated case');
      try {
        await axios.put(`/api/customers/${defaultValues._id}`, data);
        toast({
          variant: 'default',
          title: 'Customer Update Success',
          description: 'Your Customer has been update to your database.'
        });
        console.log('customer updated success');
        router.push(`/dashboard/customer`);
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
        await axios.post(`/api/customers/`, data);
        toast({
          variant: 'default',
          title: 'Customer Added Success',
          description: 'Your customer has been added to your database.'
        });
        router.push(`/dashboard/customer`);
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
        `${config.deployedUrl}/api/customers?id=${defaultValues._id}`,
        {
          method: 'DELETE'
        }
      );

      if (res.ok) {
        router.push('/dashboard/customer');
        router.refresh();
        toast({
          variant: 'default',
          title: 'Customer Deleted Success',
          description: 'Your customer has been deleted from your database.'
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
      console.error('Error deleting customer:', error);
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
                      placeholder="Customer name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      disabled={loading}
                      placeholder="9876543210"
                      value={field.value}
                      onChange={handlePhoneNumberChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
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
