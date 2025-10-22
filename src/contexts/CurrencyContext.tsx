import { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Define currency types
export type Currency = "USD" | "INR";

// Define more realistic exchange rates (1 USD = 74.50 INR as of recent)
const DEFAULT_EXCHANGE_RATES = {
  USD_TO_INR: 74.50,
  INR_TO_USD: 1 / 74.50
};

// Exchange rates object
let EXCHANGE_RATES = { ...DEFAULT_EXCHANGE_RATES };

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convertAmount: (amount: number, fromCurrency: Currency, toCurrency: Currency) => number;
  formatAmount: (amount: number) => string;
  exchangeRates: typeof EXCHANGE_RATES;
  lastUpdated: Date | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch real-time exchange rates from API
  useEffect(() => {
    fetchExchangeRates();
    
    // Refresh exchange rates every 30 minutes
    const interval = setInterval(() => {
      fetchExchangeRates();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, []);

  const fetchExchangeRates = async () => {
    try {
      // Using exchangerate-api.com (free tier allows 1500 requests/month)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      
      if (data.rates && data.rates.INR) {
        EXCHANGE_RATES.USD_TO_INR = data.rates.INR;
        EXCHANGE_RATES.INR_TO_USD = 1 / data.rates.INR;
        setLastUpdated(new Date());
        console.log(`Exchange rates updated: 1 USD = ${data.rates.INR} INR`);
      }
    } catch (error) {
      console.error("Failed to fetch exchange rates, using defaults:", error);
      // Fallback to default rates if API fails
      EXCHANGE_RATES = { ...DEFAULT_EXCHANGE_RATES };
    }
  };

  const convertAmount = (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
    // Handle edge cases
    if (isNaN(amount) || amount === null || amount === undefined) {
      console.warn("Invalid amount provided for currency conversion:", amount);
      return 0;
    }
    
    // If converting to the same currency, return the amount as is
    if (fromCurrency === toCurrency) return Number(amount.toFixed(2));
    
    // Perform currency conversion
    if (fromCurrency === "USD" && toCurrency === "INR") {
      const result = amount * EXCHANGE_RATES.USD_TO_INR;
      return Number(result.toFixed(2));
    }
    
    if (fromCurrency === "INR" && toCurrency === "USD") {
      const result = amount * EXCHANGE_RATES.INR_TO_USD;
      return Number(result.toFixed(2));
    }
    
    console.warn(`Unsupported currency conversion: ${fromCurrency} to ${toCurrency}`);
    return Number(amount.toFixed(2));
  };

  const formatAmount = (amount: number): string => {
    // Handle edge cases
    if (isNaN(amount) || amount === null || amount === undefined) {
      amount = 0;
    }
    
    if (currency === "USD") {
      return `$${Number(amount).toFixed(2)}`;
    } else {
      // Format INR with commas and ₹ symbol
      return `₹${Number(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      convertAmount,
      formatAmount,
      exchangeRates: EXCHANGE_RATES,
      lastUpdated
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};