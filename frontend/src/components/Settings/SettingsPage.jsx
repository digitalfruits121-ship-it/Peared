import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import AISettings from './AISettings';
import FileSettings from './FileSettings';
import { User, Bot, Bell, FolderOpen, Database } from 'lucide-react';

const SettingsPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your board, AI integration, and file repository settings</p>
      </div>

      <Tabs defaultValue="ai" className="space-y-6">
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger value="ai" className="gap-2">
            <Bot className="w-4 h-4" /> AI Integration
          </TabsTrigger>
          <TabsTrigger value="files" className="gap-2">
            <FolderOpen className="w-4 h-4" /> File Repository
          </TabsTrigger>
          <TabsTrigger value="board" className="gap-2">
            <Database className="w-4 h-4" /> Board Settings
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai">
          <AISettings />
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
