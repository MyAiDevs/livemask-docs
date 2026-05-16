import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConnectionStore } from '@/lib/connection-store';
import AppLayout from '@/components/livemask/AppLayout';
import { client } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const issueTypes = [
  'Connection timeout',
  'Slow connection',
  'Frequent disconnects',
  'Cannot connect to node',
  'App crash',
  'Configuration error',
  'Other',
];

const networkTypes = ['WiFi', '4G/LTE', '5G', 'Ethernet', 'Unknown'];

export default function Diagnostics() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedNode, errorCode, configVersion } = useConnectionStore();

  const [issueType, setIssueType] = useState('');
  const [networkType, setNetworkType] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!issueType) {
      toast({ title: 'Please select an issue type', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      await client.entities.diagnostic_reports.create({
        data: {
          issue_type: issueType,
          node_id: selectedNode?.id || null,
          protocol: selectedNode?.protocol || 'Unknown',
          network_type: networkType || 'Unknown',
          app_version: '1.0.0',
          config_version: configVersion,
          error_code: errorCode || '',
          description: description,
          status: 'submitted',
        },
      });
      setSubmitted(true);
    } catch {
      toast({
        title: 'Failed to send report',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <AppLayout>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="text-center animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Report Sent</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Thank you. Our team will review your report.
          </p>
          <Button
            onClick={() => navigate('/home')}
            className="bg-[hsl(174,62%,32%)] hover:bg-[hsl(174,62%,28%)] text-white"
          >
            Back to Home
          </Button>
        </div>
      </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-muted rounded xl:hidden">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Send Diagnostic Report</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-5">
        {/* Issue Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Issue Type *</label>
          <Select value={issueType} onValueChange={setIssueType}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select issue type" />
            </SelectTrigger>
            <SelectContent>
              {issueTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Auto-filled metadata */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Current Node</label>
            <Input
              value={selectedNode ? `${selectedNode.city}, ${selectedNode.country_code}` : 'None'}
              readOnly
              className="h-9 text-sm bg-muted/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Protocol</label>
            <Input
              value={selectedNode?.protocol || 'N/A'}
              readOnly
              className="h-9 text-sm bg-muted/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">App Version</label>
            <Input value="1.0.0" readOnly className="h-9 text-sm bg-muted/50" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Config Version</label>
            <Input value={configVersion} readOnly className="h-9 text-sm bg-muted/50" />
          </div>
        </div>

        {/* Network Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Network Type</label>
          <Select value={networkType} onValueChange={setNetworkType}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select network type" />
            </SelectTrigger>
            <SelectContent>
              {networkTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Error Code */}
        {errorCode && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Error Code</label>
            <Input value={errorCode} readOnly className="h-9 text-sm bg-muted/50 font-mono" />
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Description <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Textarea
            placeholder="Describe what happened..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="text-sm"
          />
        </div>

        {/* Privacy Note */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-[hsl(174,62%,95%)] border border-[hsl(174,62%,32%)]/20">
          <ShieldCheck className="h-4 w-4 text-[hsl(174,62%,32%)] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[hsl(174,62%,25%)]">
            Diagnostic reports never include browsing history or traffic content.
          </p>
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={submitting || !issueType}
          className="w-full h-12 bg-[hsl(174,62%,32%)] hover:bg-[hsl(174,62%,28%)] text-white font-semibold"
        >
          {submitting ? (
            <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" /> Send Diagnostic Report
            </>
          )}
        </Button>
      </div>
    </div>
    </AppLayout>
  );
}