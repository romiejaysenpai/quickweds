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
    const [wedding, setWedding] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [budgets, setBudgets] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);

    useEffect(() => {
        loadPlannerData();
    }, [weddingId]);

    async function loadPlannerData() {
        setLoading(true);
        try {
            const [weddingRes, tasksRes, budgetRes, vendorRes] = await Promise.all([
                supabase.from('weddings').select('total_budget, currency').eq('id', weddingId).single(),
                supabase.from('planner_tasks').select('*').eq('wedding_id', weddingId).order('created_at', { ascending: true }),
                supabase.from('planner_budgets').select('*').eq('wedding_id', weddingId).order('created_at', { ascending: true }),
                supabase.from('planner_vendors').select('*').eq('wedding_id', weddingId).order('created_at', { ascending: true })
            ]);

            if (weddingRes.data) setWedding(weddingRes.data);
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
                    {activeTab === 'budget' && <PlannerBudgets weddingId={weddingId} initialBudgets={budgets} wedding={wedding} vendors={vendors} reload={loadPlannerData} />}
                    {activeTab === 'vendors' && <PlannerVendors weddingId={weddingId} initialVendors={vendors} currency={wedding?.currency || 'USD'} reload={loadPlannerData} />}
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
        try {
            const { error } = await supabase.from('planner_tasks').insert({ wedding_id: weddingId, title: newTask.trim() });
            if (error) throw error;
            setNewTask("");
            await reload();
        } catch (err) {
            console.error("Error adding task:", err);
            alert("Failed to add task. Please try again.");
        } finally {
            setPublishing(false);
        }
    }

    async function toggleTask(task: any) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        try {
            const { error } = await supabase.from('planner_tasks').update({ status: newStatus }).eq('id', task.id);
            if (error) throw error;
            await reload();
        } catch (err) {
            console.error("Error toggling task:", err);
        }
    }

    async function deleteTask(id: string) {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            const { error } = await supabase.from('planner_tasks').delete().eq('id', id);
            if (error) throw error;
            await reload();
        } catch (err) {
            console.error("Error deleting task:", err);
        }
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

