import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import {
  Plus,
  Plug,
  Key,
  CheckCircle,
  XCircle,
  Settings2,
  Trash2,
  RefreshCw,
  ExternalLink,
  Zap,
  Bot,
  Globe,
  Database,
  Mail,
  CreditCard,
  Cloud,
  Terminal,
} from 'lucide-react';

// Available integration types
const integrationTypes = [
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'AI Provider',
    icon: '🤖',
    description: 'GPT-4, GPT-3.5, DALL-E integration',
    fields: ['api_key'],
    docs: 'https://platform.openai.com/docs',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    category: 'AI Provider',
    icon: '🧠',
    description: 'Claude AI models integration',
    fields: ['api_key'],
    docs: 'https://docs.anthropic.com',
  },
  {
    id: 'google',
    name: 'Google AI',
    category: 'AI Provider',
    icon: '✨',
    description: 'Gemini, PaLM models integration',
    fields: ['api_key'],
    docs: 'https://ai.google.dev/docs',
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'Version Control',
    icon: '🐙',
    description: 'Repository sync, commits, PRs',
    fields: ['token', 'repo', 'branch'],
    docs: 'https://docs.github.com',
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    icon: '💬',
    description: 'Notifications and updates',
    fields: ['webhook_url', 'channel'],
    docs: 'https://api.slack.com/docs',
  },
  {
    id: 'linear',
    name: 'Linear',
    category: 'Project Management',
    icon: '📋',
    description: 'Issue tracking sync',
    fields: ['api_key', 'team_id'],
    docs: 'https://developers.linear.app',
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'Documentation',
    icon: '📝',
    description: 'Docs and database sync',
    fields: ['api_key', 'database_id'],
    docs: 'https://developers.notion.com',
  },
  {
    id: 'custom_mcp',
    name: 'Custom MCP',
    category: 'MCP',
    icon: '🔌',
    description: 'Model Context Protocol server',
    fields: ['server_url', 'api_key', 'config'],
    docs: 'https://modelcontextprotocol.io',
  },
];

