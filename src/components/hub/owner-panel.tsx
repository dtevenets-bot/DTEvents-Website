"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { type Product, type ProductTag, type ProductType } from "@/types"
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Settings,
  Check,
  X,
  Image as ImageIcon,
  Megaphone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const mockProducts: Product[] = [
  {
    id: "mock1",
    name: "Pioneer DJM V10 Mixer",
    description: "Professional DJ mixer with premium sound quality.",
    price: 130,
    gamepassId: "",
    active: true,
    createdAt: Date.now(),
    createdBy: "owner",
    tags: ["new"],
    type: "other",
    images: { front: "", back: "" },
    maker: "Daniel Tiger",
    boosterExclusive: false,
  },
]

const tagOptions: { id: ProductTag; label: string }[] = [
  { id: "budget", label: "Budget" },
  { id: "free", label: "Free" },
  { id: "flux_kit_ready", label: "Flux Kit Ready" },
  { id: "new", label: "New" },
]

const typeOptions: { value: ProductType; label: string }[] = [
  { value: "profile", label: "Profile" },
  { value: "venue", label: "Venue" },
  { value: "wash", label: "Wash" },
  { value: "other", label: "Other" },
]

interface ProductFormData {
  name: string
  description: string
  price: number
  gamepassId: string
  tags: ProductTag[]
  type: ProductType
  images: { front: string; back: string }
  maker: string
  boosterExclusive: boolean
  active: boolean
  announce: boolean
}

const emptyForm: ProductFormData = {
  name: "",
  description: "",
  price: 0,
  gamepassId: "",
  tags: [],
  type: "other",
  images: { front: "", back: "" },
  maker: "",
  boosterExclusive: false,
  active: true,
  announce: true,
}

// Multi-step wizard steps
const STEPS = [
  { id: 0, label: "Images", icon: ImageIcon },
  { id: 1, label: "Details", icon: Settings },
  { id: 2, label: "Options", icon: Check },
  { id: 3, label: "Announce", icon: Megaphone },
]

