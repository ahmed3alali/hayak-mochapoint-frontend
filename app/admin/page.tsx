'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRootPage() {
  const router = useRouter();
  useEffect(() => {
    const token = sessionStorage.getItem('admin_access_token');
    router.replace(token ? '/admin/dashboard' : '/admin/login');
  }, [router]);
  return null;
}
