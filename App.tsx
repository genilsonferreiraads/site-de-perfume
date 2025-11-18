
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Page, PaymentMethod, SaleStatus } from './types';
import type { Client, Product, Sale, Expense, SaleItem, Payment } from './types';

// --- INITIAL DATA ---
const initialClients: Client[] = [
    { id: '1', name: 'Ana Clara Souza', phone: '(11) 98765-4321', email: 'ana.souza@email.com', address: 'Rua das Flores, 123', avatarUrl: 'https://picsum.photos/id/1027/100/100' },
    { id: '2', name: 'Bruno Oliveira', phone: '(21) 91234-5678', email: 'bruno.oliveira@email.com', address: 'Avenida Brasil, 456', avatarUrl: 'https://picsum.photos/id/1005/100/100' },
    { id: '3', name: 'Carla Martins', phone: '(31) 99988-7766', email: 'carla.martins@email.com', address: 'Praça da Liberdade, 789', avatarUrl: 'https://picsum.photos/id/1011/100/100' },
    { id: '4', name: 'Beatriz Costa', phone: '(41) 98877-6655', email: 'beatriz.costa@email.com', address: 'Alameda dos Anjos, 101', avatarUrl: 'https://picsum.photos/id/1012/100/100' },
    { id: '5', name: 'Carlos Andrade', phone: '(51) 97766-5544', email: 'carlos.andrade@email.com', address: 'Rua do Sol, 202', avatarUrl: 'https://picsum.photos/id/1013/100/100' },
];

const initialProducts: Product[] = [
    { id: 'p1', name: 'Kaiak Aventura', price: 149.90 },
    { id: 'p2', name: 'Egeo Dolce', price: 119.90 },
    { id: 'p3', name: 'La Vie Est Belle', price: 350.00 },
    { id: 'p4', name: 'Sauvage Dior', price: 420.00 },
    { id: 'p5', name: 'Acqua di Giò', price: 380.00 },
    { id: 'p6', name: 'Good Girl', price: 280.00 },
    { id: 'p7', name: 'Bleu de Chanel', price: 450.00 },
    { id: 'p8', name: 'Perfume Elegance', price: 250.00},
    { id: 'p9', name: 'Kit Hidratante', price: 110.00 },
    { id: 'p10', name: 'Perfume Fresh', price: 320.00 }
];

const initialSales: Sale[] = [
    { id: 's1', clientId: '4', items: [{ productId: 'p8', quantity: 1, unitPrice: 250.00 }], total: 250.00, date: '2024-05-15', paymentMethod: PaymentMethod.Credit, payments: [] },
    { id: 's2', clientId: '4', items: [{ productId: 'p9', quantity: 1, unitPrice: 110.00 }], total: 110.00, date: '2024-04-02', paymentMethod: PaymentMethod.Credit, payments: [{id: 'pay1', date: '2024-05-10', amount: 90.00, method: 'PIX'}] },
    { id: 's3', clientId: '4', items: [{ productId: 'p10', quantity: 1, unitPrice: 320.00 }], total: 320.00, date: '2024-03-10', paymentMethod: PaymentMethod.Credit, payments: [{id: 'pay2', date: '2024-03-12', amount: 320.00, method: 'Dinheiro'}] },
    { id: 's4', clientId: '5', items: [{ productId: 'p3', quantity: 1, unitPrice: 180.50 }], total: 180.50, date: '2024-06-10', paymentMethod: PaymentMethod.Credit, payments: [] },
    { id: 's5', clientId: '1', items: [{ productId: 'p1', quantity: 1, unitPrice: 149.90 }], total: 149.90, date: '2024-06-20', paymentMethod: PaymentMethod.Pix, payments: [{id: 'pay3', date: '2024-06-20', amount: 149.90, method: 'PIX'}] },
    { id: 's6', clientId: '2', items: [{ productId: 'p2', quantity: 2, unitPrice: 119.90 }], total: 239.80, date: '2024-06-18', paymentMethod: PaymentMethod.Card, payments: [{id: 'pay4', date: '2024-06-18', amount: 239.80, method: 'Cartão'}] },
];

const initialExpenses: Expense[] = [
    { id: 'e1', description: 'Compra de amostras', category: 'Compra de Estoque', amount: 150.00, date: '2024-06-10' },
    { id: 'e2', description: 'Embalagens', category: 'Outros', amount: 75.50, date: '2024-06-05' },
];

const initialUser = {
    name: 'Ana Silva',
    phone: '(11) 98765-4321',
    email: 'ana.silva@email.com',
    avatarUrl: 'https://picsum.photos/id/1018/100/100'
};

// --- HELPER COMPONENTS & HOOKS ---

const useStickyState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [value, setValue] = useState<T>(() => {
        const stickyValue = window.localStorage.getItem(key);
        return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    });
    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);
    return [value, setValue];
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative w-full sm:max-w-md bg-surface-light dark:bg-surface-dark rounded-t-2xl sm:rounded-2xl shadow-2xl transform transition-transform animate-slide-up sm:animate-none flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark shrink-0">
                    <h2 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">{title}</h2>
                    <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark">
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>
                <div className="p-5 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- NAVIGATION COMPONENTS ---

