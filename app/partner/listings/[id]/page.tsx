import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;
  if (!id) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Edit Pengalaman</h1>
      <p className="mt-4 text-gray-500">
        Form edit untuk listing {id} akan aktif setelah database terhubung.
      </p>
    </div>
  );
}
