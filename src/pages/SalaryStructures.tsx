import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Wallet, Library } from 'lucide-react';
import { BentoCard, BentoCardHeader, BentoCardTitle, BentoCardContent } from '@/components/ui/bento-card';
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Salary Structures</h1>
        <p className="text-muted-foreground">
          Manage salary components and create structure templates
        </p>
      </div>

      <Tabs defaultValue="components" className="space-y-6">
        <TabsList className="glass-card">
          <TabsTrigger value="components" className="gap-2">
            <Library className="h-4 w-4" />
            Master Components
          </TabsTrigger>
          <TabsTrigger value="structures" className="gap-2">
            <Wallet className="h-4 w-4" />
            Salary Structures
          </TabsTrigger>
        </TabsList>

        {/* Master Components Tab */}
        <TabsContent value="components">
          <BentoCard>
            <BentoCardHeader>
              <BentoCardTitle>Component Library</BentoCardTitle>
              <Button onClick={() => { resetComponentForm(); setIsComponentDialogOpen(true); }} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Component
              </Button>
            </BentoCardHeader>
            <BentoCardContent>
              <Table>
                <TableHeader>
                  <TableRow>
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
                    <TableRow key={component.id}>
                      <TableCell className="font-medium">{component.name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{component.code}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={component.type === 'earning' ? 'default' : 'destructive'}>
                          {component.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {component.calculationType === 'fixed' && 'Fixed'}
                        {component.calculationType === 'percentage_of_basic' && '% of Basic'}
                        {component.calculationType === 'percentage_of_ctc' && '% of CTC'}
                      </TableCell>
                      <TableCell>
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
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditComponent(component)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteComponent(component.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
              <BentoCardTitle>Salary Structure Templates</BentoCardTitle>
              <Button onClick={() => { resetStructureForm(); setIsStructureDialogOpen(true); }} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Structure
              </Button>
            </BentoCardHeader>
            <BentoCardContent>
              {structures.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Wallet className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No salary structures created yet.</p>
                  <p className="text-sm text-muted-foreground/70">
                    Create your first structure to assign to employees.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {structures.map((structure) => (
                    <BentoCard key={structure.id} className="bg-muted/30">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{structure.name}</h3>
                          <p className="text-sm text-muted-foreground">{structure.description}</p>
                        </div>
                        <Badge variant="outline" className={structure.isActive ? 'status-active' : 'status-inactive'}>
                          {structure.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {structure.components.map((comp) => (
                          <Badge key={comp.componentId} variant="secondary" className="text-xs">
                            {comp.componentCode}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditStructure(structure)}>
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStructure(structure.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </BentoCard>
                  ))}
                </div>
              )}
            </BentoCardContent>
          </BentoCard>
        </TabsContent>
      </Tabs>

      {/* Component Dialog */}
      <Dialog open={isComponentDialogOpen} onOpenChange={setIsComponentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingComponent ? 'Edit Component' : 'Add New Component'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Component Name</Label>
                <Input
                  value={componentForm.name}
                  onChange={(e) => setComponentForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  value={componentForm.code}
                  onChange={(e) => setComponentForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={componentForm.type}
                  onValueChange={(value) => setComponentForm(prev => ({ ...prev, type: value as ComponentType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="earning">Earning</SelectItem>
                    <SelectItem value="deduction">Deduction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Calculation Type</Label>
                <Select
                  value={componentForm.calculationType}
                  onValueChange={(value) => setComponentForm(prev => ({ ...prev, calculationType: value as CalculationType }))}
                >
                  <SelectTrigger>
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
              <Label>Value ({componentForm.calculationType === 'fixed' ? '₹' : '%'})</Label>
              <Input
                type="number"
                value={componentForm.value}
                onChange={(e) => setComponentForm(prev => ({ ...prev, value: Number(e.target.value) }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label>Taxable</Label>
                <Switch
                  checked={componentForm.isTaxable}
                  onCheckedChange={(checked) => setComponentForm(prev => ({ ...prev, isTaxable: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Include in Gross</Label>
                <Switch
                  checked={componentForm.includeInGross}
                  onCheckedChange={(checked) => setComponentForm(prev => ({ ...prev, includeInGross: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Include in PF</Label>
                <Switch
                  checked={componentForm.includeInPF}
                  onCheckedChange={(checked) => setComponentForm(prev => ({ ...prev, includeInPF: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Include in ESI</Label>
                <Switch
                  checked={componentForm.includeInESI}
                  onCheckedChange={(checked) => setComponentForm(prev => ({ ...prev, includeInESI: checked }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsComponentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveComponent}>Save Component</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Structure Dialog */}
      <Dialog open={isStructureDialogOpen} onOpenChange={setIsStructureDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStructure ? 'Edit Structure' : 'Create Salary Structure'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Structure Name</Label>
                <Input
                  value={structureForm.name}
                  onChange={(e) => setStructureForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={structureForm.description}
                  onChange={(e) => setStructureForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Add Components from Library</Label>
              <Select onValueChange={addComponentToStructure}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a component to add" />
                </SelectTrigger>
                <SelectContent>
                  {masterComponents
                    .filter(c => c.isActive && !(structureForm.components || []).some(sc => sc.componentId === c.id))
                    .map((component) => (
                      <SelectItem key={component.id} value={component.id}>
                        {component.name} ({component.code})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Structure Components</Label>
              {(structureForm.components || []).length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No components added yet. Select from the library above.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Component</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Calculation</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(structureForm.components || []).map((comp) => (
                      <TableRow key={comp.componentId}>
                        <TableCell>{comp.componentName}</TableCell>
                        <TableCell>
                          <Badge variant={comp.type === 'earning' ? 'default' : 'destructive'}>
                            {comp.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {comp.calculationType === 'fixed' && 'Fixed'}
                          {comp.calculationType === 'percentage_of_basic' && '% of Basic'}
                          {comp.calculationType === 'percentage_of_ctc' && '% of CTC'}
                        </TableCell>
                        <TableCell>
                          {comp.calculationType === 'fixed' ? `₹${comp.value}` : `${comp.value}%`}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeComponentFromStructure(comp.componentId)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStructureDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveStructure}>Save Structure</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