const BottomNav: React.FC<{ activePage: Page; setActivePage: (page: Page) => void; openMenu: () => void }> = ({ activePage, setActivePage, openMenu }) => {
    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark z-40 safe-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="grid grid-cols-4 h-16">
                <button onClick={() => setActivePage(Page.Dashboard)} className={`flex flex-col items-center justify-center gap-1 ${activePage === Page.Dashboard ? 'text-primary' : 'text-gray-400'}`}>
                    <span className={`material-symbols-outlined ${activePage === Page.Dashboard ? 'fill' : ''}`}>dashboard</span>
                    <span className="text-[10px] font-medium">Início</span>
                </button>
                <button onClick={() => setActivePage(Page.NovaVenda)} className="flex flex-col items-center justify-center -mt-6">
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${activePage === Page.NovaVenda ? 'bg-primary text-white' : 'bg-primary text-white'}`}>
                         <span className="material-symbols-outlined text-3xl">add</span>
                    </div>
                    <span className={`text-[10px] font-medium mt-1 ${activePage === Page.NovaVenda ? 'text-primary' : 'text-gray-400'}`}>Vender</span>
                </button>
                <button onClick={() => setActivePage(Page.Fiados)} className={`flex flex-col items-center justify-center gap-1 ${activePage === Page.Fiados ? 'text-primary' : 'text-gray-400'}`}>
                    <span className={`material-symbols-outlined ${activePage === Page.Fiados ? 'fill' : ''}`}>receipt_long</span>
                    <span className="text-[10px] font-medium">Fiados</span>
                </button>
                <button onClick={openMenu} className={`flex flex-col items-center justify-center gap-1 ${[Page.Produtos, Page.Clientes, Page.Historico, Page.Despesas, Page.Configuracoes].includes(activePage) ? 'text-primary' : 'text-gray-400'}`}>
                     <span className="material-symbols-outlined">menu</span>
                    <span className="text-[10px] font-medium">Menu</span>
                </button>
            </div>
        </nav>
    );
};

const Sidebar: React.FC<{ activePage: Page; setActivePage: (page: Page) => void }> = ({ activePage, setActivePage }) => {
    const navItems = [
        { id: Page.Dashboard, icon: 'dashboard', label: 'Dashboard' },
        { id: Page.NovaVenda, icon: 'shopping_cart', label: 'Nova Venda' },
        { id: Page.Produtos, icon: 'inventory_2', label: 'Produtos' },
        { id: Page.Clientes, icon: 'group', label: 'Clientes' },
        { id: Page.Historico, icon: 'history', label: 'Histórico' },
        { id: Page.Fiados, icon: 'receipt_long', label: 'Fiados' },
        { id: Page.Despesas, icon: 'account_balance_wallet', label: 'Despesas' },
        { id: Page.Configuracoes, icon: 'settings', label: 'Configurações' },
    ];
    
    return (
        <aside className="hidden md:flex flex-col w-64 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark p-4 shrink-0 h-screen sticky top-0">
            <div className="flex items-center gap-3 px-2 pb-8 pt-4">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-white text-2xl">fragrance</span>
                </div>
                <div>
                    <h1 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark leading-tight">PerfumeFlow</h1>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Gestão de Revenda</p>
                </div>
            </div>
            <nav className="flex flex-col gap-1.5 flex-grow">
                {navItems.map(item => (
                    <button key={item.id} onClick={() => setActivePage(item.id)}
                       className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group ${activePage === item.id ? 'bg-primary text-white shadow-md shadow-primary/20' : 'hover:bg-gray-100 dark:hover:bg-white/5 text-text-secondary-light dark:text-text-secondary-dark'}`}>
                        <span className={`material-symbols-outlined ${activePage === item.id ? 'fill' : ''}`}>{item.icon}</span>
                        <p className="text-sm font-semibold">{item.label}</p>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

