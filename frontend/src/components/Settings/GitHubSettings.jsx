import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  FolderGit,
  History,
  AlertCircle,
  Loader2,
  ExternalLink,
  Settings2,
  Plus,
  Save,
} from 'lucide-react';

// Mock GitHub data
const mockGitHubConfig = {
  connected: true,
  username: 'developer',
  repo: 'syncboard-project',
  branch: 'main',
  lastPush: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  lastPull: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
};

const mockCommitHistory = [
  {
    id: 'abc123',
    message: 'Update card API endpoints',
    author: 'developer',
    date: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    files: 3,
  },
  {
    id: 'def456',
    message: 'Add file repository feature',
    author: 'ai-claude',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    files: 5,
  },
  {
    id: 'ghi789',
    message: 'Fix version conflict handling',
    author: 'developer',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    files: 2,
  },
  {
    id: 'jkl012',
    message: 'Initial board setup',
    author: 'developer',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    files: 10,
  },
];

const mockBranches = ['main', 'develop', 'feature/ai-integration', 'feature/file-repo'];

const mockChangedFiles = [
  { path: 'src/components/Board/Board.jsx', status: 'modified' },
  { path: 'src/data/mockData.js', status: 'modified' },
  { path: 'backend/routes.py', status: 'modified' },
  { path: 'src/components/Files/FileRepository.jsx', status: 'added' },
];

