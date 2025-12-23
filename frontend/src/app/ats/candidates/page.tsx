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
import { useCandidates, useCreateCandidate } from '@/hooks/use-candidates';
import { Plus, Search, Loader2, Star, Mail, Phone, Linkedin } from 'lucide-react';
import { toast } from 'sonner';

export default function CandidatesPage() {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    current_company: '',
    current_title: '',
  });

  const { data: candidates, isLoading } = useCandidates({ search });
  const createCandidate = useCreateCandidate();

  const handleCreate = async () => {
    if (!newCandidate.email || !newCandidate.first_name) {
      toast.error('Email y nombre son requeridos');
      return;
    }

    try {
      await createCandidate.mutateAsync(newCandidate);
      toast.success('Candidato creado correctamente');
      setIsDialogOpen(false);
      setNewCandidate({
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        current_company: '',
        current_title: '',
      });
    } catch (error) {
      toast.error('Error al crear el candidato');
    }
  };

  return (
    <AppLayout
      title="Candidatos"
      subtitle={`${candidates?.length || 0} candidatos en total`}
      actions={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Candidato
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Candidato</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nombre *</Label>
                  <Input
                    id="first_name"
                    value={newCandidate.first_name}
                    onChange={(e) => setNewCandidate({ ...newCandidate, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido</Label>
                  <Input
                    id="last_name"
                    value={newCandidate.last_name}
                    onChange={(e) => setNewCandidate({ ...newCandidate, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCandidate.email}
                  onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  value={newCandidate.phone}
                  onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current_company">Empresa Actual</Label>
                  <Input
                    id="current_company"
                    value={newCandidate.current_company}
                    onChange={(e) => setNewCandidate({ ...newCandidate, current_company: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_title">Cargo Actual</Label>
                  <Input
                    id="current_title"
                    value={newCandidate.current_title}
                    onChange={(e) => setNewCandidate({ ...newCandidate, current_title: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleCreate} disabled={createCandidate.isPending} className="w-full">
                {createCandidate.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Crear Candidato
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
              placeholder="Buscar candidatos..."
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
          ) : candidates && candidates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Posicion Actual</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Fuente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.id} className="cursor-pointer hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-medium">
                          {candidate.first_name[0]}{candidate.last_name?.[0] || ''}
                        </div>
                        <div>
                          <p className="font-medium">{candidate.first_name} {candidate.last_name}</p>
                          <p className="text-sm text-slate-500">{candidate.location || 'Sin ubicacion'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">{candidate.email}</span>
                      </div>
                      {candidate.phone && (
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span className="text-sm">{candidate.phone}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{candidate.current_title || '-'}</p>
                      <p className="text-sm text-slate-500">{candidate.current_company || '-'}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills?.slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {candidate.skills && candidate.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{candidate.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              (candidate.rating || 0) >= star
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{candidate.source || 'Directo'}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <p className="text-slate-500">No hay candidatos. Crea el primero!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
