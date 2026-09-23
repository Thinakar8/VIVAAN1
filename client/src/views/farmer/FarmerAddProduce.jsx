import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlusCircle, ArrowLeft, CheckCircle2, Sprout, Image, Clock, Calendar } from 'lucide-react';
import BackButton from '../../components/ui/BackButton';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card, { CardBody } from '../../components/ui/Card';

export default function FarmerAddProduce() {
  const { setActiveView, addToast, firestoreService } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [price, setPrice] = useState('');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [dispatchTime, setDispatchTime] = useState('08:00 AM');
  const [availability, setAvailability] = useState('Immediate Harvest (In Stock)');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500');
  const [isOrganic, setIsOrganic] = useState(true);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const samplePhotos = [
    { label: 'Turmeric', url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500' },
    { label: 'Small Onions', url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500' },
    { label: 'Hill Garlic', url: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=500' },
    { label: 'Organic Tomatoes', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !quantity || !price) {
      addToast('Missing Fields', 'Please complete title, quantity, and price.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Write to Cloud Firestore farmerProducts collection
      await firestoreService.addFarmerProduct({
        farmerId: 'farmer_1',
        title,
        category,
        availableStock: Number(quantity),
        unit,
        pricePerUnit: Number(price),
        mandiPrice: Math.round(Number(price) * 0.72),
        mandiSpread: Math.round(Number(price) * 0.28),
        harvestDate,
        dispatchTime,
        availability,
        photoUrl,
        organic: isOrganic,
        description: description || 'Farmgate fresh harvest batch.'
      });

      // 2. Also notify backend API
      try {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            farmer_id: 1,
            title,
            category,
            quantity,
            unit,
            price_per_unit: price,
            harvest_date: harvestDate,
            dispatch_time: dispatchTime,
            availability,
            photo_url: photoUrl,
            is_organic: isOrganic,
            description: description || 'Farmgate fresh harvest batch.'
          })
        });
      } catch (apiErr) {}

      addToast('Produce Published', `${title} (${quantity} ${unit}) listed in Cloud Firestore!`);
      setActiveView('farmer_produce');
    } catch (err) {
      addToast('Error', err.message || 'Failed to publish produce.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header & Working Back Button */}
      <div className="flex items-center gap-3">
        <BackButton onClick={() => setActiveView('farmer_produce')} label="Back to Produce" />
        <div>
          <h1 className="text-2xl font-black text-slate-900">List New Harvest Batch</h1>
          <p className="text-xs text-slate-500">Publish fresh agricultural produce to the direct marketplace</p>
        </div>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Product Name */}
            <Input
              id="produce-title-input"
              label="Produce / Crop Title"
              placeholder="e.g. Salem Pure Organic Turmeric (Haldi)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Produce Image with live thumbnail preview and quick selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5 text-emerald-700" />
                Produce Photograph
              </label>
              
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={photoUrl}
                  alt="Produce Preview"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-600 shadow-md shrink-0"
                />
                <Input
                  id="produce-photo-input"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full"
                  required
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-[11px]">Presets:</span>
                {samplePhotos.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setPhotoUrl(s.url)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      photoUrl === s.url
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category & Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                id="produce-category-select"
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={['Vegetables', 'Fruits', 'Grains & Cereals', 'Spices', 'Other agricultural products']}
                required
              />

              <Select
                id="produce-availability-select"
                label="Availability Status"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                options={[
                  'Immediate Harvest (In Stock)',
                  'Harvest in 24-48 Hours',
                  'Pre-booking Available'
                ]}
                required
              />
            </div>

            {/* Quantity, Unit, Price */}
            <div className="grid grid-cols-3 gap-3">
              <Input
                id="produce-qty-input"
                label="Quantity Available"
                type="number"
                placeholder="250"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />

              <Select
                id="produce-unit-select"
                label="Unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                options={['kg', 'Quintal', 'Pack', 'Box', 'Metric Ton']}
                required
              />

              <Input
                id="produce-price-input"
                label="Farmgate Price (₹/Unit)"
                type="number"
                placeholder="160"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            {/* Price comparison helper */}
            {price && (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs flex items-center justify-between text-emerald-950 font-semibold">
                <span>Estimated Mandi Rate: <b>₹{Math.round(price * 0.68)}</b></span>
                <span className="text-emerald-700 font-bold">Your Extra Gain: +₹{Math.round(price * 0.32)}/{unit}!</span>
              </div>
            )}

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="produce-date-input"
                label="Harvest Date"
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                required
              />

              <Input
                id="produce-time-input"
                label="Expected Dispatch Time"
                type="text"
                value={dispatchTime}
                onChange={(e) => setDispatchTime(e.target.value)}
                placeholder="e.g. 08:00 AM"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Description & Quality Notes</label>
              <textarea
                id="produce-description-input"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="GI-tagged authentic variety with natural compost cultivation..."
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-emerald-700"
              />
            </div>

            {/* Organic certification checkbox */}
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <input
                type="checkbox"
                id="isOrganic"
                checked={isOrganic}
                onChange={(e) => setIsOrganic(e.target.checked)}
                className="w-4 h-4 text-emerald-700 rounded"
              />
              <label htmlFor="isOrganic" className="text-xs font-bold text-slate-800 cursor-pointer">
                🌱 Certified Organic Produce (No chemical fertilizers or synthetic pesticides)
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setActiveView('farmer_produce')}
              >
                Cancel
              </Button>

              <Button
                id="produce-submit-btn"
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
                icon={CheckCircle2}
              >
                {isSubmitting ? 'Publishing...' : 'Submit Produce Listing'}
              </Button>
            </div>

          </form>
        </CardBody>
      </Card>

    </div>
  );
}

