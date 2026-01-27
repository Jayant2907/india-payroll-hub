import { useState } from 'react';
import { Plus, Pencil, Trash2, Calculator, IndianRupee, FileText, Save, Shield } from 'lucide-react';
import { BentoCard, BentoCardHeader, BentoCardTitle, BentoCardContent } from '@/components/ui/bento-card';
import { PageHeader, PageContainer } from '@/components/ui/page-header';
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
    <PageContainer>
      <PageHeader
        title="Statutory Compliance"
        description="Configure Professional Tax, Provident Fund, and Income Tax settings"
        icon={<Shield className="h-7 w-7 text-primary" />}
        badge={
          <Badge className="status-active">
            FY {taxSettings.fiscalYear}
          </Badge>
        }
      />

      <Tabs defaultValue="pt" className="space-y-6">
        <TabsList className="premium-tabs">
          <TabsTrigger value="pt" className="gap-2 rounded-lg">
            <Calculator className="h-4 w-4" />
            Professional Tax
          </TabsTrigger>
          <TabsTrigger value="pf" className="gap-2 rounded-lg">
            <IndianRupee className="h-4 w-4" />
            Provident Fund
          </TabsTrigger>
          <TabsTrigger value="tax" className="gap-2 rounded-lg">
            <FileText className="h-4 w-4" />
            Income Tax
          </TabsTrigger>
        </TabsList>

        {/* Professional Tax Tab */}
        <TabsContent value="pt">
          <BentoCard>
            <BentoCardHeader>
              <BentoCardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                  <Calculator className="h-4 w-4 text-primary" />
                </div>
                Professional Tax Slabs
              </BentoCardTitle>
              <Button onClick={() => { setPTForm({ state: '', minSalary: 0, maxSalary: 0, taxAmount: 0 }); setIsPTDialogOpen(true); }} className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" />
                Add Slab
              </Button>
            </BentoCardHeader>
            <BentoCardContent>
              <Table className="premium-table">
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead>State</TableHead>
                    <TableHead>Min Salary</TableHead>
                    <TableHead>Max Salary</TableHead>
                    <TableHead>Tax Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ptSlabs.map((slab) => (
                    <TableRow key={slab.id} className="border-border/30 group">
                      <TableCell className="font-medium">{slab.state}</TableCell>
                      <TableCell>{formatCurrency(slab.minSalary)}</TableCell>
                      <TableCell>{slab.maxSalary >= 99999999 ? '∞' : formatCurrency(slab.maxSalary)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-muted/50">
                          {formatCurrency(slab.taxAmount)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingPTSlab(slab);
                                  setPTForm(slab);
                                  setIsPTDialogOpen(true);
                                }}
                                className="h-8 w-8"
                              >
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
                                onClick={() => handleDeletePTSlab(slab.id)}
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

        {/* Provident Fund Tab */}
        <TabsContent value="pf">
          <BentoCard>
            <BentoCardHeader>
              <BentoCardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                  <IndianRupee className="h-4 w-4 text-emerald-400" />
                </div>
                Provident Fund Configuration
              </BentoCardTitle>
            </BentoCardHeader>
            <BentoCardContent className="space-y-6">
              <div className="flex items-center justify-between p-6 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${pfSettings.enabled ? 'bg-emerald-500/20' : 'bg-muted/50'}`}>
                    <IndianRupee className={`h-6 w-6 ${pfSettings.enabled ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Enable Provident Fund</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically calculate PF deductions for eligible employees
                    </p>
                  </div>
                </div>
                <Switch
                  checked={pfSettings.enabled}
                  onCheckedChange={(checked) => setPFSettingsState(prev => ({ ...prev, enabled: checked }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Employee Contribution (%)</Label>
                  <Input
                    type="number"
                    value={pfSettings.employeeContribution}
                    onChange={(e) => setPFSettingsState(prev => ({ ...prev, employeeContribution: Number(e.target.value) }))}
                    disabled={!pfSettings.enabled}
                    className="bg-muted/30 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Employer Contribution (%)</Label>
                  <Input
                    type="number"
                    value={pfSettings.employerContribution}
                    onChange={(e) => setPFSettingsState(prev => ({ ...prev, employerContribution: Number(e.target.value) }))}
                    disabled={!pfSettings.enabled}
                    className="bg-muted/30 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Wage Ceiling (₹)</Label>
                  <Input
                    type="number"
                    value={pfSettings.wageCeiling}
                    onChange={(e) => setPFSettingsState(prev => ({ ...prev, wageCeiling: Number(e.target.value) }))}
                    disabled={!pfSettings.enabled}
                    className="bg-muted/30 border-border/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    PF calculated on minimum of Basic or this ceiling
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border/50">
                <Button onClick={handleSavePFSettings} className="gap-2 shadow-lg shadow-primary/20">
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
                <BentoCardTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
                    <FileText className="h-4 w-4 text-amber-400" />
                  </div>
                  Exemptions & Deductions
                </BentoCardTitle>
              </BentoCardHeader>
              <BentoCardContent className="space-y-6">
                <div className="grid grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Fiscal Year</Label>
                    <Input value={taxSettings.fiscalYear} disabled className="bg-muted/50 border-border/50 font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Standard Deduction (₹)</Label>
                    <Input
                      type="number"
                      value={taxSettings.standardDeduction}
                      onChange={(e) => setTaxSettingsState(prev => ({ ...prev, standardDeduction: Number(e.target.value) }))}
                      className="bg-muted/30 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Section 80C Limit (₹)</Label>
                    <Input
                      type="number"
                      value={taxSettings.section80CLimit}
                      onChange={(e) => setTaxSettingsState(prev => ({ ...prev, section80CLimit: Number(e.target.value) }))}
                      className="bg-muted/30 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">HRA Exemption Limit (₹)</Label>
                    <Input
                      type="number"
                      value={taxSettings.hraExemptionLimit}
                      onChange={(e) => setTaxSettingsState(prev => ({ ...prev, hraExemptionLimit: Number(e.target.value) }))}
                      className="bg-muted/30 border-border/50"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-border/50">
                  <Button onClick={handleSaveTaxSettings} className="gap-2 shadow-lg shadow-primary/20">
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
                  <BentoCardTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20">
                      <Calculator className="h-4 w-4 text-rose-400" />
                    </div>
                    Tax Slabs
                  </BentoCardTitle>
                  <Select value={selectedTaxRegime} onValueChange={(v) => setSelectedTaxRegime(v as TaxRegime)}>
                    <SelectTrigger className="w-40 bg-muted/30 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New Regime</SelectItem>
                      <SelectItem value="old">Old Regime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => { setTaxSlabForm({ regime: selectedTaxRegime, fiscalYear: taxSettings.fiscalYear, minIncome: 0, maxIncome: 0, taxRate: 0 }); setIsTaxSlabDialogOpen(true); }} className="gap-2 shadow-lg shadow-primary/20">
                  <Plus className="h-4 w-4" />
                  Add Slab
                </Button>
              </BentoCardHeader>
              <BentoCardContent>
                <Table className="premium-table">
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead>Min Income</TableHead>
                      <TableHead>Max Income</TableHead>
                      <TableHead>Tax Rate</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTaxSlabs.map((slab) => (
                      <TableRow key={slab.id} className="border-border/30 group">
                        <TableCell>{formatCurrency(slab.minIncome)}</TableCell>
                        <TableCell>{slab.maxIncome >= 99999999 ? '∞' : formatCurrency(slab.maxIncome)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-muted/50 font-mono">
                            {slab.taxRate}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingTaxSlab(slab);
                                    setTaxSlabForm(slab);
                                    setIsTaxSlabDialogOpen(true);
                                  }}
                                  className="h-8 w-8"
                                >
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
                                  onClick={() => handleDeleteTaxSlab(slab.id)}
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
          </div>
        </TabsContent>
      </Tabs>

      {/* PT Dialog */}
      <Dialog open={isPTDialogOpen} onOpenChange={setIsPTDialogOpen}>
        <DialogContent className="glass-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{editingPTSlab ? 'Edit PT Slab' : 'Add PT Slab'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">State</Label>
              <Select value={ptForm.state} onValueChange={(v) => setPTForm(prev => ({ ...prev, state: v }))}>
                <SelectTrigger className="bg-muted/30 border-border/50">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Min Salary (₹)</Label>
                <Input
                  type="number"
                  value={ptForm.minSalary}
                  onChange={(e) => setPTForm(prev => ({ ...prev, minSalary: Number(e.target.value) }))}
                  className="bg-muted/30 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Max Salary (₹)</Label>
                <Input
                  type="number"
                  value={ptForm.maxSalary}
                  onChange={(e) => setPTForm(prev => ({ ...prev, maxSalary: Number(e.target.value) }))}
                  className="bg-muted/30 border-border/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Tax Amount (₹)</Label>
              <Input
                type="number"
                value={ptForm.taxAmount}
                onChange={(e) => setPTForm(prev => ({ ...prev, taxAmount: Number(e.target.value) }))}
                className="bg-muted/30 border-border/50"
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsPTDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePTSlab} className="shadow-lg shadow-primary/20">Save Slab</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tax Slab Dialog */}
      <Dialog open={isTaxSlabDialogOpen} onOpenChange={setIsTaxSlabDialogOpen}>
        <DialogContent className="glass-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{editingTaxSlab ? 'Edit Tax Slab' : 'Add Tax Slab'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Regime</Label>
                <Select value={taxSlabForm.regime} onValueChange={(v) => setTaxSlabForm(prev => ({ ...prev, regime: v as TaxRegime }))}>
                  <SelectTrigger className="bg-muted/30 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New Regime</SelectItem>
                    <SelectItem value="old">Old Regime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Fiscal Year</Label>
                <Input value={taxSlabForm.fiscalYear} disabled className="bg-muted/50 border-border/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Min Income (₹)</Label>
                <Input
                  type="number"
                  value={taxSlabForm.minIncome}
                  onChange={(e) => setTaxSlabForm(prev => ({ ...prev, minIncome: Number(e.target.value) }))}
                  className="bg-muted/30 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Max Income (₹)</Label>
                <Input
                  type="number"
                  value={taxSlabForm.maxIncome}
                  onChange={(e) => setTaxSlabForm(prev => ({ ...prev, maxIncome: Number(e.target.value) }))}
                  className="bg-muted/30 border-border/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Tax Rate (%)</Label>
              <Input
                type="number"
                value={taxSlabForm.taxRate}
                onChange={(e) => setTaxSlabForm(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                className="bg-muted/30 border-border/50"
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsTaxSlabDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTaxSlab} className="shadow-lg shadow-primary/20">Save Slab</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
