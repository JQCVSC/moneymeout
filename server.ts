import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import { initializeApp as initializeClientApp } from "firebase/app";
import { 
  getFirestore as getClientFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  collectionGroup,
  query,
  where,
  getDocs,
  runTransaction as runClientTransaction, 
  serverTimestamp 
} from "firebase/firestore";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import nodemailer from "nodemailer";

dotenv.config();

const serverDir = typeof __dirname !== "undefined"
  ? __dirname
  : (typeof import.meta !== "undefined" && import.meta.url ? path.dirname(fileURLToPath(import.meta.url)) : process.cwd());

// Initialize Firebase
let firebaseConfig: any = {
  projectId: "cash-me-out-2",
  appId: "1:530455535352:web:4782ecb1a513387f09650d",
  apiKey: "AIzaSyCc1L_AvROnBSaoNOKfTW6vHIvkYr4shzY",
  authDomain: "cash-me-out-2.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-93f90599-d040-4295-962e-47c693a246a3",
  storageBucket: "cash-me-out-2.firebasestorage.app",
  messagingSenderId: "530455535352",
};

try {
  const firebaseConfigPath = fs.existsSync(path.join(serverDir, "firebase-applet-config.json")) 
    ? path.join(serverDir, "firebase-applet-config.json") 
    : path.join(process.cwd(), "firebase-applet-config.json");
  
  if (fs.existsSync(firebaseConfigPath)) {
    const fileContent = fs.readFileSync(firebaseConfigPath, "utf8");
    firebaseConfig = { ...firebaseConfig, ...JSON.parse(fileContent) };
  }
} catch (err) {
  console.warn("Could not load firebase-applet-config.json, using default config:", err);
}

const firebaseApp = initializeClientApp(firebaseConfig);
const db = getClientFirestore(firebaseApp);

// Initialize Stripe lazily to prevent server crashing on container startup
let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is missing on the server.");
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

async function updateCreatorBalanceAndNotify(
  creatorId: string,
  amount: number,
  message: string,
  fanName: string,
  fanId: string | null,
  paymentIntentId: string,
  metadata: any
) {
  try {
    const creatorRef = doc(db, "creators", creatorId);
    const donationRef = doc(db, "creators", creatorId, "donations", paymentIntentId);
    const notificationRef = doc(collection(db, "creators", creatorId, "notifications"));

    // Effective fan ID resolution (either passed directly or retrieved from metadata)
    const effectiveFanId = (fanId && typeof fanId === "string" && fanId.trim() !== "") 
      ? fanId.trim() 
      : (metadata?.fanId && typeof metadata.fanId === "string" && metadata.fanId.trim() !== "") 
        ? metadata.fanId.trim() 
        : null;

    let alreadyProcessed = false;

    await runClientTransaction(db, async (transaction) => {
      const donationDoc = await transaction.get(donationRef);
      
      if (donationDoc.exists()) {
        alreadyProcessed = true;
        return;
      }

      const creatorDoc = await transaction.get(creatorRef);
      const currentBalance = creatorDoc.exists()
        ? creatorDoc.data()?.balance || 0
        : 0;
      const currentTotalEarnings = creatorDoc.exists()
        ? creatorDoc.data()?.totalEarnings || 0
        : 0;

      transaction.set(
        creatorRef,
        {
          balance: currentBalance + amount,
          totalEarnings: currentTotalEarnings + amount,
          lastUpdated: serverTimestamp(),
          name: metadata?.creatorName || "Unknown Creator",
          handle: metadata?.creatorHandle || "",
          avatarUrl: metadata?.creatorAvatar || "",
        },
        { merge: true }
      );

      // Log the donation using the Payment Intent ID as the unique Doc ID
      transaction.set(donationRef, {
        amount: amount,
        fanName: fanName,
        fanId: effectiveFanId,
        message: message,
        timestamp: serverTimestamp(),
        stripePaymentIntentId: paymentIntentId,
      });

      // Log payout receipt under the fan's user profile so non-creators can view their total payouts
      if (effectiveFanId) {
        const payoutRef = doc(db, "users", effectiveFanId, "payouts", paymentIntentId);
        transaction.set(payoutRef, {
          amount: amount,
          creatorName: metadata?.creatorName || "Creator",
          creatorId: creatorId,
          timestamp: serverTimestamp(),
          stripePaymentIntentId: paymentIntentId,
        });
      }

      // Create a notification for the creator
      transaction.set(notificationRef, {
        type: "donation",
        title: "New Donation!",
        content: `${fanName} sent you $${amount.toFixed(2)}`,
        message: message,
        amount: amount,
        fanName: fanName,
        isRead: false,
        timestamp: serverTimestamp(),
      });
    });

    if (alreadyProcessed) {
      // Even if creator balance was already updated, backfill the fan payout record if missing
      if (effectiveFanId) {
        try {
          const payoutRef = doc(db, "users", effectiveFanId, "payouts", paymentIntentId);
          const payoutSnap = await getDoc(payoutRef);
          if (!payoutSnap.exists()) {
            await setDoc(payoutRef, {
              amount: amount,
              creatorName: metadata?.creatorName || "Creator",
              creatorId: creatorId,
              timestamp: serverTimestamp(),
              stripePaymentIntentId: paymentIntentId,
            });
            console.log(`Backfilled fan payout record ${paymentIntentId} for fan ${effectiveFanId}`);
          }
        } catch (e) {
          console.warn("Could not backfill fan payout record:", e);
        }
      }
      console.log(`Payment ${paymentIntentId} already processed, skipping creator balance update.`);
      return;
    }

    console.log(
      `Successfully updated balance for creator ${creatorId} by $${amount}`
    );
  } catch (error) {
    console.error("Error updating Firestore after payment:", error);
    throw error;
  }
}

