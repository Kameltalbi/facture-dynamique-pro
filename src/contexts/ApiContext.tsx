
import { createContext, useContext, ReactNode } from 'react';
import { toast } from 'sonner';

// Define types for our data models
export interface Profile {
  id: string;
  email: string;
  nom: string;
  role: 'admin' | 'user';
}

export interface Client {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  tva: string;
}

export interface Category {
  id: string;
  nom: string;
}

export interface Product {
  id: string;
  designation: string;
  prix_unitaire_ht: number;
  categorie_id: string;
  categorie?: Category;
}

export interface InvoiceLine {
  id?: string;
  facture_id?: string;
  produit_id?: string;
  designation: string;
  quantite: number;
  prix_unitaire: number;
  remise: number;
  tva: number;
  total_ht: number;
}

export interface Invoice {
  id?: string;
  numero: string;
  date: string;
  client_id: string;
  client?: Client;
  devise: 'DT' | 'EUR' | 'USD';
  tva_active: boolean;
  remise_active: boolean;
  timbre_active: boolean;
  avance_active: boolean;
  avance_montant: number;
  total_ht: number;
  total_ttc: number;
  reste_a_payer: number;
  lignes: InvoiceLine[];
}

// Mock data for our application
const mockClients: Client[] = [
  {
    id: '1',
    nom: 'Société Example',
    adresse: '123 Rue Principale, Tunis, Tunisie',
    telephone: '+216 71 123 456',
    email: 'contact@example.tn',
    tva: 'TN1234567'
  },
  {
    id: '2',
    nom: 'Entreprise ABC',
    adresse: '45 Avenue Habib Bourguiba, Sfax, Tunisie',
    telephone: '+216 74 987 654',
    email: 'info@abc.tn',
    tva: 'TN7654321'
  }
];

const mockCategories: Category[] = [
  { id: '1', nom: 'Informatique' },
  { id: '2', nom: 'Bureautique' },
  { id: '3', nom: 'Services' }
];

const mockProducts: Product[] = [
  { 
    id: '1', 
    designation: 'Ordinateur Portable', 
    prix_unitaire_ht: 1500, 
    categorie_id: '1'
  },
  { 
    id: '2', 
    designation: 'Imprimante Laser', 
    prix_unitaire_ht: 400, 
    categorie_id: '2'
  },
  { 
    id: '3', 
    designation: 'Développement Web', 
    prix_unitaire_ht: 2000, 
    categorie_id: '3'
  }
];

const mockInvoices: Invoice[] = [
  {
    id: '1',
    numero: 'FACT-2023-001',
    date: '2023-12-15',
    client_id: '1',
    devise: 'DT',
    tva_active: true,
    remise_active: false,
    timbre_active: true,
    avance_active: false,
    avance_montant: 0,
    total_ht: 2000,
    total_ttc: 2380,
    reste_a_payer: 2380,
    lignes: [
      {
        id: '1',
        facture_id: '1',
        produit_id: '3',
        designation: 'Développement Web',
        quantite: 1,
        prix_unitaire: 2000,
        remise: 0,
        tva: 19,
        total_ht: 2000
      }
    ]
  }
];

// Define the API context type
interface ApiContextType {
  // Clients
  getClients: () => Promise<Client[]>;
  getClient: (id: string) => Promise<Client | null>;
  createClient: (client: Omit<Client, 'id'>) => Promise<Client>;
  updateClient: (id: string, client: Partial<Client>) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  
  // Categories
  getCategories: () => Promise<Category[]>;
  getCategory: (id: string) => Promise<Category | null>;
  createCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Products
  getProducts: () => Promise<Product[]>;
  getProduct: (id: string) => Promise<Product | null>;
  createProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Invoices
  getInvoices: () => Promise<Invoice[]>;
  getInvoice: (id: string) => Promise<Invoice | null>;
  createInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<Invoice>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<Invoice>;
  deleteInvoice: (id: string) => Promise<void>;
  
  // Dashboard stats
  getDashboardStats: () => Promise<{
    clientCount: number;
    productCount: number;
    invoiceTotal: number;
    recentInvoices: Invoice[];
  }>;
}

// Create the API context
const ApiContext = createContext<ApiContextType | undefined>(undefined);

