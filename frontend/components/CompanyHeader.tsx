import { branding } from '../lib/branding';

export default function CompanyHeader() {
  const normalize = (u?: string) => {
    if (!u) return '';
    if (u.startsWith('http') || u.startsWith('/')) return u;
    return `/${u}`;
  };
  const logoSrc = normalize(branding.logoUrl);
  return (
    <div className="mb-2">
      <div className="flex items-center justify-center gap-3">
        {logoSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoSrc} alt={branding.companyName} className="h-10" />
        )}
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 leading-tight">{branding.companyName}</div>
          {branding.companyAddress && (
            <div className="text-xs text-gray-600">{branding.companyAddress}</div>
          )}
          {(branding.companyPhone || branding.companyEmail || branding.companyWebsite || branding.companyTaxNumber) && (
            <div className="text-xs text-gray-600">
              {branding.companyPhone && <span>Tel: {branding.companyPhone}</span>}
              {branding.companyEmail && <span>{' '}· E-Posta: {branding.companyEmail}</span>}
              {branding.companyWebsite && <span>{' '}· Web: {branding.companyWebsite}</span>}
              {branding.companyTaxNumber && <span>{' '}· Vergi No: {branding.companyTaxNumber}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
