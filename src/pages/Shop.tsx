import { useEffect, useMemo, useState } from 'react'
import { FlaskConical, Search, SlidersHorizontal, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '@/components/ProductCard'
import {
  categories,
  getStartingPrice,
  researchAreas,
  type Product,
} from '@/data/products'
import { useProducts } from '@/hooks/useProducts'
import { trackEvent } from '@/lib/analytics'

const shopCategories = categories.filter((category) => category.slug !== 'pre-sale')

const sortOptions = [
  { value: 'popular', label: 'Popular & featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name-asc', label: 'Name: A to Z' },
] as const

const priceRanges = [
  { slug: 'under-25', name: 'Under $25', min: 0, max: 25 },
  { slug: '25-49', name: '$25 to $49', min: 25, max: 50 },
  { slug: '50-99', name: '$50 to $99', min: 50, max: 100 },
  { slug: '100-plus', name: '$100+', min: 100, max: Number.POSITIVE_INFINITY },
]

type SortOption = (typeof sortOptions)[number]['value']
type ListFilter = 'category' | 'area' | 'price'

function readListParam(params: URLSearchParams, key: ListFilter) {
  return params.get(key)?.split(',').filter(Boolean) ?? []
}

function getSortOption(value: string | null): SortOption {
  return sortOptions.some((option) => option.value === value)
    ? (value as SortOption)
    : 'popular'
}

function isWithinPriceRange(product: Product, slug: string) {
  const range = priceRanges.find((item) => item.slug === slug)
  if (!range) return false
  const price = getStartingPrice(product)
  return price >= range.min && price < range.max
}

function sortProducts(products: Product[], sort: SortOption) {
  return [...products].sort((a, b) => {
    if (sort === 'price-asc') return getStartingPrice(a) - getStartingPrice(b)
    if (sort === 'price-desc') return getStartingPrice(b) - getStartingPrice(a)
    if (sort === 'name-asc') return a.name.localeCompare(b.name)

    return Number(b.isFeatured) - Number(a.isFeatured)
  })
}

function CheckboxOption({
  checked,
  count,
  label,
  onChange,
}: {
  checked: boolean
  count: number
  label: string
  onChange: () => void
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 py-1.5 text-sm text-ink-700">
      <span className="flex items-start gap-2.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="mt-0.5 h-4 w-4 rounded border-ink-300 accent-ink-900"
        />
        <span>{label}</span>
      </span>
      <span className="text-xs text-ink-400">{count}</span>
    </label>
  )
}

function FilterPanel({
  products,
  selectedCategories,
  selectedAreas,
  selectedPrices,
  sort,
  inStockOnly,
  onToggle,
  onSortChange,
  onStockChange,
  onClear,
}: {
  products: Product[]
  selectedCategories: string[]
  selectedAreas: string[]
  selectedPrices: string[]
  sort: SortOption
  inStockOnly: boolean
  onToggle: (key: ListFilter, value: string) => void
  onSortChange: (value: SortOption) => void
  onStockChange: (checked: boolean) => void
  onClear: () => void
}) {
  const hasFilters =
    selectedCategories.length > 0 ||
    selectedAreas.length > 0 ||
    selectedPrices.length > 0 ||
    inStockOnly

  return (
    <div className="border border-ink-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-ink-900">
          Refine results
        </h2>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-ink-500 transition hover:text-ink-900"
          >
            Clear
          </button>
        )}
      </div>

      <label className="mt-5 block">
        <span className="font-sans text-xs font-bold uppercase tracking-wider text-ink-500">
          Sort by
        </span>
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as SortOption)}
          className="mt-2 w-full border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-800 outline-none transition focus:border-ink-500"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="mt-6 border-t border-ink-100 pt-5">
        <legend className="font-sans text-xs font-bold uppercase tracking-wider text-ink-500">
          Category
        </legend>
        <div className="mt-2">
          {shopCategories.map((category) => (
            <CheckboxOption
              key={category.slug}
              label={category.name}
              count={products.filter((product) => product.categorySlug === category.slug).length}
              checked={selectedCategories.includes(category.slug)}
              onChange={() => onToggle('category', category.slug)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6 border-t border-ink-100 pt-5">
        <legend className="font-sans text-xs font-bold uppercase tracking-wider text-ink-500">
          Research area
        </legend>
        <div className="mt-2">
          {researchAreas.map((area) => (
            <CheckboxOption
              key={area.slug}
              label={area.name}
              count={
                products.filter((product) => product.researchAreas?.includes(area.slug)).length
              }
              checked={selectedAreas.includes(area.slug)}
              onChange={() => onToggle('area', area.slug)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6 border-t border-ink-100 pt-5">
        <legend className="font-sans text-xs font-bold uppercase tracking-wider text-ink-500">
          Starting price
        </legend>
        <div className="mt-2">
          {priceRanges.map((range) => (
            <CheckboxOption
              key={range.slug}
              label={range.name}
              count={products.filter((product) => isWithinPriceRange(product, range.slug)).length}
              checked={selectedPrices.includes(range.slug)}
              onChange={() => onToggle('price', range.slug)}
            />
          ))}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-400">
          Price filters use the lowest listed vial option.
        </p>
      </fieldset>

      <fieldset className="mt-6 border-t border-ink-100 pt-5">
        <legend className="font-sans text-xs font-bold uppercase tracking-wider text-ink-500">
          Availability
        </legend>
        <div className="mt-2">
          <CheckboxOption
            label="In stock only"
            count={products.filter((product) => product.inStock).length}
            checked={inStockOnly}
            onChange={() => onStockChange(!inStockOnly)}
          />
        </div>
      </fieldset>
    </div>
  )
}

export function Shop() {
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { products, loading } = useProducts()
  const query = params.get('q') ?? ''
  const sort = getSortOption(params.get('sort'))
  const selectedCategories = readListParam(params, 'category')
  const selectedAreas = readListParam(params, 'area')
  const selectedPrices = readListParam(params, 'price')
  const inStockOnly = params.get('stock') === '1'

  function setParam(key: string, value?: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  function toggleListParam(key: ListFilter, value: string) {
    const current = readListParam(params, key)
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
    setParam(key, next.join(','))
  }

  function clearFilters() {
    const next = new URLSearchParams(params)
    for (const key of ['category', 'area', 'price', 'stock']) next.delete(key)
    setParams(next, { replace: true })
  }

  function clearAll() {
    const next = new URLSearchParams(params)
    for (const key of ['q', 'category', 'area', 'price', 'stock']) next.delete(key)
    setParams(next, { replace: true })
  }

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = products.filter((product) => {
      const categoryName =
        typeof product.category === 'string' ? product.category : product.category?.name ?? ''
      const searchableText = [
        product.name,
        product.description,
        categoryName,
        ...(product.researchAreas ?? []),
        ...(product.variants?.map((variant) => variant.dose) ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      if (normalizedQuery && !searchableText.includes(normalizedQuery)) return false
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(product.categorySlug ?? '')
      ) {
        return false
      }
      if (
        selectedAreas.length > 0 &&
        !selectedAreas.some((area) => product.researchAreas?.includes(area))
      ) {
        return false
      }
      if (
        selectedPrices.length > 0 &&
        !selectedPrices.some((range) => isWithinPriceRange(product, range))
      ) {
        return false
      }
      if (inStockOnly && !product.inStock) return false
      return true
    })

    return sortProducts(filtered, sort)
  }, [
    inStockOnly,
    products,
    query,
    selectedAreas,
    selectedCategories,
    selectedPrices,
    sort,
  ])

  const activeFilterCount =
    selectedCategories.length + selectedAreas.length + selectedPrices.length + Number(inStockOnly)
  const filterSignature = [
    selectedCategories.join(','),
    selectedAreas.join(','),
    selectedPrices.join(','),
    String(inStockOnly),
  ].join('|')

  useEffect(() => {
    const normalizedQuery = query.trim()
    if (normalizedQuery.length < 2) return
    const timeout = window.setTimeout(() => {
      trackEvent('shop_search', {
        query: normalizedQuery,
        metadata: { resultCount: filteredProducts.length },
      })
    }, 600)
    return () => window.clearTimeout(timeout)
  }, [filteredProducts.length, query])

  useEffect(() => {
    if (activeFilterCount === 0) return
    trackEvent('shop_filter', {
      metadata: {
        categories: selectedCategories.join(','),
        researchAreas: selectedAreas.join(','),
        prices: selectedPrices.join(','),
        inStockOnly,
        resultCount: filteredProducts.length,
      },
    })
  }, [
    activeFilterCount,
    filteredProducts.length,
    filterSignature,
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-accent-dark">
            Research catalog
          </p>
          <h1 className="mt-2 font-sans text-3xl font-bold text-ink-900 md:text-4xl">Shop</h1>
        </div>
        <p className="text-sm text-ink-500">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setParam('q', event.target.value)}
            placeholder="Search by product, code, or vial size"
            className="w-full border border-ink-200 bg-white py-3.5 pl-12 pr-4 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-ink-500"
          />
        </label>
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          className="flex items-center gap-2 border border-ink-900 bg-ink-900 px-4 py-3.5 font-sans text-sm font-semibold text-white lg:hidden"
        >
          {filtersOpen ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center bg-white px-1 text-[11px] text-ink-900">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="mt-5 flex gap-3 border-l-4 border-accent bg-ink-50 px-4 py-3 text-sm leading-relaxed text-ink-600">
        <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-accent-dark" />
        <p>
          Research classifications organize the catalog for qualified research use only. They do
          not describe intended human use, treatment outcomes, or dosing guidance.
        </p>
      </div>

      {filtersOpen && (
        <div className="mt-6 lg:hidden">
          <FilterPanel
            products={products}
            selectedCategories={selectedCategories}
            selectedAreas={selectedAreas}
            selectedPrices={selectedPrices}
            sort={sort}
            inStockOnly={inStockOnly}
            onToggle={toggleListParam}
            onSortChange={(value) => setParam('sort', value === 'popular' ? undefined : value)}
            onStockChange={(checked) => setParam('stock', checked ? '1' : undefined)}
            onClear={clearFilters}
          />
        </div>
      )}

      <div className="mt-10 flex items-start gap-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-44">
            <FilterPanel
              products={products}
              selectedCategories={selectedCategories}
              selectedAreas={selectedAreas}
              selectedPrices={selectedPrices}
              sort={sort}
              inStockOnly={inStockOnly}
              onToggle={toggleListParam}
              onSortChange={(value) => setParam('sort', value === 'popular' ? undefined : value)}
              onStockChange={(checked) => setParam('stock', checked ? '1' : undefined)}
              onClear={clearFilters}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {loading ? (
            <p className="py-12 text-center text-ink-500">Loading...</p>
          ) : filteredProducts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  badge={!product.inStock ? undefined : product.isFeatured ? 'NEW' : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="border border-ink-200 bg-ink-50 px-6 py-14 text-center">
              <h2 className="font-sans text-xl font-bold text-ink-900">No matching products</h2>
              <p className="mt-2 text-sm text-ink-500">
                Adjust the search or clear the current filters to see the full catalog.
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-5 border-2 border-ink-900 bg-ink-900 px-5 py-3 font-sans text-sm font-semibold text-white transition hover:bg-ink-800"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