const MenuSheet: React.FC<{ isOpen: boolean; onClose: () => void; setActivePage: (page: Page) => void; activePage: Page }> = ({ isOpen, onClose, setActivePage, activePage }) => {
    if (!isOpen) return null;
    
    const menuItems = [
        { id: Page.Produtos, icon: 'inventory_2', label: 'Produtos', desc: 'Gerencie seu estoque' },
        { id: Page.Clientes, icon: 'group', label: 'Clientes', desc: 'Base de contatos' },
        { id: Page.Historico, icon: 'history', label: 'Histórico', desc: 'Todas as vendas' },
        { id: Page.Despesas, icon: 'account_balance_wallet', label: 'Despesas', desc: 'Custos e saídas' },
        { id: Page.Configuracoes, icon: 'settings', label: 'Configurações', desc: 'Perfil e dados' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-end md:hidden">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full bg-surface-light dark:bg-surface-dark rounded-t-2xl p-5 pb-8 animate-slide-up max-h-[80vh] overflow-y-auto safe-bottom">
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                </div>
                <h3 className="text-lg font-bold mb-6 px-2 text-text-primary-light dark:text-text-primary-dark">Menu Principal</h3>
                <div className="grid grid-cols-1 gap-2">
                    {menuItems.map(item => (
                        <button key={item.id} onClick={() => { setActivePage(item.id); onClose(); }}
                            className={`flex items-center gap-4 p-4 rounded-2xl transition-colors ${activePage === item.id ? 'bg-primary/10 border border-primary/20' : 'bg-background-light dark:bg-white/5'}`}>
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${activePage === item.id ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300'}`}>
                                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                            </div>
                            <div className="text-left">
                                <p className={`font-bold ${activePage === item.id ? 'text-primary' : 'text-text-primary-light dark:text-text-primary-dark'}`}>{item.label}</p>
                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{item.desc}</p>
                            </div>
                            <span className="material-symbols-outlined ml-auto text-gray-400 text-sm">arrow_forward_ios</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Header: React.FC<{ title: string; subtitle?: string; rightAction?: React.ReactNode }> = ({ title, subtitle, rightAction }) => (
    <header className="sticky top-0 z-30 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md border-b border-border-light dark:border-border-dark px-4 py-3 flex items-center justify-between md:hidden">
        <div>
            <h1 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">{title}</h1>
            {subtitle && <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{subtitle}</p>}
        </div>
        {rightAction}
    </header>
);

const DesktopHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
    <header className="hidden md:flex items-center justify-between mb-8">
        <div>
            <h1 className="text-3xl font-black text-text-primary-light dark:text-text-primary-dark tracking-tight">{title}</h1>
            {subtitle && <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">{subtitle}</p>}
        </div>
        {action}
    </header>
);

// --- UI COMPONENTS ---

const StatCard: React.FC<{ title: string; value: string; icon: string; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-card-light dark:bg-card-dark p-4 rounded-2xl border border-border-light dark:border-border-dark shadow-sm flex items-center gap-4">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color} bg-opacity-10 text-${color.split('-')[1]}-600 shrink-0`}>
            <span className="material-symbols-outlined" style={{color: 'inherit'}}>{icon}</span>
        </div>
        <div>
            <p className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">{title}</p>
            <p className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark mt-0.5">{value}</p>
        </div>
    </div>
);

// --- PAGE COMPONENTS ---

const FullDashboardPage: React.FC<{sales: Sale[], expenses: Expense[], user: any, toggleTheme: () => void, isDarkMode: boolean}> = ({ sales, expenses, user, toggleTheme, isDarkMode }) => {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    const monthlyProfitData = useMemo(() => {
        const months: { [key: string]: number } = {};
        sales.forEach(sale => {
            const month = new Date(sale.date).toLocaleDateString('pt-BR', { month: 'short' });
            months[month] = (months[month] || 0) + sale.total;
        });
        return Object.entries(months).map(([name, Vendas]) => ({ name, Vendas })).slice(-6); 
    }, [sales]);

    return (
        <div className="pb-20 md:pb-0 md:p-8">
            <Header 
                title="Dashboard" 
                subtitle={`Olá, ${user.name.split(' ')[0]}`} 
                rightAction={
                    <button onClick={toggleTheme} className="h-9 w-9 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
                    </button>
                }
            />
            <div className="p-4 md:p-0">
                <DesktopHeader title="Dashboard" subtitle="Visão geral do seu negócio" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-primary rounded-2xl p-6 text-white shadow-lg shadow-primary/30 relative overflow-hidden">
                         <div className="relative z-10">
                            <p className="text-sm font-medium opacity-90 mb-1">Faturamento Total</p>
                            <h2 className="text-3xl font-black">R$ {totalRevenue.toFixed(2)}</h2>
                         </div>
                         <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12">payments</span>
                    </div>
                    <StatCard title="Lucro Líquido" value={`R$ ${netProfit.toFixed(2)}`} icon="trending_up" color="bg-green-500" />
                    <StatCard title="Despesas" value={`R$ ${totalExpenses.toFixed(2)}`} icon="money_off" color="bg-red-500" />
                </div>

                <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 border border-border-light dark:border-border-dark shadow-sm mb-6">
                    <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark mb-4">Vendas Recentes</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyProfitData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#9ca3af" />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                                <Bar dataKey="Vendas" fill="#059669" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FullNewSalePage: React.FC<{
    clients: Client[],
    products: Product[],
    addSale: (sale: Omit<Sale, 'id'>) => void,
    onSaleComplete: () => void,
    showToast: (msg: string, type: 'success' | 'error') => void
}> = ({ clients, products, addSale, onSaleComplete, showToast }) => {
    const [cart, setCart] = useState<SaleItem[]>([]);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Pix);
    const [searchTerm, setSearchTerm] = useState('');

    const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0), [cart]);
    const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleAddToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(i => i.productId === product.id);
            if (existing) {
                return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { productId: product.id, quantity: 1, unitPrice: product.price }];
        });
        showToast(`${product.name} adicionado`, 'success');
    };

    const handleUpdateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.productId === productId) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const handleFinishSale = () => {
        if (!selectedClientId) {
            showToast('Selecione um cliente', 'error');
            return;
        }
        
        addSale({
            clientId: selectedClientId,
            items: cart,
            total: cartTotal,
            date: new Date().toISOString(),
            paymentMethod,
            payments: paymentMethod !== PaymentMethod.Credit ? [{id: `p${Date.now()}`, date: new Date().toISOString(), amount: cartTotal, method: paymentMethod}] : [],
        });

        setIsCheckoutOpen(false);
        showToast('Venda realizada!', 'success');
        setTimeout(onSaleComplete, 500);
    };

    return (
        <div className="h-full flex flex-col pb-20 md:pb-0 relative">
            <Header title="Nova Venda" />
            <div className="p-4 md:p-8 flex-1 overflow-y-auto md:overflow-hidden custom-scrollbar">
                <DesktopHeader title="Nova Venda" subtitle="Selecione os produtos" />
                
                <div className="flex flex-col h-full">
                    {/* Search */}
                    <div className="relative mb-4 shrink-0">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="form-input w-full pl-10 h-12 rounded-xl bg-surface-light dark:bg-surface-dark border-none shadow-sm"
                            placeholder="Buscar produtos..."
                        />
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-24 md:pb-0 md:overflow-y-auto custom-scrollbar">
                        {filteredProducts.map(product => {
                            const inCart = cart.find(i => i.productId === product.id);
                            return (
                                <div key={product.id} onClick={() => handleAddToCart(product)}
                                     className={`relative bg-card-light dark:bg-card-dark p-3 rounded-2xl border transition-all active:scale-95 cursor-pointer ${inCart ? 'border-primary ring-1 ring-primary' : 'border-transparent shadow-sm'}`}>
                                    <div className="aspect-square rounded-xl bg-gray-100 dark:bg-white/5 mb-3 flex items-center justify-center relative overflow-hidden">
                                        <span className="material-symbols-outlined text-4xl text-gray-300">inventory_2</span>
                                        {inCart && (
                                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
                                                <span className="text-3xl font-bold text-primary shadow-white drop-shadow-md">{inCart.quantity}</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="font-medium text-sm line-clamp-2 h-10 leading-tight text-text-primary-light dark:text-text-primary-dark">{product.name}</p>
                                    <p className="font-bold text-primary mt-1">R$ {product.price.toFixed(2)}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Mobile Floating Cart Bar */}
            {cart.length > 0 && (
                <div className="fixed md:absolute bottom-20 md:bottom-8 left-4 right-4 z-30 animate-slide-up">
                    <button onClick={() => setIsCheckoutOpen(true)} className="w-full h-14 bg-primary text-white rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-between px-5">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                {cartCount}
                            </div>
                            <span className="font-bold text-sm">Ver Carrinho</span>
                        </div>
                        <span className="font-bold text-lg">R$ {cartTotal.toFixed(2)}</span>
                    </button>
                </div>
            )}

            {/* Checkout Sheet (Mobile & Desktop) */}
            {isCheckoutOpen && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:bg-black/50 md:backdrop-blur-sm">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setIsCheckoutOpen(false)}></div>
                    <div className="relative w-full md:max-w-lg bg-surface-light dark:bg-surface-dark h-[85vh] md:h-auto md:max-h-[85vh] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col animate-slide-up">
                         <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mt-3 mb-2 md:hidden"></div>
                         
                         <div className="p-5 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                             <h2 className="text-xl font-bold">Carrinho</h2>
                             <button onClick={() => setIsCheckoutOpen(false)} className="p-2 bg-gray-100 dark:bg-white/10 rounded-full">
                                 <span className="material-symbols-outlined text-base">close</span>
                             </button>
                         </div>

                         <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                             {cart.map(item => {
                                 const p = products.find(prod => prod.id === item.productId);
                                 return (
                                     <div key={item.productId} className="flex items-center justify-between">
                                         <div className="flex-1">
                                             <p className="font-medium text-text-primary-light dark:text-text-primary-dark">{p?.name}</p>
                                             <p className="text-primary font-bold text-sm">R$ {p?.price.toFixed(2)}</p>
                                         </div>
                                         <div className="flex items-center gap-3 bg-background-light dark:bg-white/5 rounded-lg p-1">
                                             <button onClick={() => handleUpdateQuantity(item.productId, -1)} className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-black/20 shadow-sm"><span className="material-symbols-outlined text-sm">remove</span></button>
                                             <span className="w-4 text-center font-bold text-sm">{item.quantity}</span>
                                             <button onClick={() => handleUpdateQuantity(item.productId, 1)} className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-black/20 shadow-sm"><span className="material-symbols-outlined text-sm">add</span></button>
                                         </div>
                                     </div>
                                 )
                             })}
                         </div>

                         <div className="p-5 bg-background-light dark:bg-black/20 safe-bottom">
                             <div className="space-y-4 mb-4">
                                 <div>
                                    <label className="block text-xs font-bold text-text-secondary-light uppercase mb-1">Cliente</label>
                                    <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="form-select w-full h-12 rounded-xl border-none shadow-sm bg-surface-light dark:bg-surface-dark">
                                        <option value="">Selecionar Cliente...</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                 </div>
                                 <div>
                                    <label className="block text-xs font-bold text-text-secondary-light uppercase mb-1">Pagamento</label>
                                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                        {Object.values(PaymentMethod).map(method => (
                                            <button key={method} onClick={() => setPaymentMethod(method)}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${paymentMethod === method ? 'bg-primary text-white' : 'bg-surface-light dark:bg-surface-dark text-text-secondary-light shadow-sm'}`}>
                                                {method}
                                            </button>
                                        ))}
                                    </div>
                                 </div>
                             </div>
                             <div className="flex justify-between items-center mb-4">
                                 <span className="text-text-secondary-light">Total</span>
                                 <span className="text-2xl font-black text-primary">R$ {cartTotal.toFixed(2)}</span>
                             </div>
                             <button onClick={handleFinishSale} className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 text-lg">
                                 Finalizar Pedido
                             </button>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const FullClientsPage: React.FC<{
    clients: Client[], 
    addClient: (c: any) => void,
    deleteClient: (id: string) => void,
    showToast: (msg: string, type: any) => void
}> = ({ clients, addClient, deleteClient, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newClient, setNewClient] = useState({ name: '', phone: '', email: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newClient.name) {
            addClient(newClient);
            setNewClient({ name: '', phone: '', email: '' });
            setIsModalOpen(false);
            showToast('Cliente salvo!', 'success');
        }
    };

    return (
        <div className="pb-20 md:pb-0">
            <Header title="Clientes" rightAction={<button onClick={() => setIsModalOpen(true)} className="text-primary font-bold text-sm">Novo</button>} />
            <div className="p-4 md:p-8">
                 <DesktopHeader title="Clientes" action={
                     <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                         <span className="material-symbols-outlined">add</span> Novo Cliente
                     </button>
                 } />
                 
                 <input 
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="form-input w-full h-12 rounded-xl bg-card-light dark:bg-card-dark border-transparent shadow-sm mb-4"
                    placeholder="Buscar clientes..."
                 />

                 <div className="space-y-3">
                     {filtered.map(client => (
                         <div key={client.id} className="bg-card-light dark:bg-card-dark p-4 rounded-2xl border border-border-light dark:border-border-dark shadow-sm flex items-center gap-4">
                             <img src={client.avatarUrl} className="w-12 h-12 rounded-full bg-gray-200 object-cover" />
                             <div className="flex-1 min-w-0">
                                 <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark truncate">{client.name}</h3>
                                 <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{client.phone}</p>
                             </div>
                             <button onClick={() => { if(confirm('Excluir?')) deleteClient(client.id) }} className="p-2 text-gray-400 hover:text-red-500">
                                 <span className="material-symbols-outlined">delete</span>
                             </button>
                         </div>
                     ))}
                 </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Cliente">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="text-sm font-bold">Nome</label><input className="form-input w-full rounded-lg h-11" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} required /></div>
                    <div><label className="text-sm font-bold">Telefone</label><input className="form-input w-full rounded-lg h-11" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} required /></div>
                    <div><label className="text-sm font-bold">Email</label><input className="form-input w-full rounded-lg h-11" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} /></div>
                    <button type="submit" className="w-full bg-primary text-white h-12 rounded-xl font-bold mt-2">Salvar Cliente</button>
                </form>
            </Modal>
        </div>
    )
};

const FullProductsPage: React.FC<{
    products: Product[], 
    addProduct: (p: any) => void,
    deleteProduct: (id: string) => void,
    showToast: (msg: string, type: any) => void
}> = ({ products, addProduct, deleteProduct, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProd, setNewProd] = useState({ name: '', price: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newProd.name && newProd.price) {
            addProduct({ name: newProd.name, price: parseFloat(newProd.price) });
            setNewProd({ name: '', price: '' });
            setIsModalOpen(false);
            showToast('Produto criado!', 'success');
        }
    };

    return (
        <div className="pb-20 md:pb-0">
            <Header title="Produtos" rightAction={<button onClick={() => setIsModalOpen(true)} className="text-primary font-bold text-sm">Novo</button>} />
            <div className="p-4 md:p-8">
                 <DesktopHeader title="Produtos" action={
                     <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                         <span className="material-symbols-outlined">add</span> Novo Produto
                     </button>
                 } />
                 
                 <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="form-input w-full h-12 rounded-xl bg-card-light dark:bg-card-dark border-transparent shadow-sm mb-4" placeholder="Buscar produtos..." />

                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                     {filtered.map(product => (
                         <div key={product.id} className="bg-card-light dark:bg-card-dark p-4 rounded-2xl border border-border-light dark:border-border-dark shadow-sm flex justify-between items-center">
                             <div className="flex items-center gap-3">
                                 <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                     <span className="material-symbols-outlined">inventory_2</span>
                                 </div>
                                 <div>
                                     <h3 className="font-bold text-sm">{product.name}</h3>
                                     <p className="text-primary font-bold">R$ {product.price.toFixed(2)}</p>
                                 </div>
                             </div>
                             <button onClick={() => { if(confirm('Excluir?')) deleteProduct(product.id) }} className="p-2 text-gray-400 hover:text-red-500">
                                 <span className="material-symbols-outlined">delete</span>
                             </button>
                         </div>
                     ))}
                 </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Produto">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="text-sm font-bold">Nome</label><input className="form-input w-full rounded-lg h-11" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} required /></div>
                    <div><label className="text-sm font-bold">Preço</label><input type="number" step="0.01" className="form-input w-full rounded-lg h-11" value={newProd.price} onChange={e => setNewProd({...newProd, price: e.target.value})} required /></div>
                    <button type="submit" className="w-full bg-primary text-white h-12 rounded-xl font-bold mt-2">Salvar Produto</button>
                </form>
            </Modal>
        </div>
    )
};

const FullHistoryPage: React.FC<{ sales: Sale[], clients: Client[] }> = ({ sales, clients }) => {
    const sorted = [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="pb-20 md:pb-0">
            <Header title="Histórico" />
            <div className="p-4 md:p-8">
                <DesktopHeader title="Histórico de Vendas" />
                <div className="space-y-3">
                    {sorted.map(sale => {
                        const client = clients.find(c => c.id === sale.clientId);
                        return (
                            <div key={sale.id} className="bg-card-light dark:bg-card-dark p-4 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark">{client?.name || 'Desconhecido'}</h3>
                                        <p className="text-xs text-text-secondary-light">{new Date(sale.date).toLocaleDateString('pt-BR')} • {sale.paymentMethod}</p>
                                    </div>
                                    <span className="font-bold text-primary">R$ {sale.total.toFixed(2)}</span>
                                </div>
                                <div className="text-xs text-text-secondary-light mt-2 border-t border-border-light dark:border-border-dark pt-2">
                                    {sale.items.length} itens na compra
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

const FullFiadosPage: React.FC<{
    clients: Client[], sales: Sale[], 
    onAddPayment: (saleId: string, amount: number) => void
}> = ({ clients, sales, onAddPayment }) => {
    const [activeClientId, setActiveClientId] = useState<string | null>(null);

    // Logic to group debts by client
    const debtClients = useMemo(() => {
        const map = new Map();
        sales.filter(s => s.paymentMethod === PaymentMethod.Credit).forEach(s => {
            const paid = s.payments.reduce((acc, p) => acc + p.amount, 0);
            const debt = s.total - paid;
            if (debt > 0.01) {
                if (!map.has(s.clientId)) map.set(s.clientId, { totalDebt: 0, count: 0 });
                const c = map.get(s.clientId);
                c.totalDebt += debt;
                c.count += 1;
            }
        });
        return Array.from(map.entries()).map(([id, data]) => ({
            client: clients.find(c => c.id === id),
            ...data
        })).filter(i => i.client);
    }, [sales, clients]);

    const clientSales = activeClientId ? sales.filter(s => s.clientId === activeClientId && s.paymentMethod === PaymentMethod.Credit && (s.total - s.payments.reduce((a,b)=>a+b.amount,0)) > 0.01) : [];

    return (
        <div className="pb-20 md:pb-0 h-full flex flex-col">
            {!activeClientId ? (
                <>
                    <Header title="Fiados" />
                    <div className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
                        <DesktopHeader title="Controle de Fiados" />
                        {debtClients.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <span className="material-symbols-outlined text-6xl mb-2">check_circle</span>
                                <p>Nenhum fiado pendente!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {debtClients.map(item => (
                                    <div key={item.client!.id} onClick={() => setActiveClientId(item.client!.id)}
                                         className="bg-card-light dark:bg-card-dark p-4 rounded-2xl border border-border-light dark:border-border-dark shadow-sm flex items-center justify-between active:scale-98 transition-transform">
                                        <div className="flex items-center gap-3">
                                            <img src={item.client!.avatarUrl} className="w-12 h-12 rounded-full bg-gray-200" />
                                            <div>
                                                <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark">{item.client!.name}</h3>
                                                <p className="text-xs text-text-secondary-light">{item.count} compras pendentes</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-status-red text-lg">R$ {item.totalDebt.toFixed(2)}</p>
                                            <span className="text-xs text-primary font-bold">Ver Fatura</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex flex-col h-full">
                    <div className="bg-surface-light dark:bg-surface-dark p-4 border-b border-border-light dark:border-border-dark sticky top-0 z-20 flex items-center gap-3">
                        <button onClick={() => setActiveClientId(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                        </button>
                        <h2 className="font-bold text-lg">Fatura de {clients.find(c => c.id === activeClientId)?.name.split(' ')[0]}</h2>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1 pb-24 custom-scrollbar">
                        {clientSales.map(sale => {
                            const paid = sale.payments.reduce((a,b) => a+b.amount, 0);
                            const debt = sale.total - paid;
                            return (
                                <div key={sale.id} className="bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-border-light dark:border-border-dark shadow-sm mb-3">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs text-gray-500">{new Date(sale.date).toLocaleDateString('pt-BR')}</span>
                                        <span className="font-bold">Total: R$ {sale.total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-sm text-green-600">Pago: R$ {paid.toFixed(2)}</p>
                                            <p className="font-bold text-red-500 text-lg mt-1">Falta: R$ {debt.toFixed(2)}</p>
                                        </div>
                                        <button onClick={() => {
                                            const amount = prompt(`Valor para pagar (Máx: ${debt.toFixed(2)}):`);
                                            if(amount) onAddPayment(sale.id, parseFloat(amount));
                                        }} className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/20">
                                            Pagar
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const FullExpensesPage: React.FC<{
    expenses: Expense[],
    addExpense: (e: Omit<Expense, 'id'>) => void,
    deleteExpense: (id: string) => void,
    showToast: (msg: string, type: 'success' | 'error') => void
}> = ({ expenses, addExpense, deleteExpense, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newExpense, setNewExpense] = useState({ description: '', category: 'Outros', amount: '', date: new Date().toISOString().split('T')[0] });
    
    const categories = ['Compra de Estoque', 'Embalagens', 'Marketing', 'Transporte', 'Alimentação', 'Outros'];
    
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newExpense.description || !newExpense.amount) return;
        
        addExpense({
            description: newExpense.description,
            category: newExpense.category,
            amount: parseFloat(newExpense.amount),
            date: newExpense.date
        });
        setNewExpense({ description: '', category: 'Outros', amount: '', date: new Date().toISOString().split('T')[0] });
        setIsModalOpen(false);
        showToast('Despesa registrada', 'success');
    };

    return (
        <div className="pb-20 md:pb-0 h-full flex flex-col">
            <Header title="Despesas" rightAction={<button onClick={() => setIsModalOpen(true)} className="text-primary font-bold text-sm">Nova</button>} />
            
            <div className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
                <DesktopHeader title="Controle de Despesas" action={
                    <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined">add</span> Nova Despesa
                    </button>
                } />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-card-light dark:bg-card-dark p-5 rounded-2xl border border-border-light dark:border-border-dark shadow-sm flex items-center justify-between md:col-span-1">
                        <div>
                            <p className="text-sm text-text-secondary-light">Total de Despesas</p>
                            <h3 className="text-2xl font-black text-text-primary-light dark:text-text-primary-dark">R$ {totalExpenses.toFixed(2)}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 flex items-center justify-center">
                            <span className="material-symbols-outlined">trending_down</span>
                        </div>
                    </div>
                </div>

                <h3 className="font-bold text-lg mb-4 px-1">Histórico</h3>
                <div className="space-y-3">
                    {sortedExpenses.length === 0 ? (
                         <div className="text-center py-10 text-gray-400">
                             <span className="material-symbols-outlined text-5xl mb-2 opacity-50">money_off</span>
                             <p>Nenhuma despesa registrada.</p>
                         </div>
                    ) : (
                        sortedExpenses.map(exp => (
                            <div key={exp.id} className="bg-card-light dark:bg-card-dark p-4 rounded-2xl border border-border-light dark:border-border-dark shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-red-50 dark:bg-white/5 flex items-center justify-center text-red-500">
                                        <span className="material-symbols-outlined text-xl">
                                            {exp.category === 'Compra de Estoque' ? 'inventory_2' : 
                                             exp.category === 'Transporte' ? 'local_shipping' : 
                                             exp.category === 'Marketing' ? 'campaign' : 'receipt'}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-text-primary-light dark:text-text-primary-dark">{exp.description}</h4>
                                        <p className="text-xs text-text-secondary-light">{new Date(exp.date).toLocaleDateString('pt-BR')} • {exp.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-red-500">- R$ {exp.amount.toFixed(2)}</span>
                                    <button onClick={() => confirm('Apagar despesa?') && deleteExpense(exp.id)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors">
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Despesa">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Descrição</label>
                        <input className="form-input w-full rounded-xl h-11 bg-background-light dark:bg-background-dark border-none" 
                               value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} placeholder="Ex: Uber entrega" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Valor (R$)</label>
                            <input type="number" step="0.01" className="form-input w-full rounded-xl h-11 bg-background-light dark:bg-background-dark border-none" 
                                   value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} placeholder="0.00" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Data</label>
                            <input type="date" className="form-input w-full rounded-xl h-11 bg-background-light dark:bg-background-dark border-none" 
                                   value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Categoria</label>
                        <select className="form-select w-full rounded-xl h-11 bg-background-light dark:bg-background-dark border-none"
                                value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white h-12 rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all mt-2">
                        Salvar Despesa
                    </button>
                </form>
            </Modal>
        </div>
    );
};

const FullSettingsPage: React.FC<{
    user: any,
    updateUser: (u: any) => void,
    resetData: () => void,
    showToast: (msg: string, type: 'success' | 'error') => void,
    isDarkMode: boolean,
    toggleTheme: () => void
}> = ({ user, updateUser, resetData, showToast, isDarkMode, toggleTheme }) => {
    const [formData, setFormData] = useState(user);
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = () => {
        updateUser(formData);
        setIsEditing(false);
        showToast('Perfil atualizado!', 'success');
    };

    const handleReset = () => {
        if (confirm('Tem certeza? Isso apagará TODAS as vendas, clientes e produtos e restaurará os dados iniciais.')) {
            resetData();
            showToast('App restaurado.', 'success');
        }
    };

    return (
        <div className="pb-20 md:pb-0 h-full overflow-y-auto custom-scrollbar">
            <Header title="Configurações" />
            <div className="p-4 md:p-8 max-w-2xl mx-auto">
                <DesktopHeader title="Configurações" />
                
                {/* Profile Card */}
                <div className="bg-card-light dark:bg-card-dark rounded-3xl p-6 border border-border-light dark:border-border-dark shadow-sm mb-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary to-emerald-400 opacity-20"></div>
                    <div className="relative flex flex-col items-center text-center -mt-2 mb-4">
                        <div className="w-24 h-24 rounded-full p-1 bg-surface-light dark:bg-surface-dark shadow-xl mb-3 relative group cursor-pointer">
                            <img src={formData.avatarUrl} className="w-full h-full rounded-full object-cover" alt="Profile" />
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white">
                                    <span className="material-symbols-outlined">edit</span>
                                </div>
                            )}
                        </div>
                        {isEditing ? (
                            <input className="text-center font-bold text-xl bg-transparent border-b border-primary outline-none w-2/3" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        ) : (
                            <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">{user.name}</h2>
                        )}
                        <p className="text-sm text-text-secondary-light">Revendedor(a)</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-text-secondary-light uppercase ml-1">Telefone</label>
                            <input disabled={!isEditing} className="form-input w-full rounded-xl bg-background-light dark:bg-background-dark border-none disabled:opacity-60" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-text-secondary-light uppercase ml-1">Email</label>
                            <input disabled={!isEditing} className="form-input w-full rounded-xl bg-background-light dark:bg-background-dark border-none disabled:opacity-60" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        
                        {isEditing ? (
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => {setFormData(user); setIsEditing(false)}} className="flex-1 py-3 rounded-xl font-bold bg-gray-200 dark:bg-white/10">Cancelar</button>
                                <button onClick={handleSave} className="flex-1 py-3 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20">Salvar</button>
                            </div>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="w-full py-3 rounded-xl font-bold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors">Editar Perfil</button>
                        )}
                    </div>
                </div>

                {/* App Settings */}
                <h3 className="font-bold text-lg mb-3 px-2">Aplicativo</h3>
                <div className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden mb-8">
                    <div className="p-4 flex items-center justify-between border-b border-border-light dark:border-border-dark">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                <span className="material-symbols-outlined">dark_mode</span>
                            </div>
                            <div>
                                <p className="font-bold">Modo Escuro</p>
                                <p className="text-xs text-text-secondary-light">Aparência do app</p>
                            </div>
                        </div>
                        <button onClick={toggleTheme} className={`w-12 h-7 rounded-full relative transition-colors ${isDarkMode ? 'bg-primary' : 'bg-gray-300'}`}>
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow-sm ${isDarkMode ? 'left-6' : 'left-1'}`}></div>
                        </button>
                    </div>
                    <button onClick={handleReset} className="w-full p-4 flex items-center justify-between text-left hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                <span className="material-symbols-outlined">delete_forever</span>
                            </div>
                            <div>
                                <p className="font-bold text-red-600">Resetar Dados</p>
                                <p className="text-xs text-text-secondary-light">Apagar tudo e reiniciar</p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                    </button>
                </div>
                
                <p className="text-center text-xs text-gray-400 mb-10">PerfumeFlow v1.2.0 • Build 2024</p>
            </div>
        </div>
    )
}

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Data State
    const [clients, setClients] = useStickyState('perfume_clients', initialClients);
    const [products, setProducts] = useStickyState('perfume_products', initialProducts);
    const [sales, setSales] = useStickyState('perfume_sales', initialSales);
    const [expenses, setExpenses] = useStickyState('perfume_expenses', initialExpenses);
    const [user, setUser] = useStickyState('perfume_user', initialUser);

    // Toast System
    const [toasts, setToasts] = useState<{id: string, title: string, type: any}[]>([]);
    const showToast = useCallback((title: string, type: 'success'|'error' = 'success') => {
        const id = Math.random().toString(36);
        setToasts(prev => [...prev, {id, title, type}]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
    }, []);

    useEffect(() => {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(isDark);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    // Actions
    const addSale = (sale: any) => setSales((p: any) => [...p, { id: `s${Date.now()}`, ...sale }]);
    const addClient = (client: any) => setClients((p: any) => [...p, { id: `c${Date.now()}`, avatarUrl: `https://ui-avatars.com/api/?name=${client.name}`, ...client }]);
    const deleteClient = (id: string) => setClients((p: any) => p.filter((c: any) => c.id !== id));
    const addProduct = (prod: any) => setProducts((p: any) => [...p, { id: `p${Date.now()}`, ...prod }]);
    const deleteProduct = (id: string) => setProducts((p: any) => p.filter((product: any) => product.id !== id));
    const addPayment = (saleId: string, amount: number) => {
        setSales((prev: any) => prev.map((s: any) => {
            if (s.id === saleId) return { ...s, payments: [...s.payments, { id: `pay${Date.now()}`, amount, date: new Date().toISOString(), method: 'Pix' }] };
            return s;
        }));
        showToast('Pagamento registrado!');
    };
    
    const addExpense = (exp: Omit<Expense, 'id'>) => setExpenses((p: any) => [...p, { id: `e${Date.now()}`, ...exp }]);
    const deleteExpense = (id: string) => setExpenses((p: any) => p.filter((e: any) => e.id !== id));
    const updateUser = (u: any) => setUser(u);
    const resetData = () => {
        window.localStorage.removeItem('perfume_clients');
        window.localStorage.removeItem('perfume_products');
        window.localStorage.removeItem('perfume_sales');
        window.localStorage.removeItem('perfume_expenses');
        window.localStorage.removeItem('perfume_user');
        window.location.reload();
    };

    const renderPage = () => {
        switch(currentPage) {
            case Page.Dashboard: return <FullDashboardPage sales={sales} expenses={expenses} user={user} toggleTheme={() => setDarkMode(!darkMode)} isDarkMode={darkMode} />;
            case Page.NovaVenda: return <FullNewSalePage clients={clients} products={products} addSale={addSale} onSaleComplete={() => setCurrentPage(Page.Historico)} showToast={showToast} />;
            case Page.Clientes: return <FullClientsPage clients={clients} addClient={addClient} deleteClient={deleteClient} showToast={showToast} />;
            case Page.Produtos: return <FullProductsPage products={products} addProduct={addProduct} deleteProduct={deleteProduct} showToast={showToast} />;
            case Page.Fiados: return <FullFiadosPage clients={clients} sales={sales} onAddPayment={addPayment} />;
            case Page.Historico: return <FullHistoryPage sales={sales} clients={clients} />;
            case Page.Despesas: return <FullExpensesPage expenses={expenses} addExpense={addExpense} deleteExpense={deleteExpense} showToast={showToast} />;
            case Page.Configuracoes: return <FullSettingsPage user={user} updateUser={updateUser} resetData={resetData} showToast={showToast} isDarkMode={darkMode} toggleTheme={() => setDarkMode(!darkMode)} />;
            default: return <div className="p-8 text-center text-gray-500 mt-10">Página em construção: {currentPage}</div>;
        }
    };

    return (
        <div className="flex min-h-screen w-full text-text-primary-light dark:text-text-primary-dark bg-background-light dark:bg-background-dark font-display overflow-hidden">
            {/* Toasts */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] flex flex-col gap-2 w-full max-w-sm px-4">
                {toasts.map(t => (
                    <div key={t.id} className={`p-4 rounded-xl shadow-lg text-white flex items-center gap-3 animate-slide-up ${t.type === 'success' ? 'bg-gray-900 dark:bg-white dark:text-black' : 'bg-red-500'}`}>
                        <span className="material-symbols-outlined">{t.type === 'success' ? 'check_circle' : 'error'}</span>
                        <span className="font-medium text-sm">{t.title}</span>
                    </div>
                ))}
            </div>

            <Sidebar activePage={currentPage} setActivePage={setCurrentPage} />
            
            <main className="flex-1 w-full relative overflow-hidden flex flex-col h-screen">
                {renderPage()}
            </main>

            <BottomNav activePage={currentPage} setActivePage={setCurrentPage} openMenu={() => setIsMenuOpen(true)} />
            <MenuSheet isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} setActivePage={setCurrentPage} activePage={currentPage} />
        </div>
    );
}

export default App;
