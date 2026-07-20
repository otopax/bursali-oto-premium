import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { can } from "@/lib/authz";

export default async function AracimDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !can(session?.user, 'Vehicle.Read')) {
    // Redirect to login if not authenticated or not authorized
    redirect("/api/auth/signin");
  }

  // Fetch user data and their vehicles
  const customer = await prisma.customer.findUnique({
    where: { id: session.user.id },
    include: {
      vehicles: {
        include: {
          serviceHistory: { orderBy: { serviceDate: 'desc' }, take: 5 },
          diagnosticLogs: { orderBy: { createdAt: 'desc' }, take: 5 }
        }
      }
    }
  });

  if (!customer) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="container mx-auto px-4 pt-32 pb-16 min-h-[100dvh]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dijital Servis Pasaportum</h1>
          <p className="text-[var(--text-muted)] mt-2">Hoş geldin, {customer.firstName}</p>
        </div>
        <div>
          <a href="/api/auth/signout" className="btn btn-outline text-sm">Çıkış Yap</a>
        </div>
      </div>

      {customer.vehicles.length === 0 ? (
        <div className="glass-panel p-8 text-center border border-white/10">
          <h2 className="text-xl text-white mb-4">Henüz kayıtlı aracınız bulunmuyor</h2>
          <p className="text-[var(--text-muted)] mb-6">Sisteme bir araç ekleyerek servis geçmişinizi ve Sanal Usta kayıtlarınızı takip edebilirsiniz.</p>
          <button className="btn btn-gold">Araç Ekle</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {customer.vehicles.map((vehicle) => (
            <div key={vehicle.id} className="glass-panel p-6 border border-[var(--accent-gold)] relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[var(--accent-gold)] text-black px-4 py-1 rounded-bl-lg font-bold text-sm">
                Sağlık Skoru: {vehicle.healthScore || 'N/A'}/100
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-1">{vehicle.brand} {vehicle.model}</h2>
              <p className="text-[var(--text-muted)] text-sm mb-6">{vehicle.year} • {vehicle.plate} • {vehicle.vin}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                  <div className="text-xs text-[var(--text-muted)]">Motor Kodu</div>
                  <div className="font-semibold text-white">{vehicle.engineCode || '-'}</div>
                </div>
                <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                  <div className="text-xs text-[var(--text-muted)]">Son Servis KM</div>
                  <div className="font-semibold text-white">{vehicle.lastServiceKm ? `${vehicle.lastServiceKm} km` : '-'}</div>
                </div>
                <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                  <div className="text-xs text-[var(--text-muted)]">Yağ Spesifikasyonu</div>
                  <div className="font-semibold text-white">{vehicle.oilSpec || '-'}</div>
                </div>
                <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                  <div className="text-xs text-[var(--text-muted)]">Kayıtlı Arıza Kodları</div>
                  <div className="font-semibold text-[#e11d48]">{vehicle.lastObdCodes || 'Yok'}</div>
                </div>
              </div>

              {/* Service History Mini Table */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-[var(--accent-gold)] mb-3 border-b border-white/10 pb-2">Son Servis İşlemleri</h3>
                {vehicle.serviceHistory.length > 0 ? (
                  <ul className="space-y-3">
                    {vehicle.serviceHistory.map(history => (
                      <li key={history.id} className="flex justify-between items-center text-sm">
                        <div>
                          <span className="text-white block">{history.description}</span>
                          <span className="text-[var(--text-muted)] text-xs">{new Date(history.serviceDate).toLocaleDateString('tr-TR')} • {history.mileage} km</span>
                        </div>
                        <div className="text-right">
                          <span className="text-white block">{history.totalCost ? `₺${history.totalCost}` : '-'}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">Kayıtlı servis geçmişi bulunamadı.</p>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <a href={`/sanal-usta?vin=${vehicle.vin}`} className="btn btn-gold flex-1 text-center py-2 text-sm">Sanal Ustaya Sor</a>
                <button className="btn btn-outline flex-1 py-2 text-sm">Randevu Al</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
