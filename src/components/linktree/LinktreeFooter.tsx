interface Props {
  site: any;
  footer: any;
}

export default function LinktreeFooter({ site, footer }: Props) {
  return (
    <div className="text-center mt-10 pb-6">
      <p className="text-xs text-gray-600">
        Propulsé par{' '}
        <span className="text-amber-500 font-semibold">
          {site?.siteName || 'Woodiz'}
        </span>
      </p>
    </div>
  );
}
