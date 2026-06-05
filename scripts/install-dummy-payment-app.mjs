#!/usr/bin/env node
/**
 * Installs the local dummy payment app into Saleor via GraphQL appInstall.
 * Idempotent — skips if Dummy Payment App is already active.
 */
import "dotenv/config";
import { setTimeout as sleep } from "node:timers/promises";

const APP_NAME = "Dummy Payment App";

const apiUrl = process.env.SALEOR_API_URL ?? "http://localhost:8000/graphql/";
const adminEmail = process.env.SALEOR_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword = process.env.SALEOR_ADMIN_PASSWORD ?? "admin";
const defaultChannel = process.env.NEXT_PUBLIC_DEFAULT_CHANNEL ?? "default-channel";

const port = process.env.DUMMY_PAYMENT_APP_PORT ?? "3001";
const manifestHost =
  process.env.DUMMY_PAYMENT_APP_MANIFEST_HOST ?? "host.docker.internal";
const manifestUrl = `http://${manifestHost}:${port}/api/manifest`;

async function gql(query, variables, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL HTTP ${response.status}: ${await response.text()}`);
  }

  const body = await response.json();
  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join("; "));
  }
  if (!body.data) {
    throw new Error("GraphQL response missing data");
  }
  return body.data;
}

async function waitForManifest() {
  const healthUrl = `http://localhost:${port}/api/manifest`;
  for (let attempt = 1; attempt <= 30; attempt++) {
    try {
      const res = await fetch(healthUrl);
      if (res.ok) {
        console.log(`Dummy payment app manifest reachable at ${healthUrl}`);
        return;
      }
    } catch {
      // retry
    }
    console.log(`Waiting for dummy payment app manifest... (${attempt}/30)`);
    await sleep(2000);
  }
  throw new Error(`Dummy payment app not reachable at ${healthUrl}`);
}

async function ensureChannelChargeStrategy(token) {
  const channelsData = await gql(
    `query Channels {
      channels {
        id
        slug
        paymentSettings { defaultTransactionFlowStrategy }
      }
    }`,
    undefined,
    token,
  );

  const channel = channelsData.channels.find((c) => c.slug === defaultChannel);
  if (!channel) {
    console.warn(`Channel "${defaultChannel}" not found — skipping payment settings update`);
    return;
  }

  if (channel.paymentSettings.defaultTransactionFlowStrategy === "CHARGE") {
    console.log(`Channel "${defaultChannel}" already uses CHARGE transaction flow`);
    return;
  }

  const updateData = await gql(
    `mutation ChannelUpdate($id: ID!) {
      channelUpdate(id: $id, input: {
        paymentSettings: { defaultTransactionFlowStrategy: CHARGE }
      }) {
        channel {
          slug
          paymentSettings { defaultTransactionFlowStrategy }
        }
        errors { message }
      }
    }`,
    { id: channel.id },
    token,
  );

  if (updateData.channelUpdate.errors.length) {
    console.warn(
      `Could not set CHARGE strategy on ${defaultChannel}: ${updateData.channelUpdate.errors.map((e) => e.message).join("; ")}`,
    );
    return;
  }

  console.log(`Set ${defaultChannel} defaultTransactionFlowStrategy to CHARGE`);
}

const LEGACY_DUMMY_PLUGIN_ID = "mirumee.payments.dummy";

async function disableLegacyDummyPlugin(token) {
  const channelsData = await gql(
    `query Channels {
      channels {
        id
        slug
      }
    }`,
    undefined,
    token,
  );

  const channel = channelsData.channels.find((c) => c.slug === defaultChannel);
  if (!channel) {
    console.warn(`Channel "${defaultChannel}" not found — skipping legacy dummy plugin disable`);
    return;
  }

  const pluginData = await gql(
    `query Plugin($id: ID!) {
      plugin(id: $id) {
        id
        channelConfigurations {
          channel { slug }
          active
        }
      }
    }`,
    { id: LEGACY_DUMMY_PLUGIN_ID },
    token,
  );

  const plugin = pluginData.plugin;
  if (!plugin) {
    return;
  }

  const channelConfig = plugin.channelConfigurations.find(
    (config) => config.channel.slug === defaultChannel,
  );
  if (!channelConfig?.active) {
    console.log(`Legacy dummy plugin already disabled on "${defaultChannel}"`);
    return;
  }

  const updateData = await gql(
    `mutation PluginUpdate($channelId: ID!, $id: ID!, $input: PluginUpdateInput!) {
      pluginUpdate(channelId: $channelId, id: $id, input: $input) {
        plugin {
          channelConfigurations {
            channel { slug }
            active
          }
        }
        errors { message }
      }
    }`,
    {
      channelId: channel.id,
      id: LEGACY_DUMMY_PLUGIN_ID,
      input: { active: false },
    },
    token,
  );

  if (updateData.pluginUpdate.errors.length) {
    console.warn(
      `Could not disable legacy dummy plugin on ${defaultChannel}: ${updateData.pluginUpdate.errors.map((e) => e.message).join("; ")}`,
    );
    return;
  }

  console.log(`Disabled legacy "${LEGACY_DUMMY_PLUGIN_ID}" plugin on "${defaultChannel}"`);
}

