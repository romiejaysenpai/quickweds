import OperationsWorkspace from '@/components/dashboard/OperationsWorkspace';
export default async function OperationsPage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <main className="min-h-screen bg-neutral p-4 sm:p-8"><div className="mx-auto max-w-5xl"><OperationsWorkspace weddingId={id}/></div></main>;}
