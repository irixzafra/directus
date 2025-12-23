'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/providers/auth-provider';
import { Loader2, User, Bell, Shield, Palette } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // TODO: Implement profile update via Directus
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success('Perfil actualizado correctamente');
    setIsSaving(false);
  };

  return (
    <AppLayout title="Configuracion" subtitle="Gestiona tu cuenta y preferencias">
      <div className="max-w-3xl space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-100 p-2">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle>Perfil</CardTitle>
                <CardDescription>Tu informacion personal</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombre</Label>
                <Input
                  id="first_name"
                  value={profile.first_name}
                  onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Apellido</Label>
                <Input
                  id="last_name"
                  value={profile.last_name}
                  onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500">El email no se puede cambiar</p>
            </div>
            <Separator />
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2">
                <Bell className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle>Notificaciones</CardTitle>
                <CardDescription>Configura tus preferencias de notificacion</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Nuevos candidatos</p>
                  <p className="text-sm text-slate-500">Recibir notificacion cuando hay un nuevo candidato</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Cambios de etapa</p>
                  <p className="text-sm text-slate-500">Notificar cuando un candidato cambia de etapa</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Ofertas expiradas</p>
                  <p className="text-sm text-slate-500">Alerta cuando una oferta esta por expirar</p>
                </div>
                <input type="checkbox" className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Seguridad</CardTitle>
                <CardDescription>Gestiona tu password y seguridad de cuenta</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Cambiar Password</Button>
          </CardContent>
        </Card>

        {/* Theme Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Palette className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Apariencia</CardTitle>
                <CardDescription>Personaliza la interfaz</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">Claro</Button>
              <Button variant="outline" className="flex-1">Oscuro</Button>
              <Button variant="default" className="flex-1">Sistema</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