export const app = express();
export const youtubeApiProxy = app;

async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Stripe Webhook (MUST be before express.json() to get raw body)
  app.post(
    "/api/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"];
      let event;

      try {
        event = getStripe().webhooks.constructEvent(
          req.body,
          sig as string,
          process.env.STRIPE_WEBHOOK_SECRET || ""
        );
      } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle the event
      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const metadata = paymentIntent.metadata;

        if (metadata && metadata.creatorId && metadata.amount) {
          const creatorId = metadata.creatorId;
          const amount = parseFloat(metadata.amount);
          const message = metadata.message || "";
          const fanName = metadata.fanName || "Anonymous";
          const fanId = metadata.fanId || null;

          await updateCreatorBalanceAndNotify(
            creatorId,
            amount,
            message,
            fanName,
            fanId,
            paymentIntent.id,
            metadata
          );
        }
      } else if (event.type === "account.updated") {
        const account = event.data.object as Stripe.Account;
        const creatorId = account.metadata?.creatorId;

        if (creatorId && account.details_submitted) {
          try {
            const creatorRef = doc(db, "creators", creatorId);
            await updateDoc(creatorRef, {
              stripeOnboardingComplete: true,
              lastUpdated: serverTimestamp()
            });
            console.log(`Stripe onboarding complete for creator ${creatorId}`);
          } catch (error) {
            console.error("Error updating creator onboarding status:", error);
          }
        }
      }

      res.json({ received: true });
    }
  );

  app.use(cors());
  app.use(express.json());

  // Contact Form API
  app.post("/api/contact", async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Robust Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (name.length > 100 || subject.length > 200 || message.length > 2000) {
      return res.status(400).json({ error: "Input exceeds allowed length" });
    }

    try {
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.warn("Gmail credentials not configured. Storing contact message to Firestore.");
        const contactRef = doc(collection(db, "contact_messages"));
        await setDoc(contactRef, {
          name,
          email,
          subject,
          message,
          timestamp: serverTimestamp(),
        });
        return res.json({ success: true });
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      const mailOptions = {
        from: `"${name}" <${email}>`,
        to: "contactcashmeout@gmail.com",
        subject: `[Contact Form] ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        replyTo: email
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Email Error:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Support Cloud Function root invocation with ?endpoint=channels / ?endpoint=search / ?endpoint=video
  const handleYouTubeEndpoint = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { endpoint, q, ids, id, channelId, part, type, maxResults } = req.query;
    if (!endpoint) return next();

    const apiKey = process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "YOUTUBE_API_KEY environment variable is not set on the server." });
    }

    try {
      let targetUrl = "";
      if (endpoint === "channels") {
        const channelIds = (ids || id || "") as string;
        targetUrl = `https://www.googleapis.com/youtube/v3/channels?part=${encodeURIComponent((part || "snippet,statistics,brandingSettings") as string)}&id=${encodeURIComponent(channelIds)}&key=${apiKey}`;
      } else if (endpoint === "search") {
        if (channelId) {
          targetUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${encodeURIComponent(channelId as string)}&order=date&type=video&maxResults=${encodeURIComponent((maxResults || "12") as string)}&key=${apiKey}`;
        } else {
          targetUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent((q || "") as string)}&type=${encodeURIComponent((type || "channel") as string)}&maxResults=${encodeURIComponent((maxResults || "12") as string)}&key=${apiKey}`;
        }
      } else {
        return res.status(400).json({ error: `Unsupported endpoint: ${endpoint}` });
      }

      const ytRes = await fetch(targetUrl);
      const ytData = await ytRes.json();
      return res.status(ytRes.status).json(ytData);
    } catch (err: any) {
      console.error("YouTube root proxy error:", err);
      return res.status(500).json({ error: err.message || "Proxy request failed" });
    }
  };

  app.get("/", handleYouTubeEndpoint);
  app.get("/youtubeApiProxy", handleYouTubeEndpoint);

  // YouTube API Proxy Endpoints using process.env.YOUTUBE_API_KEY or process.env.YOUTUBE_KEY
  app.get("/api/youtube/channels", async (req, res) => {
    const apiKey = process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "YOUTUBE_API_KEY environment variable is not set on the server." });
    }
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({ error: "Missing required query parameter: ids" });
    }
    try {
      const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${encodeURIComponent(ids as string)}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json(data);
      }
      res.json(data);
    } catch (error: any) {
      console.error("YouTube Proxy Error (Channels):", error);
      res.status(500).json({ error: error.message || "Failed to fetch YouTube channel details" });
    }
  });

  app.get("/api/youtube/search", async (req, res) => {
    const apiKey = process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "YOUTUBE_API_KEY environment variable is not set on the server." });
    }
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Missing required query parameter: q" });
    }
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q as string)}&type=channel&maxResults=12&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json(data);
      }
      res.json(data);
    } catch (error: any) {
      console.error("YouTube Proxy Error (Search):", error);
      res.status(500).json({ error: error.message || "Failed to search YouTube creators" });
    }
  });

  app.get("/api/youtube/feed", async (req, res) => {
    const apiKey = process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "YOUTUBE_API_KEY environment variable is not set on the server." });
    }
    const { channelId } = req.query;
    if (!channelId) {
      return res.status(400).json({ error: "Missing required query parameter: channelId" });
    }
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${encodeURIComponent(channelId as string)}&order=date&type=video&maxResults=12&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json(data);
      }
      res.json(data);
    } catch (error: any) {
      console.error("YouTube Proxy Error (Feed):", error);
      res.status(500).json({ error: error.message || "Failed to fetch YouTube feed" });
    }
  });

  // API Routes
  app.post("/api/create-payment-intent", async (req, res) => {
    const { creator, amount, fanName, fanId, message } = req.body;

    if (!creator || !amount) {
      return res.status(400).json({ error: "Missing creator or amount" });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Stripe secret key (STRIPE_SECRET_KEY) environment variable is missing on the server." });
    }

    try {
      // Fetch the creator from Firestore to get their Stripe Connect Account ID
      const creatorRef = doc(db, "creators", creator.id);
      const creatorSnap = await getDoc(creatorRef);
      const creatorData = creatorSnap.exists() ? creatorSnap.data() : null;
      const creatorStripeAccountId = creatorData?.stripeConnectAccountId;

      // Calculate 5% Platform Fee (in cents)
      const amountInCents = Math.round(amount * 100);
      const platformFeeInCents = Math.round(amountInCents * 0.05);

      const paymentIntentOptions: Stripe.PaymentIntentCreateParams = {
        amount: amountInCents,
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          creatorId: creator.id,
          creatorName: creator.name,
          creatorHandle: creator.handle,
          creatorAvatar: creator.avatarUrl,
          amount: amount.toString(),
          fanName: fanName || "Anonymous",
          fanId: fanId || "",
          message: message || "",
        },
      };

      // If the creator has a linked Stripe account, we use the 5% platform fee logic
      if (creatorStripeAccountId && creatorData?.stripeOnboardingComplete) {
        paymentIntentOptions.application_fee_amount = platformFeeInCents;
        paymentIntentOptions.transfer_data = {
          destination: creatorStripeAccountId,
        };
      }

      const paymentIntent = await getStripe().paymentIntents.create(paymentIntentOptions);

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Stripe Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // New endpoint to confirm payment from client side (fallback for webhooks)
  app.post("/api/confirm-payment", async (req, res) => {
    const { paymentIntentId, creatorId, amount, fanName, message, fanId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: "Missing paymentIntentId" });
    }

    try {
      // Verify payment intent with Stripe
      const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ error: "Payment not succeeded" });
      }

      // Use metadata from Stripe as source of truth if available
      const metadata = paymentIntent.metadata;
      
      await updateCreatorBalanceAndNotify(
        creatorId || metadata.creatorId,
        amount || parseFloat(metadata.amount),
        message || metadata.message || "",
        fanName || metadata.fanName || "Anonymous",
        fanId || metadata.fanId || null,
        paymentIntent.id,
        metadata
      );

      res.json({ success: true });
    } catch (error: any) {
      console.error("Confirm Payment Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Endpoint to get all payouts for a fan/user, auto-syncing missing receipts from creator donations
  app.get("/api/users/:userId/payouts", async (req, res) => {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    try {
      // 1. Fetch existing payouts from users/{userId}/payouts
      const payoutsRef = collection(db, "users", userId, "payouts");
      const payoutsSnap = await getDocs(payoutsRef);
      const existingPayoutMap = new Map<string, any>();

      payoutsSnap.forEach((docSnap) => {
        existingPayoutMap.set(docSnap.id, docSnap.data());
      });

      // 2. Query all creator donations where fanId == userId to discover any unsynced receipts
      try {
        const donationsQuery = query(collectionGroup(db, "donations"), where("fanId", "==", userId));
        const donationsSnap = await getDocs(donationsQuery);

        for (const donDoc of donationsSnap.docs) {
          const data = donDoc.data();
          const pId = data.stripePaymentIntentId || donDoc.id;
          if (!existingPayoutMap.has(pId)) {
            const creatorId = donDoc.ref.parent.parent ? donDoc.ref.parent.parent.id : (data.creatorId || "unknown");
            
            let creatorName = data.creatorName || "Creator";
            if (creatorName === "Creator" && donDoc.ref.parent.parent) {
              const cSnap = await getDoc(donDoc.ref.parent.parent);
              if (cSnap.exists() && cSnap.data()?.name) {
                creatorName = cSnap.data().name;
              }
            }

            const newPayoutData = {
              amount: data.amount || 0,
              creatorName: creatorName,
              creatorId: creatorId,
              timestamp: data.timestamp || serverTimestamp(),
              stripePaymentIntentId: pId,
            };

            const payoutDocRef = doc(db, "users", userId, "payouts", pId);
            await setDoc(payoutDocRef, newPayoutData, { merge: true });
            existingPayoutMap.set(pId, newPayoutData);
          }
        }
      } catch (err) {
        console.warn("Could not sync collectionGroup donations for fan:", err);
      }

      // 3. Format response
      const payouts = Array.from(existingPayoutMap.entries()).map(([id, data]) => ({
        id,
        amount: data.amount || 0,
        creatorName: data.creatorName || "Creator",
        creatorId: data.creatorId || "",
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp || Date.now()),
      }));

      payouts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      const totalPayouts = payouts.reduce((sum, p) => sum + p.amount, 0);

      res.json({ payouts, totalPayouts });
    } catch (error: any) {
      console.error("Error fetching user payouts:", error);
      res.status(500).json({ error: error.message || "Failed to fetch user payouts" });
    }
  });

  // Endpoint to get creator balance (public)
  app.get("/api/creators/:id/balance", async (req, res) => {
    try {
        const creatorRef = doc(db, "creators", req.params.id);
        const creatorSnap = await getDoc(creatorRef);
        if (!creatorSnap.exists()) {
            return res.json({ balance: 0 });
        }
        res.json({ balance: creatorSnap.data()?.balance || 0 });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
  });

  // Create a Stripe Connect account and return an onboarding link
  app.post("/api/auth/stripe/onboard", async (req, res) => {
    try {
      const { creatorId, email } = req.body;
      if (!creatorId) return res.status(400).json({ error: "Missing creatorId" });

      const creatorRef = doc(db, "creators", creatorId);
      const creatorSnap = await getDoc(creatorRef);
      if (!creatorSnap.exists()) return res.status(404).json({ error: "Creator not found" });

      const creatorData = creatorSnap.data();
      let accountId = creatorData?.stripeConnectAccountId;

      if (!accountId) {
        const account = await getStripe().accounts.create({
          type: "express",
          email: email || undefined,
          capabilities: {
            transfers: { requested: true },
          },
          metadata: { creatorId },
        });
        accountId = account.id;
        await updateDoc(creatorRef, { stripeConnectAccountId: accountId });
      }

      const accountLink = await getStripe().accountLinks.create({
        account: accountId,
        refresh_url: `${process.env.APP_URL}/dashboard`,
        return_url: `${process.env.APP_URL}/dashboard?stripe_onboarding=success`,
        type: "account_onboarding",
      });

      res.json({ url: accountLink.url });
    } catch (error: any) {
      console.error("Stripe Onboarding Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Handle withdrawals
  app.post("/api/withdraw", async (req, res) => {
    try {
      const { creatorId, amount } = req.body;
      if (!creatorId || !amount) return res.status(400).json({ error: "Missing required fields" });

      const creatorRef = doc(db, "creators", creatorId);
      
      await runClientTransaction(db, async (transaction) => {
        const creatorSnap = await transaction.get(creatorRef);
        if (!creatorSnap.exists()) throw new Error("Creator not found");

        const creatorData = creatorSnap.data();
        const currentBalance = creatorData?.balance || 0;
        const accountId = creatorData?.stripeConnectAccountId;
        const onboardingComplete = creatorData?.stripeOnboardingComplete;

        if (amount > currentBalance) throw new Error("Insufficient balance");
        if (!accountId || !onboardingComplete) throw new Error("Stripe account not linked or onboarding incomplete");

        // Create a transfer to the connected account
        const transfer = await getStripe().transfers.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: "usd",
          destination: accountId,
          description: `Withdrawal for ${creatorData?.name}`,
          metadata: { creatorId },
        });

        // Update balance
        transaction.update(creatorRef, {
          balance: currentBalance - amount,
          lastUpdated: serverTimestamp()
        });

        // Log withdrawal
        const withdrawalRef = doc(collection(db, "creators", creatorId, "withdrawals"));
        transaction.set(withdrawalRef, {
          amount,
          status: "completed",
          stripeTransferId: transfer.id,
          timestamp: serverTimestamp()
        });

        // Create notification
        const notificationRef = doc(collection(db, "creators", creatorId, "notifications"));
        transaction.set(notificationRef, {
          type: "withdrawal",
          title: "Withdrawal Successful",
          content: `You have successfully withdrawn $${amount.toFixed(2)} to your linked Stripe account.`,
          amount,
          isRead: false,
          timestamp: serverTimestamp()
        });
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error("Withdrawal Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Catch-all for unhandled API routes (prevents returning index.html for API calls)
  app.all("/api/*all", (req, res) => {
    res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.path}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn("Vite middleware skipped:", err);
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.use((req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.FUNCTION_TARGET) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();