export function OwnerPanel() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState<ProductFormData>(emptyForm)
  const [currentStep, setCurrentStep] = React.useState(0)
  const [deleteTarget, setDeleteTarget] = React.useState<Product | null>(null)

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products-all"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/products?all=true")
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      } catch {
        return mockProducts
      }
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (data: ProductFormData & { id?: string }) => {
      const url = data.id ? `/api/products/${data.id}` : "/api/products"
      const method = data.id ? "PUT" : "POST"
      const { id, ...body } = data
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? `Failed to ${data.id ? "update" : "create"} product`)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["products-all"] })
      queryClient.invalidateQueries({ queryKey: ["products-list"] })
      queryClient.invalidateQueries({ queryKey: ["site-config"] })
      queryClient.invalidateQueries({ queryKey: ["landing-products"] })
      toast({
        title: editingId ? "Product updated" : "Product created",
        description: editingId
          ? "The product has been updated successfully."
          : "The product has been created" + (formData.announce ? " and announced!" : "."),
      })
      closeForm()
    },
    onError: (err: any) => {
      toast({
        title: `Failed to ${editingId ? "update" : "create"} product`,
        description: err.message,
        variant: "destructive",
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Failed to delete product")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["products-all"] })
      queryClient.invalidateQueries({ queryKey: ["products-list"] })
      queryClient.invalidateQueries({ queryKey: ["landing-products"] })
      toast({ title: "Product deleted", description: "The product has been deleted." })
      setDeleteTarget(null)
    },
    onError: (err: any) => {
      toast({
        title: "Failed to delete product",
        description: err.message,
        variant: "destructive",
      })
    },
  })

  const openCreateForm = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setCurrentStep(0)
    setFormOpen(true)
  }

  const openEditForm = (product: Product) => {
    setEditingId(product.id)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      gamepassId: product.gamepassId,
      tags: product.tags as ProductTag[],
      type: product.type as ProductType,
      images: product.images,
      maker: product.maker,
      boosterExclusive: product.boosterExclusive,
      active: product.active,
      announce: false, // Don't re-announce on edit
    })
    setCurrentStep(0)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
    setFormData(emptyForm)
    setCurrentStep(0)
  }

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1))
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      saveMutation.mutate({ ...formData, id: editingId })
    } else {
      saveMutation.mutate(formData)
    }
  }

  const handleTagToggle = (tagId: ProductTag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((t) => t !== tagId)
        : [...prev.tags, tagId],
    }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.images.front.length > 0 // At least front image
      case 1: return formData.name.trim().length > 0 && formData.description.trim().length > 0 && formData.gamepassId.trim().length > 0
      default: return true
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manage Products</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create, edit, and delete products
          </p>
        </div>
        <Button onClick={openCreateForm} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Product
        </Button>
      </div>

      {/* Product Table */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : !products || products.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <Settings className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No products found. Create your first product!</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <ScrollArea className="max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Price</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Tags</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="group">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {product.id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      {product.price === 0 ? "Free" : `${product.price}R$`}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">
                        {product.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.active ? "default" : "outline"}
                        className="gap-1 text-xs"
                      >
                        {product.active ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {product.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-foreground hover:text-background transition-all" onClick={() => openEditForm(product)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all" onClick={() => setDeleteTarget(product)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}

      {/* Create/Edit Product Wizard Dialog */}
      <Dialog open={formOpen} onOpenChange={(isOpen) => !isOpen && closeForm()}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 overflow-hidden">
          {/* Step indicator */}
          <div className="px-6 pt-6">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Product" : "Create Product"}
              </DialogTitle>
              <DialogDescription>
                {editingId ? "Update the product details." : "Follow the steps to create a new product."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-2 mt-4">
              {STEPS.map((step, i) => (
                <React.Fragment key={step.id}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    i === currentStep
                      ? "bg-foreground text-background"
                      : i < currentStep
                      ? "bg-muted text-muted-foreground"
                      : "text-muted-foreground"
                  }`}>
                    <step.icon className="h-3 w-3" />
                    {step.label}
                  </div>
                  {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <ScrollArea className="max-h-[60vh]">
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {/* Step 0: Images */}
                  {currentStep === 0 && (
                    <motion.div key="step-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="front-img">Front Image URL *</Label>
                        <Input
                          id="front-img"
                          value={formData.images.front}
                          onChange={(e) => setFormData({ ...formData, images: { ...formData.images, front: e.target.value } })}
                          placeholder="https://cdn.discordapp.com/..."
                        />
                        {formData.images.front && (
                          <div className="relative aspect-video max-w-sm rounded-lg border border-border overflow-hidden bg-muted">
                            <img src={formData.images.front} alt="Front preview" className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2 px-2 py-1 bg-foreground/80 text-background rounded text-[10px] font-medium">Front</div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="back-img">Back Image URL</Label>
                        <Input
                          id="back-img"
                          value={formData.images.back}
                          onChange={(e) => setFormData({ ...formData, images: { ...formData.images, back: e.target.value } })}
                          placeholder="https://cdn.discordapp.com/..."
                        />
                        {formData.images.back && (
                          <div className="relative aspect-video max-w-sm rounded-lg border border-border overflow-hidden bg-muted">
                            <img src={formData.images.back} alt="Back preview" className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2 px-2 py-1 bg-foreground/80 text-background rounded text-[10px] font-medium">Back</div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 1: Details */}
                  {currentStep === 1 && (
                    <motion.div key="step-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="prod-name">Product Name *</Label>
                        <Input id="prod-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Pioneer DJM V10 Mixer" required />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="prod-price">Price (R$) *</Label>
                          <Input id="prod-price" type="number" min={0} value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} placeholder="0" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="prod-gamepass">Gamepass ID *</Label>
                          <Input id="prod-gamepass" value={formData.gamepassId} onChange={(e) => setFormData({ ...formData, gamepassId: e.target.value })} placeholder="Roblox gamepass ID" required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prod-maker">Maker</Label>
                        <Input id="prod-maker" value={formData.maker} onChange={(e) => setFormData({ ...formData, maker: e.target.value })} placeholder="e.g. Daniel Tiger" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prod-desc">Description *</Label>
                        <Textarea id="prod-desc" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the product..." rows={3} required />
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Options (tags, type, booster) */}
                  {currentStep === 2 && (
                    <motion.div key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val as ProductType })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {typeOptions.map((t) => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="space-y-2 pt-1">
                          {tagOptions.map((tag) => (
                            <label key={tag.id} className="flex items-center gap-3 cursor-pointer">
                              <Checkbox checked={formData.tags.includes(tag.id)} onCheckedChange={() => handleTagToggle(tag.id)} />
                              <span className="text-sm">{tag.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <Label htmlFor="prod-booster">Booster Exclusive</Label>
                        <Switch id="prod-booster" checked={formData.boosterExclusive} onCheckedChange={(checked) => setFormData({ ...formData, boosterExclusive: !!checked })} />
                      </div>

                      {editingId && (
                        <div className="flex items-center justify-between">
                          <Label htmlFor="prod-active">Active</Label>
                          <Switch id="prod-active" checked={formData.active} onCheckedChange={(checked) => setFormData({ ...formData, active: !!checked })} />
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3: Announce */}
                  {currentStep === 3 && (
                    <motion.div key="step-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                      <div className="rounded-lg border border-border p-5 space-y-4">
                        <div className="flex items-start gap-3">
                          <Megaphone className="h-6 w-6 mt-0.5 shrink-0" />
                          <div>
                            <h3 className="font-semibold text-lg">Announce This Product?</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {editingId
                                ? "Announcing is only available when creating new products."
                                : "This will:"}
                            </p>
                          </div>
                        </div>

                        {!editingId && (
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-foreground" /> Add &quot;NEW&quot; tag to the product</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-foreground" /> Update the website hero slider</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-foreground" /> Send announcement to Discord</li>
                          </ul>
                        )}

                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <Label htmlFor="prod-announce" className="cursor-pointer">
                            {editingId ? "Announcements are for new products only" : "Announce product"}
                          </Label>
                          <Switch id="prod-announce" checked={formData.announce} onCheckedChange={(checked) => setFormData({ ...formData, announce: !!checked })} disabled={!!editingId} />
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="rounded-lg border border-border p-5 space-y-3">
                        <h3 className="font-semibold">Summary</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Name</div>
                          <div className="font-medium truncate">{formData.name || "—"}</div>
                          <div className="text-muted-foreground">Price</div>
                          <div className="font-medium">{formData.price === 0 ? "Free" : `${formData.price}R$`}</div>
                          <div className="text-muted-foreground">Type</div>
                          <div className="font-medium capitalize">{formData.type}</div>
                          <div className="text-muted-foreground">Tags</div>
                          <div className="font-medium">{formData.tags.length > 0 ? formData.tags.join(", ") : "None"}</div>
                          <div className="text-muted-foreground">Booster Only</div>
                          <div className="font-medium">{formData.boosterExclusive ? "Yes" : "No"}</div>
                          <div className="text-muted-foreground">Announce</div>
                          <div className="font-medium">{formData.announce ? "Yes" : "No"}</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={currentStep === 0 ? closeForm : prevStep} className="gap-1">
                    {currentStep === 0 ? "Cancel" : <><ChevronLeft className="h-4 w-4" /> Back</>}
                  </Button>

                  {currentStep < STEPS.length - 1 ? (
                    <Button type="button" onClick={nextStep} disabled={!canProceed()} className="gap-1">
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit" className="gap-2" disabled={saveMutation.isPending}>
                      {saveMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : editingId ? (
                        <Pencil className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {editingId ? "Update Product" : "Create Product"}
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(isOpen) => !isOpen && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
