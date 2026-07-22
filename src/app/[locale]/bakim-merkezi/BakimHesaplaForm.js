'use client';

export default function BakimHesaplaForm({ locale }) {
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const brand = e.target.brand.value.toLowerCase();
      const mileage = e.target.mileage.value;
      window.location.href = `/${locale}/bakim-merkezi/${brand}/${mileage}`;
    }} className="flex flex-col md:flex-row gap-4">
      <select name="brand" required className="flex-1 bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[var(--accent-gold)]" defaultValue="">
        <option value="" disabled>Marka Seçin</option>
        <option value="bmw">BMW</option>
        <option value="mercedes">Mercedes-Benz</option>
        <option value="audi">Audi</option>
      </select>
      <select name="mileage" required className="flex-1 bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[var(--accent-gold)]" defaultValue="">
        <option value="" disabled>Kilometre</option>
        <option value="15000">15.000 km</option>
        <option value="30000">30.000 km</option>
        <option value="60000">60.000 km</option>
        <option value="120000">120.000 km (Ağır Bakım)</option>
      </select>
      <button type="submit" className="btn btn-gold py-4 px-8 text-lg rounded-xl">Hesapla</button>
    </form>
  );
}