async function main() {
  await waitForManifest();

  const tokenData = await gql(
    `mutation TokenCreate($email: String!, $password: String!) {
      tokenCreate(email: $email, password: $password) {
        token
        errors { message }
      }
    }`,
    { email: adminEmail, password: adminPassword },
  );

  const token = tokenData.tokenCreate.token;
  if (!token) {
    const msg = tokenData.tokenCreate.errors.map((e) => e.message).join("; ");
    throw new Error(`Admin login failed: ${msg || "no token"}`);
  }

  const appsData = await gql(
    `query Apps {
      apps(first: 20, filter: { search: "Dummy Payment" }) {
        edges { node { id name isActive } }
      }
    }`,
    undefined,
    token,
  );

  const existing = appsData.apps.edges.find(
    (e) => e.node.name === APP_NAME && e.node.isActive,
  );
  if (existing) {
    console.log(`Dummy payment app already installed and active (${existing.node.id})`);
    await ensureChannelChargeStrategy(token);
    await disableLegacyDummyPlugin(token);
    return;
  }

  const installationsData = await gql(
    `query AppsInstallations {
      appsInstallations { id status appName }
    }`,
    undefined,
    token,
  );

  const failed = installationsData.appsInstallations.filter(
    (i) => i.appName === APP_NAME && i.status === "FAILED",
  );
  for (const installation of failed) {
    console.log(`Removing failed installation ${installation.id} ...`);
    await gql(
      `mutation AppDeleteFailedInstallation($id: ID!) {
        appDeleteFailedInstallation(id: $id) {
          appInstallation { id status }
          errors { message }
        }
      }`,
      { id: installation.id },
      token,
    );
  }

  console.log(`Installing dummy payment app from ${manifestUrl} ...`);

  const installData = await gql(
    `mutation AppInstall($input: AppInstallInput!) {
      appInstall(input: $input) {
        appInstallation { id status message }
        errors { field message code }
      }
    }`,
    {
      input: {
        appName: APP_NAME,
        manifestUrl,
        permissions: ["MANAGE_CHECKOUTS", "HANDLE_PAYMENTS", "MANAGE_ORDERS"],
        activateAfterInstallation: true,
      },
    },
    token,
  );

  if (installData.appInstall.errors?.length) {
    throw new Error(
      installData.appInstall.errors
        .map((e) => `${e.field ?? "?"}: ${e.message}`)
        .join("; "),
    );
  }

  const installationId = installData.appInstall.appInstallation?.id;
  if (!installationId) {
    throw new Error("appInstall returned no appInstallation id");
  }

  for (let attempt = 1; attempt <= 60; attempt++) {
    const statusData = await gql(
      `query AppsInstallations {
        appsInstallations {
          id
          status
          message
          appName
        }
      }`,
      undefined,
      token,
    );

    const installation = statusData.appsInstallations.find((i) => i.id === installationId);
    const status = installation?.status;
    const message = installation?.message;
    console.log(`App installation status: ${status ?? "unknown"}${message ? ` — ${message}` : ""}`);

    if (status === "SUCCESS") {
      console.log("Dummy payment app installed successfully");
      await ensureChannelChargeStrategy(token);
      await disableLegacyDummyPlugin(token);
      return;
    }
    if (status === "FAILED") {
      throw new Error(`App installation failed: ${message ?? "unknown error"}`);
    }

    // Installation completed and removed from appsInstallations — verify app is active
    if (!installation) {
      const appsCheck = await gql(
        `query Apps {
          apps(first: 20, filter: { search: "Dummy Payment" }) {
            edges { node { id name isActive } }
          }
        }`,
        undefined,
        token,
      );
      const installed = appsCheck.apps.edges.find(
        (e) => e.node.name === APP_NAME && e.node.isActive,
      );
      if (installed) {
        console.log(`Dummy payment app installed successfully (${installed.node.id})`);
        await ensureChannelChargeStrategy(token);
        await disableLegacyDummyPlugin(token);
        return;
      }
    }

    await sleep(2000);
  }

  throw new Error("App installation timed out");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
