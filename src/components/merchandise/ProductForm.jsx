import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ProductForm({ product, onSave, onCancel, isPending }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    image_url: product?.image_url || '',
    category: product?.category || '',
    purchase_url: product?.purchase_url || '',
    in_stock: product?.in_stock ?? true,
    featured: product?.featured ?? false
  });

  const set = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  return (
    <>
      <DialogHeader>
        <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
      </DialogHeader>

      <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4 mt-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input id="name" value={formData.name} onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input id="price" type="number" step="0.01" value={formData.price}
              onChange={(e) => set('price', parseFloat(e.target.value) || 0)} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={formData.description}
            onChange={(e) => set('description', e.target.value)} rows={3} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={formData.category}
              onChange={(e) => set('category', e.target.value)} placeholder="e.g., Apparel, Accessories" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input id="image_url" value={formData.image_url}
              onChange={(e) => set('image_url', e.target.value)} placeholder="https://..." />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchase_url">Purchase Link</Label>
          <Input id="purchase_url" value={formData.purchase_url}
            onChange={(e) => set('purchase_url', e.target.value)} placeholder="https://..." />
        </div>

        <div className="flex gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox id="in_stock" checked={formData.in_stock}
              onCheckedChange={(v) => set('in_stock', v)} />
            <Label htmlFor="in_stock" className="cursor-pointer">In Stock</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="featured" checked={formData.featured}
              onCheckedChange={(v) => set('featured', v)} />
            <Label htmlFor="featured" className="cursor-pointer">Featured Product</Label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </form>
    </>
  );
}