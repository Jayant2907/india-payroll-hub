import { useState } from 'react';
import { Building2, FileCheck, Settings, Palette, Save, RotateCcw } from 'lucide-react';
import { BentoCard, BentoCardHeader, BentoCardTitle, BentoCardContent } from '@/components/ui/bento-card';
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
  const { themeConfig, updateThemeConfig, resetTheme, toggleTheme } = useTheme();
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Company Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization details and payroll configuration
        </p>
      </div>

      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList className="glass-card">
          <TabsTrigger value="organization" className="gap-2">
            <Building2 className="h-4 w-4" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="statutory" className="gap-2">
            <FileCheck className="h-4 w-4" />
            Statutory
          </TabsTrigger>
          <TabsTrigger value="payroll" className="gap-2">
            <Settings className="h-4 w-4" />
            Payroll
          </TabsTrigger>
          <TabsTrigger value="theme" className="gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </TabsTrigger>
        </TabsList>

        {/* Organization Details */}
        <TabsContent value="organization">
          <BentoCard>
            <BentoCardHeader>
              <BentoCardTitle>Organization Details</BentoCardTitle>
            </BentoCardHeader>
            <BentoCardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="legalName">Legal Name</Label>
                  <Input
                    id="legalName"
                    value={config.legalName}
                    onChange={(e) => handleConfigChange('legalName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tradeName">Trade Name</Label>
                  <Input
                    id="tradeName"
                    value={config.tradeName}
                    onChange={(e) => handleConfigChange('tradeName', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={config.address}
                  onChange={(e) => handleConfigChange('address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={config.city}
                    onChange={(e) => handleConfigChange('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={config.state}
                    onChange={(e) => handleConfigChange('state', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={config.pincode}
                    onChange={(e) => handleConfigChange('pincode', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cin">CIN (Corporate Identification Number)</Label>
                <Input
                  id="cin"
                  value={config.cin}
                  onChange={(e) => handleConfigChange('cin', e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveConfig} className="gap-2">
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
              <BentoCardTitle>Statutory Registrations</BentoCardTitle>
            </BentoCardHeader>
            <BentoCardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN</Label>
                  <Input
                    id="pan"
                    value={config.pan}
                    onChange={(e) => handleConfigChange('pan', e.target.value.toUpperCase())}
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tan">TAN</Label>
                  <Input
                    id="tan"
                    value={config.tan}
                    onChange={(e) => handleConfigChange('tan', e.target.value.toUpperCase())}
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="epfCode">EPF Establishment Code</Label>
                  <Input
                    id="epfCode"
                    value={config.epfCode}
                    onChange={(e) => handleConfigChange('epfCode', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="esiNumber">ESI Employer Code</Label>
                  <Input
                    id="esiNumber"
                    value={config.esiNumber}
                    onChange={(e) => handleConfigChange('esiNumber', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ptState">Professional Tax State</Label>
                  <Input
                    id="ptState"
                    value={config.ptState}
                    onChange={(e) => handleConfigChange('ptState', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lwfState">LWF State</Label>
                  <Input
                    id="lwfState"
                    value={config.lwfState}
                    onChange={(e) => handleConfigChange('lwfState', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveConfig} className="gap-2">
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
              <BentoCardTitle>Payroll Settings</BentoCardTitle>
            </BentoCardHeader>
            <BentoCardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payCycle">Pay Cycle</Label>
                  <Input
                    id="payCycle"
                    value="Monthly"
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payDay">Pay Day</Label>
                  <Input
                    id="payDay"
                    type="number"
                    min={1}
                    max={28}
                    value={config.payDay}
                    onChange={(e) => handleConfigChange('payDay', Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Day of month when salary is credited (1-28)
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveConfig} className="gap-2">
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
              <BentoCardTitle>Theme & Appearance</BentoCardTitle>
            </BentoCardHeader>
            <BentoCardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium">Color Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Switch between dark and light themes
                  </p>
                </div>
                <Button onClick={toggleTheme} variant="outline">
                  {themeConfig.mode === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      value={themeConfig.primaryColor}
                      onChange={(e) => updateThemeConfig({ primaryColor: e.target.value })}
                    />
                    <div
                      className="h-10 w-10 rounded-lg border"
                      style={{ backgroundColor: themeConfig.primaryColor }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sidebarColor">Sidebar Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="sidebarColor"
                      value={themeConfig.sidebarColor}
                      onChange={(e) => updateThemeConfig({ sidebarColor: e.target.value })}
                    />
                    <div
                      className="h-10 w-10 rounded-lg border"
                      style={{ backgroundColor: themeConfig.sidebarColor }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      value={themeConfig.backgroundColor}
                      onChange={(e) => updateThemeConfig({ backgroundColor: e.target.value })}
                    />
                    <div
                      className="h-10 w-10 rounded-lg border"
                      style={{ backgroundColor: themeConfig.backgroundColor }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={resetTheme} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset to Default
                </Button>
              </div>
            </BentoCardContent>
          </BentoCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