// Mock implementation for our API functions
export const ApiProvider = ({ children }: { children: ReactNode }) => {
  // In-memory storage for our mock data
  let clients = [...mockClients];
  let categories = [...mockCategories];
  let products = [...mockProducts];
  let invoices = [...mockInvoices];

  // Client API methods
  const getClients = async (): Promise<Client[]> => {
    return [...clients];
  };

  const getClient = async (id: string): Promise<Client | null> => {
    const client = clients.find(c => c.id === id);
    return client || null;
  };

  const createClient = async (client: Omit<Client, 'id'>): Promise<Client> => {
    const newClient = {
      ...client,
      id: Math.random().toString(36).substring(2, 15)
    };
    clients.push(newClient);
    toast.success('Client ajouté avec succès');
    return newClient;
  };

  const updateClient = async (id: string, clientData: Partial<Client>): Promise<Client> => {
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Client non trouvé');
    }
    
    const updatedClient = { ...clients[index], ...clientData };
    clients[index] = updatedClient;
    toast.success('Client mis à jour avec succès');
    return updatedClient;
  };

  const deleteClient = async (id: string): Promise<void> => {
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Client non trouvé');
    }
    
    clients.splice(index, 1);
    toast.success('Client supprimé avec succès');
  };

  // Category API methods
  const getCategories = async (): Promise<Category[]> => {
    return [...categories];
  };

  const getCategory = async (id: string): Promise<Category | null> => {
    const category = categories.find(c => c.id === id);
    return category || null;
  };

  const createCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
    const newCategory = {
      ...category,
      id: Math.random().toString(36).substring(2, 15)
    };
    categories.push(newCategory);
    toast.success('Catégorie ajoutée avec succès');
    return newCategory;
  };

  const updateCategory = async (id: string, categoryData: Partial<Category>): Promise<Category> => {
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Catégorie non trouvée');
    }
    
    const updatedCategory = { ...categories[index], ...categoryData };
    categories[index] = updatedCategory;
    toast.success('Catégorie mise à jour avec succès');
    return updatedCategory;
  };

  const deleteCategory = async (id: string): Promise<void> => {
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Catégorie non trouvée');
    }
    
    // Check if category is used by any product
    const usedByProduct = products.some(p => p.categorie_id === id);
    if (usedByProduct) {
      throw new Error('Impossible de supprimer une catégorie utilisée par des produits');
    }
    
    categories.splice(index, 1);
    toast.success('Catégorie supprimée avec succès');
  };

  // Product API methods
  const getProducts = async (): Promise<Product[]> => {
    // Add category information to products
    return products.map(p => ({
      ...p,
      categorie: categories.find(c => c.id === p.categorie_id)
    }));
  };

  const getProduct = async (id: string): Promise<Product | null> => {
    const product = products.find(p => p.id === id);
    if (!product) return null;
    
    return {
      ...product,
      categorie: categories.find(c => c.id === product.categorie_id)
    };
  };

  const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    const newProduct = {
      ...product,
      id: Math.random().toString(36).substring(2, 15)
    };
    products.push(newProduct);
    toast.success('Produit ajouté avec succès');
    
    return {
      ...newProduct,
      categorie: categories.find(c => c.id === newProduct.categorie_id)
    };
  };

  const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product> => {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Produit non trouvé');
    }
    
    const updatedProduct = { ...products[index], ...productData };
    products[index] = updatedProduct;
    toast.success('Produit mis à jour avec succès');
    
    return {
      ...updatedProduct,
      categorie: categories.find(c => c.id === updatedProduct.categorie_id)
    };
  };

  const deleteProduct = async (id: string): Promise<void> => {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Produit non trouvé');
    }
    
    // Check if product is used in any invoice
    const usedInInvoice = invoices.some(inv => 
      inv.lignes.some(line => line.produit_id === id)
    );
    
    if (usedInInvoice) {
      throw new Error('Impossible de supprimer un produit utilisé dans des factures');
    }
    
    products.splice(index, 1);
    toast.success('Produit supprimé avec succès');
  };

  // Invoice API methods
  const getInvoices = async (): Promise<Invoice[]> => {
    return invoices.map(inv => ({
      ...inv,
      client: clients.find(c => c.id === inv.client_id)
    }));
  };

  const getInvoice = async (id: string): Promise<Invoice | null> => {
    const invoice = invoices.find(inv => inv.id === id);
    if (!invoice) return null;
    
    return {
      ...invoice,
      client: clients.find(c => c.id === invoice.client_id)
    };
  };

  const createInvoice = async (invoice: Omit<Invoice, 'id'>): Promise<Invoice> => {
    const newInvoice = {
      ...invoice,
      id: Math.random().toString(36).substring(2, 15)
    };
    
    // Update invoice line IDs and facture_id
    const linesWithIds = newInvoice.lignes.map(line => ({
      ...line,
      id: Math.random().toString(36).substring(2, 15),
      facture_id: newInvoice.id
    }));
    
    newInvoice.lignes = linesWithIds;
    invoices.push(newInvoice);
    toast.success('Facture créée avec succès');
    
    return {
      ...newInvoice,
      client: clients.find(c => c.id === newInvoice.client_id)
    };
  };

  const updateInvoice = async (id: string, invoiceData: Partial<Invoice>): Promise<Invoice> => {
    const index = invoices.findIndex(inv => inv.id === id);
    if (index === -1) {
      throw new Error('Facture non trouvée');
    }
    
    const updatedInvoice = { ...invoices[index], ...invoiceData };
    
    // Handle updated lines if present
    if (invoiceData.lignes) {
      updatedInvoice.lignes = invoiceData.lignes.map(line => ({
        ...line,
        id: line.id || Math.random().toString(36).substring(2, 15),
        facture_id: id
      }));
    }
    
    invoices[index] = updatedInvoice;
    toast.success('Facture mise à jour avec succès');
    
    return {
      ...updatedInvoice,
      client: clients.find(c => c.id === updatedInvoice.client_id)
    };
  };

  const deleteInvoice = async (id: string): Promise<void> => {
    const index = invoices.findIndex(inv => inv.id === id);
    if (index === -1) {
      throw new Error('Facture non trouvée');
    }
    
    invoices.splice(index, 1);
    toast.success('Facture supprimée avec succès');
  };

  // Dashboard stats
  const getDashboardStats = async () => {
    return {
      clientCount: clients.length,
      productCount: products.length,
      invoiceTotal: invoices.reduce((sum, inv) => sum + inv.total_ttc, 0),
      recentInvoices: invoices
        .slice()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map(inv => ({
          ...inv,
          client: clients.find(c => c.id === inv.client_id)
        }))
    };
  };

  return (
    <ApiContext.Provider
      value={{
        getClients,
        getClient,
        createClient,
        updateClient,
        deleteClient,
        
        getCategories,
        getCategory,
        createCategory,
        updateCategory,
        deleteCategory,
        
        getProducts,
        getProduct,
        createProduct,
        updateProduct,
        deleteProduct,
        
        getInvoices,
        getInvoice,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        
        getDashboardStats
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

// Custom hook to use the API context
export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
