import { useState } from 'react';
import { Building2, FileCheck, Settings, Palette, Save, RotateCcw, Sun, Moon } from 'lucide-react';
import { BentoCard, BentoCardHeader, BentoCardTitle, BentoCardContent } from '@/components/ui/bento-card';
import { PageHeader, PageContainer } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCompanyConfig, setCompanyConfig } from '@/lib/storage';
import { useTheme } from '@/contexts/ThemeContext';
import type { CompanyConfig } from '@/types/payroll';
import { useToast } from '@/hooks/use-toast';

export default function Company() {
  const [config, setConfig] = useState<CompanyConfig>(getCompanyConfig);
  const { themeConfig, updateThemeConfig, resetTheme, toggleTheme, theme } = useTheme();
  const { toast } = useToast();

  const handleConfigChange = (field: keyof CompanyConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveConfig = () => {
    setCompanyConfig(config);
    toast({
      title: 'Settings Saved',
      description: 'Company configuration has been updated successfully.',
    });
  };

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Company Settings"
        description="Manage your organization details and payroll configuration"
        icon={<Building2 className="h-7 w-7 text-primary" />}
      />

      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList className="premium-tabs">
          <TabsTrigger value="organization" className="gap-2 rounded-lg">
            <Building2 className="h-4 w-4" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="statutory" className="gap-2 rounded-lg">
            <FileCheck className="h-4 w-4" />
            Statutory
          </TabsTrigger>
          <TabsTrigger value="payroll" className="gap-2 rounded-lg">
            <Settings className="h-4 w-4" />
            Payroll
          </TabsTrigger>
          <TabsTrigger value="theme" className="gap-2 rounded-lg">
            <Palette className="h-4 w-4" />
            Theme
          </TabsTrigger>
        </TabsList>

        {/* Organization Details */}
        <TabsContent value="organization">
          <BentoCard>
            <BentoCardHeader>
              <BentoCardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                Organization Details
              </BentoCardTitle>
            </BentoCardHeader>
            <BentoCardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="legalName" className="text-muted-foreground">Legal Name</Label>
                  <Input
                    id="legalName"
                    value={config.legalName}
                    onChange={(e) => handleConfigChange('legalName', e.target.value)}
                    className="bg-muted/30 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tradeName" className="text-muted-foreground">Trade Name</Label>
                  <Input
                    id="tradeName"
                    value={config.tradeName}
                    onChange={(e) => handleConfigChange('tradeName', e.target.value)}
                    className="bg-muted/30 border-border/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-muted-foreground">Address</Label>
                <Input
                  id="address"
                  value={config.address}
                  onChange={(e) => handleConfigChange('address', e.target.value)}
                  className="bg-muted/30 border-border/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-muted-foreground">City</Label>
                  <Input
                    id="city"
                    value={config.city}
                    onChange={(e) => handleConfigChange('city', e.target.value)}
                    className="bg-muted/30 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-muted-foreground">State</Label>
                  <Input
                    id="state"
                    value={config.state}
                    onChange={(e) => handleConfigChange('state', e.target.value)}
                    className="bg-muted/30 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode" className="text-muted-foreground">Pincode</Label>
                  <Input
                    id="pincode"
                    value={config.pincode}
                    onChange={(e) => handleConfigChange('pincode', e.target.value)}
                    className="bg-muted/30 border-border/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cin" className="text-muted-foreground">CIN (Corporate Identification Number)</Label>
                <Input
                  id="cin"
                  value={config.cin}
                  onChange={(e) => handleConfigChange('cin', e.target.value)}
                  className="bg-muted/30 border-border/50"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-border/50">
                <Button onClick={handleSaveConfig} className="gap-2 shadow-lg shadow-primary/20">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </BentoCardContent>
          </BentoCard>
        </TabsContent>

        {/* Statutory Registrations */}
        <TabsContent value="statutory">
          <BentoCard>
            <BentoCardHeader>
              <BentoCardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                  <FileCheck className="h-4 w-4 text-emerald-400" />
                </div>
                Statutory Registrations
              </BentoCardTitle>
            </BentoCardHeader>
            <BentoCardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pan" className="text-muted-foreground">PAN</Label>
                  <Input
                    id="pan"
                    value={config.pan}
                    onChange={(e) => handleConfigChange('pan', e.target.value.toUpperCase())}
                    maxLength={10}
                    className="bg-muted/30 border-border/50 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tan" className="text-muted-foreground">TAN</Label>
                  <Input
                    id="tan"
                    value={config.tan}
                    onChange={(e) => handleConfigChange('tan', e.target.value.toUpperCase())}
                    maxLength={10}
                    className="bg-muted/30 border-border/50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="epfCode" className="text-muted-foreground">EPF Establishment Code</Label>
                  <Input
                    id="epfCode"
                    value={config.epfCode}
                    onChange={(e) => handleConfigChange('epfCode', e.target.value)}
                    className="bg-muted/30 border-border/50 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="esiNumber" className="text-muted-foreground">ESI Employer Code</Label>
                  <Input
                    id="esiNumber"
                    value={config.esiNumber}
                    onChange={(e) => handleConfigChange('esiNumber', e.target.value)}
                    className="bg-muted/30 border-border/50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ptState" className="text-muted-foreground">Professional Tax State</Label>
                  <Input
                    id="ptState"
                    value={config.ptState}
                    onChange={(e) => handleConfigChange('ptState', e.target.value)}
                    className="bg-muted/30 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lwfState" className="text-muted-foreground">LWF State</Label>
                  <Input
                    id="lwfState"
                    value={config.lwfState}
                    onChange={(e) => handleConfigChange('lwfState', e.target.value)}
                    className="bg-muted/30 border-border/50"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border/50">
                <Button onClick={handleSaveConfig} className="gap-2 shadow-lg shadow-primary/20">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </BentoCardContent>
          </BentoCard>
        </TabsContent>

        {/* Payroll Settings */}
        <TabsContent value="payroll">
          <BentoCard>
            <BentoCardHeader>
              <BentoCardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
                  <Settings className="h-4 w-4 text-amber-400" />
                </div>
                Payroll Settings
              </BentoCardTitle>
            </BentoCardHeader>
            <BentoCardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="payCycle" className="text-muted-foreground">Pay Cycle</Label>
                  <Input
                    id="payCycle"
                    value="Monthly"
                    disabled
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payDay" className="text-muted-foreground">Pay Day</Label>
                  <Input
                    id="payDay"
                    type="number"
                    min={1}
                    max={28}
                    value={config.payDay}
                    onChange={(e) => handleConfigChange('payDay', Number(e.target.value))}
                    className="bg-muted/30 border-border/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Day of month when salary is credited (1-28)
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border/50">
                <Button onClick={handleSaveConfig} className="gap-2 shadow-lg shadow-primary/20">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </BentoCardContent>
          </BentoCard>
        </TabsContent>

        {/* Theme Settings */}
        <TabsContent value="theme">
          <BentoCard>
            <BentoCardHeader>
              <BentoCardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20">
                  <Palette className="h-4 w-4 text-rose-400" />
                </div>
                Theme & Appearance
              </BentoCardTitle>
            </BentoCardHeader>
            <BentoCardContent className="space-y-6">
              <div className="flex items-center justify-between p-6 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${theme === 'dark' ? 'bg-primary/20' : 'bg-amber-500/20'}`}>
                    {theme === 'dark' ? <Moon className="h-6 w-6 text-primary" /> : <Sun className="h-6 w-6 text-amber-400" />}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Color Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Currently using {theme === 'dark' ? 'Onyx Dark' : 'Paper White'} theme
                    </p>
                  </div>
                </div>
                <Button onClick={toggleTheme} variant="outline" className="gap-2">
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'}
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="primaryColor" className="text-muted-foreground">Primary Color</Label>
                  <div className="flex gap-3">
                    <Input
                      id="primaryColor"
                      value={themeConfig.primaryColor}
                      onChange={(e) => updateThemeConfig({ primaryColor: e.target.value })}
                      className="bg-muted/30 border-border/50 flex-1"
                    />
                    <div
                      className="h-10 w-10 rounded-lg border border-border/50 shadow-inner"
                      style={{ backgroundColor: themeConfig.primaryColor }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="sidebarColor" className="text-muted-foreground">Sidebar Color</Label>
                  <div className="flex gap-3">
                    <Input
                      id="sidebarColor"
                      value={themeConfig.sidebarColor}
                      onChange={(e) => updateThemeConfig({ sidebarColor: e.target.value })}
                      className="bg-muted/30 border-border/50 flex-1"
                    />
                    <div
                      className="h-10 w-10 rounded-lg border border-border/50 shadow-inner"
                      style={{ backgroundColor: themeConfig.sidebarColor }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="backgroundColor" className="text-muted-foreground">Background Color</Label>
                  <div className="flex gap-3">
                    <Input
                      id="backgroundColor"
                      value={themeConfig.backgroundColor}
                      onChange={(e) => updateThemeConfig({ backgroundColor: e.target.value })}
                      className="bg-muted/30 border-border/50 flex-1"
                    />
                    <div
                      className="h-10 w-10 rounded-lg border border-border/50 shadow-inner"
                      style={{ backgroundColor: themeConfig.backgroundColor }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <Button variant="outline" onClick={resetTheme} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset to Default
                </Button>
              </div>
            </BentoCardContent>
          </BentoCard>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
