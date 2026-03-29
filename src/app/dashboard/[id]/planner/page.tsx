'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Circle, Plus, Trash2, ListTodo, Wallet, Users, LayoutDashboard, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PlannerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: weddingId } = use(params);
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'checklist' | 'budget' | 'vendors'>('checklist');
    const [loading, setLoading] = useState(true);

    // Data States
    const [tasks, setTasks] = useState<any[]>([]);
    const [budgets, setBudgets] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);

    useEffect(() => {
        loadPlannerData();
    }, [weddingId]);

    async function loadPlannerData() {
        setLoading(true);
        try {
            // Because planner tables might throw an error if the user hasn't run the SQL script yet,
            // we catch errors independently to prevent screen-crashing.
            const [tasksRes, budgetRes, vendorRes] = await Promise.all([
                supabase.from('planner_tasks').select('*').eq('wedding_id', weddingId).order('created_at', { ascending: true }),
                supabase.from('planner_budgets').select('*').eq('wedding_id', weddingId).order('created_at', { ascending: true }),
                supabase.from('planner_vendors').select('*').eq('wedding_id', weddingId).order('created_at', { ascending: true })
            ]);

            if (tasksRes.data) setTasks(tasksRes.data);
            if (budgetRes.data) setBudgets(budgetRes.data);
            if (vendorRes.data) setVendors(vendorRes.data);

        } catch (error) {
            console.error("Planner database missing or error:", error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>;
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-border sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push(`/dashboard/${weddingId}`)} className="w-10 h-10 rounded-full hover:bg-neutral flex items-center justify-center transition-colors">
                            <ArrowLeft className="w-5 h-5 text-text-secondary" />
                        </button>
                        <div>
                            <h1 className="text-xl font-serif font-bold text-foreground">Wedding Planner</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-64 shrink-0">
                    <div className="bg-white rounded-3xl p-6 soft-shadow border border-border sticky top-24">
                        <div className="space-y-2">
                            <button onClick={() => setActiveTab('checklist')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'checklist' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-text-secondary hover:bg-neutral hover:text-foreground'}`}>
                                <ListTodo className="w-5 h-5" /> Checklist
                            </button>
                            <button onClick={() => setActiveTab('budget')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'budget' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-text-secondary hover:bg-neutral hover:text-foreground'}`}>
                                <Wallet className="w-5 h-5" /> Budgets
                            </button>
                            <button onClick={() => setActiveTab('vendors')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'vendors' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-text-secondary hover:bg-neutral hover:text-foreground'}`}>
                                <Users className="w-5 h-5" /> Vendors
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    {activeTab === 'checklist' && <PlannerChecklists weddingId={weddingId} initialTasks={tasks} reload={loadPlannerData} />}
                    {activeTab === 'budget' && <PlannerBudgets weddingId={weddingId} initialBudgets={budgets} reload={loadPlannerData} />}
                    {activeTab === 'vendors' && <PlannerVendors weddingId={weddingId} initialVendors={vendors} reload={loadPlannerData} />}
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------
// CHILD COMPONENTS
// ----------------------------------------------------

function PlannerChecklists({ weddingId, initialTasks, reload }: any) {
    const [newTask, setNewTask] = useState("");
    const [publishing, setPublishing] = useState(false);

    async function addTask(e: any) {
        e.preventDefault();
        if (!newTask.trim() || publishing) return;
        setPublishing(true);
        await supabase.from('planner_tasks').insert({ wedding_id: weddingId, title: newTask.trim() });
        setNewTask("");
        await reload();
        setPublishing(false);
    }

    async function toggleTask(task: any) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        await supabase.from('planner_tasks').update({ status: newStatus }).eq('id', task.id);
        reload();
    }

    async function deleteTask(id: string) {
        await supabase.from('planner_tasks').delete().eq('id', id);
        reload();
    }

    const completedCount = initialTasks.filter((t: any) => t.status === 'completed').length;
    const progress = initialTasks.length > 0 ? Math.round((completedCount / initialTasks.length) * 100) : 0;

    return (
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 soft-shadow border border-border">
            <div className="flex justify-between items-end mb-8 border-b border-border/50 pb-8">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-foreground mb-2">To-Do Checklist</h2>
                    <p className="text-text-secondary">Keep track of every tiny detail before the big day.</p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-3xl font-serif font-bold text-primary mb-1">{progress}%</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Completed</p>
                </div>
            </div>

            <form onSubmit={addTask} className="flex gap-4 mb-10">
                <input 
                    type="text" 
                    value={newTask} 
                    onChange={e => setNewTask(e.target.value)} 
                    placeholder="E.g. Book the florist..." 
                    className="flex-1 bg-neutral border border-border rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button type="submit" disabled={publishing || !newTask.trim()} className="bg-primary text-white rounded-2xl px-6 py-4 font-bold disabled:opacity-50">
                    Add
                </button>
            </form>

            <div className="space-y-3">
                {initialTasks.length === 0 ? (
                    <div className="text-center py-12 opacity-50 font-serif italic">Your checklist is beautifully empty. Add your first task above!</div>
                ) : (
                    initialTasks.map((task: any) => (
                        <div key={task.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-neutral transition-colors group">
                            <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleTask(task)}>
                                {task.status === 'completed' ? (
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                                ) : (
                                    <Circle className="w-6 h-6 text-border group-hover:text-primary transition-colors shrink-0" />
                                )}
                                <span className={`text-lg font-serif ${task.status === 'completed' ? 'text-text-secondary line-through' : 'text-foreground'}`}>
                                    {task.title}
                                </span>
                            </div>
                            <button onClick={() => deleteTask(task.id)} className="w-10 h-10 flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function PlannerBudgets({ weddingId, initialBudgets, reload }: any) {
    const [publishing, setPublishing] = useState(false);
    const [newItem, setNewItem] = useState({ category: 'Venue', item_name: '', estimated_cost: '' });

    // Users can use standard categories or type their own custom ones
    const [categories, setCategories] = useState(['Venue', 'Catering', 'Attire', 'Decor', 'Photography', 'Entertainment', 'Other']);
    
    const handleAddCustomCategory = () => {
        const cat = prompt("Enter custom budget category:");
        if (cat && !categories.includes(cat)) {
            setCategories([...categories, cat]);
            setNewItem({...newItem, category: cat});
        }
    };

    async function addItem(e: any) {
        e.preventDefault();
        if (!newItem.item_name || publishing) return;
        setPublishing(true);
        await supabase.from('planner_budgets').insert({ 
            wedding_id: weddingId, 
            category: newItem.category, 
            item_name: newItem.item_name,
            estimated_cost: parseFloat(newItem.estimated_cost) || 0
        });
        setNewItem({ category: newItem.category, item_name: '', estimated_cost: '' });
        await reload();
        setPublishing(false);
    }

    async function deleteItem(id: string) {
        await supabase.from('planner_budgets').delete().eq('id', id);
        reload();
    }

    const totalEst = initialBudgets.reduce((acc: number, item: any) => acc + Number(item.estimated_cost || 0), 0);

    return (
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 soft-shadow border border-border">
            <div className="flex justify-between items-end mb-8 border-b border-border/50 pb-8">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Budget Tracker</h2>
                    <p className="text-text-secondary">Keep your wedding finances clearly mapped out.</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1">Total Estimated</p>
                    <p className="text-3xl font-mono text-primary">${totalEst.toLocaleString()}</p>
                </div>
            </div>

            <form onSubmit={addItem} className="flex flex-col md:flex-row gap-4 mb-10">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select 
                        value={newItem.category} 
                        onChange={e => e.target.value === 'CUSTOM' ? handleAddCustomCategory() : setNewItem({...newItem, category: e.target.value})}
                        className="bg-neutral border border-border rounded-xl px-4 py-3 outline-none focus:ring-primary/20"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        <option value="CUSTOM">+ Add Custom Category</option>
                    </select>
                    <input 
                        required
                        type="text" 
                        placeholder="Expense Name" 
                        value={newItem.item_name}
                        onChange={e => setNewItem({...newItem, item_name: e.target.value})}
                        className="bg-neutral border border-border rounded-xl px-4 py-3 outline-none focus:ring-primary/20"
                    />
                    <input 
                        required
                        type="number" 
                        placeholder="Est. Cost ($)" 
                        value={newItem.estimated_cost}
                        onChange={e => setNewItem({...newItem, estimated_cost: e.target.value})}
                        className="bg-neutral border border-border rounded-xl px-4 py-3 outline-none focus:ring-primary/20 font-mono"
                    />
                </div>
                <button type="submit" disabled={publishing} className="bg-primary text-white rounded-xl px-6 py-3 font-bold disabled:opacity-50 h-full">Add</button>
            </form>

            <div className="space-y-6">
                {categories.map(category => {
                    const items = initialBudgets.filter((b: any) => b.category === category);
                    if (items.length === 0) return null;
                    const catTotal = items.reduce((acc: number, item: any) => acc + Number(item.estimated_cost || 0), 0);
                    
                    return (
                        <div key={category} className="border border-border rounded-2xl overflow-hidden">
                            <div className="bg-neutral/50 px-6 py-4 flex justify-between items-center border-b border-border">
                                <h3 className="font-bold text-foreground flex items-center gap-2">
                                    <Wallet className="w-4 h-4 text-primary" /> {category}
                                </h3>
                                <span className="font-mono font-bold text-sm">${catTotal.toLocaleString()}</span>
                            </div>
                            <div className="divide-y divide-border/50">
                                {items.map((item: any) => (
                                    <div key={item.id} className="p-4 px-6 flex justify-between items-center group hover:bg-neutral/20">
                                        <p className="font-serif text-lg">{item.item_name}</p>
                                        <div className="flex items-center gap-6">
                                            <span className="font-mono text-text-secondary">${Number(item.estimated_cost).toLocaleString()}</span>
                                            <button onClick={() => deleteItem(item.id)} className="text-red-400 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function PlannerVendors({ weddingId, initialVendors, reload }: any) {
    const [publishing, setPublishing] = useState(false);
    const [newItem, setNewItem] = useState({ role: 'Photographer', name: '', contact: '' });
    
    const [roles, setRoles] = useState(['Photographer', 'Videographer', 'Florist', 'Caterer', 'Coordinator', 'DJ/Band', 'Hair & Makeup', 'Supplier']);
    
    const handleAddCustomRole = () => {
        const customRole = prompt("Enter custom vendor role (e.g. Ring Maker):");
        if (customRole && !roles.includes(customRole)) {
            setRoles([...roles, customRole]);
            setNewItem({...newItem, role: customRole});
        }
    };

    async function addItem(e: any) {
        e.preventDefault();
        if (!newItem.name || publishing) return;
        setPublishing(true);
        await supabase.from('planner_vendors').insert({ 
            wedding_id: weddingId, 
            role: newItem.role, 
            name: newItem.name,
            phone: newItem.contact
        });
        setNewItem({ role: newItem.role, name: '', contact: '' });
        await reload();
        setPublishing(false);
    }

    async function deleteItem(id: string) {
        await supabase.from('planner_vendors').delete().eq('id', id);
        reload();
    }

    return (
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 soft-shadow border border-border">
            <div className="mb-8 border-b border-border/50 pb-8">
                <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Vendor Rolodex</h2>
                <p className="text-text-secondary">Keep your crucial suppliers and professionals organized.</p>
            </div>

            <form onSubmit={addItem} className="flex flex-col md:flex-row gap-4 mb-10">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select 
                        value={newItem.role} 
                        onChange={e => e.target.value === 'CUSTOM' ? handleAddCustomRole() : setNewItem({...newItem, role: e.target.value})}
                        className="bg-neutral border border-border rounded-xl px-4 py-3 outline-none focus:ring-primary/20"
                    >
                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                        <option value="CUSTOM">+ Add Custom Supplier</option>
                    </select>
                    <input 
                        required
                        type="text" 
                        placeholder="Vendor/Company Name" 
                        value={newItem.name}
                        onChange={e => setNewItem({...newItem, name: e.target.value})}
                        className="bg-neutral border border-border rounded-xl px-4 py-3 outline-none focus:ring-primary/20"
                    />
                    <input 
                        type="text" 
                        placeholder="Contact (Email or Phone)" 
                        value={newItem.contact}
                        onChange={e => setNewItem({...newItem, contact: e.target.value})}
                        className="bg-neutral border border-border rounded-xl px-4 py-3 outline-none focus:ring-primary/20"
                    />
                </div>
                <button type="submit" disabled={publishing} className="bg-primary text-white rounded-xl px-6 py-3 font-bold disabled:opacity-50">Add</button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {initialVendors.length === 0 ? (
                    <div className="col-span-full text-center py-12 opacity-50 font-serif italic">No vendors booked yet. Add your first supplier above.</div>
                ) : (
                    initialVendors.map((vendor: any) => (
                        <div key={vendor.id} className="border border-border rounded-2xl p-6 group relative">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary block mb-1">{vendor.role}</span>
                            <h3 className="font-serif text-xl font-bold text-foreground mb-2">{vendor.name}</h3>
                            <p className="text-sm font-mono text-text-secondary">{vendor.phone || vendor.email || 'No contact provided'}</p>
                            
                            <button onClick={() => deleteItem(vendor.id)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-50 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
