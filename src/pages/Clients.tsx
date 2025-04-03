
import { useState, useEffect } from "react";
import { useApi, Client } from "../contexts/ApiContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

const Clients = () => {
  const { getClients, createClient, updateClient, deleteClient } = useApi();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form state
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Client, "id">>({
    nom: "",
    adresse: "",
    telephone: "",
    email: "",
    tva: "",
  });

  // Load clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getClients();
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [getClients]);

  // Filter clients based on search term
  const filteredClients = clients.filter(
    (client) =>
      client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle client creation
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newClient = await createClient(formData);
      setClients((prev) => [...prev, newClient]);
      setIsCreating(false);
      setFormData({
        nom: "",
        adresse: "",
        telephone: "",
        email: "",
        tva: "",
      });
    } catch (error) {
      console.error("Error creating client:", error);
    }
  };

  // Handle client update
  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;

    try {
      const updatedClient = await updateClient(isEditing, formData);
      setClients((prev) =>
        prev.map((client) => (client.id === isEditing ? updatedClient : client))
      );
      setIsEditing(null);
      setFormData({
        nom: "",
        adresse: "",
        telephone: "",
        email: "",
        tva: "",
      });
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  // Start editing a client
  const handleEditClick = (client: Client) => {
    setIsEditing(client.id);
    setFormData({
      nom: client.nom,
      adresse: client.adresse,
      telephone: client.telephone,
      email: client.email,
      tva: client.tva,
    });
    setIsCreating(false);
  };

  // Handle client deletion
  const handleDeleteClient = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      try {
        await deleteClient(id);
        setClients((prev) => prev.filter((client) => client.id !== id));
      } catch (error) {
        console.error("Error deleting client:", error);
      }
    }
  };

  // Cancel form
  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(null);
    setFormData({
      nom: "",
      adresse: "",
      telephone: "",
      email: "",
      tva: "",
    });
  };

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
        <h1 className="text-3xl font-bold">Gestion des clients</h1>
        <Button
          onClick={() => {
            setIsCreating(true);
            setIsEditing(null);
          }}
          disabled={isCreating || isEditing !== null}
        >
          <Plus className="mr-2 h-4 w-4" /> Nouveau client
        </Button>
      </div>

      {/* Search */}
      <div className="flex w-full max-w-sm items-center space-x-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || isEditing !== null) && (
        <Card>
          <CardHeader>
            <CardTitle>{isEditing !== null ? "Modifier" : "Nouveau"} client</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={isEditing !== null ? handleUpdateClient : handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tva">Numéro TVA</Label>
                  <Input
                    id="tva"
                    name="tva"
                    value={formData.tva}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="adresse">Adresse</Label>
                  <Input
                    id="adresse"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Annuler
                </Button>
                <Button type="submit">
                  {isEditing !== null ? "Mettre à jour" : "Ajouter"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des clients</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClients.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead className="hidden md:table-cell">TVA</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.nom}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.telephone}</TableCell>
                      <TableCell className="hidden md:table-cell">{client.tva || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(client)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClient(client.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Aucun client ne correspond à votre recherche"
                  : "Aucun client enregistré"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Clients;
