'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Circle, Plus, Trash2, ListTodo, Wallet, Users, LayoutDashboard, ArrowLeft, Loader2, PieChart as PieChartIcon, TrendingDown, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getWeddingCollaboratorAccess } from '@/lib/wedding-features';

export default function PlannerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: weddingId } = use(params);
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<'checklist' | 'budget' | 'vendors'>('checklist');
    const [loading, setLoading] = useState(true);
    const [accessRole, setAccessRole] = useState<'owner' | 'partner' | 'coordinator' | 'pending' | 'denied'>('denied');

    // Data States
    const [wedding, setWedding] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [budgets, setBudgets] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            void loadPlannerData();
        }
    }, [weddingId, user, authLoading, router]);

    const loadPlannerData = async () => {
        setLoading(true);
        try {
            const { data: accessWedding, error: accessWeddingError } = await supabase
                .from('weddings')
                .select('id, user_id, total_budget, currency')
                .eq('id', weddingId)
                .single();

            if (accessWeddingError || !accessWedding) {
                setAccessRole('denied');
                return;
            }

            if (accessWedding.user_id === user?.id) {
                setAccessRole('owner');
            } else {
                const collaborator = await getWeddingCollaboratorAccess(weddingId, user?.email);
                if (!collaborator) {
                    setAccessRole('denied');
                    return;
                }
                setAccessRole(collaborator.status === 'accepted' ? collaborator.role : 'pending');
                if (collaborator.status !== 'accepted') {
                    return;
                }
            }

            const [tasksRes, budgetsRes, weddingRes, vendorsRes] = await Promise.all([
                supabase.from('planner_tasks').select('*').eq('wedding_id', weddingId).order('created_at', { ascending: false }),
                supabase.from('planner_budgets').select('*').eq('wedding_id', weddingId).order('created_at', { ascending: false }),
                supabase.from('weddings').select('total_budget, currency').eq('id', weddingId).single(),
                supabase.from('planner_vendors').select('*').eq('wedding_id', weddingId),
            ]);

            if (tasksRes.data) setTasks(tasksRes.data);
            if (budgetsRes.data) setBudgets(budgetsRes.data);
            if (weddingRes.data) setWedding(weddingRes.data);
            if (vendorsRes.data) setVendors(vendorsRes.data);
        } catch (err) {
            console.error("Error loading planner data:", err);
        } finally {
            setLoading(false);
        }
    };

    async function updateVendorStatus(id: string, status: string) {
        try {
            const { error } = await supabase.from('planner_vendors').update({ payment_status: status }).eq('id', id);
            if (error) throw error;
            await loadPlannerData();
        } catch (err: any) {
            alert("Failed to update vendor: " + err.message);
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>;
    }

    if (accessRole === 'pending' || accessRole === 'denied') {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6">
                <div className="max-w-xl w-full bg-white rounded-[2rem] border border-border p-8 text-center soft-shadow space-y-4">
                    <h1 className="text-2xl font-serif font-bold text-foreground">
                        {accessRole === 'pending' ? 'Planner Invite Pending' : 'Planner Access Restricted'}
                    </h1>
                    <p className="text-text-secondary">
                        {accessRole === 'pending'
                            ? 'Accept the wedding workspace invite from your dashboard home screen to use the planner.'
                            : 'You do not currently have access to this wedding planner.'}
                    </p>
                    <Link href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-white font-bold min-h-[44px]">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-border sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        <button onClick={() => router.push(`/dashboard/${weddingId}`)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-neutral flex items-center justify-center transition-colors flex-shrink-0 min-h-[44px] min-w-[44px]">
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-text-secondary" />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-lg sm:text-xl font-serif font-bold text-foreground truncate">Wedding Planner</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-12 flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-64 shrink-0">
                    <div className="bg-white rounded-lg sm:rounded-3xl p-3 sm:p-6 soft-shadow border border-border sticky top-20 md:top-24">
                        <div className="space-y-1 sm:space-y-2">
                            <button onClick={() => setActiveTab('checklist')} className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all min-h-[44px] ${activeTab === 'checklist' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-text-secondary hover:bg-neutral hover:text-foreground'}`}>
                                <ListTodo className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> <span className="text-xs sm:text-base">Checklist</span>
                            </button>
                            <button onClick={() => setActiveTab('budget')} className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all min-h-[44px] ${activeTab === 'budget' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-text-secondary hover:bg-neutral hover:text-foreground'}`}>
                                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> <span className="text-xs sm:text-base">Budgets</span>
                            </button>
                            <button onClick={() => setActiveTab('vendors')} className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all min-h-[44px] ${activeTab === 'vendors' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-text-secondary hover:bg-neutral hover:text-foreground'}`}>
                                <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> <span className="text-xs sm:text-base">Vendors</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    {activeTab === 'checklist' && <PlannerChecklists weddingId={weddingId} initialTasks={tasks} reload={loadPlannerData} />}
                    {activeTab === 'budget' && <PlannerBudgets weddingId={weddingId} initialBudgets={budgets} wedding={wedding} vendors={vendors} reload={loadPlannerData} updateVendorStatus={updateVendorStatus} />}
                    {activeTab === 'vendors' && <PlannerVendors weddingId={weddingId} initialVendors={vendors} currency={wedding?.currency || 'USD'} reload={loadPlannerData} updateVendorStatus={updateVendorStatus} />}
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
        <div className="bg-white rounded-lg sm:rounded-[2.5rem] p-4 sm:p-8 md:p-12 soft-shadow border border-border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0 mb-6 sm:mb-8 border-b border-border/50 pb-4 sm:pb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-1 sm:mb-2">To-Do Checklist</h2>
                    <p className="text-xs sm:text-sm text-text-secondary">Keep track of every tiny detail before the big day.</p>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-2xl sm:text-3xl font-serif font-bold text-primary mb-1">{progress}%</p>
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-text-secondary">Completed</p>
                </div>
            </div>

            <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-10">
                <input 
                    type="text" 
                    value={newTask} 
                    onChange={e => setNewTask(e.target.value)} 
                    placeholder="E.g. Book the florist..." 
                    className="flex-1 bg-neutral border border-border rounded-lg sm:rounded-2xl px-3 sm:px-6 py-2 sm:py-4 outline-none focus:ring-2 focus:ring-primary/20 text-xs sm:text-base min-h-[44px]"
                />
                <button type="submit" disabled={publishing || !newTask.trim()} className="bg-primary text-white rounded-lg sm:rounded-2xl px-4 sm:px-6 py-2 sm:py-4 font-bold disabled:opacity-50 text-xs sm:text-base min-h-[44px]">
                    Add
                </button>
            </form>

            <div className="space-y-1 sm:space-y-3">
                {initialTasks.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 opacity-50 font-serif italic text-xs sm:text-base">Your checklist is beautifully empty. Add your first task above!</div>
                ) : (
                    initialTasks.map((task: any) => (
                        <div key={task.id} className="flex items-center justify-between p-2 sm:p-4 rounded-lg sm:rounded-xl hover:bg-neutral transition-colors group gap-2">
                            <div className="flex items-center gap-2 sm:gap-4 flex-1 cursor-pointer min-w-0" onClick={() => toggleTask(task)}>
                                {task.status === 'completed' ? (
                                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 shrink-0" />
                                ) : (
                                    <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-border group-hover:text-primary transition-colors shrink-0" />
                                )}
                                <span className={`text-sm sm:text-lg font-serif truncate ${task.status === 'completed' ? 'text-text-secondary line-through' : 'text-foreground'}`}>
                                    {task.title}
                                </span>
                            </div>
                            <button onClick={() => deleteTask(task.id)} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-50 flex-shrink-0 min-h-[44px] min-w-[44px]">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function PlannerBudgets({ weddingId, initialBudgets, wedding, vendors = [], reload, updateVendorStatus }: any) {
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
            console.log(`Saving ${field}:`, value);
            // 1. Update local states immediately for no-lag feel
            if (field === 'total_budget') setLocalBudget(value);
            if (field === 'currency') setLocalCurrency(value);

            // 2. Persist to Supabase
            const { error, data } = await supabase
                .from('weddings')
                .update({ [field]: value })
                .eq('id', weddingId)
                .select();

            if (error) throw error;
            
            // If data is empty, it means RLS blocked the update
            if (!data || data.length === 0) {
                throw new Error("Update blocked by database permissions (RLS). Please run the Permission Fix SQL script.");
            }

            console.log("Save successful:", data);
            await reload(); 
        } catch (err: any) {
            console.error("Error updating wedding budget:", err);
            alert("Failed to update " + field + ": " + err.message);
            // Revert local state on failure by reloading
            await reload(); 
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

    const totalEst = initialBudgets.reduce((acc: number, item: any) => acc + (parseFloat(item.estimated_cost) || 0), 0);
    const totalSpentFromVendors = vendors
        .filter((v: any) => v.payment_status?.toLowerCase() === 'paid')
        .reduce((acc: number, v: any) => acc + (parseFloat(v.amount) || 0), 0);
    
    // Total "Committed/Spent" is both the estimates you added AND what you already paid vendors
    const totalCommitted = totalEst + totalSpentFromVendors;
    const budgetRemaining = (parseFloat(wedding?.total_budget) || 0) - totalCommitted;
    const usagePercent = wedding?.total_budget > 0 ? Math.min(100, Math.round((totalCommitted / wedding.total_budget) * 100)) : 0;

    // Chart Data
    const chartData = [
        { name: 'Allocated (Budget List)', value: totalEst },
        { name: 'Paid Vendors', value: totalSpentFromVendors },
        { name: 'Remaining', value: Math.max(0, budgetRemaining) }
    ];
    const COLORS = ['#D16C78', '#CBB26A', '#E5E7EB'];

    // Derive symbol from localCurrency for immediate UI feedback
    const currencySymbol = localCurrency === 'USD' ? '$' : localCurrency === 'Yen' ? '¥' : '₱';

    return (
        <div className="bg-white rounded-lg sm:rounded-[2.5rem] p-4 sm:p-8 md:p-12 soft-shadow border border-border overflow-x-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-8 border-b border-border/50 pb-4 sm:pb-8 gap-3 sm:gap-6">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-1 sm:mb-2">Budget Tracker</h2>
                    <p className="text-xs sm:text-sm text-text-secondary">Keep your wedding finances clearly mapped out.</p>
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 md:gap-6 items-start sm:items-end w-full sm:w-auto">
                    <div className="text-left sm:text-right">
                        <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1">Wedding Budget Settings</p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <select 
                                value={localCurrency} 
                                onChange={e => {
                                    setLocalCurrency(e.target.value);
                                    saveWeddingBudget('currency', e.target.value);
                                }}
                                className="bg-neutral border border-border rounded-lg px-2 py-1 text-xs outline-none focus:ring-primary/20 font-bold min-h-[44px]"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="Yen">Yen (¥)</option>
                                <option value="Peso">Peso (₱)</option>
                            </select>
                            <div className="relative w-full sm:w-auto">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-primary font-bold text-base sm:text-lg">{currencySymbol}</span>
                                <input 
                                    type="number" 
                                    value={localBudget}
                                    onChange={e => setLocalBudget(parseFloat(e.target.value) || 0)}
                                    onBlur={e => saveWeddingBudget('total_budget', parseFloat(e.target.value) || 0)}
                                    className="text-lg sm:text-2xl font-mono text-primary w-full sm:w-40 bg-neutral border border-border rounded-lg sm:rounded-xl pl-8 pr-3 sm:pr-4 py-2 outline-none focus:ring-primary/20 min-h-[44px]"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="text-left sm:text-right">
                        <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1">Total Dedicated</p>
                        <p className={`text-xl sm:text-3xl font-mono ${totalCommitted > (wedding?.total_budget || 0) ? 'text-red-500' : 'text-primary'} font-bold`}>{currencySymbol}{totalCommitted.toLocaleString()}</p>
                    </div>
                    <div className="text-left sm:text-right">
                        <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-emerald-600 mb-1">Balance Remaining</p>
                        <p className={`text-xl sm:text-3xl font-mono ${budgetRemaining < 0 ? 'text-red-500' : 'text-emerald-500'} font-black`}>
                            {currencySymbol}{budgetRemaining.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
                {/* Visual Usage */}
                <div className="lg:col-span-2 bg-neutral/30 p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-[2rem] border border-border/50 flex flex-col md:flex-row items-center gap-4 sm:gap-6 md:gap-8 shadow-inner">
                    <div className="w-full md:w-1/2 h-[180px] sm:h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={60}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value: any) => [`${currencySymbol}${value.toLocaleString()}`, 'Amount']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full md:w-1/2 space-y-3 sm:space-y-4">
                        <div className="flex justify-between items-end gap-2">
                            <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-text-secondary">Overall Usage</h3>
                            <span className={`text-lg sm:text-2xl font-black ${usagePercent > 90 ? 'text-red-500' : 'text-primary'}`}>{usagePercent}%</span>
                        </div>
                        <div className="w-full h-2 sm:h-3 bg-white rounded-full overflow-hidden border border-border/50">
                            <div className={`h-full transition-all duration-1000 ${usagePercent > 90 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${usagePercent}%` }} />
                        </div>
                        <div className="grid grid-cols-1 gap-2 pt-2 sm:pt-4">
                            {chartData.map((entry, i) => (
                                <div key={entry.name} className="flex justify-between items-center text-xs gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i] }} />
                                        <span className="text-text-secondary font-bold truncate">{entry.name}</span>
                                    </div>
                                    <span className="font-mono font-bold text-xs flex-shrink-0">{currencySymbol}{entry.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Info */}
                <div className="bg-white border border-border rounded-lg sm:rounded-[2rem] p-4 sm:p-6 md:p-8 flex flex-col justify-center gap-3 sm:gap-6 soft-shadow">
                    <div className="flex items-start sm:items-center gap-2 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 min-h-[44px] min-w-[44px]">
                            <PieChartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary">Planned Total</p>
                            <p className="text-base sm:text-lg md:text-xl font-mono font-bold">{currencySymbol}{totalEst.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-start sm:items-center gap-2 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0 min-h-[44px] min-w-[44px]">
                            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                        </div>
                        <div>
                            <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary">Paid to Vendors</p>
                            <p className="text-base sm:text-lg md:text-xl font-mono font-bold">{currencySymbol}{totalSpentFromVendors.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-start sm:items-center gap-2 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0 min-h-[44px] min-w-[44px]">
                            <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary">Remaining Cash</p>
                            <p className="text-base sm:text-lg md:text-xl font-mono font-bold text-emerald-600">{currencySymbol}{Math.max(0, budgetRemaining).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={addItem} className="space-y-4 sm:space-y-6 mb-8 sm:mb-12 bg-neutral/30 p-4 sm:p-6 rounded-lg sm:rounded-[2rem] border border-border/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    <div>
                        <label className="block text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1.5 ml-1">Category</label>
                        <select 
                            value={newItem.category} 
                            onChange={e => e.target.value === 'CUSTOM' ? handleAddCustomCategory() : setNewItem({...newItem, category: e.target.value})}
                            className="w-full bg-white border border-border rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 outline-none focus:ring-primary/20 text-xs sm:text-base min-h-[44px]"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            <option value="CUSTOM">+ Add Custom Category</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1.5 ml-1">Expense/Item Title</label>
                        <input 
                            required
                            type="text" 
                            placeholder="e.g. Venue Rental" 
                            value={newItem.item_name}
                            onChange={e => setNewItem({...newItem, item_name: e.target.value})}
                            className="w-full bg-white border border-border rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 outline-none focus:ring-primary/20 text-xs sm:text-base min-h-[44px]"
                        />
                    </div>
                    <div>
                        <label className="block text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary mb-1.5 ml-1">Estimated Cost ({currencySymbol})</label>
                        <div className="relative">
                            <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-text-secondary text-xs sm:text-sm font-bold">{currencySymbol}</span>
                            <input 
                                required
                                type="number" 
                                placeholder="0.00" 
                                value={newItem.estimated_cost}
                                onChange={e => setNewItem({...newItem, estimated_cost: e.target.value})}
                                className="w-full bg-white border border-border rounded-lg sm:rounded-xl pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 outline-none focus:ring-primary/20 font-mono text-xs sm:text-base min-h-[44px]"
                            />
                        </div>
                    </div>
                </div>
                <button type="submit" disabled={publishing} className="w-full bg-primary text-white rounded-lg sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-5 font-bold shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm sm:text-lg min-h-[44px]">
                    {publishing ? 'Adding to Budget...' : 'Add Expense to Tracker'}
                </button>
            </form>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                {/* Estimates from Budget Table */}
                <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground flex items-center gap-2 mb-3 sm:mb-4">
                        <ListTodo className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" /> Budget Estimates
                    </h3>
                    {categories.map(category => {
                        const items = initialBudgets.filter((b: any) => b.category === category);
                        if (items.length === 0) return null;
                        const catTotal = items.reduce((acc: number, item: any) => acc + Number(item.estimated_cost || 0), 0);
                        
                        return (
                            <div key={category} className="border border-border rounded-lg sm:rounded-2xl overflow-hidden bg-white">
                                <div className="bg-neutral/30 px-3 sm:px-6 py-2 sm:py-3 flex justify-between items-center border-b border-border gap-2">
                                    <h4 className="font-bold text-xs sm:text-sm text-text-secondary uppercase tracking-widest">{category}</h4>
                                    <span className="font-mono font-bold text-xs sm:text-sm whitespace-nowrap">{currencySymbol}{catTotal.toLocaleString()}</span>
                                </div>
                                <div className="divide-y divide-border/30 max-h-[400px] overflow-y-auto">
                                    {items.map((item: any) => (
                                        <div key={item.id} className="p-3 sm:p-4 md:px-6 flex justify-between items-center group hover:bg-neutral/10 gap-2 text-xs sm:text-base">
                                            <p className="font-serif truncate">{item.item_name}</p>
                                            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                                                <span className="font-mono text-text-secondary text-xs sm:text-sm whitespace-nowrap">{currencySymbol}{Number(item.estimated_cost).toLocaleString()}</span>
                                                <button onClick={() => deleteItem(item.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity min-h-[44px] min-w-[44px] flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Actual Spending from Vendors */}
                <div className="space-y-4 sm:space-y-6">
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground flex items-center gap-2 mb-3 sm:mb-4">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" /> Actual Vendor Spending
                    </h3>
                    <div className="bg-white border border-border rounded-lg sm:rounded-[2rem] overflow-hidden soft-shadow">
                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <table className="w-full text-left border-collapse text-xs sm:text-base px-4 sm:px-0">
                            <thead>
                                <tr className="bg-neutral/30 border-b border-border sticky top-0">
                                    <th className="px-3 sm:px-6 py-2 sm:py-4 text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary">Vendor / Role</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-4 text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary text-right">Amount</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-4 text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-text-secondary text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {vendors.length === 0 ? (
                                    <tr><td colSpan={3} className="px-3 sm:px-6 py-8 sm:py-12 text-center text-text-secondary italic font-serif text-xs sm:text-base">No vendors added yet.</td></tr>
                                ) : (
                                    vendors.map((vendor: any) => (
                                        <tr key={vendor.id} className="hover:bg-neutral/10 transition-colors">
                                            <td className="px-3 sm:px-6 py-2 sm:py-4">
                                                <p className="font-bold text-foreground text-xs sm:text-base line-clamp-1">{vendor.name}</p>
                                                <p className="text-[7px] sm:text-[10px] uppercase tracking-widest text-primary font-black opacity-60">{vendor.role}</p>
                                            </td>
                                            <td className="px-3 sm:px-6 py-2 sm:py-4 text-right font-mono font-bold text-xs sm:text-base">
                                                {currencySymbol}{Number(vendor.amount || 0).toLocaleString()}
                                            </td>
                                            <td className="px-3 sm:px-6 py-2 sm:py-4 text-center">
                                                <select
                                                    value={vendor.payment_status}
                                                    onChange={(e) => updateVendorStatus(vendor.id, e.target.value)}
                                                    className={`px-2 py-1 rounded text-[7px] sm:text-[10px] font-black uppercase tracking-widest border-none outline-none cursor-pointer min-h-[44px] ${
                                                        vendor.payment_status?.toLowerCase() === 'paid' ? 'bg-emerald-100 text-emerald-600' :
                                                        vendor.payment_status?.toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-600' :
                                                        'bg-neutral-200 text-text-secondary'
                                                    }`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="paid">Paid</option>
                                                </select>
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
        </div>
    );
}

function PlannerVendors({ weddingId, initialVendors, currency, reload, updateVendorStatus }: any) {
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

    // updateVendorStatus moved to parent

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
                                    onChange={e => updateVendorStatus(vendor.id, e.target.value)}
                                    className={`flex-1 text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg border outline-none transition-colors ${
                                        vendor.payment_status?.toLowerCase() === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                        vendor.payment_status?.toLowerCase() === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
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
