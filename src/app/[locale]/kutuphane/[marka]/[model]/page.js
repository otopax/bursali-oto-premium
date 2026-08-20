import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildSEOContract } from '@/lib/seo/canonical';
import { getBrandTree, getModels, getGenerations, getEngines, vtSlug } from '@/lib/vehicleTree';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { locale, marka, model } = await params;
  const brandTree = await getBrandTree(marka);
  
  if (!brandTree) {
    return { title: 'Bulunamadı | Bursalı Oto Servis' };
  }
  
  const models = await getModels(marka);
  const targetModel = models.find(m => vtSlug(m.name) === model);
  
  if (!targetModel) {
    return { title: 'Bulunamadı | Bursalı Oto Servis' };
  }
  
  const brandName = brandTree.make;
  const modelName = targetModel.name;
  
  return {
    title: `${brandName} ${modelName} Teknik Verileri ve Arıza Çözümleri | Bursalı Oto Servis`,
    description: `${brandName} ${modelName} için kasa kodları, yıllar, motor seçenekleri ve kronik arızalar rehberi.`,
    ...buildSEOContract({ locale, path: `/kutuphane/${marka}/${model}`, title: `${brandName} ${modelName}`, description: `Teknik Veriler` })
  };
}

export default async function ModelLibraryPage({ params }) {
  const { locale, marka, model } = await params;
  setRequestLocale(locale);

  const brandTree = await getBrandTree(marka);
  if (!brandTree) notFound();

  const brandName = brandTree.make;
  const models = await getModels(marka);
  const targetModel = models.find(m => vtSlug(m.name) === model);
  
  if (!targetModel) notFound();

  const modelName = targetModel.name;
  const generations = await getGenerations(marka, targetModel.modelGroupId);

  // For each generation, get its engines
  const generationsWithEngines = await Promise.all(
    generations.map(async (gen) => {
      const engines = await getEngines(marka, gen.modelId);
      return { ...gen, enginesData: engines };
    })
  );

  return (
    <main className="min-h-screen pt-[120px] pb-24 bg-gradient-to-b from-dark-900 to-black">
      <div className="container-custom">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href={`/${locale}/kutuphane`} className="hover:text-accent-gold transition-colors">Kütüphane</Link>
          <span>/</span>
          <Link href={`/${locale}/kutuphane/${marka}`} className="hover:text-accent-gold transition-colors">{brandName}</Link>
          <span>/</span>
          <span className="text-white font-medium">{modelName}</span>
        </div>

        {/* Header Section */}
        <div className="mb-12 border-l-4 border-accent-gold pl-6 py-2 bg-white/5 rounded-r-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {brandName} <span className="text-accent-gold">{modelName}</span>
          </h1>
          <p className="text-lg text-gray-400">
            Kasa kodları, üretim yılları ve detaylı motor seçenekleri.
          </p>
        </div>

        <div className="space-y-12">
          {generationsWithEngines.length > 0 ? (
            generationsWithEngines.map((gen, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 bg-white/5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                      {gen.name}
                      {gen.chassis && (
                        <span className="px-2 py-1 bg-accent-gold/20 text-accent-gold text-xs rounded border border-accent-gold/30">
                          {gen.chassis}
                        </span>
                      )}
                    </h2>
                    <p className="text-gray-400 mt-1">{gen.years || 'Üretim Yılı Bilinmiyor'}</p>
                  </div>
                  <div className="text-sm text-gray-500 font-medium">
                    {gen.enginesData.length} Motor Seçeneği
                  </div>
                </div>
                
                <div className="p-6">
                  {gen.enginesData.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-gray-400">
                        <thead className="text-xs text-gray-500 uppercase bg-white/5">
                          <tr>
                            <th className="px-6 py-3 font-medium">Motor Tipi</th>
                            <th className="px-6 py-3 font-medium">Motor Kodu</th>
                            <th className="px-6 py-3 font-medium">Hacim (cc)</th>
                            <th className="px-6 py-3 font-medium">Güç (kW)</th>
                            <th className="px-6 py-3 font-medium">Yıl</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gen.enginesData.map((engine, eIdx) => (
                            <tr key={eIdx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-medium text-white">{engine.tip || '-'}</td>
                              <td className="px-6 py-4">{engine.motorKodu || '-'}</td>
                              <td className="px-6 py-4">{engine.kapasiteCc || '-'}</td>
                              <td className="px-6 py-4">{engine.gucKw || '-'}</td>
                              <td className="px-6 py-4">{engine.modelYili || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm">Bu nesil için motor verisi bulunamadı.</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 text-center">
              <p className="text-gray-400">Bu model için kasa ve motor bilgisi bulunamadı.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
