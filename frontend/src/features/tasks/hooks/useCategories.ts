/**
 * useCategories Hook
 * Fetch and manage categories
 */
'use client'
import { useEffect, useState, useCallback } from 'react'
import { categoryService } from '../services/categoryService'
import type { Category, CategoryCreate, CategoryUpdate } from '../types/category.types'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await categoryService.getCategories()
      
      if (response) {
        setCategories(response.categories)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  const createCategory = async (data: CategoryCreate) => {
    try {
      const result = await categoryService.createCategory(data)
      if (result) {
        setCategories(prev => [...prev, result])
      }
      return result
    } catch (err) {
      throw err
    }
  }

  const updateCategory = async (id: string, data: CategoryUpdate) => {
    try {
      const result = await categoryService.updateCategory(id, data)
      if (result) {
        setCategories(prev => prev.map(cat => cat.id === id ? result : cat))
      }
      return result
    } catch (err) {
      throw err
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      await categoryService.deleteCategory(id)
      setCategories(prev => prev.filter(cat => cat.id !== id))
      return true
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}

