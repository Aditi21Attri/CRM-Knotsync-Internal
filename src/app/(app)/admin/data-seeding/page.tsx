'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatedPage } from '@/components/ui/animated-page';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Users, FileSpreadsheet, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { seedImmigrationData } from '@/lib/actions/seedImmigrationData';

export default function DataSeedingPage() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number; error?: string } | null>(null);

  const handleSeedData = async () => {
    try {
      setLoading(true);
      setResult(null);
      const response = await seedImmigrationData();
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to seed data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <AnimatedPage>
        <div className="text-center py-10">
          <p className="text-red-600">Access denied. Admin privileges required.</p>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <PageHeader
        title="Data Seeding"
        description="Initialize the database with sample immigration data for testing and demonstration"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Immigration Data Seeding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              This will create sample immigration customers with various visa types, 
              statuses, and case complexities to demonstrate the immigration CRM features.
            </p>
            
            <div className="space-y-2">
              <h4 className="font-medium">Sample Data Includes:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 5 Immigration customers with different visa types</li>
                <li>• Work visa, family visa, student visa, investor visa, skilled worker</li>
                <li>• Various payment statuses and compliance scores</li>
                <li>• Different countries and languages</li>
                <li>• Timeline milestones and document statuses</li>
              </ul>
            </div>

            <Button 
              onClick={handleSeedData} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Seeding Data...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Seed Immigration Data
                </>
              )}
            </Button>

            {result && (
              <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                    {result.message}
                    {result.count && ` (${result.count} customers created)`}
                    {result.error && `: ${result.error}`}
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Data Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">5</div>
                <div className="text-sm text-gray-600">Sample Customers</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">5</div>
                <div className="text-sm text-gray-600">Visa Types</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">6</div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">4</div>
                <div className="text-sm text-gray-600">Languages</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Visa Types Included:</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Work Visa</Badge>
                <Badge variant="outline">Family Visa</Badge>
                <Badge variant="outline">Student Visa</Badge>
                <Badge variant="outline">Investor Visa</Badge>
                <Badge variant="outline">Skilled Worker</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Countries Represented:</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">India (IN)</Badge>
                <Badge variant="secondary">Mexico (MX)</Badge>
                <Badge variant="secondary">China (CN)</Badge>
                <Badge variant="secondary">Egypt (EG)</Badge>
                <Badge variant="secondary">UK (GB)</Badge>
                <Badge variant="secondary">UAE (AE)</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              After seeding the data, you can:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Visit the Immigration Hub to see the dashboard with real data</li>
              <li>• Check Revenue Analytics for immigration-specific insights</li>
              <li>• Test the Compliance Monitor with various risk levels</li>
              <li>• Explore the Lead Scoring system with different customer profiles</li>
              <li>• Access the Client Portal with sample customer credentials</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}
