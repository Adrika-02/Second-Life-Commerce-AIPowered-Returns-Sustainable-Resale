import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios, { BASE } from '../utils/api'

const GRADE_OPTIONS = [
  { value: 'A', label: 'Like New',  sub: 'No visible wear, all parts present', active: 'border-green-400 bg-green-50 text-green-800' },
  { value: 'B', label: 'Good',      sub: 'Minor signs of use, fully functional', active: 'border-blue-400 bg-blue-50 text-blue-800' },
  { value: 'C', label: 'Fair',      sub: 'Visible wear or minor damage', active: 'border-amber-400 bg-amber-50 text-amber-800' },
]

export default function QuickList() {
  const navigate = useNavigate()

  const [step, setStep] = useState(1)

  // Step 1
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [name, setName] = useState('')
  const fileRef = useRef(null)

  // Step 2
  const [grade, setGrade] = useState('B')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [highlights, setHighlights] = useState(['', '', ''])

  // Step 3
  const [addr, setAddr] = useState({ name: '', phone: '', line1: '', city: '', state: '', pincode: '' })

  // Submission
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [done, setDone]       = useState(false)

  const setAddrField = (k, v) => setAddr(p => ({ ...p, [k]: v }))

  const handlePhoto = (files) => {
    const f = Array.from(files).find(f => f.type.startsWith('image/'))
    if (!f) return
    setPhotoFile(f)
    setPhotoPreview(URL.createObjectURL(f))
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    handlePhoto(e.dataTransfer.files)
  }, [])

  const submit = async () => {
    setLoading(true)
    setError(null)
    try {
      let imageUrl = null
      if (photoFile) {
        const fd = new FormData()
        fd.append('files', photoFile)
        const up = await fetch(BASE + '/api/uploads/media/batch', { method: 'POST', body: fd })
        const upData = await up.json()
        imageUrl = upData.urls?.[0] || null
      }

      const priceInt = parseInt(price) || 500
      const filledHighlights = highlights.filter(Boolean)
      const listRes = await axios.post('/api/v1/marketplace/listings', {
        product_name: name,
        grade,
        image_url: imageUrl,
        extra_image_urls: [],
        estimated_resale_value_inr: priceInt,
        damage_detected: grade === 'A' ? 'None visible' : `Grade ${grade} condition`,
        customer_title: name,
        customer_description: description || `Pre-owned ${name} in ${grade === 'A' ? 'like-new' : grade === 'B' ? 'good' : 'fair'} condition. Tested and verified.`,
        customer_highlights: filledHighlights.length ? filledHighlights : [`Grade ${grade} — verified condition`, 'Tested before listing', 'Quick dispatch within 24h'],
        customer_price: priceInt,
      })

      await axios.post('/api/v1/orders/', {
        listing_id: listRes.data.id,
        product_name: name,
        image_url: imageUrl,
        grade,
        original_price: priceInt,
        user_role: 'seller',
        pickup_address: addr,
      })

      setDone(true)
      setTimeout(() => navigate('/orders'), 1800)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center">
        <div className="bg-white border border-green-200 rounded-2xl p-10 shadow-sm">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Item Listed!</h2>
          <p className="text-sm text-gray-500 mb-1">
            <span className="font-semibold text-gray-700">{name}</span> is now live on the Second Life Marketplace.
          </p>
          <p className="text-xs text-gray-400">Redirecting to Orders…</p>
        </div>
      </div>
    )
  }

  const stepLabels = ['Photo & Name', 'Item Details', 'Pickup Address']

  return (
    <div className="max-w-lg mx-auto pb-16">

      {/* Header */}
      <div className="bg-white border border-amz-border rounded-xl px-5 py-4 mb-4">
        <h1 className="text-xl font-bold text-gray-900">List an Item for Sale</h1>
        <p className="text-sm text-gray-500 mt-0.5">Sell electronics, clothes, toys, collectibles — anything</p>

        {/* Step bar */}
        <div className="flex items-center gap-1 mt-4">
          {stepLabels.map((label, i) => {
            const s = i + 1
            const done = step > s
            const active = step === s
            return (
              <div key={s} className="flex items-center gap-1 flex-1 min-w-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0 transition-all ${
                  done   ? 'bg-green-500 border-green-500 text-white'
                  : active ? 'bg-amz-orange border-amz-orange text-white'
                  : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {done ? '✓' : s}
                </div>
                <span className={`text-[11px] truncate ${active ? 'text-gray-800 font-semibold' : done ? 'text-green-600' : 'text-gray-400'}`}>
                  {label}
                </span>
                {s < 3 && <div className={`h-px flex-1 mx-1 min-w-2 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Step 1: Photo & Name ─────────────────────────────────────── */}
      {step === 1 && (
        <div className="bg-white border border-amz-border rounded-xl p-5 space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-800">What are you selling?</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Ty Beanie Plush Bear, Nike Sneakers Size 8…"
              className="mt-1.5 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amz-orange transition-colors"
              onKeyDown={e => { if (e.key === 'Enter' && name.trim()) setStep(2) }}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-800 block mb-1">
              Photo <span className="font-normal text-gray-400">(optional but recommended)</span>
            </label>
            <p className="text-xs text-gray-400 mb-2">Clear photos sell 3× faster</p>

            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 h-52 bg-gray-50">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-contain p-2" />
                <button
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center text-base transition-colors"
                >
                  ×
                </button>
                <span className="absolute bottom-2 left-2 text-[10px] bg-black/50 text-white px-2 py-0.5 rounded-full">
                  ✓ Photo added
                </span>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-xl h-52 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragging ? 'border-amz-orange bg-amber-50' : 'border-gray-300 hover:border-amz-orange hover:bg-gray-50'
                }`}
                onDrop={onDrop}
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileRef.current?.click()}
              >
                <span className="text-5xl mb-2">📷</span>
                <p className="text-sm font-semibold text-gray-600">Drop photo here or click to upload</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · max 10 MB</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handlePhoto(e.target.files)} />
          </div>

          <button
            onClick={() => { if (name.trim()) setStep(2) }}
            disabled={!name.trim()}
            className="w-full py-3 bg-amz-yellow text-amz-text font-bold text-sm rounded-full border border-[#FFA41C] hover:bg-amz-yellow-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Continue →
          </button>
        </div>
      )}

      {/* ── Step 2: Item Details ─────────────────────────────────────── */}
      {step === 2 && (
        <div className="bg-white border border-amz-border rounded-xl p-5 space-y-4">

          <div>
            <label className="text-sm font-bold text-gray-800 block mb-2">Condition</label>
            <div className="grid grid-cols-3 gap-2">
              {GRADE_OPTIONS.map(g => (
                <button
                  key={g.value}
                  onClick={() => setGrade(g.value)}
                  className={`border-2 rounded-xl p-3 text-center transition-all ${
                    grade === g.value ? g.active + ' shadow-sm' : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <p className="text-xs font-bold">{g.label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{g.sub}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-800">Your Asking Price</label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">₹</span>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="e.g. 499"
                min="1"
                className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-amz-orange"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-800">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe condition, age, what's included (original box, accessories, etc.)…"
              rows={3}
              className="mt-1.5 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amz-orange resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-800 block mb-1">
              Key Selling Points <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <div className="space-y-2">
              {highlights.map((h, i) => (
                <input
                  key={i}
                  value={h}
                  onChange={e => { const a = [...highlights]; a[i] = e.target.value; setHighlights(a) }}
                  placeholder={['Comes with original packaging', 'No scratches, all buttons work', 'Barely used — bought 2 months ago'][i]}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amz-orange"
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-300 text-gray-600 font-semibold text-sm rounded-full hover:bg-gray-50 transition-colors">
              ← Back
            </button>
            <button
              onClick={() => { if (price) setStep(3) }}
              disabled={!price}
              className="flex-[2] py-3 bg-amz-yellow text-amz-text font-bold text-sm rounded-full border border-[#FFA41C] hover:bg-amz-yellow-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Pickup Address ───────────────────────────────────── */}
      {step === 3 && (
        <div className="bg-white border border-amz-border rounded-xl p-5 space-y-4">
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
            <span className="text-base mt-0.5 flex-shrink-0">🚗</span>
            <p className="text-xs text-blue-700">Our agent will visit this address to collect the item. You'll get a 2-hour pickup window.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700">Full Name *</label>
              <input value={addr.name} onChange={e => setAddrField('name', e.target.value)} placeholder="Adrika Sarawat" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amz-orange" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700">Phone *</label>
              <input value={addr.phone} onChange={e => setAddrField('phone', e.target.value)} placeholder="+91 98765 43210" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amz-orange" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700">Address *</label>
            <input value={addr.line1} onChange={e => setAddrField('line1', e.target.value)} placeholder="Flat / House no., Street, Area" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amz-orange" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-bold text-gray-700">City *</label>
              <input value={addr.city} onChange={e => setAddrField('city', e.target.value)} placeholder="Mumbai" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amz-orange" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700">State</label>
              <input value={addr.state} onChange={e => setAddrField('state', e.target.value)} placeholder="MH" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amz-orange" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700">Pincode</label>
              <input value={addr.pincode} onChange={e => setAddrField('pincode', e.target.value)} placeholder="400001" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amz-orange" />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1">
            <p className="text-xs font-bold text-gray-700">Listing Preview</p>
            <div className="flex items-center gap-2">
              {photoPreview && <img src={photoPreview} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0" />}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                <p className="text-xs text-gray-500">Grade {grade} · ₹{parseInt(price || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="flex-1 py-3 border border-gray-300 text-gray-600 font-semibold text-sm rounded-full hover:bg-gray-50 transition-colors">
              ← Back
            </button>
            <button
              onClick={submit}
              disabled={loading || !addr.name || !addr.phone || !addr.line1 || !addr.city}
              className="flex-[2] py-3 bg-amz-yellow text-amz-text font-bold text-sm rounded-full border border-[#FFA41C] hover:bg-amz-yellow-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading
                ? <><svg className="animate-spin h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Listing…</>
                : '🚀 List on Marketplace'
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
