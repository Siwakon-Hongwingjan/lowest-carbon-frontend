import liff from "@line/liff";

export type LineUser = {
  displayName: string;
  pictureUrl?: string;
  userId: string;
};

let initialized = false;
let initializing: Promise<void> | null = null;

export async function initLiff() {
  if (typeof window === "undefined") {
    throw new Error("LIFF must be initialized in the browser");
  }

  if (!initialized) {
    initializing =
      initializing ||
      liff
        .init({
          liffId: process.env.NEXT_PUBLIC_LIFF_ID!,
        })
        .then(() => {
          initialized = true;
          initializing = null;
        });

    if (initializing) {
      await initializing;
    }
  }

  return liff;
}

export async function ensureLineLogin(): Promise<LineUser> {
  const client = await initLiff();
  await client.ready;

  if (!client.isLoggedIn()) {
    client.login();
    throw new Error("Redirecting to LINE login");
  }

  const profile = await client.getProfile();

  return {
    displayName: profile.displayName,
    pictureUrl: profile.pictureUrl ?? undefined,
    userId: profile.userId,
  };
}
