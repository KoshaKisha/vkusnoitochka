export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center h-screen text-center">
      <div>
        <h1 className="text-3xl font-bold mb-4">Доступ запрещён</h1>
        <p className="text-gray-600">У вас нет прав доступа к этой странице.</p>
      </div>
    </div>
  )
}
