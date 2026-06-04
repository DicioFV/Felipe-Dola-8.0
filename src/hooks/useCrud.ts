// ============================================
// DOLA AI — Executive Assistant
// Arquivo: src/hooks/useCrud.ts
// Fase: 1
// ============================================

import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/src/components/ui/Toast";

interface UseCrudOptions {
  onSuccess?: (action: "create" | "update" | "delete" | "list", data?: any) => void;
  onError?: (error: any) => void;
  lazy?: boolean;
}

export function useCrud<T = any>(endpoint: string, options: UseCrudOptions = {}) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("dola_token");
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch(endpoint, { headers });
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: Código ${response.status}`);
      }
      const json = await response.json();
      setData(json);
      if (options.onSuccess) options.onSuccess("list", json);
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || "Ocorreu um erro ao carregar os dados.";
      setError(errMsg);
      if (options.onError) options.onError(err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, options]);

  const create = useCallback(async (item: Partial<T>) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("dola_token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.message || "Erro ao criar novo item.");
      }

      const created = await response.json();
      setData((prev) => [created, ...prev]);
      toast("Item inserido com sucesso!", "success");
      if (options.onSuccess) options.onSuccess("create", created);
      return created;
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || "Erro ao adicionar item.";
      toast(errMsg, "error");
      if (options.onError) options.onError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, options, toast]);

  const update = useCallback(async (id: string, item: Partial<T>) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("dola_token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch(`${endpoint}/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.message || "Erro ao atualizar item.");
      }

      const updated = await response.json();
      setData((prev) => prev.map((x: any) => (x.id === id ? updated : x)));
      toast("Alterações salvas com sucesso!", "success");
      if (options.onSuccess) options.onSuccess("update", updated);
      return updated;
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || "Erro ao atualizar item.";
      toast(errMsg, "error");
      if (options.onError) options.onError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, options, toast]);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("dola_token");
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch(`${endpoint}/${id}`, {
        method: "DELETE",
        headers
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.message || "Erro ao apagar item.");
      }

      setData((prev) => prev.filter((x: any) => x.id !== id));
      toast("Item removido com sucesso!", "success");
      if (options.onSuccess) options.onSuccess("delete", id);
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || "Erro ao remover item.";
      toast(errMsg, "error");
      if (options.onError) options.onError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, options, toast]);

  useEffect(() => {
    if (!options.lazy) {
      fetchAll();
    }
  }, []);

  return {
    data,
    loading,
    error,
    refresh: fetchAll,
    create,
    update,
    remove,
    setData
  };
}
