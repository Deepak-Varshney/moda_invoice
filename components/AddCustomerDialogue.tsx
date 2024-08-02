import * as z from 'zod';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import axios from '@/utils/network';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { isAllDigits } from '@/utils/helpers';
import { Customer } from '@/constants/data';

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
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Gender is required'
  })
});

type CustomerFormValues = z.infer<typeof formSchema>;

export const AddCustomerDialog = ({
  open,
  setOpen,
  searchString,
  onCustomerCreated
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  searchString: string;
  onCustomerCreated: (c: Customer) => void;
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      gender: undefined
    }
  });

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (/^\d*$/.test(input) && input.length <= 10) {
      form.setValue('phone', input);
    }
  };

  const onSubmit = async (data: CustomerFormValues) => {
    const formattedData = {
      ...data,
      phone: data.phone.replace(/(\d{5})(\d{5})/, '$1 $2')
    };

    try {
      setLoading(true);
      const res = await axios.post('/api/customers', formattedData);
      console.log('api/customers', res);
      onCustomerCreated(res.data.data);
      toast({
        variant: 'default',
        title: 'Customer created.',
        description: 'Your customer has been saved to your database.'
      });
      setOpen(false); // Close the dialog
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your request.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            // set initial values when opened
            const isSearchStringAllDigits = isAllDigits(searchString);
            if (isSearchStringAllDigits) {
              form.setValue('phone', searchString);
            } else {
              form.setValue('name', searchString);
            }
            setOpen(true);
          }}
        >
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <Input
                    autoFocus
                    disabled={loading}
                    placeholder="Customer name"
                    {...field}
                  />
                  <FormMessage>
                    {form.formState.errors?.name?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    type="text"
                    disabled={loading}
                    placeholder="9131079189"
                    value={field.value}
                    onChange={handlePhoneNumberChange}
                  />
                  <FormMessage>
                    {form.formState.errors?.phone?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage>
                    {form.formState.errors?.gender?.message}
                  </FormMessage>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button disabled={loading} type="submit">
                Add Customer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