function PlannerBudgets({ weddingId, initialBudgets, wedding, vendors = [], reload }: any) {
    const [publishing, setPublishing] = useState(false);
    const [newItem, setNewItem] = useState({ category: 'Venue', item_name: '', estimated_cost: '' });

    // Local states for inputs to avoid jitter/focus issues
    const [localBudget, setLocalBudget] = useState(wedding?.total_budget || 0);
    const [localCurrency, setLocalCurrency] = useState(wedding?.currency || 'USD');

    useEffect(() => {
        if (wedding) {
            setLocalBudget(wedding.total_budget || 0);
            setLocalCurrency(wedding.currency || 'USD');
        }
    }, [wedding]);

    // Standard categories plus any custom ones already in the budget
    const defaultCategories = ['Venue', 'Catering', 'Attire', 'Decor', 'Photography', 'Entertainment', 'Other'];
    const [categories, setCategories] = useState(defaultCategories);

    useEffect(() => {
        const customCats = initialBudgets.map((b: any) => b.category).filter((c: string) => !defaultCategories.includes(c));
        const uniqueCats = Array.from(new Set([...defaultCategories, ...customCats]));
        setCategories(uniqueCats);
    }, [initialBudgets]);
    
    const handleAddCustomCategory = () => {
        const cat = prompt("Enter custom budget category:");
        if (cat) {
            if (!categories.includes(cat)) {
                setCategories([...categories, cat]);
            }
            setNewItem({...newItem, category: cat});
        }
    };

    async function addItem(e: any) {
        e.preventDefault();
        if (!newItem.item_name || publishing) return;
        setPublishing(true);
        try {
            const { error } = await supabase.from('planner_budgets').insert({ 
                wedding_id: weddingId, 
                category: newItem.category, 
                item_name: newItem.item_name,
                estimated_cost: parseFloat(newItem.estimated_cost) || 0
            });
            if (error) throw error;
            setNewItem({ category: newItem.category, item_name: '', estimated_cost: '' });
            await reload();
        } catch (err: any) {
            console.error("Error adding budget item:", err);
            alert("Failed to add budget item: " + err.message);
        } finally {
            setPublishing(false);
        }
    }

    async function saveWeddingBudget(field: string, value: any) {
        try {
            const { error } = await supabase.from('weddings').update({ [field]: value }).eq('id', weddingId);
            if (error) throw error;
            await reload();
        } catch (err: any) {
            console.error("Error updating wedding budget:", err);
            alert("Failed to update " + field + ": " + err.message);
        }
    }

    async function deleteItem(id: string) {
        if (!confirm("Delete this budget item?")) return;
        try {
            const { error } = await supabase.from('planner_budgets').delete().eq('id', id);
            if (error) throw error;
            await reload();
        } catch (err) {
            console.error("Error deleting budget item:", err);
        }
    }

    const totalEst = initialBudgets.reduce((acc: number, item: any) => acc + Number(item.estimated_cost || 0), 0);
    const totalSpent = vendors.filter((v: any) => v.payment_status === 'paid').reduce((acc: number, v: any) => acc + (Number(v.amount) || 0), 0);
    const budgetRemaining = (wedding?.total_budget || 0) - totalSpent;
    const usagePercent = wedding?.total_budget > 0 ? Math.min(100, Math.round((totalSpent / wedding.total_budget) * 100)) : 0;

    // Derive symbol from localCurrency for immediate UI feedback
    const currencySymbol = localCurrency === 'USD' ? '$' : localCurrency === 'Yen' ? '¥' : '₱';

    return (
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 soft-shadow border border-border">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-border/50 pb-8 gap-6">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Budget Tracker</h2>
                    <p className="text-text-secondary">Keep your wedding finances clearly mapped out.</p>
                </div>
                <div className="flex flex-wrap gap-6 items-end">
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1">Wedding Budget Settings</p>
                        <div className="flex items-center gap-2">
                            <select 
                                value={localCurrency} 
                                onChange={e => {
                                    setLocalCurrency(e.target.value);
                                    saveWeddingBudget('currency', e.target.value);
                                }}
                                className="bg-neutral border border-border rounded-lg px-2 py-1 text-xs outline-none focus:ring-primary/20 font-bold"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="Yen">Yen (¥)</option>
                                <option value="Peso">Peso (₱)</option>
                            </select>
                            <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-primary font-bold text-lg">{currencySymbol}</span>
                                <input 
                                    type="number" 
                                    value={localBudget}
                                    onChange={e => setLocalBudget(parseFloat(e.target.value) || 0)}
                                    onBlur={e => saveWeddingBudget('total_budget', parseFloat(e.target.value) || 0)}
                                    className="text-2xl font-mono text-primary w-40 bg-neutral border border-border rounded-xl pl-8 pr-4 py-2 outline-none focus:ring-primary/20"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1">Spent (Paid)</p>
                        <p className="text-3xl font-mono text-primary font-bold">{currencySymbol}{totalSpent.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1">Remaining</p>
                        <p className={`text-3xl font-mono ${budgetRemaining < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {currencySymbol}{budgetRemaining.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Usage Bar */}
            <div className="mb-10 bg-neutral/50 p-6 rounded-3xl border border-border/50">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-text-secondary uppercase tracking-widest">Budget Utilization</span>
                    <span className={`text-sm font-black ${usagePercent > 90 ? 'text-red-500' : 'text-primary'}`}>{usagePercent}%</span>
                </div>
                <div className="w-full h-4 bg-neutral rounded-full overflow-hidden border border-border/30">
                    <div 
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${usagePercent > 90 ? 'bg-red-500' : 'bg-primary'}`}
                        style={{ width: `${usagePercent}%` }}
                    />
                </div>
            </div>

            <form onSubmit={addItem} className="space-y-6 mb-12 bg-neutral/30 p-6 rounded-[2rem] border border-border/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1.5 ml-1">Category</label>
                        <select 
                            value={newItem.category} 
                            onChange={e => e.target.value === 'CUSTOM' ? handleAddCustomCategory() : setNewItem({...newItem, category: e.target.value})}
                            className="w-full bg-white border border-border rounded-xl px-4 py-3 outline-none focus:ring-primary/20"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            <option value="CUSTOM">+ Add Custom Category</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1.5 ml-1">Expense/Item Title</label>
                        <input 
                            required
                            type="text" 
                            placeholder="e.g. Venue Rental" 
                            value={newItem.item_name}
                            onChange={e => setNewItem({...newItem, item_name: e.target.value})}
                            className="w-full bg-white border border-border rounded-xl px-4 py-3 outline-none focus:ring-primary/20"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1.5 ml-1">Estimated Cost ({currencySymbol})</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm font-bold">{currencySymbol}</span>
                            <input 
                                required
                                type="number" 
                                placeholder="0.00" 
                                value={newItem.estimated_cost}
                                onChange={e => setNewItem({...newItem, estimated_cost: e.target.value})}
                                className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-primary/20 font-mono"
                            />
                        </div>
                    </div>
                </div>
                <button type="submit" disabled={publishing} className="w-full bg-primary text-white rounded-2xl px-6 py-5 font-bold shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all text-lg">
                    {publishing ? 'Adding to Budget...' : 'Add Expense to Tracker'}
                </button>
            </form>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Estimates from Budget Table */}
                <div className="space-y-6">
                    <h3 className="text-xl font-serif font-bold text-foreground flex items-center gap-2 mb-4">
                        <ListTodo className="w-5 h-5 text-primary" /> Budget Estimates
                    </h3>
                    {categories.map(category => {
                        const items = initialBudgets.filter((b: any) => b.category === category);
                        if (items.length === 0) return null;
                        const catTotal = items.reduce((acc: number, item: any) => acc + Number(item.estimated_cost || 0), 0);
                        
                        return (
                            <div key={category} className="border border-border rounded-2xl overflow-hidden bg-white">
                                <div className="bg-neutral/30 px-6 py-3 flex justify-between items-center border-b border-border">
                                    <h4 className="font-bold text-sm text-text-secondary uppercase tracking-widest">{category}</h4>
                                    <span className="font-mono font-bold text-sm">{currencySymbol}{catTotal.toLocaleString()}</span>
                                </div>
                                <div className="divide-y divide-border/30">
                                    {items.map((item: any) => (
                                        <div key={item.id} className="p-4 px-6 flex justify-between items-center group hover:bg-neutral/10">
                                            <p className="font-serif text-base">{item.item_name}</p>
                                            <div className="flex items-center gap-4">
                                                <span className="font-mono text-text-secondary text-sm">{currencySymbol}{Number(item.estimated_cost).toLocaleString()}</span>
                                                <button onClick={() => deleteItem(item.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Actual Spending from Vendors */}
                <div className="space-y-6">
                    <h3 className="text-xl font-serif font-bold text-foreground flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-secondary" /> Actual Vendor Spending
                    </h3>
                    <div className="bg-white border border-border rounded-[2rem] overflow-hidden soft-shadow">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral/30 border-b border-border">
                                    <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-text-secondary">Vendor / Role</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-text-secondary text-right">Amount</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-black tracking-widest text-text-secondary text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {vendors.length === 0 ? (
                                    <tr><td colSpan={3} className="px-6 py-12 text-center text-text-secondary italic font-serif">No vendors added yet.</td></tr>
                                ) : (
                                    vendors.map((vendor: any) => (
                                        <tr key={vendor.id} className="hover:bg-neutral/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-foreground">{vendor.name}</p>
                                                <p className="text-[10px] uppercase tracking-widest text-primary font-black opacity-60">{vendor.role}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-bold">
                                                {currencySymbol}{Number(vendor.amount || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-block px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                                                    vendor.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-600' :
                                                    vendor.payment_status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-neutral-200 text-text-secondary'
                                                }`}>
                                                    {vendor.payment_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PlannerVendors({ weddingId, initialVendors, currency, reload }: any) {
    const [publishing, setPublishing] = useState(false);
    const [newItem, setNewItem] = useState({ 
        role: 'Photographer', 
        name: '', 
        contact: '',
        amount: '',
        payment_status: 'not paid',
        payment_method: 'cash'
    });
    
    const currencySymbol = currency === 'USD' ? '$' : currency === 'Yen' ? '¥' : '₱';
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
        try {
            const { error } = await supabase.from('planner_vendors').insert({ 
                wedding_id: weddingId, 
                role: newItem.role, 
                name: newItem.name,
                phone: newItem.contact,
                amount: parseFloat(newItem.amount) || 0,
                payment_status: newItem.payment_status,
                payment_method: newItem.payment_method
            });
            if (error) throw error;
            setNewItem({ 
                role: newItem.role, 
                name: '', 
                contact: '', 
                amount: '', 
                payment_status: 'not paid', 
                payment_method: 'cash' 
            });
            await reload();
        } catch (err) {
            console.error("Error adding vendor:", err);
        } finally {
            setPublishing(false);
        }
    }

    async function updateVendorStatus(id: string, field: string, value: string) {
        try {
            const { error } = await supabase.from('planner_vendors').update({ [field]: value }).eq('id', id);
            if (error) throw error;
            await reload();
        } catch (err) {
            console.error("Error updating vendor:", err);
        }
    }

    async function deleteItem(id: string) {
        if (!confirm("Delete this vendor?")) return;
        try {
            const { error } = await supabase.from('planner_vendors').delete().eq('id', id);
            if (error) throw error;
            await reload();
        } catch (err) {
            console.error("Error deleting vendor:", err);
        }
    }

    return (
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 soft-shadow border border-border">
            <div className="mb-8 border-b border-border/50 pb-8">
                <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Vendor Rolodex</h2>
                <p className="text-text-secondary">Keep your crucial suppliers and professionals organized.</p>
            </div>

            <form onSubmit={addItem} className="space-y-6 mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1.5 ml-1">Vendor Type</label>
                        <select 
                            value={newItem.role} 
                            onChange={e => e.target.value === 'CUSTOM' ? handleAddCustomRole() : setNewItem({...newItem, role: e.target.value})}
                            className="w-full bg-neutral border border-border rounded-xl px-4 py-3 outline-none focus:ring-primary/20"
                        >
                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                            <option value="CUSTOM">+ Add Custom Supplier</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1.5 ml-1">Business Name</label>
                        <input 
                            required
                            type="text" 
                            placeholder="e.g. Dream Florals Ltd" 
                            value={newItem.name}
                            onChange={e => setNewItem({...newItem, name: e.target.value})}
                            className="w-full bg-neutral border border-border rounded-xl px-4 py-3 outline-none focus:ring-primary/20"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1.5 ml-1">Contact Info</label>
                        <input 
                            type="text" 
                            placeholder="Email or Phone" 
                            value={newItem.contact}
                            onChange={e => setNewItem({...newItem, contact: e.target.value})}
                            className="w-full bg-neutral border border-border rounded-xl px-4 py-3 outline-none focus:ring-primary/20"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1.5 ml-1">Total Agreed Amount ({currencySymbol})</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm font-bold">{currencySymbol}</span>
                            <input 
                                type="number" 
                                placeholder="0.00" 
                                value={newItem.amount}
                                onChange={e => setNewItem({...newItem, amount: e.target.value})}
                                className="w-full bg-neutral border border-border rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-primary/20 font-mono"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1.5 ml-1">Payment Status</label>
                        <select 
                            value={newItem.payment_status}
                            onChange={e => setNewItem({...newItem, payment_status: e.target.value})}
                            className="w-full bg-neutral border border-border rounded-xl px-4 py-3 outline-none focus:ring-primary/20 font-bold"
                        >
                            <option value="not paid">Not Paid</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1.5 ml-1">Payment Method</label>
                        <select 
                            value={newItem.payment_method}
                            onChange={e => setNewItem({...newItem, payment_method: e.target.value})}
                            className="w-full bg-neutral border border-border rounded-xl px-4 py-3 outline-none focus:ring-primary/20 capitalize"
                        >
                            <option value="cash">Cash</option>
                            <option value="g-cash">G-Cash</option>
                            <option value="bank transfer">Bank Transfer</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
                <button type="submit" disabled={publishing} className="w-full bg-primary text-white rounded-2xl px-6 py-5 font-bold disabled:opacity-50 shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all text-lg">
                    {publishing ? 'Adding Supplier...' : 'Add Supplier to My List'}
                </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {initialVendors.length === 0 ? (
                    <div className="col-span-full text-center py-12 opacity-50 font-serif italic">No vendors booked yet. Add your first supplier above.</div>
                ) : (
                    initialVendors.map((vendor: any) => (
                        <div key={vendor.id} className="border border-border rounded-2xl p-6 group relative bg-white hover:border-primary/30 transition-all soft-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary block mb-1">{vendor.role}</span>
                                    <h3 className="font-serif text-xl font-bold text-foreground">{vendor.name}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono font-bold text-lg text-primary">{currencySymbol}{Number(vendor.amount || 0).toLocaleString()}</p>
                                    <p className="text-[10px] uppercase tracking-widest text-text-secondary/50 font-bold">{vendor.payment_method}</p>
                                </div>
                            </div>
                            
                            <p className="text-sm font-mono text-text-secondary mb-6">{vendor.phone || vendor.email || 'No contact provided'}</p>
                            
                            <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                                <select 
                                    value={vendor.payment_status}
                                    onChange={e => updateVendorStatus(vendor.id, 'payment_status', e.target.value)}
                                    className={`flex-1 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg border outline-none transition-colors ${
                                        vendor.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                        vendor.payment_status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                        'bg-neutral text-text-secondary border-border'
                                    }`}
                                >
                                    <option value="not paid">Not Paid</option>
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>

                            <button onClick={() => deleteItem(vendor.id)} className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 border border-border shadow-sm">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
