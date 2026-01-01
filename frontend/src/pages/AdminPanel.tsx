import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

const AdminPanel: React.FC = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-6 md:gap-6 md:py-8">
          <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Admin Panel</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage content, users, and platform moderation
                  </p>
                </div>
              </div>
            </div>

            {/* Warning Alert */}
            <Alert className="mb-6 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-600 text-sm font-semibold">Admin Actions</AlertTitle>
              <AlertDescription className="text-orange-600/80 text-sm">
                All moderation actions are logged and irreversible. Use with caution.
              </AlertDescription>
            </Alert>

            {/* Admin Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="contributions">Contributions</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="credits">Credits</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Moderation Overview</CardTitle>
                    <CardDescription className="text-sm">
                      Platform statistics and recent moderation actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg bg-muted/30">
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-xs text-muted-foreground">Flagged Projects</p>
                      </div>
                      <div className="p-4 border rounded-lg bg-muted/30">
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-xs text-muted-foreground">Banned Users</p>
                      </div>
                      <div className="p-4 border rounded-lg bg-muted/30">
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-xs text-muted-foreground">Reversed Credits</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-base font-semibold mb-3">Available Actions</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-destructive mt-1.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Soft Delete Content</p>
                            <p className="text-muted-foreground text-xs">
                              Close projects or decline contributions (preserves data for audit)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-destructive mt-1.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Ban/Unban Users</p>
                            <p className="text-muted-foreground text-xs">
                              Deactivate or reactivate user accounts
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="h-2 w-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Reverse Credits</p>
                            <p className="text-muted-foreground text-xs">
                              Create offsetting entries to undo credit awards
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Projects Tab */}
              <TabsContent value="projects">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Moderate Projects</CardTitle>
                    <CardDescription className="text-sm">
                      Review and moderate project content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center py-8 text-sm">
                      Project moderation interface coming soon.
                      <br />
                      Navigate to a specific project to access moderation actions.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contributions Tab */}
              <TabsContent value="contributions">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Moderate Contributions</CardTitle>
                    <CardDescription className="text-sm">
                      Review and moderate contribution content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center py-8 text-sm">
                      Contribution moderation interface coming soon.
                      <br />
                      Navigate to a specific contribution to access moderation actions.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Moderate Users</CardTitle>
                    <CardDescription className="text-sm">
                      Ban or unban user accounts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center py-8 text-sm">
                      User moderation interface coming soon.
                      <br />
                      Navigate to a specific user profile to access moderation actions.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Credits Tab */}
              <TabsContent value="credits">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Credit Management</CardTitle>
                    <CardDescription className="text-sm">
                      Reverse credit transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center py-8 text-sm">
                      Credit management interface coming soon.
                      <br />
                      Navigate to a specific credit transaction to access reversal actions.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

