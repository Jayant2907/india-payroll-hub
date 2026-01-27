import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Wallet, Library, Package } from 'lucide-react';
import { BentoCard, BentoCardHeader, BentoCardTitle, BentoCardContent } from '@/components/ui/bento-card';
import { PageHeader, PageContainer, EmptyState } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getMasterComponents, setMasterComponents, getSalaryStructures, setSalaryStructures } from '@/lib/storage';
import type { SalaryComponent, SalaryStructure, ComponentType, CalculationType, SalaryStructureComponent } from '@/types/payroll';
import { useToast } from '@/hooks/use-toast';

export default function SalaryStructures() {
  const [masterComponents, setMasterComponentsState] = useState<SalaryComponent[]>(getMasterComponents);
  const [structures, setStructuresState] = useState<SalaryStructure[]>(getSalaryStructures);
  const [isComponentDialogOpen, setIsComponentDialogOpen] = useState(false);
  const [isStructureDialogOpen, setIsStructureDialogOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<SalaryComponent | null>(null);
  const [editingStructure, setEditingStructure] = useState<SalaryStructure | null>(null);
  const { toast } = useToast();

  // Component form state
  const [componentForm, setComponentForm] = useState<Partial<SalaryComponent>>({
    name: '',
    code: '',
    type: 'earning',
    calculationType: 'fixed',
    value: 0,
    isTaxable: true,
    includeInGross: true,
    includeInPF: false,
    includeInESI: true,
    includeInPT: true,
    includeInLWF: false,
    isActive: true,
  });

  // Structure form state
  const [structureForm, setStructureForm] = useState<Partial<SalaryStructure>>({
    name: '',
    description: '',
    components: [],
    isActive: true,
  });

  const handleSaveComponent = () => {
    const newComponent: SalaryComponent = {
      id: editingComponent?.id || `comp-${Date.now()}`,
      name: componentForm.name || '',
      code: componentForm.code || '',
      type: componentForm.type || 'earning',
      calculationType: componentForm.calculationType || 'fixed',
      value: componentForm.value || 0,
      isTaxable: componentForm.isTaxable || false,
      includeInGross: componentForm.includeInGross || false,
      includeInPF: componentForm.includeInPF || false,
      includeInESI: componentForm.includeInESI || false,
      includeInPT: componentForm.includeInPT || false,
      includeInLWF: componentForm.includeInLWF || false,
      isActive: componentForm.isActive || true,
    };

    let updatedComponents: SalaryComponent[];
    if (editingComponent) {
      updatedComponents = masterComponents.map(c => c.id === newComponent.id ? newComponent : c);
    } else {
      updatedComponents = [...masterComponents, newComponent];
    }

    setMasterComponentsState(updatedComponents);
    setMasterComponents(updatedComponents);
    setIsComponentDialogOpen(false);
    setEditingComponent(null);
    resetComponentForm();
    
    toast({
      title: editingComponent ? 'Component Updated' : 'Component Added',
      description: `${newComponent.name} has been ${editingComponent ? 'updated' : 'added'} to the library.`,
    });
  };

  const handleDeleteComponent = (id: string) => {
    const updatedComponents = masterComponents.filter(c => c.id !== id);
    setMasterComponentsState(updatedComponents);
    setMasterComponents(updatedComponents);
    toast({
      title: 'Component Deleted',
      description: 'The component has been removed from the library.',
    });
  };

  const handleSaveStructure = () => {
    const newStructure: SalaryStructure = {
      id: editingStructure?.id || `struct-${Date.now()}`,
      name: structureForm.name || '',
      description: structureForm.description || '',
      components: structureForm.components || [],
      isActive: structureForm.isActive || true,
      createdAt: editingStructure?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedStructures: SalaryStructure[];
    if (editingStructure) {
      updatedStructures = structures.map(s => s.id === newStructure.id ? newStructure : s);
    } else {
      updatedStructures = [...structures, newStructure];
    }

    setStructuresState(updatedStructures);
    setSalaryStructures(updatedStructures);
    setIsStructureDialogOpen(false);
    setEditingStructure(null);
    resetStructureForm();
    
    toast({
      title: editingStructure ? 'Structure Updated' : 'Structure Created',
      description: `${newStructure.name} has been ${editingStructure ? 'updated' : 'created'}.`,
    });
  };

  const handleDeleteStructure = (id: string) => {
    const updatedStructures = structures.filter(s => s.id !== id);
    setStructuresState(updatedStructures);
    setSalaryStructures(updatedStructures);
    toast({
      title: 'Structure Deleted',
      description: 'The salary structure has been removed.',
    });
  };

  const resetComponentForm = () => {
    setComponentForm({
      name: '',
      code: '',
      type: 'earning',
      calculationType: 'fixed',
      value: 0,
      isTaxable: true,
      includeInGross: true,
      includeInPF: false,
      includeInESI: true,
      includeInPT: true,
      includeInLWF: false,
      isActive: true,
    });
  };

  const resetStructureForm = () => {
    setStructureForm({
      name: '',
      description: '',
      components: [],
      isActive: true,
    });
  };

  const openEditComponent = (component: SalaryComponent) => {
    setEditingComponent(component);
    setComponentForm(component);
    setIsComponentDialogOpen(true);
  };

  const openEditStructure = (structure: SalaryStructure) => {
    setEditingStructure(structure);
    setStructureForm(structure);
    setIsStructureDialogOpen(true);
  };

  const addComponentToStructure = (componentId: string) => {
    const component = masterComponents.find(c => c.id === componentId);
    if (!component) return;

    const existingIds = (structureForm.components || []).map(c => c.componentId);
    if (existingIds.includes(componentId)) return;

    const structureComponent: SalaryStructureComponent = {
      componentId: component.id,
      componentName: component.name,
      componentCode: component.code,
      type: component.type,
      calculationType: component.calculationType,
      value: component.value,
      isTaxable: component.isTaxable,
    };

    setStructureForm(prev => ({
      ...prev,
      components: [...(prev.components || []), structureComponent],
    }));
  };

  const removeComponentFromStructure = (componentId: string) => {
    setStructureForm(prev => ({
      ...prev,
      components: (prev.components || []).filter(c => c.componentId !== componentId),
    }));
  };

  return (
    <PageContainer>
      <PageHeader
        title="Salary Structures"
        description="Manage salary components and create structure templates"
        icon={<Wallet className="h-7 w-7 text-primary" />}
        badge={
          <Badge className="bg-primary/20 text-primary border-primary/30">
            {structures.length} Structures
          </Badge>
        }
      />

      <Tabs defaultValue="components" className="space-y-6">
        <TabsList className="premium-tabs">
          <TabsTrigger value="components" className="gap-2 rounded-lg">
            <Library className="h-4 w-4" />
            Master Components
          </TabsTrigger>
          <TabsTrigger value="structures" className="gap-2 rounded-lg">
            <Package className="h-4 w-4" />
            Salary Structures
          </TabsTrigger>
        </TabsList>

        {/* Master Components Tab */}
        <TabsContent value="components">
          <BentoCard>
            <BentoCardHeader>
              <BentoCardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                  <Library className="h-4 w-4 text-primary" />
                </div>
                Component Library
              </BentoCardTitle>
              <Button onClick={() => { resetComponentForm(); setIsComponentDialogOpen(true); }} className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" />
                Add Component
              </Button>
            </BentoCardHeader>
            <BentoCardContent>
              <Table className="premium-table">
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Calculation</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Taxable</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {masterComponents.map((component) => (
                    <TableRow key={component.id} className="border-border/30 group">
                      <TableCell className="font-medium">{component.name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted/50 px-2 py-1 rounded-md font-mono">{component.code}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={component.type === 'earning' ? 'default' : 'destructive'} className="text-xs">
                          {component.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {component.calculationType === 'fixed' && 'Fixed'}
                        {component.calculationType === 'percentage_of_basic' && '% of Basic'}
                        {component.calculationType === 'percentage_of_ctc' && '% of CTC'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {component.calculationType === 'fixed' ? `₹${component.value}` : `${component.value}%`}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={component.isTaxable ? 'status-pending' : 'status-active'}>
                          {component.isTaxable ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={component.isActive ? 'status-active' : 'status-inactive'}>
                          {component.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => openEditComponent(component)} className="h-8 w-8">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteComponent(component.id)}
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </BentoCardContent>
          </BentoCard>
        </TabsContent>

        {/* Salary Structures Tab */}
        <TabsContent value="structures">
          <BentoCard>
            <BentoCardHeader>
              <BentoCardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                  <Package className="h-4 w-4 text-emerald-400" />
                </div>
                Salary Structure Templates
              </BentoCardTitle>
              <Button onClick={() => { resetStructureForm(); setIsStructureDialogOpen(true); }} className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" />
                Create Structure
              </Button>
            </BentoCardHeader>
            <BentoCardContent>
              {structures.length === 0 ? (
                <EmptyState
                  icon={<Wallet className="h-10 w-10" />}
                  title="No salary structures created"
                  description="Create your first structure to assign to employees"
                  action={
                    <Button onClick={() => { resetStructureForm(); setIsStructureDialogOpen(true); }} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Structure
                    </Button>
                  }
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {structures.map((structure) => (
                    <div 
                      key={structure.id} 
                      className="glass-card-hover p-6 group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{structure.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{structure.description}</p>
                        </div>
                        <Badge variant="outline" className={structure.isActive ? 'status-active' : 'status-inactive'}>
                          {structure.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {structure.components.map((comp) => (
                          <Badge key={comp.componentId} variant="secondary" className="text-xs bg-muted/50">
                            {comp.componentCode}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="sm" onClick={() => openEditStructure(structure)} className="gap-1">
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteStructure(structure.id)}
                          className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BentoCardContent>
          </BentoCard>
        </TabsContent>
      </Tabs>

      {/* Component Dialog */}
      <Dialog open={isComponentDialogOpen} onOpenChange={setIsComponentDialogOpen}>
        <DialogContent className="max-w-lg glass-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{editingComponent ? 'Edit Component' : 'Add New Component'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Component Name</Label>
                <Input
                  value={componentForm.name}
                  onChange={(e) => setComponentForm(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-muted/30 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Code</Label>
                <Input
                  value={componentForm.code}
                  onChange={(e) => setComponentForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="bg-muted/30 border-border/50 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Type</Label>
                <Select
                  value={componentForm.type}
                  onValueChange={(value) => setComponentForm(prev => ({ ...prev, type: value as ComponentType }))}
                >
                  <SelectTrigger className="bg-muted/30 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="earning">Earning</SelectItem>
                    <SelectItem value="deduction">Deduction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Calculation Type</Label>
                <Select
                  value={componentForm.calculationType}
                  onValueChange={(value) => setComponentForm(prev => ({ ...prev, calculationType: value as CalculationType }))}
                >
                  <SelectTrigger className="bg-muted/30 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="percentage_of_basic">% of Basic</SelectItem>
                    <SelectItem value="percentage_of_ctc">% of CTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Value ({componentForm.calculationType === 'fixed' ? '₹' : '%'})</Label>
              <Input
                type="number"
                value={componentForm.value}
                onChange={(e) => setComponentForm(prev => ({ ...prev, value: Number(e.target.value) }))}
                className="bg-muted/30 border-border/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <Label className="text-sm">Taxable</Label>
                <Switch
                  checked={componentForm.isTaxable}
                  onCheckedChange={(checked) => setComponentForm(prev => ({ ...prev, isTaxable: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <Label className="text-sm">Include in Gross</Label>
                <Switch
                  checked={componentForm.includeInGross}
                  onCheckedChange={(checked) => setComponentForm(prev => ({ ...prev, includeInGross: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <Label className="text-sm">Include in PF</Label>
                <Switch
                  checked={componentForm.includeInPF}
                  onCheckedChange={(checked) => setComponentForm(prev => ({ ...prev, includeInPF: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <Label className="text-sm">Active</Label>
                <Switch
                  checked={componentForm.isActive}
                  onCheckedChange={(checked) => setComponentForm(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsComponentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveComponent} className="shadow-lg shadow-primary/20">Save Component</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Structure Dialog */}
      <Dialog open={isStructureDialogOpen} onOpenChange={setIsStructureDialogOpen}>
        <DialogContent className="max-w-2xl glass-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{editingStructure ? 'Edit Structure' : 'Create Salary Structure'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Structure Name</Label>
                <Input
                  value={structureForm.name}
                  onChange={(e) => setStructureForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Developer L1"
                  className="bg-muted/30 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Description</Label>
                <Input
                  value={structureForm.description}
                  onChange={(e) => setStructureForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description"
                  className="bg-muted/30 border-border/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Add Component from Library</Label>
              <Select onValueChange={addComponentToStructure}>
                <SelectTrigger className="bg-muted/30 border-border/50">
                  <SelectValue placeholder="Select component to add" />
                </SelectTrigger>
                <SelectContent>
                  {masterComponents
                    .filter(c => c.isActive && !(structureForm.components || []).find(sc => sc.componentId === c.id))
                    .map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Selected Components</Label>
              <div className="rounded-xl border border-border/50 p-4 bg-muted/20">
                {(structureForm.components || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No components added yet</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(structureForm.components || []).map(comp => (
                      <Badge
                        key={comp.componentId}
                        variant="secondary"
                        className="gap-1 pr-1 bg-muted/50"
                      >
                        {comp.componentName}
                        <button
                          onClick={() => removeComponentFromStructure(comp.componentId)}
                          className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <Label>Active</Label>
              <Switch
                checked={structureForm.isActive}
                onCheckedChange={(checked) => setStructureForm(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsStructureDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveStructure} className="shadow-lg shadow-primary/20">Save Structure</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
