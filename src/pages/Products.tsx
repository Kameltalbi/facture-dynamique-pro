
import { useState, useEffect } from "react";
import { useApi, Product, Category } from "../contexts/ApiContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/invoiceUtils";

const Products = () => {
  const { 
    getProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
  } = useApi();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Product form state
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState<string | null>(null);
  const [productFormData, setProductFormData] = useState<Omit<Product, "id" | "categorie">>({
    designation: "",
    prix_unitaire_ht: 0,
    categorie_id: "",
  });
  
  // Category form state
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState<string | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<Omit<Category, "id">>({
    nom: "",
  });

  // Load products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getProducts, getCategories]);

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categorie?.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) => category.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle product form input changes
  const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProductFormData((prev) => ({ 
      ...prev, 
      [name]: name === "prix_unitaire_ht" ? parseFloat(value) || 0 : value 
    }));
  };

  // Handle category form input changes
  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCategoryFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle product creation
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newProduct = await createProduct(productFormData);
      setProducts((prev) => [...prev, newProduct]);
      setIsCreatingProduct(false);
      setProductFormData({
        designation: "",
        prix_unitaire_ht: 0,
        categorie_id: "",
      });
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  // Handle product update
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingProduct) return;

    try {
      const updatedProduct = await updateProduct(isEditingProduct, productFormData);
      setProducts((prev) =>
        prev.map((product) => (product.id === isEditingProduct ? updatedProduct : product))
      );
      setIsEditingProduct(null);
      setProductFormData({
        designation: "",
        prix_unitaire_ht: 0,
        categorie_id: "",
      });
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  // Start editing a product
  const handleEditProductClick = (product: Product) => {
    setIsEditingProduct(product.id);
    setProductFormData({
      designation: product.designation,
      prix_unitaire_ht: product.prix_unitaire_ht,
      categorie_id: product.categorie_id,
    });
    setIsCreatingProduct(false);
  };

  // Handle product deletion
  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        await deleteProduct(id);
        setProducts((prev) => prev.filter((product) => product.id !== id));
      } catch (error: any) {
        console.error("Error deleting product:", error);
        alert(error.message || "Erreur lors de la suppression du produit");
      }
    }
  };

  // Cancel product form
  const handleCancelProduct = () => {
    setIsCreatingProduct(false);
    setIsEditingProduct(null);
    setProductFormData({
      designation: "",
      prix_unitaire_ht: 0,
      categorie_id: "",
    });
  };

  // Handle category creation
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCategory = await createCategory(categoryFormData);
      setCategories((prev) => [...prev, newCategory]);
      setIsCreatingCategory(false);
      setCategoryFormData({
        nom: "",
      });
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  // Handle category update
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingCategory) return;

    try {
      const updatedCategory = await updateCategory(isEditingCategory, categoryFormData);
      setCategories((prev) =>
        prev.map((category) => (category.id === isEditingCategory ? updatedCategory : category))
      );
      setIsEditingCategory(null);
      setCategoryFormData({
        nom: "",
      });
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  // Start editing a category
  const handleEditCategoryClick = (category: Category) => {
    setIsEditingCategory(category.id);
    setCategoryFormData({
      nom: category.nom,
    });
    setIsCreatingCategory(false);
  };

  // Handle category deletion
  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      try {
        await deleteCategory(id);
        setCategories((prev) => prev.filter((category) => category.id !== id));
      } catch (error: any) {
        console.error("Error deleting category:", error);
        alert(error.message || "Erreur lors de la suppression de la catégorie");
      }
    }
  };

  // Cancel category form
  const handleCancelCategory = () => {
    setIsCreatingCategory(false);
    setIsEditingCategory(null);
    setCategoryFormData({
      nom: "",
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
        <h1 className="text-3xl font-bold">Gestion des produits</h1>
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setIsCreatingProduct(true);
                setIsEditingProduct(null);
              }}
              disabled={isCreatingProduct || isEditingProduct !== null}
            >
              <Plus className="mr-2 h-4 w-4" /> Nouveau produit
            </Button>
          </div>

          {/* Product Form */}
          {(isCreatingProduct || isEditingProduct !== null) && (
            <Card>
              <CardHeader>
                <CardTitle>{isEditingProduct !== null ? "Modifier" : "Nouveau"} produit</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={isEditingProduct !== null ? handleUpdateProduct : handleCreateProduct} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="designation">Désignation</Label>
                      <Input
                        id="designation"
                        name="designation"
                        value={productFormData.designation}
                        onChange={handleProductInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prix_unitaire_ht">Prix unitaire HT</Label>
                      <Input
                        id="prix_unitaire_ht"
                        name="prix_unitaire_ht"
                        type="number"
                        step="0.001"
                        value={productFormData.prix_unitaire_ht}
                        onChange={handleProductInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categorie_id">Catégorie</Label>
                      <Select 
                        value={productFormData.categorie_id} 
                        onValueChange={(value) => setProductFormData(prev => ({ ...prev, categorie_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={handleCancelProduct}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      {isEditingProduct !== null ? "Mettre à jour" : "Ajouter"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des produits</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredProducts.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Désignation</TableHead>
                        <TableHead>Prix unitaire HT</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.designation}</TableCell>
                          <TableCell>{formatCurrency(product.prix_unitaire_ht, 'DT')}</TableCell>
                          <TableCell>{product.categorie?.nom || "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditProductClick(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteProduct(product.id)}
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
                      ? "Aucun produit ne correspond à votre recherche"
                      : "Aucun produit enregistré"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setIsCreatingCategory(true);
                setIsEditingCategory(null);
              }}
              disabled={isCreatingCategory || isEditingCategory !== null}
            >
              <Plus className="mr-2 h-4 w-4" /> Nouvelle catégorie
            </Button>
          </div>

          {/* Category Form */}
          {(isCreatingCategory || isEditingCategory !== null) && (
            <Card>
              <CardHeader>
                <CardTitle>{isEditingCategory !== null ? "Modifier" : "Nouvelle"} catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={isEditingCategory !== null ? handleUpdateCategory : handleCreateCategory} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom</Label>
                    <Input
                      id="nom"
                      name="nom"
                      value={categoryFormData.nom}
                      onChange={handleCategoryInputChange}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={handleCancelCategory}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      {isEditingCategory !== null ? "Mettre à jour" : "Ajouter"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Categories Table */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des catégories</CardTitle>
              <CardDescription>
                Organisez vos produits par catégories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredCategories.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCategories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.nom}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditCategoryClick(category)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteCategory(category.id)}
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
                      ? "Aucune catégorie ne correspond à votre recherche"
                      : "Aucune catégorie enregistrée"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Products;
