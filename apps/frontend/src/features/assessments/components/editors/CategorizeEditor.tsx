import { Plus, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Item {
  id: string;
  label: string;
  correctCategoryId: string;
}

interface Props {
  categories: Category[];
  items: Item[];
  onChange: (data: { categories: Category[]; items: Item[] }) => void;
}

function generateCategoryId(): string {
  return `c${Math.random().toString(36).slice(2, 8)}`;
}

function generateItemId(): string {
  return `i${Math.random().toString(36).slice(2, 8)}`;
}

export function CategorizeEditor({ categories, items, onChange }: Props) {
  function addCategory(): void {
    onChange({
      categories: [
        ...categories,
        { id: generateCategoryId(), name: '' },
      ],
      items,
    });
  }

  function removeCategory(index: number): void {
    const removed = categories[index];
    onChange({
      categories: categories.filter((_, i) => i !== index),
      items: items.filter((item) => item.correctCategoryId !== removed.id),
    });
  }

  function updateCategory(index: number, name: string): void {
    onChange({
      categories: categories.map((c, i) => (i === index ? { ...c, name } : c)),
      items,
    });
  }

  function addItem(): void {
    if (categories.length === 0) return;
    onChange({
      categories,
      items: [
        ...items,
        {
          id: generateItemId(),
          label: '',
          correctCategoryId: categories[0].id,
        },
      ],
    });
  }

  function removeItem(index: number): void {
    onChange({
      categories,
      items: items.filter((_, i) => i !== index),
    });
  }

  function updateItem(index: number, patch: Partial<Item>): void {
    onChange({
      categories,
      items: items.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    });
  }

  return (
    <div className="space-y-5">
      {/* Categorías */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Categorías
          </label>
          <button
            type="button"
            onClick={addCategory}
            className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar categoría
          </button>
        </div>

        {categories.length < 2 ? (
          <p className="text-xs text-gray-500 italic text-center py-3 bg-gray-50 rounded-lg">
            Necesitas al menos 2 categorías
          </p>
        ) : (
          <div className="space-y-2">
            {categories.map((cat, i) => (
              <div key={cat.id} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                <input
                  type="text"
                  required
                  value={cat.name}
                  onChange={(e) => updateCategory(i, e.target.value)}
                  placeholder={`Categoría ${i + 1}`}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={() => removeCategory(i)}
                  className="p-1.5 text-gray-400 hover:text-red-600"
                  title="Eliminar categoría"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Elementos a clasificar
          </label>
          <button
            type="button"
            onClick={addItem}
            disabled={categories.length < 2}
            className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar elemento
          </button>
        </div>

        {categories.length < 2 ? (
          <p className="text-xs text-gray-500 italic text-center py-3 bg-gray-50 rounded-lg">
            Primero agrega al menos 2 categorías
          </p>
        ) : items.length < 2 ? (
          <p className="text-xs text-gray-500 italic text-center py-3 bg-gray-50 rounded-lg">
            Necesitas al menos 2 elementos
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-white"
              >
                <input
                  type="text"
                  required
                  value={item.label}
                  onChange={(e) => updateItem(i, { label: e.target.value })}
                  placeholder={`Elemento ${i + 1}`}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <select
                  value={item.correctCategoryId}
                  onChange={(e) =>
                    updateItem(i, { correctCategoryId: e.target.value })
                  }
                  className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name || '(sin nombre)'}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="p-1.5 text-gray-400 hover:text-red-600"
                  title="Eliminar elemento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}