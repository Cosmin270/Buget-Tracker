import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Trash2, TrendingUp, Wallet, AlertCircle, PlusCircle, DollarSign } from 'lucide-react'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function App() {
  const [expenses, setExpenses] = useState([])
  const [newExpense, setNewExpense] = useState({ category: '', amount: '' })
  const [loading, setLoading] = useState(false)
  
  const BUDGET_LIMIT = 2000; 

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await axios.get('http://localhost:3000/expenses')
      setExpenses(response.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/expenses/${id}`)
      fetchExpenses()
    } catch (error) {
      console.error("Error deleting:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newExpense.category || !newExpense.amount) return
    
    setLoading(true)
    try {
      await axios.post('http://localhost:3000/expenses', {
        category: newExpense.category,
        amount: parseFloat(newExpense.amount)
      })
      await fetchExpenses()
      setNewExpense({ category: '', amount: '' })
    } catch (error) {
      console.error("Error adding expense:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remaining = BUDGET_LIMIT - totalSpent;
  const percentage = Math.min((totalSpent / BUDGET_LIMIT) * 100, 100);
  
  const chartData = useMemo(() => {
    const result = {};
    expenses.forEach(item => {
      const cat = item.category || 'Other';
      result[cat] = (result[cat] || 0) + item.amount;
    });
    return Object.keys(result).map(key => ({ name: key, value: result[key] }));
  }, [expenses]);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans p-6 md:p-12">
      
      {/* HEADER */}
      <header className="max-w-6xl mx-auto mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-8 h-8 text-indigo-600" />
            SmartBudget
          </h1>
          <p className="text-slate-500 mt-1">Financial overview for November</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm font-semibold text-slate-400">USER</p>
          <p className="font-bold text-slate-800">cosmin@demo.com</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-8">
        
        {/* TOP STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Spent */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold uppercase">Total Spent</p>
              <h2 className="text-3xl font-bold text-slate-900">${totalSpent.toFixed(2)}</h2>
            </div>
            <div className="p-3 bg-indigo-50 rounded-full">
              <DollarSign className="w-6 h-6 text-indigo-600" />
            </div>
          </div>

          {/* Card 2: Budget Progress */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-end mb-2">
              <p className="text-slate-400 text-sm font-semibold uppercase">Monthly Budget</p>
              <span className="text-xs font-bold text-slate-500">{percentage.toFixed(0)}% Used</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">${BUDGET_LIMIT}</h2>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${percentage > 90 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Card 3: Remaining */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-semibold uppercase">Remaining</p>
              <h2 className={`text-3xl font-bold ${remaining < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                ${remaining.toFixed(2)}
              </h2>
            </div>
            <div className="p-3 bg-emerald-50 rounded-full">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: FORM & LIST (Takes up 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* ADD EXPENSE FORM */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-500" />
                Add Transaction
              </h3>
              <form onSubmit={handleSubmit} className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="Category (e.g. Groceries)" 
                  className="flex-1 bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  value={newExpense.category}
                  onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                />
                <input 
                  type="number" 
                  placeholder="0.00" 
                  className="w-32 bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  value={newExpense.amount}
                  onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                />
                <button 
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 rounded-xl transition-all shadow-lg shadow-indigo-200"
                >
                  {loading ? '...' : 'Add'}
                </button>
              </form>
            </div>

            {/* TRANSACTIONS LIST */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {expenses.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">No transactions yet</div>
                ) : (
                  expenses.map(expense => (
                    <div key={expense.id} className="group flex justify-between items-center p-4 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                          {expense.category.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{expense.category}</p>
                          <p className="text-xs text-slate-400">{new Date(expense.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="font-bold text-slate-700">-${expense.amount.toFixed(2)}</span>
                        <button 
                          onClick={() => handleDelete(expense.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CHART (Takes up 1 column) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-indigo-500" />
                Breakdown
              </h3>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#1e293b' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Custom Legend */}
              <div className="mt-6 space-y-2">
                {chartData.map((entry, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-slate-600">{entry.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">${entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default App