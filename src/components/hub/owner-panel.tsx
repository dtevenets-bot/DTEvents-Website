'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product, ProductTag, ProductType } from '@/types';

const ALL_TAGS: ProductTag[] = ['new', 'popular', 'limited', 'sale', 'featured', 'exclusive'];
const ALL_TYPES: ProductType[] = ['gamepass', 'asset', 'plugin', 'tool', 'other'];

const TOTAL_STEPS = 4;

interface ProductFormData {
  frontImage: string;
  backImage: string;
  name: string;
  price: number;
  gamepassId: number | null;
  maker: string;
  description: string;
  type: ProductType;
  tags: ProductTag[];
  boosterExclusive: boolean;
  active: boolean;
  announce: boolean;
}

const defaultFormData: ProductFormData = {
  frontImage: '',
  backImage: '',
  name: '',
  price: 0,
  gamepassId: null,
  maker: '',
  description: '',
  type: 'other',
  tags: [],
  boosterExclusive: false,
  active: true,
  announce: false,
};

export function OwnerPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ProductFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteStep, setDeleteStep] = useState<0 | 1>(0);
  const [deleteNameInput, setDeleteNameInput] = useState('');
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?showAll=true');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(defaultFormData);
    setStep(0);
    setWizardOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      frontImage: product.images?.front || '',
      backImage: product.images?.back || '',
      name: product.name,
      price: product.price,
      gamepassId: product.gamepassId,
      maker: product.maker,
      description: product.description,
      type: product.type,
      tags: product.tags || [],
      boosterExclusive: product.boosterExclusive,
      active: product.active,
      announce: false,
    });
    setStep(0);
    setWizardOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setDeleteTarget(product);
    setDeleteStep(0);
    setDeleteNameInput('');
    setDeleteConfirmInput('');
  };

  const closeDeleteDialog = () => {
    if (deleting) return;
    setDeleteTarget(null);
    setDeleteStep(0);
    setDeleteNameInput('');
    setDeleteConfirmInput('');
  };

  const handleDeleteNameNext = () => {
    if (deleteTarget && deleteNameInput.trim() === deleteTarget.name.trim()) {
      setDeleteStep(1);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleteConfirmInput.trim() !== 'CONFIRM') return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        closeDeleteDialog();
        fetchProducts();
      }
    } catch {
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: form.price,
        gamepassId: form.gamepassId,
        type: form.type,
        tags: form.tags,
        images: { front: form.frontImage, back: form.backImage },
        maker: form.maker,
        boosterExclusive: form.boosterExclusive,
        active: form.active,
        announce: form.announce,
      };

      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update product');
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create product');
      }

      setWizardOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateForm = (updates: Partial<ProductFormData>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const toggleTag = (tag: ProductTag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Cog6ToothIcon className="size-5" />
            Manage Products
          </h2>
          <p className="text-sm text-soft-fg">
            Create, edit, and manage your product catalog.
          </p>
        </div>
        <Button
          className="hover:bg-ink/90"
          onClick={openCreate}
        >
          <PlusIcon className="size-4 mr-2" />
          New Product
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Price</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-soft-fg">
                    No products yet. Create your first one!
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium truncate max-w-[200px]">
                      {product.name}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">R${product.price}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="text-xs capitalize">
                        {product.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.active ? 'default' : 'secondary'} className="text-xs">
                        {product.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 hover:bg-ink hover:text-page"
                          onClick={() => openEdit(product)}
                        >
                          <PencilSquareIcon className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 hover:bg-err hover:text-white"
                          onClick={() => openDeleteDialog(product)}
                        >
                          <TrashIcon className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={wizardOpen}
        onOpenChange={(open) => {
          setWizardOpen(open);
          if (!open) setStep(0);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Create Product'}
            </DialogTitle>
            <DialogDescription>
              Step {step + 1} of {TOTAL_STEPS}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-1 mb-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? 'bg-ink' : 'bg-soft'
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-sm">Product Images</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Front Image URL</Label>
                    <Input
                      placeholder="https://..."
                      value={form.frontImage}
                      onChange={(e) => updateForm({ frontImage: e.target.value })}
                    />
                    {form.frontImage && (
                      <div className="aspect-video rounded-md overflow-hidden border bg-soft">
                        <img
                          src={form.frontImage}
                          alt="Front preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Back Image URL</Label>
                    <Input
                      placeholder="https://..."
                      value={form.backImage}
                      onChange={(e) => updateForm({ backImage: e.target.value })}
                    />
                    {form.backImage && (
                      <div className="aspect-video rounded-md overflow-hidden border bg-soft">
                        <img
                          src={form.backImage}
                          alt="Back preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-sm">Basic Information</h3>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="Product name"
                    value={form.name}
                    onChange={(e) => updateForm({ name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (R$)</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={form.price || ''}
                      onChange={(e) => updateForm({ price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gamepass ID</Label>
                    <Input
                      type="number"
                      placeholder="Optional"
                      value={form.gamepassId || ''}
                      onChange={(e) =>
                        updateForm({
                          gamepassId: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Maker</Label>
                  <Input
                    placeholder="Creator name"
                    value={form.maker}
                    onChange={(e) => updateForm({ maker: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Product description"
                    value={form.description}
                    onChange={(e) => updateForm({ description: e.target.value })}
                    rows={3}
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-sm">Tags & Type</h3>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(val) => updateForm({ type: val as ProductType })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_TAGS.map((tag) => (
                      <label key={tag} className="flex items-center gap-1.5 cursor-pointer">
                        <Checkbox
                          checked={form.tags.includes(tag)}
                          onCheckedChange={() => toggleTag(tag)}
                        />
                        <span className="text-xs capitalize">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <Label className="text-sm">Booster Exclusive</Label>
                    <p className="text-xs text-soft-fg">
                      Only boosters can purchase this product
                    </p>
                  </div>
                  <Switch
                    checked={form.boosterExclusive}
                    onCheckedChange={(checked) => updateForm({ boosterExclusive: checked })}
                  />
                </div>
                {editingProduct && (
                  <div className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <Label className="text-sm">Active</Label>
                      <p className="text-xs text-soft-fg">
                        Product is visible and purchasable
                      </p>
                    </div>
                    <Switch
                      checked={form.active}
                      onCheckedChange={(checked) => updateForm({ active: checked })}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-sm">Review & Announce</h3>

                <div className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <MegaphoneIcon className="size-4" />
                    <div>
                      <Label className="text-sm">Announce Product</Label>
                      <p className="text-xs text-soft-fg">
                        Post to Discord and feature on the landing page
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={form.announce}
                    onCheckedChange={(checked) => updateForm({ announce: checked })}
                  />
                </div>

                <div className="border rounded-lg p-4 space-y-2 text-sm">
                  <h4 className="font-semibold mb-3">Summary</h4>
                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
                    <span className="text-soft-fg">Name:</span>
                    <span className="font-medium">{form.name || '—'}</span>
                    <span className="text-soft-fg">Price:</span>
                    <span className="font-medium">R${form.price}</span>
                    <span className="text-soft-fg">Type:</span>
                    <span className="font-medium capitalize">{form.type}</span>
                    <span className="text-soft-fg">Maker:</span>
                    <span className="font-medium">{form.maker || '—'}</span>
                    <span className="text-soft-fg">Tags:</span>
                    <span className="font-medium">
                      {form.tags.length > 0 ? form.tags.join(', ') : 'None'}
                    </span>
                    <span className="text-soft-fg">Booster Exclusive:</span>
                    <span className="font-medium">{form.boosterExclusive ? 'Yes' : 'No'}</span>
                    <span className="text-soft-fg">Active:</span>
                    <span className="font-medium">{form.active ? 'Yes' : 'No'}</span>
                    <span className="text-soft-fg">Announce:</span>
                    <span className="font-medium">{form.announce ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 0}
            >
              <ChevronLeftIcon className="size-4 mr-1" />
              Back
            </Button>
            <div className="flex gap-2">
              {step < TOTAL_STEPS - 1 ? (
                <Button onClick={nextStep}>
                  Next
                  <ChevronRightIcon className="size-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={saving || !form.name}
                  className="hover:bg-ink/90"
                >
                  {saving && <ArrowPathIcon className="size-4 animate-spin" />}
                  {saving
                    ? 'Saving...'
                    : editingProduct
                      ? 'Update Product'
                      : 'Create Product'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) closeDeleteDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-err">
              <TrashIcon className="size-5" />
              Deactivate Product
            </DialogTitle>
            <DialogDescription>
              {deleteStep === 0
                ? 'This action will deactivate the product. Please type the product name to confirm.'
                : 'Final confirmation required. Type CONFIRM to proceed.'}
            </DialogDescription>
          </DialogHeader>

          {deleteTarget && (
            <div className="space-y-4">
              <div className="border rounded-lg p-3 bg-soft/50">
                <p className="text-sm font-medium">{deleteTarget.name}</p>
                <p className="text-xs text-soft-fg">
                  R${deleteTarget.price} · {deleteTarget.type}
                </p>
              </div>

              {deleteStep === 0 && (
                <div className="space-y-2">
                  <Label htmlFor="delete-name-input">
                    Type <span className="font-semibold">"{deleteTarget.name}"</span> to continue
                  </Label>
                  <Input
                    id="delete-name-input"
                    placeholder={deleteTarget.name}
                    value={deleteNameInput}
                    onChange={(e) => setDeleteNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleDeleteNameNext();
                    }}
                    autoFocus
                  />
                  {deleteNameInput.trim().length > 0 &&
                    deleteNameInput.trim() !== deleteTarget.name.trim() && (
                      <p className="text-xs text-err">Name does not match.</p>
                    )}
                </div>
              )}

              {deleteStep === 1 && (
                <div className="space-y-2">
                  <Label htmlFor="delete-confirm-input">
                    Type <span className="font-semibold">CONFIRM</span> to permanently deactivate
                  </Label>
                  <Input
                    id="delete-confirm-input"
                    placeholder="CONFIRM"
                    value={deleteConfirmInput}
                    onChange={(e) => setDeleteConfirmInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmDelete();
                    }}
                    autoFocus
                    className="font-mono"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={closeDeleteDialog} disabled={deleting}>
              Cancel
            </Button>
            {deleteStep === 0 ? (
              <Button
                variant="destructive"
                disabled={
                  !deleteTarget ||
                  deleteNameInput.trim() !== deleteTarget?.name.trim()
                }
                onClick={handleDeleteNameNext}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="destructive"
                disabled={deleting || deleteConfirmInput.trim() !== 'CONFIRM'}
                onClick={confirmDelete}
              >
                {deleting && <ArrowPathIcon className="size-4 animate-spin mr-1" />}
                {deleting ? 'Deactivating...' : 'Deactivate Product'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
