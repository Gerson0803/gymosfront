'use client';

import { useState } from 'react';
import { Download, Upload, RefreshCw, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { getAuthToken } from '@/lib/api';

interface ImportError {
  sheet: string;
  row: number;
  field: string;
  error: string;
  updateDetails?: Array<{ field: string; oldValue: any; newValue: any }>;
}

interface UpdateInfo {
  existingId: string;
  email: string;
  productType: string;
  changedFields: Array<{ field: string; oldValue: any; newValue: any }>;
  action: string;
}

interface ApplyUpdateResult {
  success: boolean;
  message: string;
  appliedUpdates: any[];
  failedUpdates?: Array<{ id: string; error: string }>;
}

interface ImportResult {
  success: boolean;
  message?: string;
  totalRows?: number;
  importedRows?: number;
  updateAvailable?: number;
  updates?: UpdateInfo[];
  duplicatesFound?: number;
  errors?: ImportError[];
  error?: string;
}

const FIELD_LABELS: Record<string, string> = {
  name: 'Nombre',
  phone: 'Teléfono',
  source: 'Fuente',
  status: 'Estado',
  assignedAdvisor: 'Asesor Asignado',
  notes: 'Notas',
  'productDetails.membershipType': 'Tipo de Membresía',
  'productDetails.durationMonths': 'Duración (meses)',
  'productDetails.pricePerPeriod': 'Precio por Período',
  'productDetails.periodicity': 'Periodicidad',
  'productDetails.startDate': 'Fecha de Inicio',
  'productDetails.endDate': 'Fecha de Fin',
  'productDetails.autoRenewal': 'Renovación Automática',
  'productDetails.includedAccess': 'Acceso Incluido',
  'productDetails.enrollmentFee': 'Cuota de Inscripción',
  'productDetails.serviceType': 'Tipo de Servicio',
  'productDetails.assignedTrainer': 'Entrenador Asignado',
  'productDetails.numberOfSessions': 'Número de Sesiones',
  'productDetails.sessionDurationMinutes': 'Duración (minutos)',
  'productDetails.modality': 'Modalidad',
  'productDetails.pricePerSession': 'Precio por Sesión',
  'productDetails.packagePrice': 'Precio del Paquete',
  'productDetails.firstSessionDate': 'Fecha Primera Sesión',
  'productDetails.clientObjective': 'Objetivo del Cliente',
  'productDetails.initialEvaluationRequired': 'Evaluación Inicial',
  'productDetails.productName': 'Nombre del Producto',
  'productDetails.sku': 'SKU',
  'productDetails.category': 'Categoría',
  'productDetails.quantity': 'Cantidad',
  'productDetails.unitPrice': 'Precio Unitario',
  'productDetails.size': 'Talla',
  'productDetails.color': 'Color',
  'productDetails.availableStock': 'Stock Disponible',
  'productDetails.brand': 'Marca',
};

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  membership: 'Membresía',
  personal_training: 'Entrenamiento Personal',
  fitness_product: 'Producto',
  MEMBERSHIP: 'Membresía',
  PERSONAL_TRAINING: 'Entrenamiento Personal',
  FITNESS_PRODUCT: 'Producto',
};

function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] || field;
}

function getProductTypeLabel(type: string): string {
  return PRODUCT_TYPE_LABELS[type] || type;
}

function categorizeImportErrors(errors?: ImportError[]) {
  if (!errors) return { parse: [], fileDups: [], dbDups: [], changes: [], creation: [] };

  const parse: ImportError[] = [];
  const fileDups: ImportError[] = [];
  const dbDups: ImportError[] = [];
  const changes: ImportError[] = [];
  const creation: ImportError[] = [];

  for (const err of errors) {
    if (err.updateDetails) {
      changes.push(err);
    } else if (err.error.includes('Duplicado en archivo')) {
      fileDups.push(err);
    } else if (err.error.includes('ya existe sin cambios')) {
      dbDups.push(err);
    } else if (err.error.includes('Error al guardar')) {
      creation.push(err);
    } else {
      parse.push(err);
    }
  }

  return { parse, fileDups, dbDups, changes, creation };
}

function formatValue(val: any): string {
  if (val === null || val === undefined) return '-';
  if (typeof val === 'boolean') return val ? 'Sí' : 'No';
  if (Array.isArray(val)) return val.join(', ');
  return String(val);
}

