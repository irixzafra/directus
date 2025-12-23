'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useOpportunities, useCreateOpportunity } from '@/hooks/use-opportunities';
import { useCompanies } from '@/hooks/use-companies';
import { useContacts } from '@/hooks/use-contacts';
import { Plus, Loader2, DollarSign, Building2, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const stages = [
  { id: 'lead', label: 'Lead', color: 'bg-slate-100 text-slate-700' },
  { id: 'qualified', label: 'Cualificado', color: 'bg-blue-100 text-blue-700' },
  { id: 'proposal', label: 'Propuesta', color: 'bg-amber-100 text-amber-700' },
  { id: 'negotiation', label: 'Negociacion', color: 'bg-purple-100 text-purple-700' },
  { id: 'won', label: 'Ganado', color: 'bg-green-100 text-green-700' },
  { id: 'lost', label: 'Perdido', color: 'bg-red-100 text-red-700' },
];

export default function OpportunitiesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newOpportunity, setNewOpportunity] = useState({
    name: '',
    company_id: '',
    contact_id: '',
    value: '',
    stage: 'lead',
    probability: 10,
    expected_close_date: '',
  });

  const { data: opportunities, isLoading } = useOpportunities();
  const { data: companies } = useCompanies({ limit: 100 });
  const { data: contacts } = useContacts({ limit: 100 });
  const createOpportunity = useCreateOpportunity();

  const handleCreate = async () => {
    if (!newOpportunity.name) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      const data: any = {
        name: newOpportunity.name,
        stage: newOpportunity.stage,
        probability: newOpportunity.probability,
        value: newOpportunity.value ? parseFloat(newOpportunity.value) : null,
        expected_close_date: newOpportunity.expected_close_date || null,
      };
      if (newOpportunity.company_id) data.company_id = newOpportunity.company_id;
      if (newOpportunity.contact_id) data.contact_id = newOpportunity.contact_id;

      await createOpportunity.mutateAsync(data);
      toast.success('Oportunidad creada correctamente');
      setIsDialogOpen(false);
      setNewOpportunity({
        name: '',
        company_id: '',
        contact_id: '',
        value: '',
        stage: 'lead',
        probability: 10,
        expected_close_date: '',
      });
    } catch (error) {
      toast.error('Error al crear la oportunidad');
    }
  };

  const getStageInfo = (stageId: string) => {
    return stages.find((s) => s.id === stageId) || stages[0];
  };

  const totalValue = opportunities?.reduce((sum, opp) => sum + (opp.value || 0), 0) || 0;
  const weightedValue = opportunities?.reduce((sum, opp) => sum + ((opp.value || 0) * (opp.probability / 100)), 0) || 0;

  return (
    <AppLayout
      title="Oportunidades"
      subtitle={`${opportunities?.length || 0} oportunidades en pipeline`}
      actions={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Oportunidad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Crear Nueva Oportunidad</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Implementacion CRM Acme"
                  value={newOpportunity.name}
                  onChange={(e) => setNewOpportunity({ ...newOpportunity, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_id">Empresa</Label>
                  <select
                    id="company_id"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newOpportunity.company_id}
                    onChange={(e) => setNewOpportunity({ ...newOpportunity, company_id: e.target.value })}
                  >
                    <option value="">Seleccionar...</option>
                    {companies?.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_id">Contacto</Label>
                  <select
                    id="contact_id"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newOpportunity.contact_id}
                    onChange={(e) => setNewOpportunity({ ...newOpportunity, contact_id: e.target.value })}
                  >
                    <option value="">Seleccionar...</option>
                    {contacts?.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.first_name} {contact.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Valor (EUR)</Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder="Ej: 25000"
                    value={newOpportunity.value}
                    onChange={(e) => setNewOpportunity({ ...newOpportunity, value: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="probability">Probabilidad (%)</Label>
                  <Input
                    id="probability"
                    type="number"
                    min="0"
                    max="100"
                    value={newOpportunity.probability}
                    onChange={(e) => setNewOpportunity({ ...newOpportunity, probability: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stage">Etapa</Label>
                  <select
                    id="stage"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newOpportunity.stage}
                    onChange={(e) => setNewOpportunity({ ...newOpportunity, stage: e.target.value })}
                  >
                    {stages.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expected_close_date">Fecha estimada cierre</Label>
                  <Input
                    id="expected_close_date"
                    type="date"
                    value={newOpportunity.expected_close_date}
                    onChange={(e) => setNewOpportunity({ ...newOpportunity, expected_close_date: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleCreate} disabled={createOpportunity.isPending} className="w-full">
                {createOpportunity.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Crear Oportunidad
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-2xl font-bold">
              <DollarSign className="h-6 w-6 text-green-600" />
              {totalValue.toLocaleString()} EUR
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Valor Ponderado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-2xl font-bold">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
              {weightedValue.toLocaleString()} EUR
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">En Negociacion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {opportunities?.filter((o) => o.stage === 'negotiation').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Opportunities Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : opportunities && opportunities.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opportunity) => {
            const stageInfo = getStageInfo(opportunity.stage);
            return (
              <Card key={opportunity.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{opportunity.name}</CardTitle>
                    <Badge className={stageInfo.color}>{stageInfo.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {typeof opportunity.company_id === 'object' && opportunity.company_id && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Building2 className="h-4 w-4" />
                        <span>{opportunity.company_id.name}</span>
                      </div>
                    )}
                    {opportunity.value && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold">{opportunity.value.toLocaleString()} EUR</span>
                        <span className="text-slate-400">({opportunity.probability}%)</span>
                      </div>
                    )}
                    {opportunity.expected_close_date && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(opportunity.expected_close_date).toLocaleDateString('es-ES')}</span>
                      </div>
                    )}
                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Probabilidad</span>
                        <span>{opportunity.probability}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${opportunity.probability}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">No hay oportunidades. Crea la primera!</p>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
