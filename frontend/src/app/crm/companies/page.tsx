'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useCompanies, useCreateCompany } from '@/hooks/use-companies';
import { Plus, Search, Loader2, Building2, Globe, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function CompaniesPage() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    domain: '',
    industry: '',
    company_size: '',
    website: '',
  });

  const { data: companies, isLoading } = useCompanies({ search });
  const createCompany = useCreateCompany();

  const handleCreate = async () => {
    if (!newCompany.name) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      await createCompany.mutateAsync({ ...newCompany, status: 'lead' });
      toast.success('Empresa creada correctamente');
      setIsDialogOpen(false);
      setNewCompany({
        name: '',
        domain: '',
        industry: '',
        company_size: '',
        website: '',
      });
    } catch (error) {
      toast.error('Error al crear la empresa');
    }
  };

  const statusColors: Record<string, string> = {
    lead: 'bg-blue-100 text-blue-700',
    prospect: 'bg-amber-100 text-amber-700',
    customer: 'bg-green-100 text-green-700',
    churned: 'bg-red-100 text-red-700',
  };

  const statusLabels: Record<string, string> = {
    lead: 'Lead',
    prospect: 'Prospecto',
    customer: 'Cliente',
    churned: 'Perdido',
  };

  return (
    <AppLayout
      title="Empresas"
      subtitle={`${companies?.length || 0} empresas en total`}
      actions={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Empresa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Empresa</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Acme Corporation"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Dominio</Label>
                  <Input
                    id="domain"
                    placeholder="Ej: acme.com"
                    value={newCompany.domain}
                    onChange={(e) => setNewCompany({ ...newCompany, domain: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="Ej: https://acme.com"
                    value={newCompany.website}
                    onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industria</Label>
                  <Input
                    id="industry"
                    placeholder="Ej: Tecnologia"
                    value={newCompany.industry}
                    onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_size">Tamano</Label>
                  <select
                    id="company_size"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newCompany.company_size}
                    onChange={(e) => setNewCompany({ ...newCompany, company_size: e.target.value })}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value="501-1000">501-1000</option>
                    <option value="1000+">1000+</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleCreate} disabled={createCompany.isPending} className="w-full">
                {createCompany.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Crear Empresa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar empresas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : companies && companies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Industria</TableHead>
                  <TableHead>Tamano</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id} className="cursor-pointer hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-slate-500">{company.domain || 'Sin dominio'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{company.industry || '-'}</TableCell>
                    <TableCell>
                      {company.company_size && (
                        <div className="flex items-center gap-1 text-slate-600">
                          <Users className="h-4 w-4" />
                          <span>{company.company_size}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-indigo-600 hover:underline"
                        >
                          <Globe className="h-4 w-4" />
                          <span>Visitar</span>
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[company.status] || statusColors.lead}>
                        {statusLabels[company.status] || company.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <p className="text-slate-500">No hay empresas. Crea la primera!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
