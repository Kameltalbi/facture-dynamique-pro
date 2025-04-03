
import { Client, Invoice } from "@/contexts/ApiContext";
import { formatCurrency, calculateInvoiceTVA, calculateTimbre, numberToWords } from "@/utils/invoiceUtils";
import { FileText, Phone, Mail, MapPin, Building } from "lucide-react";

interface InvoicePreviewProps {
  invoice: Invoice;
  client: Client | null;
}

const InvoicePreview = ({ invoice, client }: InvoicePreviewProps) => {
  const totalTVA = calculateInvoiceTVA(invoice.lignes, invoice.tva_active);
  const timbre = calculateTimbre(invoice.timbre_active);

  // Mock company information (in a real app, this would come from the database)
  const company = {
    name: "Ma Société SARL",
    address: "123 Rue des Entreprises, Tunis, Tunisie",
    phone: "+216 71 123 456",
    email: "contact@masociete.tn",
    tva: "TN12345678",
    rib: "TN59 1234 5678 9012 3456 7890"
  };

  return (
    <div className="a4-page bg-white shadow-md">
      {/* Invoice Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 text-invoice-blue">
            <FileText />
            <h1 className="text-2xl font-bold">{company.name}</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">Facture N° {invoice.numero}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">Date: {new Date(invoice.date).toLocaleDateString("fr-FR")}</p>
        </div>
      </div>

      {/* Client and Company Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Client Info */}
        <div className="border p-4 rounded-md">
          <h2 className="font-bold mb-2 text-invoice-blue">Client</h2>
          {client ? (
            <div className="space-y-1">
              <p className="font-semibold">{client.nom}</p>
              <div className="flex items-start gap-1 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{client.adresse}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{client.telephone}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Mail className="h-4 w-4 shrink-0" />
                <span>{client.email}</span>
              </div>
              {client.tva && (
                <div className="flex items-center gap-1 text-sm">
                  <Building className="h-4 w-4 shrink-0" />
                  <span>TVA: {client.tva}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400 italic">Aucun client sélectionné</p>
          )}
        </div>

        {/* Company Info */}
        <div className="border p-4 rounded-md">
          <h2 className="font-bold mb-2 text-invoice-blue">Émetteur</h2>
          <div className="space-y-1">
            <p className="font-semibold">{company.name}</p>
            <div className="flex items-start gap-1 text-sm">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{company.address}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-4 w-4 shrink-0" />
              <span>{company.phone}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-4 w-4 shrink-0" />
              <span>{company.email}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Building className="h-4 w-4 shrink-0" />
              <span>TVA: {company.tva}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Désignation</th>
              <th className="border p-2 text-center">Qté</th>
              <th className="border p-2 text-right">Prix Unitaire</th>
              {invoice.remise_active && <th className="border p-2 text-right">Remise (%)</th>}
              {invoice.tva_active && <th className="border p-2 text-center">TVA (%)</th>}
              <th className="border p-2 text-right">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lignes.map((line, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="border p-2">{line.designation || "..."}</td>
                <td className="border p-2 text-center">{line.quantite}</td>
                <td className="border p-2 text-right">{formatCurrency(line.prix_unitaire, invoice.devise)}</td>
                {invoice.remise_active && (
                  <td className="border p-2 text-right">{line.remise}%</td>
                )}
                {invoice.tva_active && (
                  <td className="border p-2 text-center">{line.tva}%</td>
                )}
                <td className="border p-2 text-right">{formatCurrency(line.total_ht, invoice.devise)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-1/2">
          <div className="border-t border-b py-2 flex justify-between">
            <span>Total HT</span>
            <span>{formatCurrency(invoice.total_ht, invoice.devise)}</span>
          </div>
          
          {invoice.tva_active && (
            <div className="border-b py-2 flex justify-between">
              <span>TVA</span>
              <span>{formatCurrency(totalTVA, invoice.devise)}</span>
            </div>
          )}
          
          {invoice.timbre_active && (
            <div className="border-b py-2 flex justify-between">
              <span>Timbre fiscal</span>
              <span>{formatCurrency(timbre, invoice.devise)}</span>
            </div>
          )}
          
          <div className="border-b py-2 flex justify-between font-bold">
            <span>Total TTC</span>
            <span>{formatCurrency(invoice.total_ttc, invoice.devise)}</span>
          </div>
          
          {invoice.avance_active && (
            <>
              <div className="border-b py-2 flex justify-between">
                <span>Avance</span>
                <span>{formatCurrency(invoice.avance_montant, invoice.devise)}</span>
              </div>
              <div className="border-b py-2 flex justify-between font-bold">
                <span>Reste à payer</span>
                <span>{formatCurrency(invoice.reste_a_payer, invoice.devise)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Amount in words */}
      <div className="mt-6 p-3 border rounded-md bg-gray-50">
        <p>
          <span className="font-semibold">Arrêtée la présente facture à la somme de: </span>
          <span className="italic">{numberToWords(invoice.total_ttc, invoice.devise)}</span>
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-10 left-10 right-10">
        <div className="grid grid-cols-3 gap-4 text-xs text-gray-600 border-t pt-4">
          <div>
            <p className="font-semibold mb-1">Coordonnées</p>
            <p>{company.address}</p>
            <p>Tél: {company.phone}</p>
            <p>Email: {company.email}</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Mentions légales</p>
            <p>MF: {company.tva}</p>
            <p>RC: B123456789</p>
            <p>Régime: Réel</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Coordonnées bancaires</p>
            <p>Banque: BANQUE XYZ</p>
            <p>RIB: {company.rib}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
