export const isAllDigits = (searchString: string) => /^\d+$/.test(searchString);

export const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

// Helper function to format the phone number

export const formatPhoneNumber = (number: string) => {
  return number.replace(/(\d{5})(\d{5})/, '$1 $2');
};