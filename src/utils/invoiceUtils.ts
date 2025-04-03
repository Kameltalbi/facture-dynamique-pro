
// Currency formatting
export const formatCurrency = (
  amount: number,
  currency: 'DT' | 'EUR' | 'USD' = 'DT'
): string => {
  const formatter = new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: currency === 'DT' ? 'TND' : currency,
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

  // For Tunisian Dinar, we want the symbol at the end
  if (currency === 'DT') {
    const formatted = formatter.format(amount);
    // Remove TND and add DT at the end
    return formatted.replace('TND', '').trim() + ' DT';
  }

  return formatter.format(amount);
};

// Calculate the total HT for a line
export const calculateLineTotal = (
  quantity: number,
  unitPrice: number,
  discount: number = 0
): number => {
  return quantity * unitPrice * (1 - discount / 100);
};

// Calculate the total TTC for a line
export const calculateLineTTC = (
  quantity: number,
  unitPrice: number,
  discount: number = 0,
  tva: number = 0
): number => {
  const totalHT = calculateLineTotal(quantity, unitPrice, discount);
  return totalHT * (1 + tva / 100);
};

// Calculate the total HT for an invoice
export const calculateInvoiceHT = (
  lines: Array<{
    quantite: number;
    prix_unitaire: number;
    remise: number;
  }>
): number => {
  return lines.reduce(
    (sum, line) =>
      sum + calculateLineTotal(line.quantite, line.prix_unitaire, line.remise),
    0
  );
};

// Calculate the total TVA for an invoice
export const calculateInvoiceTVA = (
  lines: Array<{
    quantite: number;
    prix_unitaire: number;
    remise: number;
    tva: number;
  }>,
  tvaActive: boolean = true
): number => {
  if (!tvaActive) return 0;
  
  return lines.reduce((sum, line) => {
    const lineHT = calculateLineTotal(
      line.quantite,
      line.prix_unitaire,
      line.remise
    );
    return sum + lineHT * (line.tva / 100);
  }, 0);
};

// Calculate the timbre fiscal
export const calculateTimbre = (timbresActive: boolean = false): number => {
  return timbresActive ? 1 : 0; // Timbre fiscal is 1 DT in Tunisia
};

// Calculate the total TTC for an invoice
export const calculateInvoiceTTC = (
  lines: Array<{
    quantite: number;
    prix_unitaire: number;
    remise: number;
    tva: number;
  }>,
  tvaActive: boolean = true,
  timbresActive: boolean = false
): number => {
  const totalHT = calculateInvoiceHT(lines);
  const totalTVA = calculateInvoiceTVA(lines, tvaActive);
  const timbre = calculateTimbre(timbresActive);
  
  return totalHT + totalTVA + timbre;
};

// Calculate the remaining amount to pay
export const calculateResteAPayer = (
  totalTTC: number,
  avanceActive: boolean = false,
  avanceMontant: number = 0
): number => {
  if (!avanceActive) return totalTTC;
  return Math.max(0, totalTTC - avanceMontant);
};

// Convert a number to words in French
export const numberToWords = (
  num: number,
  currency: 'DT' | 'EUR' | 'USD' = 'DT'
): string => {
  if (num === 0) return 'zéro';

  const units = [
    '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
    'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
    'dix-sept', 'dix-huit', 'dix-neuf'
  ];
  
  const tens = [
    '', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante',
    'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'
  ];
  
  const scales = ['', 'mille', 'million', 'milliard'];
  
  // Handle special cases for French numbers
  const convertLessThanOneThousand = (n: number): string => {
    if (n === 0) return '';
    
    if (n < 20) return units[n];
    
    const digit = n % 10;
    
    if (n < 100) {
      // Special case for French: 70-79 and 90-99
      if (n >= 70 && n < 80) {
        return 'soixante-' + units[n - 60];
      }
      if (n === 71) return 'soixante-et-onze';
      if (n >= 90 && n < 100) {
        return 'quatre-vingt-' + units[n - 80];
      }
      if (n === 80) return 'quatre-vingts';
      
      // Handle the "et un" case (21, 31, 41, 51, 61)
      if (digit === 1 && n < 70 && n > 20) {
        return tens[Math.floor(n / 10)] + '-et-un';
      }
      
      return tens[Math.floor(n / 10)] + (digit > 0 ? '-' + units[digit] : '');
    }
    
    // Handle hundreds
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    
    if (hundreds === 1) {
      return 'cent' + (remainder > 0 ? ' ' + convertLessThanOneThousand(remainder) : '');
    } else {
      return units[hundreds] + ' cents' + (remainder > 0 ? ' ' + convertLessThanOneThousand(remainder) : '');
    }
  };
  
  // Main function to convert the number
  const convert = (n: number): string => {
    if (n === 0) return 'zéro';
    
    let result = '';
    let scaleIndex = 0;
    
    while (n > 0) {
      const chunk = n % 1000;
      
      if (chunk !== 0) {
        const chunkText = convertLessThanOneThousand(chunk);
        const scale = scales[scaleIndex];
        
        result = `${chunkText} ${scale} ${result}`.trim();
      }
      
      n = Math.floor(n / 1000);
      scaleIndex++;
    }
    
    return result.trim();
  };
  
  // Split the number into integer and decimal parts
  const parts = num.toFixed(3).split('.');
  const integerPart = parseInt(parts[0]);
  const decimalPart = parseInt(parts[1]);
  
  // Convert both parts
  let result = convert(integerPart);
  
  // Add currency name
  switch (currency) {
    case 'DT':
      result += ' dinars';
      if (decimalPart > 0) {
        result += ' et ' + convert(decimalPart) + ' millimes';
      }
      break;
    case 'EUR':
      result += ' euros';
      if (decimalPart > 0) {
        result += ' et ' + convert(decimalPart) + ' centimes';
      }
      break;
    case 'USD':
      result += ' dollars';
      if (decimalPart > 0) {
        result += ' et ' + convert(decimalPart) + ' cents';
      }
      break;
  }
  
  return result;
};

// Get the next invoice number in the format FACT-YYYY-XXX
export const getNextInvoiceNumber = (
  existingInvoices: { numero: string }[]
): string => {
  const currentYear = new Date().getFullYear();
  const prefix = `FACT-${currentYear}-`;
  
  // Filter invoices from the current year
  const currentYearInvoices = existingInvoices.filter(inv => 
    inv.numero.startsWith(prefix)
  );
  
  if (currentYearInvoices.length === 0) {
    return `${prefix}001`;
  }
  
  // Extract the numeric parts and find the max
  const maxNumber = currentYearInvoices.reduce((max, inv) => {
    const numPart = inv.numero.substring(prefix.length);
    const num = parseInt(numPart, 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  
  // Format the next number with leading zeros
  const nextNumber = (maxNumber + 1).toString().padStart(3, '0');
  return `${prefix}${nextNumber}`;
};
