interface Props {
  params: Promise<{ id: string }>;
}

export default async function SessionsPage({ params }: Props) {
  const { id } = await params;
  return (
    <div>
      <h1 className="text-2xl font-bold text-lelampahan-earth">Sesi &amp; Tiket</h1>
      <p className="mt-4 text-gray-500">Kelola sesi dan tipe tiket untuk listing {id}.</p>
    </div>
  );
}
