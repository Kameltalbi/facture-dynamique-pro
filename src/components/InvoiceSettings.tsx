
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InvoiceSettingsProps {
  settings: {
    tva_active: boolean;
    remise_active: boolean;
    timbre_active: boolean;
    avance_active: boolean;
    devise: "DT" | "EUR" | "USD";
  };
  onChange: (settings: {
    tva_active: boolean;
    remise_active: boolean;
    timbre_active: boolean;
    avance_active: boolean;
    devise: "DT" | "EUR" | "USD";
  }) => void;
  onClose: () => void;
}

const InvoiceSettings = ({ settings, onChange, onClose }: InvoiceSettingsProps) => {
  const handleToggle = (field: keyof typeof settings) => {
    if (typeof settings[field] === "boolean") {
      onChange({
        ...settings,
        [field]: !settings[field as keyof typeof settings],
      });
    }
  };

  const handleDeviseChange = (devise: "DT" | "EUR" | "USD") => {
    onChange({
      ...settings,
      devise,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Options de la facture</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="tva-switch" className="flex items-center space-x-2">
            <span>Afficher la TVA</span>
          </Label>
          <Switch
            id="tva-switch"
            checked={settings.tva_active}
            onCheckedChange={() => handleToggle("tva_active")}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="remise-switch" className="flex items-center space-x-2">
            <span>Activer les remises</span>
          </Label>
          <Switch
            id="remise-switch"
            checked={settings.remise_active}
            onCheckedChange={() => handleToggle("remise_active")}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="timbre-switch" className="flex items-center space-x-2">
            <span>Timbre fiscal</span>
          </Label>
          <Switch
            id="timbre-switch"
            checked={settings.timbre_active}
            onCheckedChange={() => handleToggle("timbre_active")}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="avance-switch" className="flex items-center space-x-2">
            <span>Avance sur facture</span>
          </Label>
          <Switch
            id="avance-switch"
            checked={settings.avance_active}
            onCheckedChange={() => handleToggle("avance_active")}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="devise-select">Devise</Label>
          <Select
            value={settings.devise}
            onValueChange={(value) => handleDeviseChange(value as "DT" | "EUR" | "USD")}
          >
            <SelectTrigger id="devise-select">
              <SelectValue placeholder="Sélectionner une devise" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DT">Dinar Tunisien (DT)</SelectItem>
              <SelectItem value="EUR">Euro (€)</SelectItem>
              <SelectItem value="USD">Dollar ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={onClose}>Fermer</Button>
      </div>
    </div>
  );
};

export default InvoiceSettings;
