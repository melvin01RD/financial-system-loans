import { redirect } from 'next/navigation';

export default function Home() {
  // 🚀 Esto mandará a cualquier usuario que entre al link directamente al Login
  redirect('/login');
}