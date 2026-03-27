import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Wrench, 
  DollarSign, 
  ShieldCheck, 
  Info,
  Droplets,
  Loader2,
  Brush
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';

const InstallationForm = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const sigCanvas = useRef(null);

  // Initialize State following the required structure
  const [formData, setFormData] = useState({
    cliente: {
      fecha_doc: new Date().toISOString().split('T')[0],
      comprador: '',
      telefono: '',
      email: '',
      direccion: '',
      ciudad: '',
      estado: '',
      zip: ''
    },
    instalacion: {
      fecha_inst: new Date().toISOString().split('T')[0],
      instalador: '',
      representante: ''
    },
    equipos: {
      municipal: false,
      renew_system: false,
      serial_renew: '',
      alkaline: false,
      serial_alkaline: '',
      well_system: false,
      serial_well: '',
      icemaker: false,
      ultraviolet: false,
      big_blue: false,
      spin_down: false,
      other: false,
      other_text: ''
    },
    preguntas: {
      led: 'Yes', 
      led_iniciales: '',
      lugar: 'Yes',
      lugar_iniciales: '',
      clima: 'Yes',
      clima_iniciales: ''
    },
    costos: {
      instalacion: 0,
      millas: 0,
      extra: 0,
      otro: 0,
      total: 0
    },
    firmas: {
      firma_comprador: '',
      fecha_firma: ''
    }
  });

  // Calculate Total Real-time
  useEffect(() => {
    const { instalacion, millas, extra, otro } = formData.costos;
    const total = Number(instalacion) + Number(millas) + Number(extra) + Number(otro);
    setFormData(prev => ({
      ...prev,
      costos: { ...prev.costos, total }
    }));
  }, [formData.costos.instalacion, formData.costos.millas, formData.costos.extra, formData.costos.otro]);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const clearSignature = () => {
    sigCanvas.current.clear();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Get Signature as Base64
      const signature64 = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      const finalData = {
        ...formData,
        firmas: {
          firma_comprador: signature64,
          fecha_firma: new Date().toLocaleString()
        }
      };

      console.log('Sending data:', finalData);

      // Simulation of fetch
      const response = await fetch('https://TU_WEBHOOK_URL_AQUI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });

      // For demo purposes, we always set success to true after a small delay
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
      }, 1500);

    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error sending confirmation. Please try again.');
      setLoading(false);
    }
  };

  const ProgressBar = () => (
    <div className="flex items-center justify-between mb-8 px-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            step >= i ? 'bg-water-blue text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'
          }`}>
            {step > i ? <CheckCircle2 size={24} /> : <span>{i}</span>}
          </div>
          <span className={`text-[10px] mt-2 font-semibold uppercase tracking-wider ${
            step >= i ? 'text-water-blue' : 'text-gray-300'
          }`}>
            {['General', 'Equipos', 'Verif', 'Firma'][i-1]}
          </span>
        </div>
      ))}
      <div className="absolute top-[38px] left-[52px] right-[52px] h-0.5 bg-gray-100 -z-10">
        <motion.div 
          initial={{ width: '0%' }}
          animate={{ width: `${(step-1) * 33.3}%` }}
          className="h-full bg-water-blue transition-all duration-500"
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen bg-ios-bg p-4 flex flex-col font-sans">
      <header className="mb-8 pt-4">
        <div className="flex items-center justify-center gap-4 mb-2">
          <img src={logo} alt="Renew Water Logo" className="w-16 h-auto drop-shadow-sm" />
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">RENEW <span className="text-water-blue font-light">WATER</span></h1>
        </div>
        <p className="text-center text-gray-500 font-bold tracking-[0.1em] text-xs uppercase opacity-40">Installation Confirmation</p>
      </header>

      <div className="relative">
        <ProgressBar />
      </div>

      <main className="flex-1 bg-white rounded-3xl p-6 ios-shadow min-h-[500px] flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center py-10"
            >
              <div className="w-20 h-20 bg-renew-green/10 text-renew-green rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Success!</h2>
              <p className="text-gray-500 mb-8 px-4 font-medium">The installation confirmation has been sent successfully.</p>
              <button 
                onClick={() => window.location.reload()}
                className="btn-primary w-full"
              >
                Close
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              {/* STEP 1: GENERAL DATA */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <User size={20} className="text-water-blue" />
                    General Data
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="ios-label">Doc Date</label>
                      <input 
                        type="date" 
                        className="ios-input shadow-sm border border-gray-50"
                        value={formData.cliente.fecha_doc}
                        onChange={(e) => handleInputChange('cliente', 'fecha_doc', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="ios-label">Install Date</label>
                      <input 
                        type="date" 
                        className="ios-input shadow-sm border border-gray-50"
                        value={formData.instalacion.fecha_inst}
                        onChange={(e) => handleInputChange('instalacion', 'fecha_inst', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="ios-label">Buyer Name</label>
                    <input 
                      type="text" 
                      placeholder="Full Name"
                      className="ios-input shadow-sm border border-gray-50"
                      value={formData.cliente.comprador}
                      onChange={(e) => handleInputChange('cliente', 'comprador', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="ios-label">Phone</label>
                      <input 
                        type="tel" 
                        placeholder="Ex: 555-0123"
                        className="ios-input shadow-sm border border-gray-50"
                        value={formData.cliente.telefono}
                        onChange={(e) => handleInputChange('cliente', 'telefono', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="ios-label">Email</label>
                      <input 
                        type="email" 
                        placeholder="email@example.com"
                        className="ios-input shadow-sm border border-gray-50"
                        value={formData.cliente.email}
                        onChange={(e) => handleInputChange('cliente', 'email', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="ios-label">Address</label>
                    <input 
                      type="text" 
                      placeholder="Street Address"
                      className="ios-input shadow-sm border border-gray-50"
                      value={formData.cliente.direccion}
                      onChange={(e) => handleInputChange('cliente', 'direccion', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label className="ios-label">City</label>
                      <input 
                        type="text" 
                        className="ios-input shadow-sm border border-gray-50"
                        value={formData.cliente.ciudad}
                        onChange={(e) => handleInputChange('cliente', 'ciudad', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="ios-label">State</label>
                      <input 
                        type="text" 
                        className="ios-input shadow-sm border border-gray-50"
                        value={formData.cliente.estado}
                        onChange={(e) => handleInputChange('cliente', 'estado', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="ios-label">Zip</label>
                      <input 
                        type="text" 
                        className="ios-input shadow-sm border border-gray-50"
                        value={formData.cliente.zip}
                        onChange={(e) => handleInputChange('cliente', 'zip', e.target.value)}
                      />
                    </div>
                  </div>

                  <hr className="my-6 border-gray-100" />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="ios-label">Installer</label>
                      <input 
                        type="text" 
                        className="ios-input shadow-sm border border-gray-50"
                        value={formData.instalacion.instalador}
                        onChange={(e) => handleInputChange('instalacion', 'instalador', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="ios-label">Representative</label>
                      <input 
                        type="text" 
                        className="ios-input shadow-sm border border-gray-50"
                        value={formData.instalacion.representante}
                        onChange={(e) => handleInputChange('instalacion', 'representante', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: INSTALLED EQUIPMENT */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <Wrench size={20} className="text-water-blue" />
                    Equipment Installed
                  </h3>

                  <div className="space-y-3">
                    {[
                      { id: 'municipal', label: 'Municipal Water', color: 'bg-blue-500' },
                      { id: 'renew_system', label: 'RENEW WATER TREATMENT SYSTEM', serial: 'serial_renew' },
                      { id: 'alkaline', label: 'ALKALINE REVERSE OSMOSIS', serial: 'serial_alkaline' },
                      { id: 'well_system', label: 'WELL WATER SYSTEM', serial: 'serial_well' },
                      { id: 'icemaker', label: 'ICE MAKER Hook up' },
                      { id: 'ultraviolet', label: 'Ultraviolet' },
                      { id: 'big_blue', label: 'Big Blue' },
                      { id: 'spin_down', label: 'Spin Down' },
                      { id: 'other', label: 'Other', text: 'other_text' }
                    ].map((item) => (
                      <div key={item.id} className="group">
                        <label 
                          className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${
                            formData.equipos[item.id] 
                              ? 'bg-renew-green/5 border-renew-green ring-1 ring-renew-green/10' 
                              : 'bg-gray-50 border-transparent hover:bg-gray-100'
                          }`}
                        >
                          <div className="relative flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              className="peer hidden"
                              checked={formData.equipos[item.id]}
                              onChange={(e) => handleInputChange('equipos', item.id, e.target.checked)}
                            />
                            <div className={`w-6 h-6 rounded-full border-2 transition-all ${
                              formData.equipos[item.id] ? 'bg-renew-green border-renew-green' : 'bg-white border-gray-300'
                            } flex items-center justify-center mr-4`}>
                              {formData.equipos[item.id] && <CheckCircle2 size={16} className="text-white" />}
                            </div>
                            <span className={`font-semibold ${formData.equipos[item.id] ? 'text-renew-green' : 'text-gray-600'}`}>
                              {item.label}
                            </span>
                          </div>
                        </label>

                        {/* Conditional Fields */}
                        <AnimatePresence>
                          {formData.equipos[item.id] && (item.serial || item.text) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0, marginTop: 0 }}
                              animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                              exit={{ height: 0, opacity: 0, marginTop: 0 }}
                              className="overflow-hidden pl-10 pr-2"
                            >
                              <input 
                                type="text"
                                placeholder={item.text ? "Specify other equipment..." : "Serial Number"}
                                className="ios-input bg-white border border-renew-green/20 shadow-inner text-sm focus:ring-renew-green"
                                value={formData.equipos[item.serial || item.text]}
                                onChange={(e) => handleInputChange('equipos', item.serial || item.text, e.target.value)}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: VERIFICATIONS AND COSTS */}
              {step === 3 && (
                <div className="space-y-8 pb-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                      <ShieldCheck size={20} className="text-water-blue" />
                      Verification Check-off
                    </h3>

                    {[
                      { id: 'led', label: 'Shown how to program/read LED?', iniz: 'led_iniciales' },
                      { id: 'lugar', label: 'Agree to location/drain?', iniz: 'lugar_iniciales' },
                      { id: 'clima', label: 'Explained to protect from weather/freezing?', iniz: 'clima_iniciales' }
                    ].map((q) => (
                      <div key={q.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                        <p className="text-sm font-semibold text-gray-700 leading-tight">{q.label}</p>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100 flex-1">
                            {['Yes', 'No'].map((opt) => (
                              <button
                                key={opt}
                                onClick={() => handleInputChange('preguntas', q.id, opt)}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                  formData.preguntas[q.id] === opt 
                                    ? 'bg-water-blue text-white shadow-sm' 
                                    : 'text-gray-400'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                          <input 
                            type="text" 
                            placeholder="INIZ"
                            maxLength="3"
                            className="bg-white px-3 py-2 rounded-xl text-center w-16 border-none text-xs font-bold shadow-sm focus:ring-2 focus:ring-water-blue outline-none placeholder:text-gray-300"
                            value={formData.preguntas[q.iniz]}
                            onChange={(e) => handleInputChange('preguntas', q.iniz, e.target.value.toUpperCase())}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr className="border-gray-100" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                      <DollarSign size={20} className="text-water-blue" />
                      Installation Costs
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="ios-label">Installation</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                          <input 
                            type="number" 
                            className="ios-input pl-8 shadow-sm border border-gray-50"
                            placeholder="0.00"
                            value={formData.costos.instalacion || ''}
                            onChange={(e) => handleInputChange('costos', 'instalacion', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="ios-label">Miles</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                          <input 
                            type="number" 
                            className="ios-input pl-8 shadow-sm border border-gray-50"
                            placeholder="0.00"
                            value={formData.costos.millas || ''}
                            onChange={(e) => handleInputChange('costos', 'millas', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="ios-label">Extra Labor</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                          <input 
                            type="number" 
                            className="ios-input pl-8 shadow-sm border border-gray-50"
                            placeholder="0.00"
                            value={formData.costos.extra || ''}
                            onChange={(e) => handleInputChange('costos', 'extra', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="ios-label">Other</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                          <input 
                            type="number" 
                            className="ios-input pl-8 shadow-sm border border-gray-50"
                            placeholder="0.00"
                            value={formData.costos.otro || ''}
                            onChange={(e) => handleInputChange('costos', 'otro', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-renew-yellow/5 rounded-2xl border-2 border-renew-yellow/20 flex items-center justify-between">
                      <span className="font-bold text-gray-800">Total Installation Cost</span>
                      <span className="text-2xl font-black text-renew-yellow">${formData.costos.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: SIGNATURE AND SUBMIT */}
              {step === 4 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <Brush size={20} className="text-water-blue" />
                    Customer Signature
                  </h3>

                  <div className="relative">
                    <div className="w-full h-80 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden relative group">
                      <SignatureCanvas 
                        ref={sigCanvas}
                        penColor='#1a202c'
                        canvasProps={{className: 'sigCanvas w-full h-full cursor-crosshair'}}
                      />
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
                        <Brush size={120} />
                      </div>
                      
                      <button 
                        onClick={clearSignature}
                        className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-red-500 shadow-sm border border-gray-100 active:scale-95 transition-all"
                      >
                        Clear Signature
                      </button>
                    </div>
                    <p className="mt-3 text-center text-xs text-gray-400 font-medium">Use your finger or stylus to sign above</p>
                  </div>

                  <div className="bg-blue-50/50 p-4 rounded-2xl flex gap-3">
                    <Info className="text-water-blue shrink-0" size={20} />
                    <p className="text-xs text-blue-800/70 font-medium leading-relaxed">
                      By signing this document, I confirm that the installation has been completed properly and I agree with the verification points mentioned in the previous steps.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* NAVIGATION BUTTONS */}
        {!success && (
          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <button 
                onClick={prevStep}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <ChevronLeft size={20} />
                Back
              </button>
            )}
            
            {step < 4 ? (
              <button 
                onClick={nextStep}
                className="btn-primary flex-[2] flex items-center justify-center gap-2"
              >
                Next Step
                <ChevronRight size={20} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary flex-[2] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Confirmation
                    <CheckCircle2 size={20} />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </main>

      <footer className="mt-8 mb-4 text-center">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">© 2026 RENEW WATER TREATMENT SYSTEMS</p>
      </footer>
    </div>
  );
};

export default InstallationForm;
