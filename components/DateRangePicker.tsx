// components/DateRangePicker.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, startOfMonth, endOfMonth, isValid } from 'date-fns';

const DateRangePicker = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [startDate, setStartDate] = useState(() => {
    const paramStartDate = searchParams.get('startDate');
    return paramStartDate ? new Date(paramStartDate) : startOfMonth(new Date());
  });
  const [endDate, setEndDate] = useState(() => {
    const paramEndDate = searchParams.get('endDate');
    return paramEndDate ? new Date(paramEndDate) : new Date();
  });

  useEffect(() => {
    const startDateParam = format(startDate, 'yyyy-MM-dd');
    const endDateParam = format(endDate, 'yyyy-MM-dd');
    router.push(`/dashboard?startDate=${startDateParam}&endDate=${endDateParam}`);
  }, [startDate, endDate, router]);

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = new Date(event.target.value);
    if (isValid(newStartDate) && newStartDate <= endDate) {
      setStartDate(newStartDate);
    }
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = new Date(event.target.value);
    if (isValid(newEndDate) && newEndDate >= startDate) {
      setEndDate(newEndDate);
    }
  };

  return (
    <div className="flex space-x-2">
      <input
        type="date"
        value={format(startDate, 'yyyy-MM-dd')}
        onChange={handleStartDateChange}
        className="border p-2 rounded bg-background"
      />
      <input
        type="date"
        value={format(endDate, 'yyyy-MM-dd')}
        onChange={handleEndDateChange}
        className="border p-2 rounded bg-background"
      />
    </div>
  );
};

export default DateRangePicker;
