import { NewTicketModal } from "@/components/ticketCreation/NewTicketModal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider as JotaiProvider, createStore } from "jotai";
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { isNewTicketModalOpenAtom } from "@/store/ticketCreation/atoms";
import { setupTestUser } from "../../../tests/helpers/auth";
import { listActors } from "@/lib/api/actors";
import { queryKeys } from "@/lib/queryKeys";

loadEnv({ path: resolve(process.cwd(), ".env") });

const originalMatchMedia = window.matchMedia;

const setMatchMedia = (matches: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

const selectOption = async (testId: string, optionLabel: string, user: ReturnType<typeof userEvent.setup>) => {
  const trigger = screen.getByTestId(testId);
  await user.click(trigger);
  await user.keyboard("{ArrowDown}");
  const option = await screen.findByRole("option", { name: optionLabel });
  await user.click(option);
};

const createWrapper = (queryClient: QueryClient, store: ReturnType<typeof createStore>) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider store={store}>{children}</JotaiProvider>
    </QueryClientProvider>
  );
};

async function loadSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing Supabase env vars for NewTicketModal tests");
  }

  vi.resetModules();
  vi.stubEnv("VITE_SUPABASE_URL", supabaseUrl);
  vi.stubEnv("VITE_SUPABASE_ANON_KEY", anonKey);

  const { supabase } = await import("../../lib/supabase");
  return supabase;
}

describe("NewTicketModal", () => {
  beforeAll(async () => {
    await setupTestUser();

    const demoEmail = process.env.VITE_DEMO_USER_EMAIL;
    const demoPassword = process.env.VITE_DEMO_USER_PASSWORD;
    const supabaseUrl = process.env.VITE_SUPABASE_URL;

    if (!demoEmail || !demoPassword || !supabaseUrl) {
      throw new Error("Missing demo credentials for NewTicketModal tests");
    }

    const seedResponse = await fetch(`${supabaseUrl}/functions/v1/reset_db_4214476`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        demo_email: demoEmail,
        demo_password: demoPassword,
      }),
    });

    if (!seedResponse.ok) {
      throw new Error("Failed to seed demo data for NewTicketModal tests");
    }
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    setMatchMedia(true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  afterAll(async () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) return;

    vi.resetModules();
    vi.stubEnv("VITE_SUPABASE_URL", supabaseUrl);
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", anonKey);

    const { supabase } = await import("../../lib/supabase");
    await supabase.auth.signOut();
    vi.unstubAllEnvs();
    window.matchMedia = originalMatchMedia;
  });

  it(
    "shows a success toast when ticket creation succeeds",
    async () => {
      const supabase = await loadSupabaseClient();
      const email = process.env.VITE_DEMO_USER_EMAIL;
      const password = process.env.VITE_DEMO_USER_PASSWORD;

      if (!email || !password) {
        throw new Error("Missing demo credentials for NewTicketModal tests");
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }

      const actors = await listActors();
      const fromActor = actors.customers[0];

      if (!fromActor) {
        throw new Error("No customer actors available for ticket creation test");
      }

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: Infinity,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
          },
        },
      });
      queryClient.setQueryData(queryKeys.actorsList, actors);
      const store = createStore();
      store.set(isNewTicketModalOpenAtom, true);

      const successSpy = vi.spyOn(toast, "success");
      const user = userEvent.setup();

      render(<NewTicketModal />, { wrapper: createWrapper(queryClient, store) });

      await user.type(screen.getByTestId("new-ticket-subject"), "Demo ticket");
      await user.type(screen.getByTestId("new-ticket-body"), "Customer reported an issue.");

      await selectOption("new-ticket-from-actor", fromActor.name, user);

      await user.click(screen.getByTestId("new-ticket-submit"));

      await waitFor(() => {
        expect(successSpy).toHaveBeenCalledWith("Ticket created");
      });
    },
    20000
  );

  it("shows an error toast when ticket creation fails", async () => {
    const supabase = await loadSupabaseClient();
    const email = process.env.VITE_DEMO_USER_EMAIL;
    const password = process.env.VITE_DEMO_USER_PASSWORD;

    if (!email || !password) {
      throw new Error("Missing demo credentials for NewTicketModal tests");
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }

    const actors = await listActors();
    const fromActor = actors.customers[0];

    await supabase.auth.signOut();

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: Infinity,
          refetchOnMount: false,
          refetchOnWindowFocus: false,
        },
        mutations: {
          retry: false,
        },
      },
    });
    queryClient.setQueryData(queryKeys.actorsList, actors);
    const store = createStore();
    store.set(isNewTicketModalOpenAtom, true);

    const errorSpy = vi.spyOn(toast, "error");
    const user = userEvent.setup();

    render(<NewTicketModal />, { wrapper: createWrapper(queryClient, store) });

    await user.type(screen.getByTestId("new-ticket-subject"), "Demo ticket");
    await user.type(screen.getByTestId("new-ticket-body"), "Customer reported an issue.");

    if (!fromActor) {
      throw new Error("No customer actors available for ticket creation test");
    }

    await selectOption("new-ticket-from-actor", fromActor.name, user);

    await user.click(screen.getByTestId("new-ticket-submit"));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
