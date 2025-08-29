import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import CompanyHeader from '../../../components/CompanyHeader';
import { getOrder, OrderDetail } from '../../../lib/api/orders';
import { getPartner, Partner } from '../../../lib/api/partners';

function fmt(n: number | undefined, digits = 2) {
  if (n == null || isNaN(n)) return '';
  return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
}

export default function OrderQuotePrint() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const o = await getOrder('', '', id as string);
      setOrder(o);
      if (o.partner_id) {
        try { setPartner(await getPartner(o.partner_id)); } catch {}
      }
    })();
  }, [id]);

  const rows = useMemo(() => {
    if (!order) return [] as Array<{
      sn: number;
      name: string;
      width?: number;
      height?: number;
      quantity: number;
      perArea: number;
      effPerArea: number;
      totalArea: number;
      unitPrice: number;
      lineTotal: number;
      note?: string;
    }>;
    const out: any[] = [];
    let sn = 1;
    for (const it of order.items) {
      const q = Number(it.quantity || 0);
      const unit = Number(it.unit_price || 0);
      let per = 0;
      if (it.area_sqm != null) {
        per = Number(it.area_sqm || 0);
      } else {
        const w = Number(it.width || 0) / 1000;
        const h = Number(it.height || 0) / 1000;
        per = w * h;
      }
      const effPer = Math.max(0.25, per);
      const qty = q || 1;
      const tArea = effPer * qty;
      const lTotal = tArea * unit;
      out.push({
        sn: sn++,
        name: (it as any).product_name || '',
        width: it.width || undefined,
        height: it.height || undefined,
        quantity: qty,
        perArea: per,
        effPerArea: effPer,
        totalArea: tArea,
        unitPrice: unit,
        lineTotal: lTotal,
        note: it.description || '',
      });
    }
    return out;
  }, [order]);

  const totals = useMemo(() => {
    const totalQty = rows.reduce((s, r) => s + (r.quantity || 0), 0);
    const totalArea = rows.reduce((s, r) => s + r.totalArea, 0);
    const subtotal = rows.reduce((s, r) => s + r.lineTotal, 0);
    const smallPieces = rows.reduce((s, r) => s + (r.perArea < 0.25 ? r.quantity : 0), 0);
    const discountPct = Number((order as any)?.discount_percent || 0) || 0;
    const discountAmt = subtotal * (discountPct / 100);
    const afterDiscount = subtotal - discountAmt;
    const vatInclusive = !!(order as any)?.vat_inclusive;
    let net = 0, vat = 0, grand = 0;
    if (vatInclusive) {
      // Prices include VAT: totals are gross; apply discount to gross, then split VAT
      grand = afterDiscount;
      net = grand / 1.20;
      vat = grand - net;
    } else {
      // Prices exclude VAT: apply discount to net, then add VAT
      net = afterDiscount;
      vat = net * 0.20;
      grand = net + vat;
    }
    return { totalQty, totalArea, subtotal, discountPct, discountAmt, net, vat, grand, smallPieces };
  }, [rows, order]);

  return (
    <div className="p-6 print:p-0">
      <div className="no-print mb-4 flex items-center justify-between">
        <button className="px-4 py-2 border" onClick={() => window.print()}>Yazdır</button>
        <button className="px-4 py-2 border" onClick={() => router.back()}>Geri</button>
      </div>

      <div className="max-w-5xl mx-auto">
        <CompanyHeader />
        <h2 className="text-xl font-bold text-center mb-3">CAM TEKLİFİ</h2>

        {/* Üst bilgi kutusu */}
        <div className="border rounded mb-4 p-3 text-sm grid grid-cols-1 md:grid-cols-2 gap-2">
          <div><span className="font-semibold">Takip No:</span> {order?.order_number || '-'}</div>
          <div><span className="font-semibold">Kayıt Tarihi:</span> {order?.order_date || '-'}</div>
          <div><span className="font-semibold">Müşteri:</span> {partner?.name || '-'}</div>
          <div><span className="font-semibold">Teslim Tarihi:</span> {order?.delivery_date || '-'}</div>
          <div><span className="font-semibold">Proje Adı:</span> {order?.project_name || '-'}</div>
          <div><span className="font-semibold">Para Birimi:</span> TL</div>
        </div>

        {/* Kalem tablosu */}
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="border p-2 text-left">S/N</th>
              <th className="border p-2 text-left">Ürün</th>
              <th className="border p-2 text-right">En (mm)</th>
              <th className="border p-2 text-right">Boy (mm)</th>
              <th className="border p-2 text-right">Adet</th>
              <th className="border p-2 text-right">m²</th>
              <th className="border p-2 text-right">Birim Fiyat</th>
              <th className="border p-2 text-right">Tutar</th>
              <th className="border p-2 text-left">Açıklama</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sn}>
                <td className="border p-2">{r.sn}</td>
                <td className="border p-2">{r.name || '-'}</td>
                <td className="border p-2 text-right">{r.width ?? ''}</td>
                <td className="border p-2 text-right">{r.height ?? ''}</td>
                <td className="border p-2 text-right">{r.quantity}</td>
                <td className="border p-2 text-right">{fmt(r.totalArea)}</td>
                <td className="border p-2 text-right">{fmt(r.unitPrice)}</td>
                <td className="border p-2 text-right">{fmt(r.lineTotal)}</td>
                <td className="border p-2">{r.note || ''}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="border p-2 text-center" colSpan={9}>Kayıt yok</td></tr>
            )}
          </tbody>
        </table>

        {/* Alt özet */}
        <div className="mt-2 text-sm">
          <div><span className="font-semibold">Toplam:</span> {totals.totalQty} Ad — {fmt(totals.totalArea)} m²</div>
          {totals.smallPieces > 0 && (
            <div className="text-gray-700">0,25 m²’den küçük cam adedi: {totals.smallPieces}</div>
          )}
        </div>

        {/* Fiyatlandırma */}
        <div className="mt-4 ml-auto max-w-sm text-sm">
          <div className="flex justify-between"><span>Toplam</span><span>{fmt(totals.subtotal)}</span></div>
          {totals.discountPct > 0 && (
            <div className="flex justify-between"><span>Alt İskonto(%)</span><span>{fmt(totals.discountPct, 0)}%</span></div>
          )}
          <div className="flex justify-between"><span>Ara Toplam</span><span>{fmt(totals.net)}</span></div>
          <div className="flex justify-between"><span>KDV(%20)</span><span>{fmt(totals.vat)}</span></div>
          <div className="flex justify-between font-semibold text-lg"><span>Yekün</span><span>{fmt(totals.grand)}</span></div>
        </div>

        {/* Açıklama & İmza */}
        <div className="mt-8 text-sm">
          <div className="mb-10">
            <div className="font-semibold mb-1">Açıklamalar</div>
            <div className="min-h-[60px] border rounded p-2"></div>
          </div>
          <div className="mt-8 text-right">
            <div className="inline-block text-center">
              <div className="border-t border-gray-400 px-12 pt-1">İmza</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </div>
  );
}
