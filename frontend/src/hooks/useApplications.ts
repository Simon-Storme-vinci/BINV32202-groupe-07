import { useCallback, useEffect, useState } from "react";
import type { Application } from "../models/application.ts";
import {
  createApplication,
  getApplications,
  withdrawApplication,
} from "../services/applications.service.ts";
import { isUnauthorized } from "../utils/api.ts";

export const useApplications = (token: string, onUnauthorized: () => void) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setApplications(await getApplications(token));
    } catch (reason: unknown) {
      if (isUnauthorized(reason)) onUnauthorized();
      else setError(reason instanceof Error ? reason.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, [token, onUnauthorized]);

  useEffect(() => {
    const controller = new AbortController();
    getApplications(token, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setApplications(data);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        if (isUnauthorized(reason)) onUnauthorized();
        else setError(reason instanceof Error ? reason.message : "Erreur inconnue");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [token, onUnauthorized]);

  const apply = async (offerId: number, message: string) => {
    try {
      await createApplication(token, offerId, message);
      await reload();
    } catch (reason: unknown) {
      if (isUnauthorized(reason)) onUnauthorized();
      else throw reason;
    }
  };

  const withdraw = async (id: number) => {
    try {
      await withdrawApplication(token, id);
      await reload();
    } catch (reason: unknown) {
      if (isUnauthorized(reason)) onUnauthorized();
      else throw reason;
    }
  };

  return { applications, isLoading, error, apply, withdraw, reload };
};
