
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useApi } from "../contexts/ApiContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/invoiceUtils";
import { Users, Package, FileText } from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardStats {
  clientCount: number;
  productCount: number;
  invoiceTotal: number;
  recentInvoices: Array<any>;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { getDashboardStats } = useApi();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [getDashboardStats]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-gray-500">
          Bienvenue, <span className="font-medium">{user?.nom}</span>
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Clients Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.clientCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              <Link to="/clients" className="text-invoice-blue hover:underline">
                Gérer les clients
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Products Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.productCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              <Link to="/produits" className="text-invoice-blue hover:underline">
                Gérer les produits
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Invoices Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturé (Total)</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.invoiceTotal || 0, 'DT')}
            </div>
            <p className="text-xs text-muted-foreground">
              <Link to="/facturation" className="text-invoice-blue hover:underline">
                Créer une nouvelle facture
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Factures récentes</CardTitle>
          <CardDescription>
            Les dernières factures créées dans le système
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentInvoices && stats.recentInvoices.length > 0 ? (
            <div className="space-y-4">
              {stats.recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{invoice.numero}</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.client?.nom || "Client inconnu"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(invoice.date).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(invoice.total_ttc, invoice.devise)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">
              Aucune facture récente
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
