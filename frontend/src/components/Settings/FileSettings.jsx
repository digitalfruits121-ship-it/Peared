import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { FolderOpen, FileText, Bot, User, Link, Edit, Eye, Upload, Shield } from 'lucide-react';

const FileSettings = () => {
  const [settings, setSettings] = useState({
    enableFileRepo: true,
    allowUIEditing: true,
    allowCardLinking: true,
    aiReadAccess: true,
    aiWriteAccess: true,
    maxFileSize: 5, // MB
    allowedTypes: ['markdown', 'json', 'image'],
  });

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="space-y-6">
      {/* File Repository Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-600" />
                File Repository Settings
              </CardTitle>
              <CardDescription className="mt-1">
                Configure file storage for project documentation, instructions, and artifacts.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">File Repo</span>
              <Switch
                checked={settings.enableFileRepo}
                onCheckedChange={() => handleToggle('enableFileRepo')}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Access Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Access Permissions
          </CardTitle>
          <CardDescription>
            Control who can read and write files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Human Access */}
          <div className="p-4 rounded-lg border border-teal-200 bg-teal-50/50">
            <div className="flex items-center gap-3 mb-3">
              <User className="w-5 h-5 text-teal-600" />
              <h4 className="font-medium text-gray-900">Human Access</h4>
            </div>
            <div className="space-y-3 pl-8">
              <div className="flex items-center justify-between">
                <div>
                  <Label>UI Editing</Label>
                  <p className="text-xs text-gray-500">Edit files directly in the browser</p>
                </div>
                <Switch
                  checked={settings.allowUIEditing}
                  onCheckedChange={() => handleToggle('allowUIEditing')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Card Linking</Label>
                  <p className="text-xs text-gray-500">Link files to specific task cards</p>
                </div>
                <Switch
                  checked={settings.allowCardLinking}
                  onCheckedChange={() => handleToggle('allowCardLinking')}
                />
              </div>
            </div>
          </div>

          {/* AI Access */}
          <div className="p-4 rounded-lg border border-purple-200 bg-purple-50/50">
            <div className="flex items-center gap-3 mb-3">
              <Bot className="w-5 h-5 text-purple-600" />
              <h4 className="font-medium text-gray-900">AI Access</h4>
            </div>
            <div className="space-y-3 pl-8">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Read Access</Label>
                  <p className="text-xs text-gray-500">AI can read files for context and instructions</p>
                </div>
                <Switch
                  checked={settings.aiReadAccess}
                  onCheckedChange={() => handleToggle('aiReadAccess')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Write Access</Label>
                  <p className="text-xs text-gray-500">AI can create and modify files</p>
                </div>
                <Switch
                  checked={settings.aiWriteAccess}
                  onCheckedChange={() => handleToggle('aiWriteAccess')}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Allowed File Types
          </CardTitle>
          <CardDescription>
            Configure which file types can be uploaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['markdown', 'json', 'image', 'code'].map((type) => (
              <Badge
                key={type}
                variant={settings.allowedTypes.includes(type) ? 'default' : 'outline'}
                className={`cursor-pointer transition-all ${
                  settings.allowedTypes.includes(type)
                    ? 'bg-teal-500 hover:bg-teal-600'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => {
                  const newTypes = settings.allowedTypes.includes(type)
                    ? settings.allowedTypes.filter(t => t !== type)
                    : [...settings.allowedTypes, type];
                  setSettings({ ...settings, allowedTypes: newTypes });
                }}
              >
                {type === 'markdown' && '.md'}
                {type === 'json' && '.json'}
                {type === 'image' && '.png/.jpg'}
                {type === 'code' && '.js/.py'}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Storage Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Storage Limits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Max File Size (MB)</Label>
            <Input
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) || 5 })}
              className="mt-1 w-32"
              min={1}
              max={50}
            />
            <p className="text-xs text-gray-500 mt-1">Maximum size per file upload</p>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Link className="w-4 h-4" />
            File API Endpoints
          </CardTitle>
          <CardDescription>
            Use these endpoints for programmatic file access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 font-mono text-sm">
            <div className="p-3 bg-gray-900 text-gray-100 rounded-lg">
              <span className="text-green-400">GET</span> /api/files
              <span className="text-gray-500 ml-2">- List all files</span>
            </div>
            <div className="p-3 bg-gray-900 text-gray-100 rounded-lg">
              <span className="text-green-400">GET</span> /api/files/:id
              <span className="text-gray-500 ml-2">- Get file content</span>
            </div>
            <div className="p-3 bg-gray-900 text-gray-100 rounded-lg">
              <span className="text-blue-400">POST</span> /api/files
              <span className="text-gray-500 ml-2">- Create new file</span>
            </div>
            <div className="p-3 bg-gray-900 text-gray-100 rounded-lg">
              <span className="text-yellow-400">PUT</span> /api/files/:id
              <span className="text-gray-500 ml-2">- Update file</span>
            </div>
            <div className="p-3 bg-gray-900 text-gray-100 rounded-lg">
              <span className="text-red-400">DELETE</span> /api/files/:id
              <span className="text-gray-500 ml-2">- Delete file</span>
            </div>
            <div className="p-3 bg-gray-900 text-gray-100 rounded-lg">
              <span className="text-purple-400">GET</span> /api/cards/:cardId/files
              <span className="text-gray-500 ml-2">- Get files linked to card</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="bg-teal-500 hover:bg-teal-600">Save Settings</Button>
    </div>
  );
};

export default FileSettings;
