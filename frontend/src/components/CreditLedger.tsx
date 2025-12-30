import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { type CreditLedgerEntry } from '../api/credits';
import { Award, Calendar, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';

interface CreditLedgerProps {
  entries: CreditLedgerEntry[];
  isLoading?: boolean;
}

const CreditLedger: React.FC<CreditLedgerProps> = ({ entries, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">Loading credit history...</p>
        </CardContent>
      </Card>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No credit transactions yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Earn credits by having your contributions accepted!
          </p>
        </CardContent>
      </Card>
    );
  }

  const getEntryIcon = (entryType: string) => {
    switch (entryType) {
      case 'AWARD':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'REVERSAL':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'ADJUSTMENT':
        return <RefreshCcw className="h-4 w-4 text-blue-600" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  const getEntryBadge = (entryType: string) => {
    switch (entryType) {
      case 'AWARD':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Award
          </Badge>
        );
      case 'REVERSAL':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            Reversal
          </Badge>
        );
      case 'ADJUSTMENT':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            Adjustment
          </Badge>
        );
      default:
        return <Badge variant="outline">{entryType}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <Card key={entry.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getEntryIcon(entry.entry_type)}
                  <CardTitle className="text-lg">{entry.project_title}</CardTitle>
                </div>
                <CardDescription className="flex items-center gap-4 flex-wrap">
                  {entry.from_user_name && (
                    <span>Awarded by {entry.from_user_name}</span>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(entry.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                {getEntryBadge(entry.entry_type)}
                <div className="text-2xl font-bold text-primary">
                  {entry.entry_type === 'REVERSAL' ? '-' : '+'}{entry.amount}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

export default CreditLedger;

