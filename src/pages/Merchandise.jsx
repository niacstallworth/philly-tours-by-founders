import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '../components/ui/PullToRefresh';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, ExternalLink, Search, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Merchandise() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
    initialData: []
  });

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const featuredProducts = filteredProducts.filter(p => p.featured);
  const regularProducts = filteredProducts.filter(p => !p.featured);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      {/* Hero Section */}
      <div className="relative h-96 md:h-[500px] overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900" />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <ShoppingBag className="w-16 h-16" />
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Merchandise</h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Explore our collection of exclusive Philadelphia-inspired products
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
              Featured Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} featured />
              ))}
            </div>
          </div>
        )}

        {/* Regular Products */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-96 bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {regularProducts.length > 0 && (
              <>
                {featuredProducts.length > 0 && (
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">All Products</h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 dark:text-slate-400 text-lg">No products found</p>
          </div>
        )}
      </div>
    </div>
    </PullToRefresh>
  );
}

function ProductCard({ product, featured = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`overflow-hidden h-full flex flex-col ${featured ? 'border-2 border-amber-500 shadow-xl' : 'shadow-lg'}`}>
        {product.image_url && (
          <div className="relative h-64 overflow-hidden bg-gray-100">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            {!product.in_stock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Badge className="bg-red-500 text-white text-lg px-4 py-2">Out of Stock</Badge>
              </div>
            )}
            {featured && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-amber-500 text-white flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" />
                  Featured
                </Badge>
              </div>
            )}
          </div>
        )}
        
        <CardHeader className="flex-1">
          <div className="flex justify-between items-start gap-2 mb-2">
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <Badge variant="outline" className="flex-shrink-0">
              ${product.price?.toFixed(2)}
            </Badge>
          </div>
          
          {product.category && (
            <Badge className="w-fit bg-purple-100 text-purple-800">
              {product.category}
            </Badge>
          )}
          
          {product.description && (
            <p className="text-sm text-gray-600 mt-3 line-clamp-3">
              {product.description}
            </p>
          )}
        </CardHeader>
        
        <CardContent>
          {product.purchase_url ? (
            <a
              href={product.purchase_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={!product.in_stock}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {product.in_stock ? 'Purchase' : 'Out of Stock'}
              </Button>
            </a>
          ) : (
            <Button 
              className="w-full"
              variant="outline"
              disabled
            >
              No Purchase Link
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}