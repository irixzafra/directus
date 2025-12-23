'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/auth-provider';
import { useCandidates } from '@/hooks/use-candidates';
import { useJobs } from '@/hooks/use-jobs';
import { Users, Briefcase, Building2, TrendingUp, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: candidates, isLoading: candidatesLoading } = useCandidates({ limit: 100 });
  const { data: jobs, isLoading: jobsLoading } = useJobs({ limit: 100 });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const stats = [
    {
      name: 'Total Candidatos',
      value: candidates?.length || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Ofertas Activas',
      value: jobs?.filter(j => j.status === 'published').length || 0,
      icon: Briefcase,
      color: 'bg-green-500',
    },
    {
      name: 'En Pipeline',
      value: candidates?.filter(c => c.rating && c.rating > 0).length || 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      name: 'Contratados',
      value: 0,
      icon: Building2,
      color: 'bg-amber-500',
    },
  ];

  return (
    <AppLayout title="Dashboard" subtitle="Resumen de tu actividad">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.name}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {candidatesLoading || jobsLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  stat.value
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ultimos Candidatos</CardTitle>
          </CardHeader>
          <CardContent>
            {candidatesLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : candidates && candidates.length > 0 ? (
              <div className="space-y-3">
                {candidates.slice(0, 5).map((candidate) => (
                  <div key={candidate.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">
                        {candidate.first_name} {candidate.last_name}
                      </p>
                      <p className="text-sm text-slate-500">{candidate.email}</p>
                    </div>
                    <div className="text-sm text-slate-500">
                      {candidate.current_title || 'Sin titulo'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-4">No hay candidatos aun</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ofertas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : jobs && jobs.length > 0 ? (
              <div className="space-y-3">
                {jobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-slate-500">{job.department || 'Sin departamento'}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs ${
                      job.status === 'published' ? 'bg-green-100 text-green-700' :
                      job.status === 'draft' ? 'bg-slate-100 text-slate-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-4">No hay ofertas aun</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
