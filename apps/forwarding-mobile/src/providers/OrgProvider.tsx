import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState
} from "react";
import { useAuthContext } from "@receipt-radar/mobile/providers/AuthProvider";
import {
  bootstrapOrganization,
  type OrganizationRecord
} from "../api/forwardingClient";

interface OrgContextValue {
  organization: OrganizationRecord | null;
  role: string | null;
  isBootstrapping: boolean;
  error: string | null;
  retry: () => void;
}

const OrgContext = createContext<OrgContextValue | null>(null);

/**
 * Calls POST /forwarding/organizations/bootstrap on first authenticated
 * mount. Idempotent server-side — returns the user's existing workspace
 * if they already have one, creates `{displayName}'s Workspace` otherwise.
 *
 * Must be mounted INSIDE AuthProvider so we have a token to send.
 */
export const OrgProvider = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, token } = useAuthContext();
  const [organization, setOrganization] = useState<OrganizationRecord | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setOrganization(null);
      setRole(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsBootstrapping(true);
    setError(null);

    bootstrapOrganization()
      .then((response) => {
        if (cancelled) return;
        setOrganization(response.organization);
        setRole(response.role);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (cancelled) return;
        setIsBootstrapping(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token, attempt]);

  const retry = () => setAttempt((n) => n + 1);

  return (
    <OrgContext.Provider
      value={{ organization, role, isBootstrapping, error, retry }}
    >
      {children}
    </OrgContext.Provider>
  );
};

export const useOrgContext = () => {
  const ctx = useContext(OrgContext);
  if (!ctx) {
    throw new Error("useOrgContext must be used within an OrgProvider");
  }
  return ctx;
};
