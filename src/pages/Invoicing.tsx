
import { useState, useEffect, useRef } from "react";
import { useApi, Client, Product, Invoice, InvoiceLine } from "../contexts/ApiContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trash2, Plus, Download, Settings } from "lucide-react";
import { 
  formatCurrency, 
  calculateLineTotal, 
  calculateInvoiceHT, 
  calculateInvoiceTVA, 
  calculateTimbre,
  calculateInvoiceTTC,
  calculateResteAPayer,
  numberToWords,
  getNextInvoiceNumber
} from "@/utils/invoiceUtils";
import InvoicePreview from "@/components/InvoicePreview";
import InvoiceSettings from "@/components/InvoiceSettings";

// Initial empty invoice line
const emptyInvoiceLine: InvoiceLine = {
  designation: "",
  quantite: 1,
  prix_unitaire: 0,
  remise: 0,
  tva: 19,
  total_ht: 0
};

// PDF conversion will happen in the InvoicePreview component

const Invoicing = () => {
  const { getClients, getProducts, getInvoices, createInvoice } = useApi();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [existingInvoices, setExistingInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Invoice state
  const [invoice, setInvoice] = useState<Omit<Invoice, "id">>({
    numero: "",
    date: new Date().toISOString().split('T')[0],
    client_id: "",
    devise: "DT",
    tva_active: true,
    remise_active: true,
    timbre_active: true,
    avance_active: false,
    avance_montant: 0,
    total_ht: 0,
    total_ttc: 0,
    reste_a_payer: 0,
    lignes: [{ ...emptyInvoiceLine }]
  });
  
  // Client search
  const [clientSearch, setClientSearch] = useState("");
  const [clientSearchResults, setClientSearchResults] = useState<Client[]>([]);
  
  // Selected client
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Track which invoice line is being edited
  const [activeLineIdx, setActiveLineIdx] = useState<number | null>(null);
  
  // Product search for the active line
  const [productSearch, setProductSearch] = useState("");
  const [productSearchResults, setProductSearchResults] = useState<Product[]>([]);
  
  // Reference to settings popover
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, productsData, invoicesData] = await Promise.all([
          getClients(),
          getProducts(),
          getInvoices()
        ]);
        setClients(clientsData);
        setProducts(productsData);
        setExistingInvoices(invoicesData);
        
        // Set next invoice number
        const nextNumber = getNextInvoiceNumber(invoicesData);
        setInvoice(prev => ({ ...prev, numero: nextNumber }));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getClients, getProducts, getInvoices]);

  // Client search effect
  useEffect(() => {
    if (clientSearch.trim().length < 2) {
      setClientSearchResults([]);
      return;
    }
    
    const results = clients.filter(client => 
      client.nom.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearch.toLowerCase())
    );
    
    setClientSearchResults(results);
  }, [clientSearch, clients]);

  // Product search effect (for active line)
  useEffect(() => {
    if (productSearch.trim().length < 2 || activeLineIdx === null) {
      setProductSearchResults([]);
      return;
    }
    
    const results = products.filter(product => 
      product.designation.toLowerCase().includes(productSearch.toLowerCase())
    );
    
    setProductSearchResults(results);
  }, [productSearch, products, activeLineIdx]);

  // Recalculate totals when invoice lines or settings change
  useEffect(() => {
    const total_ht = calculateInvoiceHT(invoice.lignes);
    const total_tva = calculateInvoiceTVA(invoice.lignes, invoice.tva_active);
    const timbre = calculateTimbre(invoice.timbre_active);
    const total_ttc = total_ht + total_tva + timbre;
    const reste_a_payer = calculateResteAPayer(total_ttc, invoice.avance_active, invoice.avance_montant);
    
    setInvoice(prev => ({
      ...prev,
      total_ht,
      total_ttc,
      reste_a_payer
    }));
  }, [
    invoice.lignes, 
    invoice.tva_active, 
    invoice.timbre_active, 
    invoice.avance_active, 
    invoice.avance_montant
  ]);

  // Select client handler
  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setInvoice(prev => ({ ...prev, client_id: client.id }));
    setClientSearch("");
    setClientSearchResults([]);
  };

  // Clear selected client
  const handleClearClient = () => {
    setSelectedClient(null);
    setInvoice(prev => ({ ...prev, client_id: "" }));
  };

  // Handle invoice line changes
  const handleLineChange = (index: number, field: keyof InvoiceLine, value: any) => {
    const newLines = [...invoice.lignes];
    newLines[index] = { ...newLines[index], [field]: value };
    
    // Re-calculate line total
    const quantity = newLines[index].quantite;
    const unitPrice = newLines[index].prix_unitaire;
    const discount = newLines[index].remise;
    
    newLines[index].total_ht = calculateLineTotal(quantity, unitPrice, discount);
    
    setInvoice(prev => ({ ...prev, lignes: newLines }));
  };

  // Add new line
  const handleAddLine = () => {
    setInvoice(prev => ({
      ...prev,
      lignes: [...prev.lignes, { ...emptyInvoiceLine }]
    }));
  };

  // Remove line
  const handleRemoveLine = (index: number) => {
    if (invoice.lignes.length <= 1) return;
    
    const newLines = [...invoice.lignes];
    newLines.splice(index, 1);
    
    setInvoice(prev => ({ ...prev, lignes: newLines }));
  };

  // Select product for active line
  const handleSelectProduct = (product: Product) => {
    if (activeLineIdx === null) return;
    
    const newLines = [...invoice.lignes];
    newLines[activeLineIdx] = {
      ...newLines[activeLineIdx],
      produit_id: product.id,
      designation: product.designation,
      prix_unitaire: product.prix_unitaire_ht,
      total_ht: calculateLineTotal(
        newLines[activeLineIdx].quantite,
        product.prix_unitaire_ht,
        newLines[activeLineIdx].remise
      )
    };
    
    setInvoice(prev => ({ ...prev, lignes: newLines }));
    setProductSearch("");
    setProductSearchResults([]);
    setActiveLineIdx(null);
  };

  // Handle settings changes
  const handleSettingsChange = (settings: {
    tva_active: boolean;
    remise_active: boolean;
    timbre_active: boolean;
    avance_active: boolean;
    devise: "DT" | "EUR" | "USD";
  }) => {
    setInvoice(prev => ({
      ...prev,
      ...settings,
      // Reset avance_montant if avance is disabled
      avance_montant: settings.avance_active ? prev.avance_montant : 0
    }));
  };

  // Save invoice
  const handleSaveInvoice = async () => {
    try {
      if (!invoice.client_id) {
        alert("Veuillez sélectionner un client.");
        return;
      }

      if (invoice.lignes.some(line => !line.designation || line.quantite <= 0 || line.prix_unitaire <= 0)) {
        alert("Veuillez remplir correctement toutes les lignes de la facture.");
        return;
      }

      await createInvoice(invoice);
      
      // Reset form
      setSelectedClient(null);
      const nextNumber = getNextInvoiceNumber([...existingInvoices, { numero: invoice.numero }]);
      
      setInvoice({
        numero: nextNumber,
        date: new Date().toISOString().split('T')[0],
        client_id: "",
        devise: "DT",
        tva_active: true,
        remise_active: true,
        timbre_active: true,
        avance_active: false,
        avance_montant: 0,
        total_ht: 0,
        total_ttc: 0,
        reste_a_payer: 0,
        lignes: [{ ...emptyInvoiceLine }]
      });
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Erreur lors de l'enregistrement de la facture");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left side - Invoice Form */}
      <div className="lg:w-7/12 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Facturation</h1>
          <div className="flex space-x-2">
            <Button
              onClick={handleSaveInvoice}
              variant="default"
            >
              Enregistrer
            </Button>
            <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  ref={settingsButtonRef}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Options
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <InvoiceSettings 
                  settings={{
                    tva_active: invoice.tva_active,
                    remise_active: invoice.remise_active,
                    timbre_active: invoice.timbre_active,
                    avance_active: invoice.avance_active,
                    devise: invoice.devise
                  }}
                  onChange={handleSettingsChange}
                  onClose={() => setIsSettingsOpen(false)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations de la facture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facture-numero">Numéro</Label>
                <Input
                  id="facture-numero"
                  value={invoice.numero}
                  onChange={(e) => setInvoice(prev => ({ ...prev, numero: e.target.value }))}
                  placeholder="FACT-2023-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facture-date">Date</Label>
                <Input
                  id="facture-date"
                  type="date"
                  value={invoice.date}
                  onChange={(e) => setInvoice(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedClient ? (
              <div className="border rounded-md p-4 space-y-2">
                <div className="flex justify-between">
                  <h3 className="font-bold">{selectedClient.nom}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearClient}
                  >
                    Changer
                  </Button>
                </div>
                <p className="text-sm">{selectedClient.adresse}</p>
                <p className="text-sm">Tél: {selectedClient.telephone}</p>
                <p className="text-sm">Email: {selectedClient.email}</p>
                {selectedClient.tva && (
                  <p className="text-sm">TVA: {selectedClient.tva}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-search">Rechercher un client</Label>
                  <Input
                    id="client-search"
                    placeholder="Nom ou email du client..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                  />
                </div>
                {clientSearchResults.length > 0 && (
                  <div className="border rounded-md divide-y">
                    {clientSearchResults.map((client) => (
                      <div
                        key={client.id}
                        className="p-2 hover:bg-muted cursor-pointer"
                        onClick={() => handleSelectClient(client)}
                      >
                        <p className="font-medium">{client.nom}</p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lignes de facturation</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddLine}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une ligne
            </Button>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Désignation</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Prix Unitaire</TableHead>
                    {invoice.remise_active && <TableHead>Remise (%)</TableHead>}
                    {invoice.tva_active && <TableHead>TVA (%)</TableHead>}
                    <TableHead>Total HT</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.lignes.map((line, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="space-y-2">
                          <Input
                            placeholder="Désignation"
                            value={line.designation}
                            onChange={(e) => handleLineChange(index, "designation", e.target.value)}
                            onFocus={() => {
                              setActiveLineIdx(index);
                              setProductSearch("");
                            }}
                          />
                          {activeLineIdx === index && productSearch.length >= 2 && productSearchResults.length > 0 && (
                            <div className="border rounded-md absolute z-10 bg-white shadow-md max-h-60 overflow-y-auto w-60">
                              {productSearchResults.map((product) => (
                                <div
                                  key={product.id}
                                  className="p-2 hover:bg-muted cursor-pointer"
                                  onClick={() => handleSelectProduct(product)}
                                >
                                  <p className="font-medium">{product.designation}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatCurrency(product.prix_unitaire_ht, invoice.devise)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={line.quantite}
                          onChange={(e) => handleLineChange(index, "quantite", parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.001"
                          min="0"
                          value={line.prix_unitaire}
                          onChange={(e) => handleLineChange(index, "prix_unitaire", parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      {invoice.remise_active && (
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={line.remise}
                            onChange={(e) => handleLineChange(index, "remise", parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                      )}
                      {invoice.tva_active && (
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={line.tva}
                            onChange={(e) => handleLineChange(index, "tva", parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">
                        {formatCurrency(line.total_ht, invoice.devise)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveLine(index)}
                          disabled={invoice.lignes.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between">
                <span>Total HT</span>
                <span className="font-medium">{formatCurrency(invoice.total_ht, invoice.devise)}</span>
              </div>
              
              {invoice.tva_active && (
                <div className="flex justify-between">
                  <span>TVA</span>
                  <span>
                    {formatCurrency(
                      calculateInvoiceTVA(invoice.lignes, true),
                      invoice.devise
                    )}
                  </span>
                </div>
              )}
              
              {invoice.timbre_active && (
                <div className="flex justify-between">
                  <span>Timbre fiscal</span>
                  <span>{formatCurrency(1, invoice.devise)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-bold">
                <span>Total TTC</span>
                <span>{formatCurrency(invoice.total_ttc, invoice.devise)}</span>
              </div>
              
              {invoice.avance_active && (
                <>
                  <div className="flex justify-between">
                    <span>Avance</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.001"
                        min="0"
                        max={invoice.total_ttc}
                        value={invoice.avance_montant}
                        onChange={(e) => setInvoice(prev => ({ 
                          ...prev, 
                          avance_montant: parseFloat(e.target.value) || 0 
                        }))}
                        className="w-32"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between font-bold">
                    <span>Reste à payer</span>
                    <span>{formatCurrency(invoice.reste_a_payer, invoice.devise)}</span>
                  </div>
                </>
              )}
              
              <div className="text-sm italic text-muted-foreground">
                <span>Soit: {numberToWords(invoice.total_ttc, invoice.devise)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right side - Preview */}
      <div className="lg:w-5/12">
        <div className="sticky top-0 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Aperçu</h2>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Télécharger PDF
            </Button>
          </div>
          
          <InvoicePreview 
            invoice={invoice} 
            client={selectedClient}
          />
        </div>
      </div>
    </div>
  );
};

export default Invoicing;
