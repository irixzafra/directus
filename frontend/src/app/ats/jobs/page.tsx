'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useJobs, useCreateJob } from '@/hooks/use-jobs';
import { Plus, Loader2, MapPin, Clock, Users, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function JobsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    department: '',
    location: '',
    location_type: 'on-site',
    employment_type: 'full-time',
    description: '',
  });

  const { data: jobs, isLoading } = useJobs();
  const createJob = useCreateJob();

  const handleCreate = async () => {
    if (!newJob.title) {
      toast.error('El titulo es requerido');
      return;
    }

    try {
      await createJob.mutateAsync({ ...newJob, status: 'draft' });
      toast.success('Oferta creada correctamente');
      setIsDialogOpen(false);
      setNewJob({
        title: '',
        department: '',
        location: '',
        location_type: 'on-site',
        employment_type: 'full-time',
        description: '',
      });
    } catch (error) {
      toast.error('Error al crear la oferta');
    }
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    published: 'bg-green-100 text-green-700',
    paused: 'bg-amber-100 text-amber-700',
    closed: 'bg-red-100 text-red-700',
  };

  return (
    <AppLayout
      title="Ofertas de Trabajo"
      subtitle={`${jobs?.length || 0} ofertas en total`}
      actions={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Oferta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Crear Nueva Oferta</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titulo del puesto *</Label>
                <Input
                  id="title"
                  placeholder="Ej: Senior Frontend Developer"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    placeholder="Ej: Engineering"
                    value={newJob.department}
                    onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicacion</Label>
                  <Input
                    id="location"
                    placeholder="Ej: Madrid, Spain"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location_type">Tipo de trabajo</Label>
                  <select
                    id="location_type"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newJob.location_type}
                    onChange={(e) => setNewJob({ ...newJob, location_type: e.target.value })}
                  >
                    <option value="on-site">Presencial</option>
                    <option value="remote">Remoto</option>
                    <option value="hybrid">Hibrido</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employment_type">Tipo de contrato</Label>
                  <select
                    id="employment_type"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newJob.employment_type}
                    onChange={(e) => setNewJob({ ...newJob, employment_type: e.target.value })}
                  >
                    <option value="full-time">Tiempo completo</option>
                    <option value="part-time">Tiempo parcial</option>
                    <option value="contract">Contrato</option>
                    <option value="internship">Practicas</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleCreate} disabled={createJob.isPending} className="w-full">
                {createJob.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Crear Oferta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <Badge className={statusColors[job.status] || statusColors.draft}>
                    {job.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500">{job.department || 'Sin departamento'}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location || 'Sin ubicacion'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      {job.location_type === 'remote' ? 'Remoto' :
                       job.location_type === 'hybrid' ? 'Hibrido' : 'Presencial'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="h-4 w-4" />
                    <span>
                      {job.employment_type === 'full-time' ? 'Tiempo completo' :
                       job.employment_type === 'part-time' ? 'Tiempo parcial' :
                       job.employment_type === 'contract' ? 'Contrato' : 'Practicas'}
                    </span>
                  </div>
                  {(job.salary_min || job.salary_max) && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <DollarSign className="h-4 w-4" />
                      <span>
                        {job.salary_min && job.salary_max
                          ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} EUR`
                          : job.salary_min
                          ? `Desde ${job.salary_min.toLocaleString()} EUR`
                          : `Hasta ${job.salary_max?.toLocaleString()} EUR`}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">No hay ofertas de trabajo. Crea la primera!</p>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
