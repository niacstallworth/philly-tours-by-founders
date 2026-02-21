import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Plus, Upload, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import AdminGuard from '../components/AdminGuard';
import ProductForm from '../components/merchandise/ProductForm';

export default function AdminMerchandise() {
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [importMode, setImportMode] = useState('csv');
  const [csvFile, setCsvFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');

  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
    initialData: []
  });

  const createProductMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowDialog(false);
      setEditingProduct(null);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowDialog(false);
      setEditingProduct(null);
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const handleSave = (formData) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createProductMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    deleteProductMutation.mutate(id);
  };

  const handleCSVImport = async () => {
    if (!csvFile) return;
    
    setImporting(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: csvFile });
      
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: 'object',
          properties: {
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number' },
                  image_url: { type: 'string' },
                  category: { type: 'string' },
                  purchase_url: { type: 'string' },
                  in_stock: { type: 'boolean' },
                  featured: { type: 'boolean' }
                }
              }
            }
          }
        }
      });

      if (result.status === 'success' && result.output?.products) {
        await base44.entities.Product.bulkCreate(result.output.products);
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast.success(`Imported ${result.output.products.length} products!`);
        setCsvFile(null);
      } else {
        toast.error('Failed to extract products: ' + (result.details || 'Unknown error'));
      }
    } catch (error) {
      toast.error('Import failed: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  const handleWebsiteImport = async () => {
    if (!websiteUrl) return;
    
    setImporting(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract all product information from this e-commerce page: ${websiteUrl}. Return a JSON array of products with name, description, price (as number), image_url, category, and purchase_url fields.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number' },
                  image_url: { type: 'string' },
                  category: { type: 'string' },
                  purchase_url: { type: 'string' }
                }
              }
            }
          }
        }
      });

      if (result?.products?.length > 0) {
        await base44.entities.Product.bulkCreate(result.products.map(p => ({
          ...p,
          in_stock: true,
          featured: false
        })));
        queryClient.invalidateQueries({ queryKey: ['products'] });
        alert(`Successfully imported ${result.products.length} products!`);
        setWebsiteUrl('');
      } else {
        alert('No products found on the website');
      }
    } catch (error) {
      alert('Import failed: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <AdminGuard>
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Merchandise</h1>
            <p className="text-gray-600 mt-2">Add, edit, and import products</p>
          </div>
          
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingProduct(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <ProductForm
                product={editingProduct}
                onSave={handleSave}
                onCancel={() => setShowDialog(false)}
                isPending={createProductMutation.isPending || updateProductMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Import Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Import Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={importMode} onValueChange={setImportMode}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="csv">CSV Upload</TabsTrigger>
                <TabsTrigger value="website">From Website</TabsTrigger>
              </TabsList>

              <TabsContent value="csv" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="csvFile">Upload CSV File</Label>
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files[0])}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    CSV should include: name, description, price, image_url, category, purchase_url, in_stock, featured
                  </p>
                </div>
                <Button 
                  onClick={handleCSVImport} 
                  disabled={!csvFile || importing}
                  className="w-full"
                >
                  {importing ? 'Importing...' : 'Import from CSV'}
                </Button>
              </TabsContent>

              <TabsContent value="website" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="websiteUrl">E-commerce Website URL</Label>
                  <Input
                    id="websiteUrl"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://foundersthreads.org/collections/all"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    AI will extract products from Shopify, WooCommerce, or other e-commerce sites
                  </p>
                </div>
                <Button 
                  onClick={handleWebsiteImport} 
                  disabled={!websiteUrl || importing}
                  className="w-full"
                >
                  {importing ? 'Importing...' : 'Import from Website'}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative h-48 bg-gray-200">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  {product.featured && (
                    <Badge className="absolute top-2 right-2 bg-amber-500">Featured</Badge>
                  )}
                </div>
                
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge>${product.price?.toFixed(2)}</Badge>
                    {product.category && (
                      <Badge variant="outline">{product.category}</Badge>
                    )}
                    {!product.in_stock && (
                      <Badge className="bg-red-500">Out of Stock</Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => setEditingProduct(product)}
                        className="w-full"
                        variant="outline"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <ProductForm
                        product={product}
                        onSave={handleSave}
                        onCancel={() => setEditingProduct(null)}
                        isPending={updateProductMutation.isPending}
                      />
                    </DialogContent>
                  </Dialog>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full" variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete "{product.name}". This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(product.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && products.length === 0 && (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-4">No products yet</p>
            <p className="text-gray-400">Add products manually or import from CSV/website</p>
          </div>
        )}
      </div>
    </div>
    </AdminGuard>
  );
}