const CommitDialog = ({ open, onClose, onCommit, changedFiles }) => {
  const [message, setMessage] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState(changedFiles.map(f => f.path));
  const [isCommitting, setIsCommitting] = useState(false);

  const handleCommit = async () => {
    if (!message.trim()) return;
    setIsCommitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onCommit({ message, description, files: selectedFiles });
    setIsCommitting(false);
    setMessage('');
    setDescription('');
    onClose();
  };

  const toggleFile = (path) => {
    if (selectedFiles.includes(path)) {
      setSelectedFiles(selectedFiles.filter(p => p !== path));
    } else {
      setSelectedFiles([...selectedFiles, path]);
    }
  };

  const statusColors = {
    modified: 'text-yellow-600 bg-yellow-50',
    added: 'text-green-600 bg-green-50',
    deleted: 'text-red-600 bg-red-50',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCommit className="w-5 h-5" /> Create Commit
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label>Commit Message *</Label>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Brief description of changes"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Extended Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed explanation of changes..."
              className="mt-1 h-20"
            />
          </div>

          <div>
            <Label className="mb-2 block">Files to Commit ({selectedFiles.length}/{changedFiles.length})</Label>
            <ScrollArea className="h-40 border rounded-lg">
              <div className="p-2 space-y-1">
                {changedFiles.map(file => (
                  <label
                    key={file.path}
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.path)}
                      onChange={() => toggleFile(file.path)}
                      className="rounded"
                    />
                    <span className={`text-xs px-1.5 py-0.5 rounded ${statusColors[file.status]}`}>
                      {file.status[0].toUpperCase()}
                    </span>
                    <span className="text-sm font-mono truncate">{file.path}</span>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleCommit}
            disabled={!message.trim() || selectedFiles.length === 0 || isCommitting}
            className="bg-teal-500 hover:bg-teal-600 gap-2"
          >
            {isCommitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Committing...</>
            ) : (
              <><GitCommit className="w-4 h-4" /> Commit Changes</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const PushDialog = ({ open, onClose, onPush, branch, commits }) => {
  const [isPushing, setIsPushing] = useState(false);
  const [forcePush, setForcePush] = useState(false);

  const handlePush = async () => {
    setIsPushing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    onPush({ branch, force: forcePush });
    setIsPushing(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" /> Push to Remote
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Branch:</span>
              <span className="font-mono font-medium">{branch}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-600">Commits to push:</span>
              <span className="font-medium">{commits}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label>Force Push</Label>
              <p className="text-xs text-gray-500">Overwrite remote history (use with caution)</p>
            </div>
            <Switch checked={forcePush} onCheckedChange={setForcePush} />
          </div>

          {forcePush && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Warning: This will overwrite remote history!</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handlePush}
            disabled={isPushing}
            className="bg-teal-500 hover:bg-teal-600 gap-2"
          >
            {isPushing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Pushing...</>
            ) : (
              <><Upload className="w-4 h-4" /> Push Changes</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const GitHubSettings = () => {
  const [config, setConfig] = useState(mockGitHubConfig);
  const [commits, setCommits] = useState(mockCommitHistory);
  const [branches, setBranches] = useState(mockBranches);
  const [changedFiles, setChangedFiles] = useState(mockChangedFiles);
  const [selectedBranch, setSelectedBranch] = useState(config.branch);
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [showPushDialog, setShowPushDialog] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSyncing(false);
  };

  const handlePull = async () => {
    setIsPulling(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setConfig({ ...config, lastPull: new Date().toISOString() });
    setIsPulling(false);
  };

  const handleCommit = (commitData) => {
    const newCommit = {
      id: Math.random().toString(36).substr(2, 6),
      message: commitData.message,
      author: config.username,
      date: new Date().toISOString(),
      files: commitData.files.length,
    };
    setCommits([newCommit, ...commits]);
    setChangedFiles([]);
  };

  const handlePush = (pushData) => {
    setConfig({ ...config, lastPush: new Date().toISOString() });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderGit className="w-5 h-5 text-gray-800" />
                GitHub Integration
              </CardTitle>
              <CardDescription className="mt-1">
                Push, pull, and manage your repository
              </CardDescription>
            </div>
            <Badge className={config.connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
              {config.connected ? (
                <><CheckCircle className="w-3 h-3 mr-1" /> Connected</>
              ) : (
                <><XCircle className="w-3 h-3 mr-1" /> Disconnected</>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Repository</p>
              <p className="font-mono font-medium">{config.username}/{config.repo}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Last Push</p>
              <p className="font-medium">{formatTime(config.lastPush)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Last Pull</p>
              <p className="font-medium">{formatTime(config.lastPull)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleSync}
              disabled={isSyncing}
              variant="outline"
              className="gap-2"
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Sync Status
            </Button>

            <Button
              onClick={handlePull}
              disabled={isPulling}
              variant="outline"
              className="gap-2"
            >
              {isPulling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Pull Changes
            </Button>

            <Button
              onClick={() => setShowCommitDialog(true)}
              disabled={changedFiles.length === 0}
              className="gap-2 bg-teal-500 hover:bg-teal-600"
            >
              <GitCommit className="w-4 h-4" />
              Commit ({changedFiles.length})
            </Button>

            <Button
              onClick={() => setShowPushDialog(true)}
              className="gap-2 bg-blue-500 hover:bg-blue-600"
            >
              <Upload className="w-4 h-4" />
              Push
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Branch Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Branch
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {branches.map(branch => (
                  <SelectItem key={branch} value={branch}>
                    <span className="flex items-center gap-2">
                      <GitBranch className="w-3 h-3" />
                      {branch}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="w-3 h-3" /> New Branch
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Changed Files */}
      {changedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Changed Files ({changedFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {changedFiles.map(file => (
                <div key={file.path} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <Badge
                    className={`text-[10px] ${
                      file.status === 'modified' ? 'bg-yellow-100 text-yellow-700' :
                      file.status === 'added' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}
                  >
                    {file.status}
                  </Badge>
                  <span className="font-mono text-sm">{file.path}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commit History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4" />
            Recent Commits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {commits.slice(0, 5).map(commit => (
              <div key={commit.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <GitCommit className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{commit.message}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="font-mono">{commit.id}</span>
                    <span>{commit.author}</span>
                    <span>{formatTime(commit.date)}</span>
                    <span>{commit.files} files</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Repository Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Repository Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Repository URL</Label>
            <Input
              value={`https://github.com/${config.username}/${config.repo}`}
              readOnly
              className="mt-1 font-mono bg-gray-50"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-commit on card changes</Label>
              <p className="text-xs text-gray-500">Automatically create commits when cards are updated</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-push on commit</Label>
              <p className="text-xs text-gray-500">Automatically push after each commit</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Sync files to repository</Label>
              <p className="text-xs text-gray-500">Keep instruction files synced with repo</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CommitDialog
        open={showCommitDialog}
        onClose={() => setShowCommitDialog(false)}
        onCommit={handleCommit}
        changedFiles={changedFiles}
      />

      <PushDialog
        open={showPushDialog}
        onClose={() => setShowPushDialog(false)}
        onPush={handlePush}
        branch={selectedBranch}
        commits={1}
      />
    </div>
  );
};

export default GitHubSettings;
