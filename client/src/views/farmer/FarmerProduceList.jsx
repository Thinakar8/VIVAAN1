import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Sprout, PlusCircle, ArrowLeft, Search } from 'lucide-react';
import BackButton from '../../components/ui/BackButton';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import SearchInput from '../../components/ui/SearchInput';
import FilterPills from '../../components/ui/FilterPills';
import Table, { TableRow, TableCell } from '../../components/ui/Table';

export default function FarmerProduceList() {
  const { setActiveView, firestoreService } = useApp();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const unsub = firestoreService.subscribeCollection('farmerProducts', (prods) => {
      const normalized = prods.map((p) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        quantity: p.availableStock || p.available_stock || p.quantity || 100,
        available_quantity: p.availableStock || p.available_stock || p.available_quantity || 100,
        price_per_unit: p.pricePerUnit || p.price_per_unit || 100,
        unit: p.unit || 'kg',
        harvest_date: p.harvestDate || p.harvest_date || '2026-02-20',
        is_organic: p.organic !== undefined ? p.organic : p.is_organic,
        photo_url: p.photoUrl || p.photo_url || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500'
      }));
      setProducts(normalized);
    });
    return () => {
      if (unsub) unsub();
    };
  }, [firestoreService]);

  const categories = ['All', 'Spices', 'Grains & Cereals', 'Vegetables', 'Fruits'];

  const filtered = products.filter(p => {
    if (category !== 'All' && p.category.toLowerCase() !== category.toLowerCase()) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header with Working Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => setActiveView('farmer_dashboard')} label="Back to Dashboard" />
          <div>
            <h1 className="text-2xl font-black text-slate-900">My Produce Listings</h1>
            <p className="text-xs text-slate-500">Manage harvest stock and direct pricing</p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={PlusCircle}
          onClick={() => setActiveView('farmer_add_produce')}
        >
          Add New Produce
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search my crops..."
            className="w-full sm:w-80"
          />
          <FilterPills
            categories={categories}
            activeCategory={category}
            onSelect={setCategory}
          />
        </div>
      </div>

      {/* Produce Table */}
      <Table
        headers={['Produce Name', 'Category', 'Total Batch', 'Available Stock', 'Unit Price', 'Harvest Date', 'Status']}
        isEmpty={filtered.length === 0}
        emptyMessage="No produce found in your catalog."
      >
        {filtered.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-black text-slate-900">
              <div className="flex items-center gap-3">
                <img src={p.photo_url} alt={p.title} className="w-12 h-12 rounded-2xl object-cover border border-slate-200" />
                <div>
                  <span>{p.title}</span>
                  <span className="block text-[10px] text-slate-400 font-mono">{p.id}</span>
                </div>
              </div>
            </TableCell>
            <TableCell className="font-semibold text-slate-600">{p.category}</TableCell>
            <TableCell>{p.quantity} {p.unit}</TableCell>
            <TableCell className="font-black text-slate-900">{p.available_quantity} {p.unit}</TableCell>
            <TableCell className="font-black text-emerald-800">₹{p.price_per_unit} / {p.unit}</TableCell>
            <TableCell className="text-slate-500">{p.harvest_date}</TableCell>
            <TableCell>
              <Badge variant={p.is_organic ? 'organic' : 'verified'} size="sm">
                {p.is_organic ? 'Organic' : 'Active'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </Table>

    </div>
  );
}
