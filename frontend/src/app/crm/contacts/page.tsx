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
import { useContacts, useCreateContact } from '@/hooks/use-contacts';
import { useCompanies } from '@/hooks/use-companies';
import { Plus, Search, Loader2, Mail, Phone, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactsPage() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    job_title: '',
    company_id: '',
  });

  const { data: contacts, isLoading } = useContacts({ search });
  const { data: companies } = useCompanies({ limit: 100 });
  const createContact = useCreateContact();

  const handleCreate = async () => {
    if (!newContact.email || !newContact.first_name) {
      toast.error('Email y nombre son requeridos');
      return;
    }

    try {
      const data: any = { ...newContact };
      if (!data.company_id) delete data.company_id;
      await createContact.mutateAsync(data);
      toast.success('Contacto creado correctamente');
      setIsDialogOpen(false);
      setNewContact({
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        job_title: '',
        company_id: '',
      });
    } catch (error) {
      toast.error('Error al crear el contacto');
    }
  };

  return (
    <AppLayout
      title="Contactos"
      subtitle={`${contacts?.length || 0} contactos en total`}
      actions={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Contacto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Contacto</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nombre *</Label>
                  <Input
                    id="first_name"
                    value={newContact.first_name}
                    onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido</Label>
                  <Input
                    id="last_name"
                    value={newContact.last_name}
                    onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefono</Label>
                  <Input
                    id="phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_title">Cargo</Label>
                  <Input
                    id="job_title"
                    placeholder="Ej: Director de RRHH"
                    value={newContact.job_title}
                    onChange={(e) => setNewContact({ ...newContact, job_title: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_id">Empresa</Label>
                <select
                  id="company_id"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newContact.company_id}
                  onChange={(e) => setNewContact({ ...newContact, company_id: e.target.value })}
                >
                  <option value="">Sin empresa</option>
                  {companies?.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={handleCreate} disabled={createContact.isPending} className="w-full">
                {createContact.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Crear Contacto
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
              placeholder="Buscar contactos..."
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
          ) : contacts && contacts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id} className="cursor-pointer hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-medium">
                          {contact.first_name[0]}{contact.last_name?.[0] || ''}
                        </div>
                        <div>
                          <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">{contact.email}</span>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span className="text-sm">{contact.phone}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{contact.job_title || '-'}</TableCell>
                    <TableCell>
                      {typeof contact.company_id === 'object' && contact.company_id ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          <span>{contact.company_id.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {contact.is_primary && (
                        <Badge className="bg-green-100 text-green-700">Principal</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <p className="text-slate-500">No hay contactos. Crea el primero!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
