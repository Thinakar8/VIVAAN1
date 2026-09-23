import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  Store,
  Utensils,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';
import BackButton from '../../components/ui/BackButton';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function BuyerProfile() {
  const { setActiveView, addToast, firestoreService, currentUser } = useApp();

  const [fullName, setFullName] = useState('Aditi Sharma');
  const [email, setEmail] = useState('aditi.sharma@gmail.com');
  const [mobile, setMobile] = useState('+91 98765 43210');
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('Chennai');
  const [cityVillage, setCityVillage] = useState('Adyar');
  const [pincode, setPincode] = useState('600020');
  const [deliveryAddress, setDeliveryAddress] = useState('Flat 4B, Greenview Apts, 2nd Avenue');
  const [buyerType, setBuyerType] = useState('Retail Consumer'); // 'Retail Consumer' | 'Wholesaler' | 'Retailer' | 'Restaurant' | 'Business Buyer'
  const [isGoogleLinked, setIsGoogleLinked] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // Load existing buyer profile from Firestore
    firestoreService.getBuyerProfile().then((profile) => {
      if (profile) {
        if (profile.fullName || profile.name) setFullName(profile.fullName || profile.name);
        if (profile.email) setEmail(profile.email);
        if (profile.mobile || profile.phone) setMobile(profile.mobile || profile.phone);
        if (profile.state) setState(profile.state);
        if (profile.district) setDistrict(profile.district);
        if (profile.cityVillage) setCityVillage(profile.cityVillage);
        if (profile.pincode) setPincode(profile.pincode);
        if (profile.deliveryAddress) setDeliveryAddress(profile.deliveryAddress);
        if (profile.buyerType) setBuyerType(profile.buyerType);
        if (profile.authProvider === 'google.com' || profile.isGoogleAuth) setIsGoogleLinked(true);
      }
    });
  }, [firestoreService]);

  const buyerTypes = [
    {
      id: 'Retail Consumer',
      title: 'Retail Consumer',
      desc: 'Household fresh culinary produce and kitchen needs',
      icon: ShoppingBag,
      color: 'emerald'
    },
    {
      id: 'Wholesaler',
      title: 'Wholesaler',
      desc: 'Bulk procurement, mandi-scale dispatch and storage',
      icon: Layers,
      color: 'amber'
    },
    {
      id: 'Retailer',
      title: 'Retailer',
      desc: 'Local grocery, supermarket and organic store stocks',
      icon: Store,
      color: 'sky'
    },
    {
      id: 'Restaurant',
      title: 'Restaurant',
      desc: 'Daily commercial kitchen fresh farmgate supply',
      icon: Utensils,
      color: 'purple'
    },
    {
      id: 'Business Buyer',
      title: 'Business Buyer',
      desc: 'Corporate canteen, food processing and institutions',
      icon: Briefcase,
      color: 'slate'
    }
  ];

  const handleGoogleLogin = () => {
    setIsGoogleLinked(true);
    setEmail('aditi.sharma@gmail.com');
    setFullName('Aditi Sharma');
    addToast('Google Sign-In Successful', 'Connected with Google Account: aditi.sharma@gmail.com');
  };

  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSubmitting(true);

    try {
      await firestoreService.saveBuyerProfile({
        fullName,
        email,
        mobile,
        state,
        district,
        cityVillage,
        pincode,
        deliveryAddress,
        buyerType,
        authProvider: isGoogleLinked ? 'google.com' : 'email'
      });

      setSavedSuccess(true);
      addToast(
        'Buyer Profile Saved!',
        `Saved as ${buyerType} with delivery hub in ${cityVillage}, ${district}.`
      );
    } catch (err) {
      addToast('Profile Save Error', err.message || 'Failed to save buyer profile.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => setActiveView('buyer_marketplace')} label="Back to Marketplace" />
          <div>
            <h1 className="text-2xl font-black text-slate-900">Buyer Profile and Authentication</h1>
            <p className="text-xs text-slate-500">Manage delivery destinations, procurement tier, and Google authorization</p>
          </div>
        </div>

        <Badge variant="verified" size="md">
          ✓ Verified Buyer
        </Badge>
      </div>

      {/* 1. GOOGLE / GMAIL AUTHENTICATION CARD */}
      <Card className="border-emerald-200 shadow-sm bg-gradient-to-r from-emerald-50/50 via-white to-amber-50/30">
        <CardBody className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200"
                  alt="Buyer Avatar"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-600 shadow-md"
                />
                {isGoogleLinked && (
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px] ring-2 ring-white font-bold">
                    ✓
                  </span>
                )}
              </div>

              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <h3 id="buyer-display-fullname" className="text-base font-black text-slate-900">{fullName}</h3>
                  <span id="buyer-display-type" className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                    {buyerType}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-emerald-700" />
                  <span id="buyer-display-email" className="font-semibold">{email}</span>
                  {isGoogleLinked && (
                    <span className="text-[10px] text-emerald-800 font-mono font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      Google Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button
              id="google-signin-btn"
              type="button"
              variant={isGoogleLinked ? 'secondary' : 'primary'}
              size="md"
              onClick={handleGoogleLogin}
              className="shrink-0"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isGoogleLinked ? 'Google Account Connected' : 'Sign in with Google'}</span>
              </div>
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* 2. PROFILE CREATION & UPDATE FORM */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Buyer Registration and Procurement Profile</h3>
                <p className="text-xs text-slate-500">Required for automated escrow checkout, dispatch routing and GST invoicing</p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
              100% Escrow Safe
            </span>
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            {/* Section A: Buyer Classification (All 5 Types) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Buyer Classification Type <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {buyerTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = buyerType === type.id;
                  const slug = type.id.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <button
                      key={type.id}
                      id={`buyertype-${slug}`}
                      type="button"
                      onClick={() => setBuyerType(type.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'border-emerald-800 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-800/10'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-xl mt-0.5 ${isSelected ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs font-black text-slate-900">{type.title}</div>
                        <div className="text-[11px] text-slate-500 leading-tight">{type.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section B: Personal / Business Contact Details */}
            <div className="pt-2 border-t border-slate-100 space-y-4">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                Contact and Identity Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  id="buyer-fullname-input"
                  label="Full Name / Legal Entity"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <Input
                  id="buyer-email-input"
                  label="Email (Google / Gmail)"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  id="buyer-mobile-input"
                  label="Mobile Number for OTP"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Section C: Delivery Destination & Locality */}
            <div className="pt-2 border-t border-slate-100 space-y-4">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider block flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                Primary Delivery Destination
              </span>

              <Input
                id="buyer-address-input"
                label="Door / Flat No, Street, Locality"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="e.g. Flat 4B, Greenview Apts, 2nd Avenue"
                required
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Input
                  id="buyer-city-input"
                  label="City / Village"
                  value={cityVillage}
                  onChange={(e) => setCityVillage(e.target.value)}
                  placeholder="Adyar"
                  required
                />
                <Input
                  id="buyer-district-input"
                  label="District"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Chennai"
                  required
                />
                <Select
                  id="buyer-state-select"
                  label="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  options={[
                    'Tamil Nadu',
                    'Karnataka',
                    'Kerala',
                    'Andhra Pradesh',
                    'Telangana',
                    'Maharashtra',
                    'Delhi NCR',
                    'Gujarat'
                  ]}
                  required
                />
                <Input
                  id="buyer-pincode-input"
                  label="PIN Code"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="600020"
                  required
                />
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setActiveView('buyer_marketplace')}
              >
                Cancel
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  id="buyer-profile-save-btn"
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  onClick={handleSaveProfile}
                  icon={CheckCircle2}
                >
                  {isSubmitting ? 'Saving Profile...' : 'Save and Update Buyer Profile'}
                </Button>
              </div>
            </div>

          </form>
        </CardBody>
      </Card>

    </div>
  );
}
