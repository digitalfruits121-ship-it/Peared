import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Bot, Key, RefreshCw, Zap, Shield, Clock, CheckCircle, AlertCircle, Settings2, Cpu } from 'lucide-react';
import { mockAISettings } from '../../data/mockData';

const AISettings = () => {
  const [settings, setSettings] = useState(mockAISettings);
  const [testStatus, setTestStatus] = useState(null); // null, 'testing', 'success', 'error'

  const handleProviderToggle = (providerId) => {
    setSettings({
      ...settings,
      providers: settings.providers.map(p =>
        p.id === providerId ? { ...p, enabled: !p.enabled } : p
      ),
    });
  };

  const handleModelChange = (providerId, model) => {
    setSettings({
      ...settings,
      providers: settings.providers.map(p =>
        p.id === providerId ? { ...p, model } : p
      ),
    });
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTestStatus('success');
    setTimeout(() => setTestStatus(null), 3000);
  };

  const providerModels = {
    openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    google: ['gemini-2.0-flash', 'gemini-pro', 'gemini-pro-vision'],
  };

  const providerIcons = {
    openai: '🤖',
    anthropic: '🧠',
    google: '✨',
  };

  return (
    <div className="space-y-6">
      {/* AI Integration Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-600" />
                AI Integration Settings
              </CardTitle>
              <CardDescription className="mt-1">
                Configure AI agents to access and modify the board. AI can read/write cards, move tasks, and sync changes.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">AI Access</span>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(enabled) => setSettings({ ...settings, enabled })}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Configuration
          </CardTitle>
          <CardDescription>
            Using Emergent Universal Key for all AI providers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Emergent Universal Key</h4>
                  <p className="text-sm text-gray-600">Single key for OpenAI, Anthropic, and Google</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" /> Active
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Poll Interval (ms)</Label>
              <Select
                value={settings.pollInterval.toString()}
                onValueChange={(value) => setSettings({ ...settings, pollInterval: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1000">1 second</SelectItem>
                  <SelectItem value="3000">3 seconds</SelectItem>
                  <SelectItem value="5000">5 seconds</SelectItem>
                  <SelectItem value="10000">10 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Auto-assign AI Tasks</Label>
              <div className="flex items-center gap-2 mt-2">
                <Switch
                  checked={settings.autoAssign}
                  onCheckedChange={(autoAssign) => setSettings({ ...settings, autoAssign })}
                />
                <span className="text-sm text-gray-500">Automatically assign tasks marked as AI</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            AI Providers
          </CardTitle>
          <CardDescription>
            Enable and configure individual AI providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.providers.map((provider) => (
              <div
                key={provider.id}
                className={`p-4 rounded-lg border transition-all ${
                  provider.enabled
                    ? 'border-purple-200 bg-purple-50/50'
                    : 'border-gray-200 bg-gray-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{providerIcons[provider.id]}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{provider.name}</h4>
                      <p className="text-sm text-gray-500">Model: {provider.model}</p>
                    </div>
                  </div>
                  <Switch
                    checked={provider.enabled}
                    onCheckedChange={() => handleProviderToggle(provider.id)}
                  />
                </div>
                {provider.enabled && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Label>Model Selection</Label>
                    <Select
                      value={provider.model}
                      onValueChange={(value) => handleModelChange(provider.id, value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {providerModels[provider.id]?.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connection Test */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Connection Test
          </CardTitle>
          <CardDescription>
            Test the connection to AI providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="gap-2"
            >
              {testStatus === 'testing' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Test Connection
                </>
              )}
            </Button>
            {testStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Connection successful!</span>
              </div>
            )}
            {testStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Connection failed</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            API Endpoints for AI Access
          </CardTitle>
          <CardDescription>
            Use these endpoints to give AI agents access to the board
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 font-mono text-sm">
            <div className="p-3 bg-gray-900 text-gray-100 rounded-lg">
              <span className="text-green-400">GET</span> /api/boards/:boardId/cards
            </div>
            <div className="p-3 bg-gray-900 text-gray-100 rounded-lg">
              <span className="text-blue-400">POST</span> /api/boards/:boardId/cards
            </div>
            <div className="p-3 bg-gray-900 text-gray-100 rounded-lg">
              <span className="text-yellow-400">PUT</span> /api/cards/:cardId
            </div>
            <div className="p-3 bg-gray-900 text-gray-100 rounded-lg">
              <span className="text-red-400">DELETE</span> /api/cards/:cardId
            </div>
            <div className="p-3 bg-gray-900 text-gray-100 rounded-lg">
              <span className="text-purple-400">PATCH</span> /api/cards/:cardId/move
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AISettings;
