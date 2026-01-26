import { useState } from 'react';
import { Plus, Pencil, Trash2, Calculator, IndianRupee, FileText, Save } from 'lucide-react';
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
import { getPTSlabs, setPTSlabs, getPFSettings, setPFSettings, getTaxSettings, setTaxSettings } from '@/lib/storage';
import type { PTSlab, PFSettings, TaxSettings, TaxSlab, TaxRegime } from '@/types/payroll';
import { useToast } from '@/hooks/use-toast';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

export default function Statutory() {
  const [ptSlabs, setPTSlabsState] = useState<PTSlab[]>(getPTSlabs);
  const [pfSettings, setPFSettingsState] = useState<PFSettings>(getPFSettings);
  const [taxSettings, setTaxSettingsState] = useState<TaxSettings>(getTaxSettings);
  const [isPTDialogOpen, setIsPTDialogOpen] = useState(false);
  const [isTaxSlabDialogOpen, setIsTaxSlabDialogOpen] = useState(false);
  const [editingPTSlab, setEditingPTSlab] = useState<PTSlab | null>(null);
  const [editingTaxSlab, setEditingTaxSlab] = useState<TaxSlab | null>(null);
  const [selectedTaxRegime, setSelectedTaxRegime] = useState<TaxRegime>('new');
  const { toast } = useToast();

  // PT Slab form
  const [ptForm, setPTForm] = useState<Partial<PTSlab>>({
    state: '',
    minSalary: 0,
    maxSalary: 0,
    taxAmount: 0,
  });

  // Tax Slab form
  const [taxSlabForm, setTaxSlabForm] = useState<Partial<TaxSlab>>({
    regime: 'new',
    fiscalYear: taxSettings.fiscalYear,
    minIncome: 0,
    maxIncome: 0,
    taxRate: 0,
  });

  const handleSavePFSettings = () => {
    setPFSettings(pfSettings);
    toast({
      title: 'PF Settings Saved',
      description: 'Provident Fund configuration has been updated.',
    });
  };

  const handleSaveTaxSettings = () => {
    setTaxSettings(taxSettings);
    toast({
      title: 'Tax Settings Saved',
      description: 'Income Tax configuration has been updated.',
    });
  };

  const handleSavePTSlab = () => {
    const newSlab: PTSlab = {
      id: editingPTSlab?.id || `pt-${Date.now()}`,
      state: ptForm.state || '',
      minSalary: ptForm.minSalary || 0,
      maxSalary: ptForm.maxSalary || 0,
      taxAmount: ptForm.taxAmount || 0,
    };

    let updatedSlabs: PTSlab[];
    if (editingPTSlab) {
      updatedSlabs = ptSlabs.map(s => s.id === newSlab.id ? newSlab : s);
    } else {
      updatedSlabs = [...ptSlabs, newSlab];
    }

    setPTSlabsState(updatedSlabs);
    setPTSlabs(updatedSlabs);
    setIsPTDialogOpen(false);
    setEditingPTSlab(null);
    setPTForm({ state: '', minSalary: 0, maxSalary: 0, taxAmount: 0 });
    
    toast({
      title: editingPTSlab ? 'PT Slab Updated' : 'PT Slab Added',
      description: `Professional Tax slab for ${newSlab.state} has been saved.`,
    });
  };

  const handleDeletePTSlab = (id: string) => {
    const updatedSlabs = ptSlabs.filter(s => s.id !== id);
    setPTSlabsState(updatedSlabs);
    setPTSlabs(updatedSlabs);
    toast({
      title: 'PT Slab Deleted',
      description: 'The Professional Tax slab has been removed.',
    });
  };

  const handleSaveTaxSlab = () => {
    const newSlab: TaxSlab = {
      id: editingTaxSlab?.id || `tax-${Date.now()}`,
      regime: taxSlabForm.regime || 'new',
      fiscalYear: taxSlabForm.fiscalYear || taxSettings.fiscalYear,
      minIncome: taxSlabForm.minIncome || 0,
      maxIncome: taxSlabForm.maxIncome || 0,
      taxRate: taxSlabForm.taxRate || 0,
    };

    let updatedSlabs: TaxSlab[];
    if (editingTaxSlab) {
      updatedSlabs = taxSettings.slabs.map(s => s.id === newSlab.id ? newSlab : s);
    } else {
      updatedSlabs = [...taxSettings.slabs, newSlab];
    }

    const updatedSettings = { ...taxSettings, slabs: updatedSlabs };
    setTaxSettingsState(updatedSettings);
    setTaxSettings(updatedSettings);
    setIsTaxSlabDialogOpen(false);
    setEditingTaxSlab(null);
    setTaxSlabForm({ regime: 'new', fiscalYear: taxSettings.fiscalYear, minIncome: 0, maxIncome: 0, taxRate: 0 });
    
    toast({
      title: editingTaxSlab ? 'Tax Slab Updated' : 'Tax Slab Added',
      description: `Income Tax slab has been saved.`,
    });
  };

  const handleDeleteTaxSlab = (id: string) => {
    const updatedSlabs = taxSettings.slabs.filter(s => s.id !== id);
    const updatedSettings = { ...taxSettings, slabs: updatedSlabs };
    setTaxSettingsState(updatedSettings);
    setTaxSettings(updatedSettings);
    toast({
      title: 'Tax Slab Deleted',
      description: 'The Income Tax slab has been removed.',
    });
  };

  const filteredTaxSlabs = taxSettings.slabs.filter(s => s.regime === selectedTaxRegime);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Statutory Compliance</h1>
        <p className="text-muted-foreground">
          Configure Professional Tax, Provident Fund, and Income Tax settings
        </p>
      </div>

      <Tabs defaultValue="pt" className="space-y-6">
        <TabsList className="glass-card">
          <TabsTrigger value="pt" className="gap-2">
            <Calculator className="h-4 w-4" />
            Professional Tax
          </TabsTrigger>
          <TabsTrigger value="pf" className="gap-2">
            <IndianRupee className="h-4 w-4" />
            Provident Fund
          </TabsTrigger>
          <TabsTrigger value="tax" className="gap-2">
            <FileText className="h-4 w-4" />
            Income Tax
          </TabsTrigger>
        </TabsList>

        {/* Professional Tax Tab */}
        <TabsContent value="pt">
          <BentoCard>
            <BentoCardHeader>
              <BentoCardTitle>Professional Tax Slabs</BentoCardTitle>
              <Button onClick={() => { setPTForm({ state: '', minSalary: 0, maxSalary: 0, taxAmount: 0 }); setIsPTDialogOpen(true); }} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Slab
              </Button>
            </BentoCardHeader>
            <BentoCardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>State</TableHead>
                    <TableHead>Min Salary</TableHead>
                    <TableHead>Max Salary</TableHead>
                    <TableHead>Tax Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ptSlabs.map((slab) => (
                    <TableRow key={slab.id}>
                      <TableCell className="font-medium">{slab.state}</TableCell>
                      <TableCell>{formatCurrency(slab.minSalary)}</TableCell>
                      <TableCell>{slab.maxSalary >= 99999999 ? '∞' : formatCurrency(slab.maxSalary)}</TableCell>
                      <TableCell>{formatCurrency(slab.taxAmount)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingPTSlab(slab);
                              setPTForm(slab);
                              setIsPTDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePTSlab(slab.id)}
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

        {/* Provident Fund Tab */}
        <TabsContent value="pf">
          <BentoCard>
            <BentoCardHeader>
              <BentoCardTitle>Provident Fund Configuration</BentoCardTitle>
            </BentoCardHeader>
            <BentoCardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium">Enable Provident Fund</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically calculate PF deductions for eligible employees
                  </p>
                </div>
                <Switch
                  checked={pfSettings.enabled}
                  onCheckedChange={(checked) => setPFSettingsState(prev => ({ ...prev, enabled: checked }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Employee Contribution (%)</Label>
                  <Input
                    type="number"
                    value={pfSettings.employeeContribution}
                    onChange={(e) => setPFSettingsState(prev => ({ ...prev, employeeContribution: Number(e.target.value) }))}
                    disabled={!pfSettings.enabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Employer Contribution (%)</Label>
                  <Input
                    type="number"
                    value={pfSettings.employerContribution}
                    onChange={(e) => setPFSettingsState(prev => ({ ...prev, employerContribution: Number(e.target.value) }))}
                    disabled={!pfSettings.enabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Wage Ceiling (₹)</Label>
                  <Input
                    type="number"
                    value={pfSettings.wageCeiling}
                    onChange={(e) => setPFSettingsState(prev => ({ ...prev, wageCeiling: Number(e.target.value) }))}
                    disabled={!pfSettings.enabled}
                  />
                  <p className="text-xs text-muted-foreground">
                    PF calculated on minimum of Basic or this ceiling
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSavePFSettings} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save PF Settings
                </Button>
              </div>
            </BentoCardContent>
          </BentoCard>
        </TabsContent>

        {/* Income Tax Tab */}
        <TabsContent value="tax">
          <div className="space-y-6">
            {/* Exemptions Card */}
            <BentoCard>
              <BentoCardHeader>
                <BentoCardTitle>Exemptions & Deductions</BentoCardTitle>
              </BentoCardHeader>
              <BentoCardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Fiscal Year</Label>
                    <Input value={taxSettings.fiscalYear} disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Standard Deduction (₹)</Label>
                    <Input
                      type="number"
                      value={taxSettings.standardDeduction}
                      onChange={(e) => setTaxSettingsState(prev => ({ ...prev, standardDeduction: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Section 80C Limit (₹)</Label>
                    <Input
                      type="number"
                      value={taxSettings.section80CLimit}
                      onChange={(e) => setTaxSettingsState(prev => ({ ...prev, section80CLimit: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>HRA Exemption Limit (₹)</Label>
                    <Input
                      type="number"
                      value={taxSettings.hraExemptionLimit}
                      onChange={(e) => setTaxSettingsState(prev => ({ ...prev, hraExemptionLimit: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveTaxSettings} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Tax Settings
                  </Button>
                </div>
              </BentoCardContent>
            </BentoCard>

            {/* Tax Slabs Card */}
            <BentoCard>
              <BentoCardHeader>
                <div className="flex items-center gap-4">
                  <BentoCardTitle>Tax Slabs</BentoCardTitle>
                  <Select value={selectedTaxRegime} onValueChange={(v) => setSelectedTaxRegime(v as TaxRegime)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New Regime</SelectItem>
                      <SelectItem value="old">Old Regime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => { setTaxSlabForm({ regime: selectedTaxRegime, fiscalYear: taxSettings.fiscalYear, minIncome: 0, maxIncome: 0, taxRate: 0 }); setIsTaxSlabDialogOpen(true); }} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Slab
                </Button>
              </BentoCardHeader>
              <BentoCardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Min Income</TableHead>
                      <TableHead>Max Income</TableHead>
                      <TableHead>Tax Rate</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTaxSlabs.map((slab) => (
                      <TableRow key={slab.id}>
                        <TableCell>{formatCurrency(slab.minIncome)}</TableCell>
                        <TableCell>{slab.maxIncome >= 99999999 ? '∞' : formatCurrency(slab.maxIncome)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{slab.taxRate}%</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingTaxSlab(slab);
                                setTaxSlabForm(slab);
                                setIsTaxSlabDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTaxSlab(slab.id)}
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
          </div>
        </TabsContent>
      </Tabs>

      {/* PT Dialog */}
      <Dialog open={isPTDialogOpen} onOpenChange={setIsPTDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPTSlab ? 'Edit PT Slab' : 'Add PT Slab'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>State</Label>
              <Select value={ptForm.state} onValueChange={(v) => setPTForm(prev => ({ ...prev, state: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Salary (₹)</Label>
                <Input
                  type="number"
                  value={ptForm.minSalary}
                  onChange={(e) => setPTForm(prev => ({ ...prev, minSalary: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Salary (₹)</Label>
                <Input
                  type="number"
                  value={ptForm.maxSalary}
                  onChange={(e) => setPTForm(prev => ({ ...prev, maxSalary: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tax Amount (₹)</Label>
              <Input
                type="number"
                value={ptForm.taxAmount}
                onChange={(e) => setPTForm(prev => ({ ...prev, taxAmount: Number(e.target.value) }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPTDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePTSlab}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tax Slab Dialog */}
      <Dialog open={isTaxSlabDialogOpen} onOpenChange={setIsTaxSlabDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTaxSlab ? 'Edit Tax Slab' : 'Add Tax Slab'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Regime</Label>
                <Select value={taxSlabForm.regime} onValueChange={(v) => setTaxSlabForm(prev => ({ ...prev, regime: v as TaxRegime }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New Regime</SelectItem>
                    <SelectItem value="old">Old Regime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fiscal Year</Label>
                <Input value={taxSlabForm.fiscalYear} disabled className="bg-muted" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Income (₹)</Label>
                <Input
                  type="number"
                  value={taxSlabForm.minIncome}
                  onChange={(e) => setTaxSlabForm(prev => ({ ...prev, minIncome: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Income (₹)</Label>
                <Input
                  type="number"
                  value={taxSlabForm.maxIncome}
                  onChange={(e) => setTaxSlabForm(prev => ({ ...prev, maxIncome: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tax Rate (%)</Label>
              <Input
                type="number"
                value={taxSlabForm.taxRate}
                onChange={(e) => setTaxSlabForm(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaxSlabDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTaxSlab}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
