import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '../components/ui/PullToRefresh';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, ExternalLink, Search, Star, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Merchandise() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [user, setUser] = useState(null);
  const [redeeming, setRedeeming] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: settings } = useQuery({
    queryKey: ['homepage-settings'],
    queryFn: async () => {
      const list = await base44.entities.HomePageSettings.list();
      return list[0] || null;
    }
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
    initialData: []
  });

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => {
      if (!user?.email) return null;
      return base44.entities.UserProfile.filter({ user_email: user.email }).then(p => p[0]);
    },
    enabled: !!user?.email,
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
      {/* Hero Section with Video */}
      <div className="relative h-96 md:h-[500px] overflow-hidden text-white bg-black">
        <div className="absolute inset-0 w-full h-full">
          <iframe
            src="https://www.youtube.com/embed/TonPbG2M3fU?autoplay=1&mute=1&loop=1&playlist=TonPbG2M3fU&controls=0&modestbranding=1"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120%',
              height: '120%',
              pointerEvents: 'none'
            }}
          />
        </div>
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col items-center justify-center text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Merchandise</h1>
           <p className="text-xl text-purple-200 max-w-2xl mx-auto">
             Explore our collection of exclusive Philadelphia-inspired products
            </p>
            <div className="mt-6 bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl px-6 py-4 max-w-lg mx-auto text-center">
              <p className="text-white font-semibold text-sm">💡 Tip: Play hunts and scavenger games to earn points and redeem items for free!</p>
            </div>
          {user && userProfile && (
            <div className="mt-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-white font-semibold">{userProfile.total_points || 0} Points</span>
            </div>
          )}
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
                <ProductCard key={product.id} product={product} featured user={user} userProfile={userProfile} redeeming={redeeming} setRedeeming={setRedeeming} queryClient={queryClient} />
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
                    <ProductCard key={product.id} product={product} user={user} userProfile={userProfile} redeeming={redeeming} setRedeeming={setRedeeming} queryClient={queryClient} />
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

function ProductCard({ product, featured = false, user, userProfile, redeeming, setRedeeming, queryClient }) {
  const handleRedeemPoints = async () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    setRedeeming(product.id);
    try {
      const response = await base44.functions.invoke('redeemProduct', { product_id: product.id });
      if (response.data.success) {
        toast.success(response.data.message);
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      } else {
        toast.error(response.data.error || 'Redemption failed');
      }
    } catch (error) {
      toast.error('Could not redeem product. Please try again.');
      console.error(error);
    } finally {
      setRedeeming(null);
    }
  };

  const hasEnoughPoints = userProfile && (userProfile.total_points || 0) >= (product.points_cost || 0);

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
          <div className="flex justify-between items-start gap-2 mb-3">
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <div className="flex flex-col gap-1 flex-shrink-0">
              {product.points_cost && (
                <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {product.points_cost} pts
                </Badge>
              )}
              {product.price && (
                <Badge variant="outline" className="flex-shrink-0">
                  ${product.price?.toFixed(2)}
                </Badge>
              )}
            </div>
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
        
        <CardContent className="space-y-2">
          {product.points_cost ? (
            <Button
              onClick={handleRedeemPoints}
              disabled={!user || !hasEnoughPoints || redeeming === product.id}
              className="w-full bg-amber-500 hover:bg-amber-600"
            >
              {redeeming === product.id ? (
                <>Redeeming...</>
              ) : !user ? (
                <>Sign in to redeem</>
              ) : !hasEnoughPoints ? (
                <><AlertCircle className="w-4 h-4 mr-2" />Not enough points</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />Redeem Points</>
              )}
            </Button>
          ) : null}
          {product.purchase_url && (
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
                {product.in_stock ? 'Buy' : 'Out of Stock'}
              </Button>
            </a>
          )}
          {!product.points_cost && !product.purchase_url && (
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