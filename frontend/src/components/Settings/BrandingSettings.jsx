import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useAppSettings } from '../../contexts/AppSettingsContext';
import PearLogo from '../Layout/PearLogo';
import { Palette, Type, Image, RotateCcw, Check, Sparkles } from 'lucide-react';

const BrandingSettings = () => {
  const { settings, updateSettings, resetSettings } = useAppSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetSettings();
    setLocalSettings({
      appName: 'Pears',
      slogan: 'Paired for Production, Performance, Partnership',
      logoType: 'default',
      customLogoUrl: '',
      logoEmoji: '🍐',
    });
  };

  const renderLogoPreview = () => {
    switch (localSettings.logoType) {
      case 'emoji':
        return <span className="text-4xl">{localSettings.logoEmoji}</span>;
      case 'custom':
        return localSettings.customLogoUrl ? (
          <img 
            src={localSettings.customLogoUrl} 
            alt="Custom Logo" 
            className="w-10 h-10 object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
            <Image className="w-5 h-5" />
          </div>
        );
      default:
        return <PearLogo size={40} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Branding Header */}
      <Card className="border-neon-500/20 bg-gradient-to-br from-gray-900/5 to-neon-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-neon-500" />
            App Branding
          </CardTitle>
          <CardDescription>
            Customize your Pears app name, logo, and slogan
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl">
            <div className="flex items-center gap-3">
              {renderLogoPreview()}
              <div>
                <h3 className="text-xl font-bold text-neon-400">{localSettings.appName || 'Pears'}</h3>
                <p className="text-xs text-neon-300/70">{localSettings.slogan || 'Your slogan here'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Name */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Type className="w-4 h-4" />
            App Name & Slogan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="appName">App Name</Label>
            <Input
              id="appName"
              value={localSettings.appName}
              onChange={(e) => setLocalSettings({ ...localSettings, appName: e.target.value })}
              placeholder="Pears"
              className="mt-1"
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">Max 20 characters</p>
          </div>
          <div>
            <Label htmlFor="slogan">Slogan</Label>
            <Input
              id="slogan"
              value={localSettings.slogan}
              onChange={(e) => setLocalSettings({ ...localSettings, slogan: e.target.value })}
              placeholder="Paired for Production, Performance, Partnership"
              className="mt-1"
              maxLength={60}
            />
            <p className="text-xs text-gray-500 mt-1">Max 60 characters</p>
          </div>
        </CardContent>
      </Card>

      {/* Logo Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Logo Style
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={localSettings.logoType}
            onValueChange={(value) => setLocalSettings({ ...localSettings, logoType: value })}
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-neon-300 transition-colors">
              <RadioGroupItem value="default" id="logo-default" />
              <Label htmlFor="logo-default" className="flex items-center gap-3 cursor-pointer flex-1">
                <PearLogo size={32} />
                <div>
                  <p className="font-medium">3D Neon Pear (Default)</p>
                  <p className="text-xs text-gray-500">Animated neon green pear logo</p>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-neon-300 transition-colors">
              <RadioGroupItem value="emoji" id="logo-emoji" />
              <Label htmlFor="logo-emoji" className="flex items-center gap-3 cursor-pointer flex-1">
                <span className="text-3xl">🍐</span>
                <div>
                  <p className="font-medium">Emoji</p>
                  <p className="text-xs text-gray-500">Simple emoji-based logo</p>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-neon-300 transition-colors">
              <RadioGroupItem value="custom" id="logo-custom" />
              <Label htmlFor="logo-custom" className="flex items-center gap-3 cursor-pointer flex-1">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Image className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium">Custom Image</p>
                  <p className="text-xs text-gray-500">Use your own logo URL</p>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {/* Emoji Selector */}
          {localSettings.logoType === 'emoji' && (
            <div className="pt-3 border-t">
              <Label>Select Emoji</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {['🍐', '🍏', '🍎', '🥝', '🌿', '💚', '✨', '⚡'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setLocalSettings({ ...localSettings, logoEmoji: emoji })}
                    className={`text-2xl p-2 rounded-lg transition-all ${
                      localSettings.logoEmoji === emoji
                        ? 'bg-neon-100 ring-2 ring-neon-500'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom URL Input */}
          {localSettings.logoType === 'custom' && (
            <div className="pt-3 border-t">
              <Label htmlFor="customLogoUrl">Logo URL</Label>
              <Input
                id="customLogoUrl"
                value={localSettings.customLogoUrl}
                onChange={(e) => setLocalSettings({ ...localSettings, customLogoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended size: 64x64px, PNG or SVG</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset to Default
        </Button>
        <Button onClick={handleSave} className="gap-2 bg-neon-500 hover:bg-neon-600 text-black">
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved!
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
};

export default BrandingSettings;
