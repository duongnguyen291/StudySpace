'use client'

let container: HTMLDivElement | null = null

const ensureContainer = () => {
  if (!container) {
    container = document.createElement('div')
    container.className = 'fixed top-4 right-4 z-[9999] space-y-2'
    document.body.appendChild(container)
  }
  return container
}

export const showToast = (message: string, link?: string) => {
  const root = ensureContainer()
  const el = document.createElement('div')
  el.className =
    'bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow border border-gray-700 flex items-center gap-3 animate-fade-in cursor-pointer'

  const textSpan = document.createElement('span')
  textSpan.textContent = message
  el.appendChild(textSpan)

  if (link) {
    const anchor = document.createElement('a')
    anchor.href = link
    anchor.textContent = 'View in Notes'
    anchor.className = 'text-blue-400 underline text-xs'
    el.appendChild(anchor)
  }

  root.appendChild(el)

  const remove = () => {
    if (root.contains(el)) {
      root.removeChild(el)
    }
  }

  const timeout = window.setTimeout(remove, 3500)

  el.addEventListener('click', () => {
    window.clearTimeout(timeout)
    remove()
  })
}