export function ExcelButtons({ onImportComplete }: { onImportComplete?: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isApplyingUpdates, setIsApplyingUpdates] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [applyResult, setApplyResult] = useState<ApplyUpdateResult | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'errors' | 'updates'>('summary');

  const handleDownloadTemplate = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = getAuthToken();

      const response = await fetch(`${API_URL}/leads/export/template`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plantilla_leads.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error descargando plantilla:', error);
      alert('Error al descargar la plantilla: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      alert('Por favor selecciona un archivo Excel (.xlsx)');
      return;
    }

    setIsLoading(true);
    setApplyResult(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = getAuthToken();

      const response = await fetch(`${API_URL}/leads/import`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const data: ImportResult = await response.json();
      setResult(data);
      setShowResult(true);
      setActiveTab('summary');

      if (data.success && onImportComplete) {
        setTimeout(onImportComplete, 2000);
      }
    } catch (error) {
      console.error('Error importando:', error);
      setResult({
        success: false,
        error: 'Error al importar: ' + (error instanceof Error ? error.message : 'Error desconocido'),
      });
      setShowResult(true);
    } finally {
      setIsLoading(false);
      event.target.value = '';
    }
  };

  const handleApplyUpdates = async () => {
    if (!result?.updates || result.updates.length === 0) return;

    setIsApplyingUpdates(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const token = getAuthToken();

      const updates = result.updates.map((upd) => {
        const productDetailsFields = upd.changedFields
          .filter(f => f.field.startsWith('productDetails.'))
          .reduce((acc: any, f) => {
            const key = f.field.replace('productDetails.', '');
            acc[key] = f.newValue;
            return acc;
          }, {});

        return {
          existingId: upd.existingId,
          leadData: {
            name: upd.changedFields.find(f => f.field === 'name')?.newValue,
            phone: upd.changedFields.find(f => f.field === 'phone')?.newValue,
            source: upd.changedFields.find(f => f.field === 'source')?.newValue,
            status: upd.changedFields.find(f => f.field === 'status')?.newValue,
            assignedAdvisor: upd.changedFields.find(f => f.field === 'assignedAdvisor')?.newValue,
            notes: upd.changedFields.find(f => f.field === 'notes')?.newValue,
            ...(Object.keys(productDetailsFields).length > 0 && { productDetails: productDetailsFields }),
          },
        };
      });

      const response = await fetch(`${API_URL}/leads/import/apply-updates`, {
        method: 'POST',
        body: JSON.stringify({ updates }),
        credentials: 'include',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      const data: ApplyUpdateResult = await response.json();
      setApplyResult(data);
    } catch (error) {
      console.error('Error aplicando actualizaciones:', error);
      setApplyResult({
        success: false,
        message: 'Error de conexión',
        appliedUpdates: [],
        failedUpdates: [{ id: '0', error: error instanceof Error ? error.message : 'Error desconocido' }],
      });
    } finally {
      setIsApplyingUpdates(false);
    }
  };

  const categorized = result ? categorizeImportErrors(result.errors) : null;
  const hasChanges = categorized ? categorized.changes.length > 0 : false;

  const getHeader = () => {
    if (!result) return { icon: null, title: '', color: '' };
    if (applyResult) {
      return applyResult.success
        ? { icon: <CheckCircle size={20} />, title: 'Actualizaciones Aplicadas', color: 'text-green-600' }
        : { icon: <AlertTriangle size={20} />, title: 'Error al Actualizar', color: 'text-red-600' };
    }
    if (result.success && result.importedRows && result.importedRows > 0 && !hasChanges) {
      return { icon: <CheckCircle size={20} />, title: 'Importación Exitosa', color: 'text-green-600' };
    }
    if (result.success && result.importedRows && result.importedRows > 0 && hasChanges) {
      return { icon: <AlertTriangle size={20} />, title: 'Importación Parcial', color: 'text-amber-600' };
    }
    if (result.importedRows === 0 && (result.updateAvailable || 0) > 0) {
      return { icon: <Info size={20} />, title: 'Sin Registros Nuevos', color: 'text-blue-600' };
    }
    if (result.importedRows === 0 && (result.duplicatesFound || 0) > 0) {
      return { icon: <Info size={20} />, title: 'Todos los Registros ya Existen', color: 'text-blue-600' };
    }
    return { icon: <XCircle size={20} />, title: 'Importación Rechazada', color: 'text-red-600' };
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleDownloadTemplate}
          disabled={isLoading}
          title="Descargar plantilla de Excel"
          className="p-2 rounded-lg border border-[#E5EAF3] text-[#5B6475] hover:bg-[#F5F7FB] disabled:opacity-50 transition"
        >
          <Download size={18} />
        </button>

        <label className="p-2 rounded-lg border border-[#E5EAF3] text-[#5B6475] hover:bg-[#F5F7FB] cursor-pointer disabled:opacity-50 transition">
          <Upload size={18} />
          <input
            type="file"
            accept=".xlsx"
            onChange={handleImportFile}
            disabled={isLoading}
            className="hidden"
          />
        </label>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-[#E5EAF3] border-t-[#0B57F0] rounded-full animate-spin" />
            <p className="text-sm font-medium text-[#0A1733]">Importando datos del Excel...</p>
            <p className="text-xs text-[#5B6475]">Procesando hojas y verificando duplicados</p>
          </div>
        </div>
      )}

      {showResult && result && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E5EAF3]">
              <div className="flex items-center gap-3">
                {applyResult ? (
                  applyResult.success
                    ? <CheckCircle size={24} className="text-green-500" />
                    : <AlertTriangle size={24} className="text-red-500" />
                ) : result.success
                  ? <CheckCircle size={24} className="text-green-500" />
                  : result.importedRows === 0 && (result.updateAvailable || result.duplicatesFound)
                    ? <Info size={24} className="text-blue-500" />
                    : <XCircle size={24} className="text-red-500" />
                }
                <div>
                  <h2 className="text-lg font-semibold text-[#0A1733]">
                    {applyResult
                      ? (applyResult.success ? 'Actualizaciones Aplicadas' : 'Error al Actualizar')
                      : getHeader().title
                    }
                  </h2>
                  <p className="text-sm text-[#5B6475]">
                    {applyResult ? applyResult.message : (result.message || result.error)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowResult(false); setApplyResult(null); }}
                className="text-[#5B6475] hover:text-[#0A1733] text-2xl"
              >
                ×
              </button>
            </div>

            {/* Tabs (only show if NOT in apply-updates result view) */}
            {!applyResult && (
              <div className="flex gap-4 px-6 pt-4 border-b border-[#E5EAF3]">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`pb-3 font-medium text-sm transition ${
                    activeTab === 'summary'
                      ? 'border-b-2 border-[#0B57F0] text-[#0B57F0]'
                      : 'text-[#5B6475] hover:text-[#0A1733]'
                  }`}
                >
                  Resumen
                </button>
                {result.errors && result.errors.length > 0 && (
                  <button
                    onClick={() => setActiveTab('errors')}
                    className={`pb-3 font-medium text-sm transition ${
                      activeTab === 'errors'
                        ? 'border-b-2 border-[#0B57F0] text-[#0B57F0]'
                        : 'text-[#5B6475] hover:text-[#0A1733]'
                    }`}
                  >
                    Errores ({result.errors.length})
                  </button>
                )}
                {result.updates && result.updates.length > 0 && (
                  <button
                    onClick={() => setActiveTab('updates')}
                    className={`pb-3 font-medium text-sm transition ${
                      activeTab === 'updates'
                        ? 'border-b-2 border-[#0B57F0] text-[#0B57F0]'
                        : 'text-[#5B6475] hover:text-[#0A1733]'
                    }`}
                  >
                    Cambios ({result.updates.length})
                  </button>
                )}
              </div>
            )}

            {/* Apply-updates Result */}
            {applyResult ? (
              <div className="p-6 space-y-4">
                {applyResult.appliedUpdates.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="font-medium text-green-800 mb-1">
                      <CheckCircle size={16} className="inline mr-1" />
                      {applyResult.appliedUpdates.length} lead(es) actualizado(s) correctamente
                    </p>
                    <p className="text-sm text-green-600">
                      Los cambios se han guardado en la base de datos.
                    </p>
                  </div>
                )}
                {applyResult.failedUpdates && applyResult.failedUpdates.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="font-medium text-red-800 mb-2">
                      <XCircle size={16} className="inline mr-1" />
                      {applyResult.failedUpdates.length} actualizaciones fallaron
                    </p>
                    <div className="space-y-1">
                      {applyResult.failedUpdates.map((f, idx) => (
                        <p key={idx} className="text-sm text-red-600">
                          ID {f.id}: {f.error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Content */
              <div className="p-6 space-y-4">
                {/* Summary Tab */}
                {activeTab === 'summary' && (
                  <>
                    {result.totalRows !== undefined && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-[#F5F7FB] p-4 rounded-lg">
                          <p className="text-sm text-[#5B6475]">Total de Filas</p>
                          <p className="text-2xl font-bold text-[#0A1733]">{result.totalRows}</p>
                        </div>
                        <div className="bg-[#F5F7FB] p-4 rounded-lg">
                          <p className="text-sm text-[#5B6475]">Nuevos Leads</p>
                          <p className="text-2xl font-bold text-green-600">{result.importedRows || 0}</p>
                        </div>
                        <div className="bg-[#F5F7FB] p-4 rounded-lg">
                          <p className="text-sm text-[#5B6475]">Con Cambios</p>
                          <p className="text-2xl font-bold text-blue-600">{result.updateAvailable || 0}</p>
                        </div>
                        {(result.duplicatesFound || 0) > 0 && (
                          <div className="bg-[#F5F7FB] p-4 rounded-lg">
                            <p className="text-sm text-[#5B6475]">Duplicados Exactos</p>
                            <p className="text-2xl font-bold text-amber-600">{result.duplicatesFound}</p>
                          </div>
                        )}
                        {categorized && categorized.parse.length > 0 && (
                          <div className="bg-[#F5F7FB] p-4 rounded-lg">
                            <p className="text-sm text-[#5B6475]">Errores de Validación</p>
                            <p className="text-2xl font-bold text-red-600">{categorized.parse.length}</p>
                          </div>
                        )}
                        {categorized && categorized.creation.length > 0 && (
                          <div className="bg-[#F5F7FB] p-4 rounded-lg">
                            <p className="text-sm text-[#5B6475]">Errores al Guardar</p>
                            <p className="text-2xl font-bold text-red-600">{categorized.creation.length}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {categorized && categorized.changes.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                        <div className="flex items-start gap-3">
                          <Info size={20} className="text-blue-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-blue-800 mb-1">
                              {categorized.changes.length} lead(es) existente(s) con cambios detectados
                            </p>
                            <p className="text-sm text-blue-600">
                              Revisa la pestaña Cambios y usa el botón &quot;Aplicar Cambios&quot; si deseas actualizar los datos.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {categorized && categorized.fileDups.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-2">
                        <div className="flex items-start gap-3">
                          <AlertTriangle size={20} className="text-amber-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-amber-800 mb-1">
                              {categorized.fileDups.length} registro(s) duplicado(s) dentro del archivo
                            </p>
                            <p className="text-sm text-amber-600">
                              El mismo correo con el mismo tipo de producto aparece más de una vez en el Excel.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Errors Tab */}
                {activeTab === 'errors' && result.errors && result.errors.length > 0 && (
                  <div className="space-y-6">
                    {categorized && categorized.parse.length > 0 && (
                      <Section title="Errores de Validación" count={categorized.parse.length} color="red">
                        <ErrorTable errors={categorized.parse} />
                      </Section>
                    )}
                    {categorized && categorized.fileDups.length > 0 && (
                      <Section title="Duplicados en el Archivo" count={categorized.fileDups.length} color="amber">
                        <ErrorTable errors={categorized.fileDups} />
                      </Section>
                    )}
                    {categorized && categorized.dbDups.length > 0 && (
                      <Section title="Duplicados en Base de Datos" count={categorized.dbDups.length} color="amber">
                        <ErrorTable errors={categorized.dbDups} />
                      </Section>
                    )}
                    {categorized && categorized.changes.length > 0 && (
                      <Section title="Cambios Detectados" count={categorized.changes.length} color="blue">
                        <div className="space-y-2">
                          {categorized.changes.map((err, idx) => (
                            <div key={idx} className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                              <p className="text-sm font-medium text-blue-800 mb-1">
                                Fila {err.row} - {err.error.replace(/^Lead existente con cambios: /, '')}
                              </p>
                              {err.updateDetails && (
                                <div className="text-xs space-y-1 mt-2">
                                  {err.updateDetails.map((d, didx) => (
                                    <div key={didx} className="flex items-center gap-2 text-blue-700">
                                      <span className="font-medium min-w-[120px]">{getFieldLabel(d.field)}:</span>
                                      <span className="line-through text-blue-400">{formatValue(d.oldValue)}</span>
                                      <span>→</span>
                                      <span className="font-medium">{formatValue(d.newValue)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </Section>
                    )}
                    {categorized && categorized.creation.length > 0 && (
                      <Section title="Errores al Guardar" count={categorized.creation.length} color="red">
                        <ErrorTable errors={categorized.creation} />
                      </Section>
                    )}
                  </div>
                )}

                {/* Updates Tab */}
                {activeTab === 'updates' && result.updates && result.updates.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#0A1733] mb-3">
                      Cambios Detectados ({result.updates.length})
                    </h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {result.updates.map((upd, idx) => (
                        <div key={idx} className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-medium text-[#0A1733]">{upd.email}</p>
                              <p className="text-xs text-blue-600">{getProductTypeLabel(upd.productType)}</p>
                            </div>
                          </div>
                          <div className="text-sm space-y-1.5 ml-9">
                            {upd.changedFields.map((field, fieldIdx) => (
                              <div key={fieldIdx} className="flex items-center gap-2 text-[#5B6475]">
                                <span className="font-medium min-w-[140px]">{getFieldLabel(field.field)}:</span>
                                <span className="line-through text-red-400 bg-red-50 px-1.5 py-0.5 rounded text-xs">
                                  {formatValue(field.oldValue)}
                                </span>
                                <span className="text-gray-400">→</span>
                                <span className="font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded text-xs">
                                  {formatValue(field.newValue)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-[#E5EAF3]">
              <button
                onClick={() => { setShowResult(false); setApplyResult(null); }}
                className="px-4 py-2 rounded-lg border border-[#E5EAF3] text-[#5B6475] font-medium hover:bg-[#F5F7FB] transition"
              >
                {applyResult ? 'Cerrar' : 'Cerrar'}
              </button>
              {applyResult ? (
                <button
                  onClick={() => {
                    setShowResult(false);
                    setApplyResult(null);
                    if (onImportComplete) onImportComplete();
                  }}
                  className="px-4 py-2 rounded-lg bg-[#0B57F0] text-white font-medium hover:bg-[#0A4BC8] transition"
                >
                  Actualizar Vista
                </button>
              ) : (
                <>
                  {result.success && result.importedRows && result.importedRows > 0 && (
                    <button
                      onClick={() => {
                        setShowResult(false);
                        if (onImportComplete) onImportComplete();
                      }}
                      className="px-4 py-2 rounded-lg bg-[#0B57F0] text-white font-medium hover:bg-[#0A4BC8] transition"
                    >
                      Actualizar
                    </button>
                  )}
                  {result.updates && result.updates.length > 0 && (
                    <button
                      onClick={handleApplyUpdates}
                      disabled={isApplyingUpdates}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition"
                    >
                      <RefreshCw size={16} className={isApplyingUpdates ? 'animate-spin' : ''} />
                      {isApplyingUpdates ? 'Aplicando...' : 'Aplicar Cambios'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ title, count, color, children }: { title: string; count: number; color: string; children: React.ReactNode }) {
  const colorMap: Record<string, string> = {
    red: 'border-red-200 bg-red-50 text-red-800',
    amber: 'border-amber-200 bg-amber-50 text-amber-800',
    blue: 'border-blue-200 bg-blue-50 text-blue-800',
  };
  const dotMap: Record<string, string> = {
    red: 'bg-red-500',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
  };
  return (
    <div>
      <h4 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${colorMap[color]?.split(' ').pop()}`}>
        <span className={`w-2 h-2 rounded-full ${dotMap[color] || 'bg-gray-500'}`} />
        {title}
        <span className="text-xs font-normal opacity-70">({count})</span>
      </h4>
      {children}
    </div>
  );
}

function ErrorTable({ errors }: { errors: ImportError[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#F5F7FB] border-b border-[#E5EAF3]">
            <th className="px-4 py-2 text-left text-[#5B6475] font-medium">Hoja</th>
            <th className="px-4 py-2 text-left text-[#5B6475] font-medium">Fila</th>
            <th className="px-4 py-2 text-left text-[#5B6475] font-medium">Campo</th>
            <th className="px-4 py-2 text-left text-[#5B6475] font-medium">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {errors.map((err, idx) => (
            <tr key={idx} className="border-b border-[#E5EAF3] hover:bg-[#F9FAFB]">
              <td className="px-4 py-2 text-[#0A1733]">{err.sheet}</td>
              <td className="px-4 py-2 text-[#0A1733]">{err.row}</td>
              <td className="px-4 py-2 text-[#0A1733] font-medium">{err.field}</td>
              <td className="px-4 py-2 text-red-600">{err.error}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
