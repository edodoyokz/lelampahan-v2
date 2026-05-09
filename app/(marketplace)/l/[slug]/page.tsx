import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lelampahan-brick">
        Lelampahan / Listing
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-lelampahan-earth">
        {slug.replace(/-/g, ' ')}
      </h1>
      <p className="mt-6 text-amber-950/70">Detail listing akan dimuat dari database.</p>
    </section>
  );
}