// Mock configured integrations
const mockIntegrations = [
  {
    id: 'int-1',
    type: 'openai',
    name: 'OpenAI',
    status: 'connected',
    config: { api_key: 'sk-...redacted' },
    lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'int-2',
    type: 'github',
    name: 'GitHub',
    status: 'connected',
    config: { repo: 'user/syncboard', branch: 'main' },
    lastSync: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
];

const IntegrationCard = ({ integration, onConfigure, onDelete, onTest }) => {
  const typeInfo = integrationTypes.find(t => t.id === integration.type);
  const isConnected = integration.status === 'connected';

  return (
    <div className="p-4 rounded-lg border border-gray-200 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{typeInfo?.icon || '🔌'}</span>
          <div>
            <h4 className="font-medium text-gray-900">{integration.name}</h4>
            <p className="text-xs text-gray-500">{typeInfo?.category}</p>
          </div>
        </div>
        <Badge className={isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
          {isConnected ? (
            <><CheckCircle className="w-3 h-3 mr-1" /> Connected</>
          ) : (
            <><XCircle className="w-3 h-3 mr-1" /> Disconnected</>
          )}
        </Badge>
      </div>

      {integration.config?.repo && (
        <div className="mt-3 text-sm text-gray-600">
          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
            {integration.config.repo}
          </span>
          {integration.config.branch && (
            <span className="ml-2 text-gray-400">({integration.config.branch})</span>
          )}
        </div>
      )}

      {integration.lastSync && (
        <p className="mt-2 text-xs text-gray-400">
          Last sync: {new Date(integration.lastSync).toLocaleTimeString()}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onConfigure(integration)}>
          <Settings2 className="w-3 h-3 mr-1" /> Configure
        </Button>
        <Button variant="outline" size="sm" onClick={() => onTest(integration)}>
          <RefreshCw className="w-3 h-3 mr-1" /> Test
        </Button>
        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => onDelete(integration.id)}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

const AddIntegrationDialog = ({ open, onClose, onAdd }) => {
  const [selectedType, setSelectedType] = useState('');
  const [config, setConfig] = useState({});
  const [name, setName] = useState('');

  const typeInfo = integrationTypes.find(t => t.id === selectedType);

  const handleAdd = () => {
    if (!selectedType) return;
    onAdd({
      id: `int-${Date.now()}`,
      type: selectedType,
      name: name || typeInfo?.name,
      status: 'pending',
      config,
    });
    setSelectedType('');
    setConfig({});
    setName('');
    onClose();
  };

  const categories = [...new Set(integrationTypes.map(t => t.category))];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plug className="w-5 h-5" /> Add Integration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label>Integration Type</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select an integration..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <div key={category}>
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                      {category}
                    </div>
                    {integrationTypes
                      .filter(t => t.category === category)
                      .map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          <span className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            <span>{type.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          {typeInfo && (
            <>
              <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                {typeInfo.description}
                <a
                  href={typeInfo.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex items-center hover:underline"
                >
                  Docs <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>

              <div>
                <Label>Display Name (optional)</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={typeInfo.name}
                  className="mt-1"
                />
              </div>

              {typeInfo.fields.includes('api_key') && (
                <div>
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={config.api_key || ''}
                    onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
                    placeholder="Enter your API key"
                    className="mt-1 font-mono"
                  />
                </div>
              )}

              {typeInfo.fields.includes('token') && (
                <div>
                  <Label>Access Token</Label>
                  <Input
                    type="password"
                    value={config.token || ''}
                    onChange={(e) => setConfig({ ...config, token: e.target.value })}
                    placeholder="Enter your access token"
                    className="mt-1 font-mono"
                  />
                </div>
              )}

              {typeInfo.fields.includes('repo') && (
                <div>
                  <Label>Repository</Label>
                  <Input
                    value={config.repo || ''}
                    onChange={(e) => setConfig({ ...config, repo: e.target.value })}
                    placeholder="owner/repository"
                    className="mt-1 font-mono"
                  />
                </div>
              )}

              {typeInfo.fields.includes('branch') && (
                <div>
                  <Label>Branch</Label>
                  <Input
                    value={config.branch || ''}
                    onChange={(e) => setConfig({ ...config, branch: e.target.value })}
                    placeholder="main"
                    className="mt-1 font-mono"
                  />
                </div>
              )}

              {typeInfo.fields.includes('server_url') && (
                <div>
                  <Label>Server URL</Label>
                  <Input
                    value={config.server_url || ''}
                    onChange={(e) => setConfig({ ...config, server_url: e.target.value })}
                    placeholder="https://mcp-server.example.com"
                    className="mt-1 font-mono"
                  />
                </div>
              )}

              {typeInfo.fields.includes('webhook_url') && (
                <div>
                  <Label>Webhook URL</Label>
                  <Input
                    value={config.webhook_url || ''}
                    onChange={(e) => setConfig({ ...config, webhook_url: e.target.value })}
                    placeholder="https://hooks.slack.com/..."
                    className="mt-1 font-mono"
                  />
                </div>
              )}

              {typeInfo.fields.includes('config') && (
                <div>
                  <Label>Configuration (JSON)</Label>
                  <Textarea
                    value={config.config || ''}
                    onChange={(e) => setConfig({ ...config, config: e.target.value })}
                    placeholder='{"tools": [], "resources": []}'
                    className="mt-1 font-mono text-sm h-24"
                  />
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAdd} disabled={!selectedType} className="bg-teal-500 hover:bg-teal-600">
            Add Integration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const IntegrationsSettings = () => {
  const [integrations, setIntegrations] = useState(mockIntegrations);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [testingId, setTestingId] = useState(null);

  const handleAddIntegration = (integration) => {
    setIntegrations([...integrations, { ...integration, status: 'connected' }]);
  };

  const handleDeleteIntegration = (id) => {
    setIntegrations(integrations.filter(i => i.id !== id));
  };

  const handleTestIntegration = async (integration) => {
    setTestingId(integration.id);
    // Simulate test
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTestingId(null);
  };

  const handleConfigureIntegration = (integration) => {
    // Would open config dialog
    console.log('Configure:', integration);
  };

  const categories = [...new Set(integrations.map(i => {
    const type = integrationTypes.find(t => t.id === i.type);
    return type?.category || 'Other';
  }))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Plug className="w-5 h-5 text-blue-600" />
                Integrations & MCPs
              </CardTitle>
              <CardDescription className="mt-1">
                Connect third-party services and Model Context Protocol servers
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2 bg-teal-500 hover:bg-teal-600">
              <Plus className="w-4 h-4" /> Add Integration
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Emergent Universal Key Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-600" />
            Emergent Universal Key
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Universal AI Access</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Single key for OpenAI, Anthropic, and Google AI models
                </p>
              </div>
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" /> Active
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Manage balance: Profile → Universal Key → Add Balance
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configured Integrations */}
      {integrations.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configured Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {integrations.map(integration => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConfigure={handleConfigureIntegration}
                  onDelete={handleDeleteIntegration}
                  onTest={handleTestIntegration}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Plug className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="font-medium text-gray-900">No integrations configured</h3>
            <p className="text-sm text-gray-500 mt-1">Add your first integration to get started</p>
            <Button onClick={() => setShowAddDialog(true)} className="mt-4 gap-2">
              <Plus className="w-4 h-4" /> Add Integration
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available Integrations</CardTitle>
          <CardDescription>Browse and add new integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {integrationTypes.map(type => {
              const isConfigured = integrations.some(i => i.type === type.id);
              return (
                <button
                  key={type.id}
                  onClick={() => !isConfigured && setShowAddDialog(true)}
                  disabled={isConfigured}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    isConfigured
                      ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50 cursor-pointer'
                  }`}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <h4 className="font-medium text-gray-900 mt-2">{type.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{type.category}</p>
                  {isConfigured && (
                    <Badge className="mt-2 bg-green-100 text-green-700 text-[10px]">
                      Configured
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add Integration Dialog */}
      <AddIntegrationDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddIntegration}
      />
    </div>
  );
};

export default IntegrationsSettings;
