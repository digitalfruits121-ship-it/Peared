import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import AISettings from './AISettings';
import FileSettings from './FileSettings';
import IntegrationsSettings from './IntegrationsSettings';
import GitHubSettings from './GitHubSettings';
import { Bot, Bell, FolderOpen, Database, Plug, GitBranch } from 'lucide-react';

const SettingsPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">Manage your board, AI integration, and file repository settings</p>
      </div>

      <Tabs defaultValue="ai" className="space-y-4 md:space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="bg-gray-100 p-1 inline-flex min-w-max">
            <TabsTrigger value="ai" className="gap-1.5 md:gap-2 text-xs md:text-sm px-2 md:px-3">
              <Bot className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">AI</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-1.5 md:gap-2 text-xs md:text-sm px-2 md:px-3">
              <Plug className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="github" className="gap-1.5 md:gap-2 text-xs md:text-sm px-2 md:px-3">
              <GitBranch className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">GitHub</span>
            </TabsTrigger>
            <TabsTrigger value="files" className="gap-1.5 md:gap-2 text-xs md:text-sm px-2 md:px-3">
              <FolderOpen className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">Files</span>
            </TabsTrigger>
            <TabsTrigger value="board" className="gap-1.5 md:gap-2 text-xs md:text-sm px-2 md:px-3">
              <Database className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">Board</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5 md:gap-2 text-xs md:text-sm px-2 md:px-3">
              <Bell className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden xs:inline">Alerts</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ai">
          <AISettings />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsSettings />
        </TabsContent>

        <TabsContent value="github">
          <GitHubSettings />
        </TabsContent>

        <TabsContent value="files">
          <FileSettings />
        </TabsContent>

        <TabsContent value="board">
          <Card>
            <CardHeader>
              <CardTitle>Board Settings</CardTitle>
              <CardDescription>Configure your board preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Board Name</Label>
                  <Input defaultValue="Project Sync" className="mt-1" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input defaultValue="Human-AI collaborative project management board" className="mt-1" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Public Board</Label>
                    <p className="text-sm text-gray-500">Allow anyone with the link to view</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-close completed cards</Label>
                    <p className="text-sm text-gray-500">Archive cards after 7 days in Done</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <Button className="bg-teal-500 hover:bg-teal-600">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Choose what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Card assignments</Label>
                  <p className="text-sm text-gray-500">When you're assigned to a card</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>AI task updates</Label>
                  <p className="text-sm text-gray-500">When AI completes or updates a task</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Comments & mentions</Label>
                  <p className="text-sm text-gray-500">When someone mentions you or comments</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sync conflicts</Label>
                  <p className="text-sm text-gray-500">When a version conflict is detected</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>File updates</Label>
                  <p className="text-sm text-gray-500">When files are created or modified</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button className="bg-teal-500 hover:bg-teal-600">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input defaultValue="Michael" className="mt-1" />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input defaultValue="B." className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" defaultValue="michael@example.com" className="mt-1" />
              </div>
              <div>
                <Label>Avatar URL</Label>
                <Input defaultValue="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" className="mt-1" />
              </div>
              <Button className="bg-teal-500 hover:bg-teal-600">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
