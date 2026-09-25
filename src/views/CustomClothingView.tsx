import React, { useState } from 'react';
import { Scissors, CheckCircle, Upload, Search, Clock, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { CustomClothingRequest, CustomRequestStatus } from '../types';
import { createCustomRequest, getCustomRequests } from '../services/api';

interface CustomClothingViewProps {
  onNavigateHome: () => void;
}

export const CustomClothingView: React.FC<CustomClothingViewProps> = () => {
  const [activeTab, setActiveTab] = useState<'request' | 'track'>('request');

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+250 78');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'Men' | 'Women' | 'Unisex'>('Unisex');
  const [clothingType, setClothingType] = useState('Bespoke Traditional Suit');
  const [preferredColor, setPreferredColor] = useState('');
  const [measurements, setMeasurements] = useState('');
  const [occasion, setOccasion] = useState('');
  const [description, setDescription] = useState('');
  const [preferredDeadline, setPreferredDeadline] = useState('');
  const [referenceImage, setReferenceImage] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<CustomClothingRequest | null>(null);

  // Tracking State
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackedRequest, setTrackedRequest] = useState<CustomClothingRequest | null>(null);
  const [trackingError, setTrackingError] = useState('');
  const [searchingTrack, setSearchingTrack] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setReferenceImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload: Partial<CustomClothingRequest> = {
        full_name: fullName,
        phone,
        email,
        gender,
        clothing_type: clothingType,
        preferred_color: preferredColor,
        measurements,
        occasion,
        description,
        reference_image: referenceImage,
        preferred_deadline: preferredDeadline,
        estimated_price: 180000,
      };

      const newReq = await createCustomRequest(payload);
      setSubmittedRequest(newReq);
    } catch (err) {
      console.error(err);
      alert('Failed to submit bespoke tailoring request. Please check inputs and retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingError('');
    setTrackedRequest(null);
    if (!trackingNumber.trim()) return;

    setSearchingTrack(true);
    try {
      const requests = await getCustomRequests();
      const cleanInput = trackingNumber.trim().toUpperCase().replace('#', '');
      const found = requests.find(
        (r) => r.request_number.toUpperCase().replace('#', '') === cleanInput
      );

      if (found) {
        setTrackedRequest(found);
      } else {
        setTrackingError(`No custom tailoring request found for "${trackingNumber}". Please check the number.`);
      }
    } catch {
      setTrackingError('Failed to lookup request. Please try again.');
    } finally {
      setSearchingTrack(false);
    }
  };

  const statusPipeline: CustomRequestStatus[] = [
    'NEW',
    'CONTACTED',
    'DESIGNING',
    'APPROVED',
    'IN PRODUCTION',
    'READY',
    'COMPLETED'
  ];

  const getStatusIndex = (st: CustomRequestStatus) => statusPipeline.indexOf(st);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2B2B2B] bg-[#141414] text-[10px] uppercase tracking-[0.25em] text-neutral-300">
          <Scissors size={12} className="text-amber-400" />
          <span>KIGALI ATELIER · BESPOKE COMMISSION</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white uppercase tracking-wide">
          CUSTOM CLOTHING & TAILORING
        </h1>
        <p className="text-xs text-neutral-400 leading-relaxed font-light">
          Commission a one-of-a-kind garment crafted by LENO’S Rwandan master tailors. From modern ceremony suits to reinterpreted cultural drapery.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center border-b border-[#222222]">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('request')}
            className={`pb-3 text-xs uppercase tracking-widest font-semibold transition-colors relative ${
              activeTab === 'request' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Submit Custom Request
            {activeTab === 'request' && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('track')}
            className={`pb-3 text-xs uppercase tracking-widest font-semibold transition-colors relative ${
              activeTab === 'track' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Track Existing Request
            {activeTab === 'track' && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white"></span>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Submit Custom Request Form */}
      {activeTab === 'request' && (
        <div className="max-w-3xl mx-auto bg-[#141414] border border-[#262626] p-6 sm:p-10 shadow-xl">
          {submittedRequest ? (
            <div className="text-center py-10 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle size={32} />
              </div>

              <div>
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">
                  Bespoke Commission Received
                </span>
                <h2 className="font-heading text-2xl font-bold text-white mt-1">
                  Thank you, {submittedRequest.full_name}
                </h2>
                <p className="text-xs text-neutral-400 mt-2 max-w-md mx-auto">
                  Our Kigali tailoring lead will review your specifications and reach out via phone/WhatsApp at {submittedRequest.phone} within 24 hours.
                </p>
              </div>

              <div className="bg-[#0D0D0D] border border-[#222222] p-4 max-w-sm mx-auto text-xs text-left space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Request #:</span>
                  <span className="text-white font-bold">{submittedRequest.request_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Garment:</span>
                  <span className="text-neutral-300">{submittedRequest.clothing_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Status:</span>
                  <span className="text-amber-400 font-bold">{submittedRequest.status}</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={() => {
                    setTrackingNumber(submittedRequest.request_number);
                    setTrackedRequest(submittedRequest);
                    setActiveTab('track');
                  }}
                  className="bg-white text-black font-semibold text-xs uppercase tracking-widest px-6 py-2.5 hover:bg-neutral-200 transition-colors"
                >
                  Track Request Status
                </button>
                <button
                  onClick={() => setSubmittedRequest(null)}
                  className="border border-[#333333] text-neutral-300 text-xs uppercase tracking-widest px-6 py-2.5 hover:border-neutral-500 transition-colors"
                >
                  Submit Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-[#F5F5F5]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Marie Claire Uwera"
                    className="w-full bg-[#1A1A1A] border border-[#2E2E2E] text-xs px-3.5 py-2.5 rounded text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Phone / WhatsApp (+250) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+250 788 000 000"
                    className="w-full bg-[#1A1A1A] border border-[#2E2E2E] text-xs px-3.5 py-2.5 rounded text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. client@email.rw"
                    className="w-full bg-[#1A1A1A] border border-[#2E2E2E] text-xs px-3.5 py-2.5 rounded text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Gender Alignment *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-[#1A1A1A] border border-[#2E2E2E] text-xs px-3.5 py-2.5 rounded text-white focus:outline-none focus:border-white"
                  >
                    <option value="Unisex">Unisex / Gender-Neutral</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Clothing Type *
                  </label>
                  <input
                    type="text"
                    required
                    value={clothingType}
                    onChange={(e) => setClothingType(e.target.value)}
                    placeholder="e.g. Modern Umushanana, Tuxedo, Two-Piece Trousers"
                    className="w-full bg-[#1A1A1A] border border-[#2E2E2E] text-xs px-3.5 py-2.5 rounded text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Preferred Color / Palette *
                  </label>
                  <input
                    type="text"
                    required
                    value={preferredColor}
                    onChange={(e) => setPreferredColor(e.target.value)}
                    placeholder="e.g. Matte Black, Deep Bronze, Emerald"
                    className="w-full bg-[#1A1A1A] border border-[#2E2E2E] text-xs px-3.5 py-2.5 rounded text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Occasion / Event
                  </label>
                  <input
                    type="text"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    placeholder="e.g. Gusaba Ceremony, Wedding, Gala, Red Carpet"
                    className="w-full bg-[#1A1A1A] border border-[#2E2E2E] text-xs px-3.5 py-2.5 rounded text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Preferred Completion Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={preferredDeadline}
                    onChange={(e) => setPreferredDeadline(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#2E2E2E] text-xs px-3.5 py-2.5 rounded text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Measurements or Standard Sizes (Inches / CM)
                  </label>
                  <textarea
                    rows={2}
                    value={measurements}
                    onChange={(e) => setMeasurements(e.target.value)}
                    placeholder="e.g. Chest: 40in, Waist: 32in, Height: 180cm (or 'I will visit the atelier in Kigali for custom fitting')"
                    className="w-full bg-[#1A1A1A] border border-[#2E2E2E] text-xs px-3.5 py-2.5 rounded text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Detailed Design Description & Silhouette Vision *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe specific features: collar shape, embroidery, cuff style, fabric drape, lining requirements..."
                    className="w-full bg-[#1A1A1A] border border-[#2E2E2E] text-xs px-3.5 py-2.5 rounded text-white focus:outline-none focus:border-white"
                  />
                </div>

                {/* Optional Reference sketch/photo upload */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Reference Image or Sketch (Optional)
                  </label>
                  <div className="border border-dashed border-[#333333] hover:border-neutral-500 p-4 rounded text-center bg-[#101010]">
                    {referenceImage ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-emerald-400">✓ Image attached</span>
                        <button
                          type="button"
                          onClick={() => setReferenceImage('')}
                          className="text-xs text-red-400 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-1.5 text-neutral-400 hover:text-white">
                        <Upload size={18} />
                        <span className="text-xs">Click to upload photo or sketch</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#222222]">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white hover:bg-neutral-200 text-black py-3.5 font-bold text-xs uppercase tracking-[0.2em] transition-colors"
                >
                  {submitting ? 'Transmitting Commission...' : 'Submit Bespoke Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab 2: Track Existing Custom Request */}
      {activeTab === 'track' && (
        <div className="max-w-2xl mx-auto space-y-8">
          <form onSubmit={handleTrackLookup} className="bg-[#141414] border border-[#262626] p-6 space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold flex items-center gap-1.5">
              <Search size={14} />
              <span>Lookup Tailoring Request</span>
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter request number (e.g. REQ-2026-001)"
                className="flex-1 bg-[#1A1A1A] border border-[#2E2E2E] text-xs px-3.5 py-2.5 rounded text-white focus:outline-none focus:border-white font-mono"
              />
              <button
                type="submit"
                disabled={searchingTrack}
                className="bg-white hover:bg-neutral-200 text-black px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                {searchingTrack ? 'Searching...' : 'Search'}
              </button>
            </div>
            <div className="text-[11px] text-neutral-500">
              Demo sample request numbers: <span className="font-mono text-neutral-400">REQ-2026-001</span>, <span className="font-mono text-neutral-400">REQ-2026-002</span>
            </div>
          </form>

          {trackingError && (
            <div className="p-4 bg-red-950/30 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{trackingError}</span>
            </div>
          )}

          {trackedRequest && (
            <div className="bg-[#141414] border border-[#262626] p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-start border-b border-[#222222] pb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-400">
                    Bespoke Request Details
                  </span>
                  <h3 className="font-heading text-xl font-bold text-white">
                    #{trackedRequest.request_number}
                  </h3>
                  <p className="text-xs text-neutral-300 mt-0.5">{trackedRequest.clothing_type}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500 block">
                    Current Stage
                  </span>
                  <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs uppercase tracking-wider mt-1">
                    {trackedRequest.status}
                  </span>
                </div>
              </div>

              {/* Progress Pipeline */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-3">
                  Atelier Production Pipeline
                </span>
                <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2">
                  {statusPipeline.map((step, idx) => {
                    const currentIdx = getStatusIndex(trackedRequest.status);
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={step} className="flex-1 min-w-[70px] text-center">
                        <div
                          className={`h-1.5 w-full mb-2 transition-colors ${
                            isPassed ? 'bg-amber-400' : 'bg-[#262626]'
                          }`}
                        />
                        <span
                          className={`text-[9px] uppercase tracking-wider block font-semibold ${
                            isCurrent
                              ? 'text-amber-300'
                              : isPassed
                              ? 'text-white'
                              : 'text-neutral-600'
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Details breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#0D0D0D] p-4 border border-[#222222]">
                <div>
                  <span className="text-neutral-500 block">Client:</span>
                  <span className="text-white font-medium">{trackedRequest.full_name} ({trackedRequest.phone})</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Occasion:</span>
                  <span className="text-white font-medium">{trackedRequest.occasion || 'General Bespoke'}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Preferred Color:</span>
                  <span className="text-white font-medium">{trackedRequest.preferred_color}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Deadline:</span>
                  <span className="text-white font-medium">{trackedRequest.preferred_deadline}</span>
                </div>
                {trackedRequest.notes && (
                  <div className="sm:col-span-2 pt-2 border-t border-[#1C1C1C]">
                    <span className="text-amber-400 font-semibold block mb-0.5">Master Tailor Note:</span>
                    <span className="text-neutral-300 italic">{trackedRequest.notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
