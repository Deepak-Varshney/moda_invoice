import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface Product {
  productId: string;
  quantity: number;
  price: number;
  _id: string;
}

interface Invoice {
  customer: Customer;
  _id: string;
  invoiceNumber: string;
  products: Product[];
  totalAmount: number;
  totalQuantity: number;
  issueDate: string;
  __v: number;
}

interface RecentSalesProps {
  sales: Invoice[];
}

export function RecentSales({ sales }: RecentSalesProps) {
  return (
    <div className="space-y-8">
      {sales.map((sale, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            {/* Placeholder for AvatarImage and AvatarFallback */}
            <AvatarImage src={`/avatars/${index + 1}.png`} alt="Avatar" />
            <AvatarFallback>{sale.customer.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.customer.name}</p>
            <p className="text-sm text-muted-foreground">{sale.customer.phone}</p>
          </div>
          <div className="ml-auto font-medium">+₹ {sale.totalAmount.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}
